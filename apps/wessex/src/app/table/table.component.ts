import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { AsyncPipe, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
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
import { Subscription, map, skip, take } from 'rxjs';
import { MatMultiSortHeader } from '../common/mat-multi-sort-header/mat-multi-sort-header.component';
import { MatMultiSortTableDataSource } from '../common/mat-multi-sort-header/mat-multi-sort-table-data-source';
import { MatMultiSort } from '../common/mat-multi-sort-header/mat-multi-sort.directive';
import { OverflowTooltipDirective } from '../common/overflow-tooltip.directive';
import { TypedMatCellDef } from '../common/typed-mat-cell-def.directive';
import { TypedMatRowDef } from '../common/typed-mat-row-def.directive';
import { Column, PeriodicElement, TableOptions, defaultTableOptions } from '../data/data';
import { TableStore } from './table.store';

@Component({
  standalone: true,
  imports: [
    MatMultiSortHeader,
    MatMultiSort,
    OverflowTooltipDirective,
    ReactiveFormsModule,
    AsyncPipe,
    TypedMatCellDef,
    TypedMatRowDef,
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
  ],
  selector: 'be-table',
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
export class TableComponent {
  protected readonly store = inject<TableStore<PeriodicElement>>(TableStore);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatMultiSort) sort: MatMultiSort | null = null;

  dataSource = new MatMultiSortTableDataSource<PeriodicElement>();

  data = input.required<PeriodicElement[]>();

  columns = model.required<Column<PeriodicElement>[]>();

  options = input<TableOptions, Partial<TableOptions>>(defaultTableOptions, {
    transform: (value) => ({
      ...defaultTableOptions,
      ...value,
      emptyMessage: value.emptyMessage || defaultTableOptions.emptyMessage,
    }),
  });

  resetColumns = output();

  expandedElements: string[] = [];

  selection = new SelectionModel<PeriodicElement>(true, []);

  pinnedLeftColumns = computed(() => this.columns().filter((c) => this.store.$pinned().get(c.columnDef) === 'left'));

  unpinnedColumns = computed(() => this.columns().filter((c) => !this.store.$pinned().get(c.columnDef)));

  pinnedRightColumns = computed(() => this.columns().filter((c) => this.store.$pinned().get(c.columnDef) === 'right'));

  displayedColumns = computed(() => [
    ...(this.options().rowAction === 'select' && this.options().multi ? ['select'] : []),
    ...this.pinnedLeftColumns()
      .filter((c) => this.store.$active().get(c.columnDef) ?? false)
      .map((c) => c.columnDef),
    ...this.unpinnedColumns()
      .filter((c) => this.store.$active().get(c.columnDef) ?? false)
      .map((c) => c.columnDef),
    ...this.pinnedRightColumns()
      .filter((c) => this.store.$active().get(c.columnDef) ?? false)
      .map((c) => c.columnDef),
    ...(this.options().showActionRow ? ['actions'] : []),
  ]);

  filterColumns = computed(() => [...this.displayedColumns()].map((x) => x + '-filter'));

  removeEmpty = <T>(obj: Record<string, T | string>): Record<string, T | string> =>
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined && v !== ''));

  constructor() {
    let sortSub: Subscription | undefined;
    let pageSub: Subscription | undefined;
    let filterSub: Subscription | undefined;
    effect(
      () => {
        const columns = this.columns();

        untracked(() => {
          this.store.$filter = columns;

          sortSub?.unsubscribe();
          sortSub = this.sort?.sortChangeMulti
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

    this.dataSource.filterPredicate = (item, filter) =>
      !Object.entries<string | undefined>(JSON.parse(filter))
        .filter(([k]) => !['sort', 'page', 'size'].includes(k))
        .reduce(
          (remove, [k, v]) =>
            remove ||
            !(item[k as keyof typeof item] ?? '')
              .toString()
              .toLocaleLowerCase()
              .includes((v ?? '').toString().toLocaleLowerCase()),
          false,
        );
  }

  clearFilters() {
    this.store.$filter?.().reset();
  }

  clickRow(row: PeriodicElement) {
    const options = this.options();
    if (options.rowAction === 'expand') {
      const index = this.expandedElements.findIndex((x) => x == row.name);
      if (index === -1) {
        if (!options.multi) {
          this.expandedElements = [];
        }
        this.expandedElements.push(row.name);
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator?.firstPage();
    }
  }

  pinColumn(column: any, direction?: 'left' | 'right') {
    this.columns.update((columns) => {
      const previousIndex = columns.indexOf(column);
      if (direction === 'left' && this.store.$pinned().get(column.columnDef) !== 'left') {
        const currentIndex = columns.filter((c) => this.store.$pinned().get(c.columnDef) === 'left').length;

        columns.splice(currentIndex, 0, { ...columns.splice(previousIndex, 1)[0]!, pinned: 'left' });
      } else if (direction === 'right' && this.store.$pinned().get(column.columnDef) !== 'right') {
        const currentIndex =
          columns.length - columns.filter((c) => this.store.$pinned().get(c.columnDef) === 'right').length - 1;
        columns.splice(currentIndex, 0, { ...columns.splice(previousIndex, 1)[0]!, pinned: 'right' });
      } else if (!direction) {
        if (this.store.$pinned().get(column.columnDef) === 'left') {
          const currentIndex = columns.filter((c) => this.store.$pinned().get(c.columnDef) === 'left').length - 1;
          columns.splice(currentIndex, 0, {
            ...columns.splice(previousIndex, 1)[0]!,
            pinned: '',
          });
        } else if (this.store.$pinned().get(column.columnDef) === 'right') {
          const currentIndex =
            columns.length - columns.filter((c) => this.store.$pinned().get(c.columnDef) === 'right').length;
          columns.splice(currentIndex, 0, {
            ...columns.splice(previousIndex, 1)[0]!,
            pinned: '',
          });
        }
      }

      return [...columns];
    });
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
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  drop(event: CdkDragDrop<string[]>) {
    this.columns.update((columns) => {
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

      columns.splice(event.currentIndex + currentOffset, 0, {
        ...columns.splice(event.previousIndex + previousOffset, 1)[0]!,
        pinned: event.container.id === 'pinned-left' ? 'left' : event.container.id === 'pinned-right' ? 'right' : '',
      });
      return [...columns];
    });
  }

  // Todo: I don't like this behavior
  tableDrop(event: CdkDragDrop<string[]>) {
    this.columns.update((columns) => {
      // This gets the correct indexes based on hidden columns
      const a = this.displayedColumns()[event.previousIndex]!;
      const previous = columns.find((b) => b.columnDef === a)!;
      const previousIndex = columns.indexOf(previous);
      const d = this.displayedColumns()[event.currentIndex]!;
      const current = columns.find((b) => b.columnDef === d)!;
      const currentIndex = columns.indexOf(current);

      // Swap pinned values
      const temp = current.pinned;
      current.pinned = previous.pinned;
      previous.pinned = temp;

      columns.splice(currentIndex, 0, columns.splice(previousIndex, 1)[0]!);
      return [...columns];
    });
  }

  toggleColumn(key: keyof PeriodicElement, checked: boolean) {
    this.store.updateActive(key, checked);
  }
}
