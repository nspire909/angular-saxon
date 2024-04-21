import { ValidatorFn } from '@angular/forms';

export interface TableOptions {
  rowAction: 'select' | 'expand' | 'link' | 'none';
  multi: boolean;
  showFilter: boolean;
  showPaginator: boolean;
  showActions: boolean;
  showActionRow: boolean;
  cellWrapping: boolean;
  multiSort: boolean;
  emptyMessage: string;
}

export const defaultTableOptions: TableOptions = {
  rowAction: 'none',
  multi: false,
  showFilter: true,
  showPaginator: false,
  showActions: true,
  showActionRow: true,
  cellWrapping: false,
  multiSort: true,
  emptyMessage: 'No records found.',
};

export interface Column<T> {
  name: Extract<keyof T, string>;
  title: string;
  cell: (element: T) => string;

  // initial values
  isActive: boolean;
  pinned?: 'left' | 'right' | null;
  defaultFilter: string;
  disableFilter: boolean;
  filterValidators?: ValidatorFn[];
}

export interface Entity<T> {
  name: string;
  title: string;
  primaryKey: Extract<keyof T, string>;

  columns: Column<T>[];
}
