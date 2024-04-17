import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { CdkColumnDef } from '@angular/cdk/table';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject } from '@angular/core';
import { MAT_SORT_DEFAULT_OPTIONS, MatSortHeader, MatSortHeaderIntl } from '@angular/material/sort';
import { MultiSortDirective } from './multi-sort.directive';

@Component({
  standalone: true,
  selector: 'ngsx-multi-sort-header',
  exportAs: 'ngsxMultiSortHeader',
  templateUrl: 'multi-sort-header.component.html',
  styleUrl: 'multi-sort-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSortHeaderComponent extends MatSortHeader {
  public override readonly _sort = inject(MultiSortDirective);

  constructor() {
    super(
      inject(MatSortHeaderIntl),
      inject(ChangeDetectorRef),
      inject(MultiSortDirective),
      inject(CdkColumnDef),
      inject(FocusMonitor),
      inject<ElementRef<HTMLElement>>(ElementRef),
      inject(AriaDescriber),
      inject(MAT_SORT_DEFAULT_OPTIONS, { optional: true }) ?? undefined,
    );
  }

  sort(direction: 'none' | 'ascending' | 'descending') {
    while (this._getAriaSortAttribute() !== direction) {
      this._sort.sort(this);
    }
  }

  override _isSorted() {
    return this._sort.isMulti()
      ? this._sort.actives.findIndex((activeId) => activeId === this.id) > -1
      : super._isSorted();
  }

  protected sortId() {
    return this._sort.isMulti() ? this._sort.actives.findIndex((activeId) => activeId === this.id) + 1 || '' : '';
  }

  override _updateArrowDirection() {
    if (this._sort.isMulti()) {
      this._arrowDirection = this.getSortDirection();
    } else {
      super._updateArrowDirection();
    }
  }

  override _getAriaSortAttribute() {
    if (this._sort.isMulti()) {
      if (!this._isSorted()) {
        return 'none';
      }

      const i = this._sort.actives.findIndex((activeIds) => activeIds === this.id);
      const direction = this._sort.directions[i] || this.start || this._sort.start;

      return direction === 'asc' ? 'ascending' : 'descending';
    } else {
      return super._getAriaSortAttribute();
    }
  }

  private getSortDirection() {
    const i = this._sort.actives.findIndex((activeIds) => activeIds === this.id);
    const direction = this._sort.directions[i] || this.start || this._sort.start;
    return this._isSorted() ? direction : this.start || this._sort.start;
  }
}
