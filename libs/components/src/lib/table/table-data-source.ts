import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MultiSortDirective } from '../multi-sort/multi-sort.directive';

export class NgsxTableDataSource<T> extends MatTableDataSource<T> {
  override get sort(): MultiSortDirective | null {
    return super.sort as MultiSortDirective;
  }

  override set sort(sort: MultiSortDirective | null) {
    super.sort = sort;
  }

  constructor(initialData: T[] = []) {
    super(initialData);
  }

  override sortData = (data: T[], sort: MatSort): T[] => {
    if ((sort as MultiSortDirective).isMulti()) {
      const _data = Object.assign(new Array<T>(), data);
      return _data.sort((i1, i2) => {
        return this._sortData(
          i1,
          i2,
          (sort as MultiSortDirective).actives as (keyof T)[],
          (sort as MultiSortDirective).directions,
        );
      });
    } else {
      return new MatTableDataSource<T>().sortData(data, sort);
    }
  };

  _sortData(d1: T, d2: T, params: (keyof T)[], dirs: string[]): number {
    if (params[0] && d1[params[0]] > d2[params[0]]) {
      return dirs[0] === 'asc' ? 1 : -1;
    } else if (params[0] && d1[params[0]] < d2[params[0]]) {
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

  // Todo: support Array<string> values and Ops
  override filterPredicate = (data: T, filter: string) =>
    !Object.entries<string | undefined>(JSON.parse(filter) as Record<string, string>)
      .filter(([k]) => !['sort', 'page', 'size'].includes(k))
      .reduce(
        (remove, [k, v]) =>
          remove ||
          !(data[k as keyof typeof data] ?? '')
            .toString()
            .toLocaleLowerCase()
            .includes((v ?? '').toString().toLocaleLowerCase()),
        false,
      );
}
