import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { skip, take } from 'rxjs';
import { Column } from '../data/data';

export type FilterFormGroup<T> = ReturnType<TableStore<T>['createForm']>;

@Injectable()
export class TableStore<T> {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  private readonly state = {
    $active: signal(new Map<keyof T, boolean>()),
    $pinned: signal(new Map<keyof T, 'left' | 'right' | null>()),
  } as const;

  private _$filter?: Signal<FilterFormGroup<T>>;

  public get $filter(): Signal<FilterFormGroup<T>> | undefined {
    return this._$filter;
  }
  public set $filter(columns: Column<T>[]) {
    this._$filter = computed(() => this.createForm(columns));
    this.setActive(columns);
    this.setPinned(columns);
    this.route.queryParamMap.pipe(skip(1), take(1)).subscribe((queryParams) => {
      this._$filter?.().patchValue(
        queryParams.keys
          .filter(
            (k) =>
              ['sort', 'page', 'size'].includes(k) ||
              columns.find((column) => column.columnDef === k && !column.disableFilter),
          )
          .reduce(
            (p, c) => ({
              ...p,
              [c]:
                c === 'sort'
                  ? queryParams
                      .getAll(c)
                      .filter((x) => columns.some((y) => y.columnDef === (x.startsWith('-') ? x.slice(1) : x)))
                      .join(',')
                  : c === 'page' || c === 'size'
                    ? queryParams.get(c)?.match(/^[0-9]+$/)
                      ? queryParams.get(c)
                      : ''
                    : queryParams.get(c),
            }),
            {},
          ),
      );
    });
  }

  public readonly $active = this.state.$active.asReadonly();
  public readonly $pinned = this.state.$pinned.asReadonly();

  private setActive(columns?: Column<T>[]) {
    const activeColumns = columns?.reduce<{ [K in keyof T]: boolean }>(
      (p, c) => ({ ...p, [c.columnDef]: c.isActive }),
      {} as { [K in keyof T]: boolean },
    );
    this.state.$active.update((active) => this.mapUnion(active, activeColumns));
  }

  private setPinned(columns?: Column<T>[]) {
    const pinnedColumns = columns?.reduce<{ [K in keyof T]: 'left' | 'right' | null }>(
      (p, c) => ({ ...p, [c.columnDef]: c.pinned }),
      {} as { [K in keyof T]: 'left' | 'right' | null },
    );
    this.state.$pinned.update((pinned) => this.mapUnion(pinned, pinnedColumns));
  }

  private mapUnion<U>(map: Map<keyof T, U>, iterable?: { [K in keyof T]: U }) {
    Object.entries<U>(iterable ?? {}).forEach(([k, v]) => map.set(k as keyof T, v));
    return new Map(map);
  }

  updateActive(key: keyof T, value: boolean) {
    this.state.$active.update((active) => {
      active.set(key, value);
      return new Map(active);
    });
  }

  updatePinned(key: keyof T, value: 'left' | 'right' | null) {
    this.state.$pinned.update((pinned) => {
      pinned.set(key, value);
      return new Map(pinned);
    });
  }

  private createForm(columns?: Column<T>[]) {
    return this.fb.group(
      (columns ?? ([] as Column<T>[])).reduce<{ [K in keyof T | 'sort' | 'page' | 'size']: FormControl<string> }>(
        (p, c) => ({
          ...p,
          [c.columnDef]: this.fb.control<string>(
            { value: c.defaultFilter, disabled: c.disableFilter },
            { validators: c.filterValidators ?? [] },
          ),
        }),
        {
          sort: this.fb.control<string>(''),
          page: this.fb.control<string>(''),
          size: this.fb.control<string>(''),
        } as { [K in keyof T | 'sort' | 'page' | 'size']: FormControl<string> },
      ),
    );
  }
}
