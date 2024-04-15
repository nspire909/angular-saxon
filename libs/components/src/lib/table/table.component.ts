import {
  assertPresent,
  OverflowTooltipDirective,
  TypedMatCellDefDirective,
  TypedMatRowDefDirective,
} from '@angular-saxon/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { AsyncPipe, JsonPipe, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  untracked,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgScrollbar, ScrollViewport } from 'ngx-scrollbar';
import { map, skip, Subscription, take } from 'rxjs';
import { MultiSortHeaderComponent } from '../multi-sort/multi-sort-header.component';
import { MultiSortDirective } from '../multi-sort/multi-sort.directive';
import { NgsxTableDataSource } from './table-data-source';
import { Column, defaultTableOptions, Entity, TableOptions } from './table.models';
import { TableStore } from './table.store';

@Component({
  standalone: true,
  imports: [
    MultiSortDirective,
    MultiSortHeaderComponent,
    OverflowTooltipDirective,
    ReactiveFormsModule,
    AsyncPipe,
    TypedMatCellDefDirective,
    TypedMatRowDefDirective,
    RouterLink,
    JsonPipe,
    DragDropModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTableModule,
    NgScrollbar,
    ScrollViewport,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatRadioModule,
    MatMenuModule,
    MatDividerModule,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    NgStyle,
  ],
  selector: 'ngsx-table',
  styleUrl: 'table.component.scss',
  templateUrl: 'table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [TableStore],
})
export class TableComponent<T> {
  protected readonly store = inject<TableStore<T>>(TableStore);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MultiSortDirective) sort: MultiSortDirective | null = null;

  dataSource = new NgsxTableDataSource<T>();

  data = input.required<T[]>();

  entity = input.required<Entity<T>>();

  options = input<TableOptions, Partial<TableOptions>>(defaultTableOptions, {
    transform: (value) => ({
      ...defaultTableOptions,
      ...value,
      emptyMessage: value.emptyMessage || defaultTableOptions.emptyMessage,
    }),
  });

  resetColumns = output();

  expandedElements: string[] = [];

  // Todo: change true to false for single select?
  selection = new SelectionModel<T>(true, []);

  pinnedLeftColumns = computed(() => this.store.$order().filter((c) => this.store.$pinned().get(c) === 'left'));

  unpinnedColumns = computed(() => this.store.$order().filter((c) => !this.store.$pinned().get(c)));

  pinnedRightColumns = computed(() => this.store.$order().filter((c) => this.store.$pinned().get(c) === 'right'));

  displayedColumns = computed(() => [
    ...(this.options().rowAction === 'select' && this.options().multi ? ['select'] : []),
    ...this.pinnedLeftColumns().filter((c) => this.store.$active().get(c) ?? false),
    ...this.unpinnedColumns().filter((c) => this.store.$active().get(c) ?? false),
    ...this.pinnedRightColumns().filter((c) => this.store.$active().get(c) ?? false),
    ...(this.options().showActionRow ? ['actions'] : []),
  ]);

  filterColumns = computed(() => [...this.displayedColumns()].map((x) => x + '-filter'));

  removeEmpty = <T>(obj: Record<string, T | string>): Record<string, T | string> =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== ''));

  constructor() {
    let sortSub: Subscription | undefined;
    let pageSub: Subscription | undefined;
    let filterSub: Subscription | undefined;
    effect(
      () => {
        const columns = this.entity();

        untracked(() => {
          this.store.$filter = columns.columns;

          sortSub?.unsubscribe();
          sortSub = this.sort?.matMultiSortChange
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              map((sorts) => ({
                sort: sorts.map((s) => `${s.direction === 'desc' ? '-' : ''}${s.direction ? s.active : ''}`),
              })),
            )
            ?.subscribe((s) => {
              this.store.$filter?.().controls.sort.setValue(s.sort.join(','));
            });

          pageSub?.unsubscribe();
          pageSub = this.paginator?.page
            .pipe(map((page) => ({ page: page.pageIndex + 1, size: page.pageSize })))
            ?.subscribe((s) => {
              this.store.$filter?.().controls.page.setValue(s.page.toString());
              this.store.$filter?.().controls.size.setValue(s.size.toString());
            });

          filterSub?.unsubscribe();
          filterSub = this.store
            .$filter?.()
            ?.valueChanges.pipe(map((value) => ({ value, rawValue: this.store.$filter?.()?.getRawValue() })))
            .subscribe((filterChange) => {
              this.dataSource.filter = JSON.stringify(filterChange.rawValue ?? {});

              const sort = filterChange.value?.sort?.split(',').filter(Boolean) ?? [];

              this.router.navigate([`.`], {
                queryParams: this.removeEmpty(
                  {
                    ...filterChange.value,
                    sort: sort.length ? sort : '',
                    ...(!this.options().showPaginator ? { page: '', size: '' } : {}),
                  } ?? {},
                ),
              });
            });
        });
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      this.dataSource.data = this.data();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.options().showPaginator ? this.paginator : null;
      this.expandedElements = [];
      this.selection.clear();
    });

    this.route.queryParamMap.pipe(skip(1), take(1)).subscribe((queryParams) => {
      if (this.sort) {
        this.sort.active = queryParams.getAll('sort').join(',').split('-').join('').split(',').filter(Boolean)[0] ?? '';
        this.sort.direction =
          queryParams
            .getAll('sort')
            .map((x) => (x.startsWith('-') ? 'desc' : 'asc'))
            .filter(Boolean)[0] ?? '';
        this.sort.actives = queryParams.getAll('sort').join(',').split('-').join('').split(',').filter(Boolean) ?? [];
        this.sort.directions =
          queryParams
            .getAll('sort')
            .filter(Boolean)
            .map((x) => (x.startsWith('-') ? 'desc' : 'asc')) ?? [];
      }
      if (this.paginator) {
        this.paginator.pageIndex = parseInt(queryParams.get('page') || '1', 10) - 1;
        this.paginator.pageSize = parseInt(queryParams.get('size') || '10', 10);
      }
    });
  }

  clearFilters() {
    this.store.$filter?.().reset();
  }

  clickRow(row: T) {
    const options = this.options();
    const entity = this.entity();
    if (options.rowAction === 'expand') {
      const index = this.expandedElements.findIndex((x) => x === row[entity.primaryKey]);
      if (index === -1) {
        if (!options.multi) {
          this.expandedElements = [];
        }
        this.expandedElements.push(row[entity.primaryKey] as string);
      } else {
        this.expandedElements.splice(index, 1);
      }
    }
    if (options.rowAction === 'select') {
      if (!options.multi) {
        this.selection.clear();
      }
      this.selection.toggle(row);
    }
  }

  pinColumn(column: Column<T>, direction?: 'left' | 'right') {
    const order = this.store.$order();
    const previousIndex = order.indexOf(column.name);
    if (direction === 'left' && this.store.$pinned().get(column.name) !== 'left') {
      const currentIndex = order.filter((c) => this.store.$pinned().get(c) === 'left').length;
      const key = assertPresent(order.splice(previousIndex, 1)[0]);
      order.splice(currentIndex, 0, key);
      this.store.updatePinned(key, 'left');
    } else if (direction === 'right' && this.store.$pinned().get(column.name) !== 'right') {
      const currentIndex = order.length - order.filter((c) => this.store.$pinned().get(c) === 'right').length - 1;
      const key = assertPresent(order.splice(previousIndex, 1)[0]);
      order.splice(currentIndex, 0, key);
      this.store.updatePinned(key, 'right');
    } else if (!direction) {
      if (this.store.$pinned().get(column.name) === 'left') {
        const currentIndex = order.filter((c) => this.store.$pinned().get(c) === 'left').length - 1;
        const key = assertPresent(order.splice(previousIndex, 1)[0]);
        order.splice(currentIndex, 0, key);
        this.store.updatePinned(key, null);
      } else if (this.store.$pinned().get(column.name) === 'right') {
        const currentIndex = order.length - order.filter((c) => this.store.$pinned().get(c) === 'right').length;
        const key = assertPresent(order.splice(previousIndex, 1)[0]);
        order.splice(currentIndex, 0, key);
        this.store.updatePinned(key, null);
      }
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: T, rowIndex = 0): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${rowIndex + 1}`;
  }

  isExpanded(row: T) {
    return this.expandedElements.includes(row[this.entity().primaryKey] as string);
  }

  drop(event: CdkDragDrop<Extract<keyof T, string>[]>) {
    const order = this.store.$order();

    const previousOffset =
      event.previousContainer.id === 'pinned-none'
        ? this.pinnedLeftColumns().length
        : event.previousContainer.id === 'pinned-right'
          ? this.pinnedLeftColumns().length + this.unpinnedColumns().length
          : 0;
    const currentOffset =
      (event.container.id === 'pinned-none'
        ? this.pinnedLeftColumns().length
        : event.container.id === 'pinned-right'
          ? this.pinnedLeftColumns().length + this.unpinnedColumns().length
          : 0) -
      ((event.previousContainer.id === 'pinned-left' && event.container.id === 'pinned-none') ||
      (event.previousContainer.id === 'pinned-none' && event.container.id === 'pinned-right')
        ? 1
        : 0);

    const key = assertPresent(order.splice(event.previousIndex + previousOffset, 1)[0]);
    order.splice(event.currentIndex + currentOffset, 0, key);
    this.store.updateOrder(order);
    this.store.updatePinned(
      key,
      event.container.id === 'pinned-left' ? 'left' : event.container.id === 'pinned-right' ? 'right' : null,
    );
  }

  tableDrop(event: CdkDragDrop<string[]>) {
    const order = this.store.$order();
    // This gets the correct indexes based on hidden columns
    const prev = assertPresent(this.displayedColumns()[event.previousIndex]);
    const previous = assertPresent(order.find((b) => b === prev));
    const previousIndex = order.indexOf(previous);
    const curr = assertPresent(this.displayedColumns()[event.currentIndex]);
    const current = assertPresent(order.find((b) => b === curr));
    const currentIndex = order.indexOf(current);

    order.splice(currentIndex, 0, assertPresent(order.splice(previousIndex, 1)[0]));
    this.store.updateOrder(order);

    // Swap pinned values
    const temp = this.store.$pinned().get(previous) ?? null;
    this.store.updatePinned(previous, this.store.$pinned().get(current) ?? null);
    this.store.updatePinned(current, temp);
  }

  toggleColumn(key: Extract<keyof T, string>, checked: boolean) {
    this.store.updateActive(key, checked);
  }
}
