import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { type CanStick, CdkFooterRowDef, CdkHeaderRowDef, CdkTable } from '@angular/cdk/table';
import {
  type AfterContentInit,
  ContentChild,
  Directive,
  Input,
  NgZone,
  type OnChanges,
  type OnDestroy,
  forwardRef,
} from '@angular/core';
import { MatTable } from '@angular/material/table';
import { Subject, combineLatest, from } from 'rxjs';
import { delayWhen, distinctUntilChanged, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs';
import { FixedSizeTableVirtualScrollStrategy } from './fixed-size-table-virtual-scroll-strategy';
import { NgsxTableDataSource } from './table-data-source';

export function _tableVirtualScrollDirectiveStrategyFactory(tableDir: TableItemSizeDirective) {
  return tableDir.scrollStrategy;
}

function combineSelectors(...pairs: string[][]): string {
  return pairs.map((selectors) => `${selectors.join(' ')}, ${selectors.join('')}`).join(', ');
}

const stickyHeaderSelector = combineSelectors(
  ['.mat-mdc-header-row', '.mat-mdc-table-sticky'],
  ['.mat-header-row', '.mat-table-sticky'],
  ['.cdk-header-row', '.cdk-table-sticky'],
);

const stickyFooterSelector = combineSelectors(
  ['.mat-mdc-footer-row', '.mat-mdc-table-sticky'],
  ['.mat-footer-row', '.mat-table-sticky'],
  ['.cdk-footer-row', '.cdk-table-sticky'],
);

function isMatTable<T>(table: unknown): table is MatTable<T> {
  return table instanceof CdkTable && table['stickyCssClass'].includes('mat');
}

const defaults = {
  rowHeight: 48,
  headerHeight: 56,
  headerEnabled: true,
  footerHeight: 48,
  footerEnabled: false,
  bufferMultiplier: 0.7,
};

@Directive({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'cdk-virtual-scroll-viewport[tvsItemSize]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: _tableVirtualScrollDirectiveStrategyFactory,
      deps: [forwardRef(() => TableItemSizeDirective)],
    },
  ],
})
export class TableItemSizeDirective<T = unknown> implements OnChanges, AfterContentInit, OnDestroy {
  private destroyed$ = new Subject<void>();

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('tvsItemSize')
  rowHeight: string | number = defaults.rowHeight;

  @Input()
  headerEnabled: boolean = defaults.headerEnabled;

  @Input()
  headerHeight: string | number = defaults.headerHeight;

  @Input()
  footerEnabled: boolean = defaults.footerEnabled;

  @Input()
  footerHeight: string | number = defaults.footerHeight;

  @Input()
  bufferMultiplier: string | number = defaults.bufferMultiplier;

  @ContentChild(MatTable, { static: false })
  table!: MatTable<T>;

  scrollStrategy = new FixedSizeTableVirtualScrollStrategy();

  dataSourceChanges = new Subject<void>();

  private stickyPositions: Map<HTMLElement, number> | null = null;
  private resetStickyPositions = new Subject<void>();
  private stickyEnabled = {
    header: false,
    footer: false,
  };

