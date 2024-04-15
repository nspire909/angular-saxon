import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { skip, take } from 'rxjs';
import { Column } from './table.models';

export type FilterFormGroup<T> = ReturnType<TableStore<T>['createForm']>;

@Injectable()
export class TableStore<T> {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  private readonly state = {
    $active: signal(new Map<Extract<keyof T, string>, boolean>()),
    $pinned: signal(new Map<Extract<keyof T, string>, 'left' | 'right' | null>()),
    $order: signal<Extract<keyof T, string>[]>([]),
  } as const;

  private _$filter?: Signal<FilterFormGroup<T>>;

  public get $filter(): Signal<FilterFormGroup<T>> | undefined {
    return this._$filter;
  }
  public set $filter(columns: Column<T>[]) {
    this._$filter = computed(() => this.createForm(columns));
    this.setActive(columns);
    this.setPinned(columns);
    this.setOrder(columns);

    this.route.queryParamMap.pipe(skip(1), take(1)).subscribe((queryParams) => {
      this._$filter?.().patchValue(
        queryParams.keys
          .filter(
            (k) =>
              ['sort', 'page', 'size'].includes(k) ||
              columns.find((column) => column.name === k && !column.disableFilter),
          )
          .reduce(
            (p, c) => ({
              ...p,
              [c]:
                c === 'sort'
                  ? queryParams
                      .getAll(c)
                      .filter((x) => columns.some((y) => y.name === (x.startsWith('-') ? x.slice(1) : x)))
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
  public readonly $order = this.state.$order.asReadonly();

  private setActive(columns?: Column<T>[]) {
    const activeColumns = columns?.reduce<{ [K in Extract<keyof T, string>]: boolean }>(
      (p, c) => ({ ...p, [c.name]: c.isActive }),
      {} as { [K in Extract<keyof T, string>]: boolean },
    );
    this.state.$active.update((active) => this.mapUnion(active, activeColumns));
  }

  private setPinned(columns?: Column<T>[]) {
    const pinnedColumns = columns?.reduce<{ [K in Extract<keyof T, string>]: 'left' | 'right' | null }>(
      (p, c) => ({ ...p, [c.name]: c.pinned }),
      {} as { [K in Extract<keyof T, string>]: 'left' | 'right' | null },
    );
    this.state.$pinned.update((pinned) => this.mapUnion(pinned, pinnedColumns));
  }

  private setOrder(columns?: Column<T>[]) {
    this.state.$order.update(() => columns?.map((column) => column.name) ?? []);
  }

  private mapUnion<U>(map: Map<Extract<keyof T, string>, U>, iterable?: { [K in Extract<keyof T, string>]: U }) {
    Object.entries<U>(iterable ?? {}).forEach(([k, v]) => map.set(k as Extract<keyof T, string>, v));
    return new Map(map);
  }

  updateActive(key: Extract<keyof T, string>, value: boolean) {
    this.state.$active.update((active) => {
      active.set(key, value);
      return new Map(active);
    });
  }

  updatePinned(key: Extract<keyof T, string>, value: 'left' | 'right' | null) {
    // Todo: change $order if val is left or right
    this.state.$pinned.update((pinned) => {
      pinned.set(key, value);
      return new Map(pinned);
    });
  }

  updateOrder(columns: Extract<keyof T, string>[]) {
    this.state.$order.update(() => [...columns]);
  }

  private createForm(columns?: Column<T>[]) {
    return this.fb.group(
      (columns ?? ([] as Column<T>[])).reduce<{
        [K in Extract<keyof T, string> | 'sort' | 'page' | 'size']: FormControl<string>;
      }>(
        (p, c) => ({
          ...p,
          [c.name]: this.fb.control<string>(
            { value: c.defaultFilter, disabled: c.disableFilter },
            { validators: c.filterValidators ?? [] },
          ),
        }),
        {
          sort: this.fb.control<string>(''),
          page: this.fb.control<string>(''),
          size: this.fb.control<string>(''),
        } as { [K in Extract<keyof T, string> | 'sort' | 'page' | 'size']: FormControl<string> },
      ),
    );
  }
}
