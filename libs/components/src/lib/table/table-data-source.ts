import { MatSort, type Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MultiSortDirective } from '../multi-sort/multi-sort.directive';
import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription, combineLatest, map, merge, of } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

export class NgsxTableDataSource<T> extends MatTableDataSource<T> {
  public dataToRender$: Subject<T[]> = new ReplaySubject<T[]>(1);
  public dataOfRange$: Subject<T[]> = new ReplaySubject<T[]>(1);
  //private streamsReady = false;

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
    if (params[0] && d1[params[0]] === null) {
      return 1;
    }
    if (params[0] && d2[params[0]] === null) {
      return -1;
    }
    if (params[0] && (d1[params[0]] ?? '') > (d2[params[0]] ?? '')) {
      return dirs[0] === 'asc' ? 1 : -1;
    } else if (params[0] && (d1[params[0]] ?? '') < (d2[params[0]] ?? '')) {
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

  override _updateChangeSubscription() {
    //this.initStreams();
    const _sort: MatSort | null = this['_sort'] as MatSort | null;
    const _paginator: MatPaginator | null = this['_paginator'] as MatPaginator | null;
    const _internalPageChanges: Subject<void> = this['_internalPageChanges'] as Subject<void>;
    const _filter: BehaviorSubject<string> = this['_filter'] as BehaviorSubject<string>;
    const _renderData: BehaviorSubject<T[]> = this['_renderData'] as BehaviorSubject<T[]>;

    const sortChange: Observable<Sort | null | void> = _sort ? merge(_sort.sortChange, _sort.initialized) : of(null);
    const pageChange: Observable<PageEvent | null | void> = _paginator
      ? merge(_paginator.page, _internalPageChanges, _paginator.initialized)
      : of(null);
    const dataStream: Observable<T[]> = this['_data'] as Observable<T[]>;
    const filteredData = combineLatest([dataStream, _filter]).pipe(map(([data]) => this._filterData(data)));
    const orderedData = combineLatest([filteredData, sortChange]).pipe(map(([data]) => this._orderData(data)));
    const paginatedData = combineLatest([orderedData, pageChange]).pipe(map(([data]) => this._pageData(data)));

    this._renderChangesSubscription?.unsubscribe();
    this._renderChangesSubscription = new Subscription();
    this._renderChangesSubscription.add(paginatedData.subscribe((data) => this.dataToRender$?.next(data)));
    this._renderChangesSubscription.add(this.dataOfRange$?.subscribe((data) => _renderData.next(data)));
  }

  // private initStreams() {
  //   if (!this.streamsReady) {
  //     this.dataToRender$ = new ReplaySubject<T[]>(1);
  //     this.dataOfRange$ = new ReplaySubject<T[]>(1);
  //     this.streamsReady = true;
  //   }
  // }
}