  constructor(private zone: NgZone) {}

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.dataSourceChanges.complete();
  }

  ngAfterContentInit() {
    const switchDataSourceOrigin = this.table['_switchDataSource'] as (dataSource: NgsxTableDataSource<T>) => void;
    this.table['_switchDataSource'] = (dataSource: NgsxTableDataSource<T>) => {
      switchDataSourceOrigin.call(this.table, dataSource);
      this.connectDataSource(dataSource);
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const updateStickyColumnStylesOrigin = this.table.updateStickyColumnStyles;
    this.table.updateStickyColumnStyles = () => {
      const stickyColumnStylesNeedReset = this.table['_stickyColumnStylesNeedReset'] as boolean;
      updateStickyColumnStylesOrigin.call(this.table);
      if (stickyColumnStylesNeedReset) {
        this.resetStickyPositions.next();
      }
    };

    this.connectDataSource(this.table.dataSource as NgsxTableDataSource<T>);

    combineLatest([
      this.scrollStrategy.stickyChange,
      this.resetStickyPositions.pipe(
        startWith(void 0),
        delayWhen(() => this.getScheduleObservable()),
        tap(() => {
          this.stickyPositions = null;
        }),
      ),
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([stickyOffset]) => {
        if (!this.stickyPositions?.keys.length) {
          this.initStickyPositions();
        }
        if (this.stickyEnabled.header) {
          this.setStickyHeader(stickyOffset);
        }
        if (this.stickyEnabled.footer) {
          this.setStickyFooter(stickyOffset);
        }
      });
  }

  connectDataSource(dataSource: NgsxTableDataSource<T>) {
    this.dataSourceChanges.next();
    if (!(dataSource instanceof NgsxTableDataSource)) {
      throw new Error('[tvsItemSize] requires NgsxTableDataSource be set as [dataSource] of the table');
    }
    if (isMatTable(this.table) && !(dataSource instanceof NgsxTableDataSource)) {
      throw new Error('[tvsItemSize] requires NgsxTableDataSource be set as [dataSource] of [mat-table]');
    }

    dataSource.dataToRender$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.dataSourceChanges),
        // eslint-disable-next-line rxjs/no-unsafe-takeuntil
        takeUntil(this.destroyed$),
        tap((data) => (this.scrollStrategy.dataLength = data.length)),
        switchMap((data) =>
          this.scrollStrategy.renderedRangeStream.pipe(
            map(({ start, end }) =>
              typeof start !== 'number' || typeof end !== 'number' ? data : data.slice(start, end),
            ),
          ),
        ),
      )
      .subscribe((data) => {
        this.zone.run(() => {
          dataSource.dataOfRange$.next(data);
        });
      });
  }

  ngOnChanges() {
    const config = {
      rowHeight: +this.rowHeight || defaults.rowHeight,
      headerHeight: this.headerEnabled ? +this.headerHeight || defaults.headerHeight : 0,
      footerHeight: this.footerEnabled ? +this.footerHeight || defaults.footerHeight : 0,
      bufferMultiplier: +this.bufferMultiplier || defaults.bufferMultiplier,
    };
    this.scrollStrategy.setConfig(config);
  }

  private setStickyEnabled() {
    if (!this.scrollStrategy.viewport) {
      this.stickyEnabled = {
        header: false,
        footer: false,
      };
      return;
    }

    const isEnabled = (rowDefs: CanStick[]) =>
      rowDefs.map((def) => def.sticky).reduce((prevState, state) => prevState && state, true);

    this.stickyEnabled = {
      header: isEnabled(this.table['_headerRowDefs'] as CdkHeaderRowDef[]),
      footer: isEnabled(this.table['_footerRowDefs'] as CdkFooterRowDef[]),
    };
  }

  private setStickyHeader(offset: number) {
    this.scrollStrategy.viewport.elementRef.nativeElement
      .querySelectorAll(stickyHeaderSelector)
      .forEach((el: Element) => {
        const parent = el.parentElement;
        let baseOffset = 0;
        if (parent && this.stickyPositions?.has(parent)) {
          baseOffset = this.stickyPositions.get(parent) ?? 0;
        }
        (el as HTMLElement).style.top = `${baseOffset - offset}px`;
      });
  }

  private setStickyFooter(offset: number) {
    this.scrollStrategy.viewport.elementRef.nativeElement
      .querySelectorAll(stickyFooterSelector)
      .forEach((el: Element) => {
        const parent = el.parentElement;
        let baseOffset = 0;
        if (parent && this.stickyPositions?.has(parent)) {
          baseOffset = this.stickyPositions.get(parent) ?? 0;
        }
        (el as HTMLElement).style.bottom = `${-baseOffset + offset}px`;
      });
  }

  private initStickyPositions() {
    this.stickyPositions = new Map<HTMLElement, number>();

    this.setStickyEnabled();

    if (this.stickyEnabled.header) {
      this.scrollStrategy.viewport.elementRef.nativeElement.querySelectorAll(stickyHeaderSelector).forEach((el) => {
        const parent = el.parentElement;
        if (parent && !this.stickyPositions?.has(parent)) {
          this.stickyPositions?.set(parent, parent.offsetTop);
        }
      });
    }

    if (this.stickyEnabled.footer) {
      this.scrollStrategy.viewport.elementRef.nativeElement.querySelectorAll(stickyFooterSelector).forEach((el) => {
        const parent = el.parentElement;
        if (parent && !this.stickyPositions?.has(parent)) {
          this.stickyPositions?.set(parent, -parent.offsetTop);
        }
      });
    }
  }

  private getScheduleObservable() {
    // Use onStable when in the context of an ongoing change detection cycle so that we
    // do not accidentally trigger additional cycles.
    return this.zone.isStable ? from(Promise.resolve(undefined)) : this.zone.onStable.pipe(take(1));
  }
}
