import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatMultiSort } from './mat-multi-sort.directive';

export class MatMultiSortTableDataSource<T> extends MatTableDataSource<T> {
  override get sort(): MatMultiSort | null {
    return super.sort as MatMultiSort;
  }

  override set sort(sort: MatMultiSort | null) {
    super.sort = sort;
  }

  constructor(initialData: T[] = []) {
    super(initialData);
  }

  override sortData = (data: T[], sort: MatSort): T[] => {
    if ((sort as MatMultiSort).isMulti()) {
      const _data = Object.assign(new Array<T>(), data);
      return _data.sort((i1, i2) => {
        return this._sortData(i1, i2, (sort as MatMultiSort).actives, (sort as MatMultiSort).directions);
      });
    } else {
      return new MatTableDataSource<T>().sortData(data, sort);
    }
  };

  _sortData(d1: T, d2: T, params: string[], dirs: string[]): number {
    // @ts-ignore -- need a typesafe way to express these accessor operations, ts-ignore could be a solution
    // if there's not a suitable solution offered by typescript
    if (d1[params[0]] > d2[params[0]]) {
      return dirs[0] === 'asc' ? 1 : -1;
      // @ts-ignore
    } else if (d1[params[0]] < d2[params[0]]) {
      return dirs[0] === 'asc' ? -1 : 1;
    } else {
      if (params.length > 1) {
        params = params.slice(1, params.length);
        dirs = dirs.slice(1, dirs.length);
        return this._sortData(d1, d2, params, dirs);
      } else {
        return 0;
      }
    }
  }
}
