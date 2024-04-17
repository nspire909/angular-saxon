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
    $titles: signal(new Map<Extract<keyof T, string>, string>()),
    $active: signal(new Map<Extract<keyof T, string>, boolean>()),
    $pinned: signal(new Map<Extract<keyof T, string>, 'left' | 'right' | null | undefined>()),
    $order: signal<Extract<keyof T, string>[]>([]),
  } as const;

  private _$filter?: Signal<FilterFormGroup<T>>;

  public get $filter(): Signal<FilterFormGroup<T>> | undefined {
    return this._$filter;
  }
  public set $filter(columns: Column<T>[]) {
    this._$filter = computed(() => this.createForm(columns));
    this.setTitles(columns);
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

  public readonly $titles = this.state.$titles.asReadonly();
  public readonly $active = this.state.$active.asReadonly();
  public readonly $pinned = this.state.$pinned.asReadonly();
  public readonly $order = this.state.$order.asReadonly();

  private setTitles(columns?: Column<T>[]) {
    this.state.$titles.update(() => new Map(columns?.map((column) => [column.name, column.title])));
  }

  private setActive(columns?: Column<T>[]) {
    this.state.$active.update(() => new Map(columns?.map((column) => [column.name, column.isActive])));
  }

  private setPinned(columns?: Column<T>[]) {
    this.state.$pinned.update(() => new Map(columns?.map((column) => [column.name, column.pinned])));
  }

  private setOrder(columns?: Column<T>[]) {
    this.state.$order.update(() => columns?.map((column) => column.name) ?? []);
  }

  updateActive(key: Extract<keyof T, string>, value: boolean) {
    this.state.$active.update((active) => new Map([...active, [key, value]]));
  }

  updatePinned(key: Extract<keyof T, string>, value: 'left' | 'right' | null) {
    this.state.$pinned.update((pinned) => new Map([...pinned, [key, value]]));
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
