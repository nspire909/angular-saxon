import { Directive, EventEmitter, Output, booleanAttribute, effect, input } from '@angular/core';
import { MatSort, MatSortable, Sort, SortDirection } from '@angular/material/sort';

@Directive({
  selector: '[ngsxMultiSort]',
  exportAs: 'ngsxMultiSort',
  standalone: true,
})
export class MultiSortDirective extends MatSort {
  isMulti = input<boolean, unknown>(true, { transform: booleanAttribute, alias: 'ngsxMultiSort' });

  actives: string[] = [];
  directions: SortDirection[] = [];

  @Output() readonly matMultiSortChange: EventEmitter<Sort[]> = new EventEmitter<Sort[]>();

  constructor() {
    super();
    effect(() => {
      if (this.isMulti()) {
        super.sort({ id: '', start: '', disableClear: false });
        this.active = '';
        this.direction = '';
      } else {
        this.sort({ id: '', start: '', disableClear: false });
        this.sort({ id: '', start: '', disableClear: false });
        this.sort({ id: '', start: '', disableClear: false });
        this.actives = [];
        this.directions = [];
      }
    });
  }

  override sort(sortable: MatSortable): void {
    if (this.isMulti()) {
      this.updateMultipleSorts(sortable);
    }
    super.sort(sortable);

    this.matMultiSortChange.emit(
      this.isMulti()
        ? this.actives.map<Sort>((active, i) => ({ active, direction: this.directions[i] ?? '' }))
        : [{ active: this.active, direction: this.direction }],
    );
  }

  private updateMultipleSorts(sortable: MatSortable): void {
    const i = this.actives.findIndex((activeId) => activeId === sortable.id);

    if (this.isActive(sortable)) {
      if (this.activeDirection(sortable) === (sortable.start || this.start)) {
        this.directions.splice(i, 1, this.activeDirection(sortable) === 'asc' ? 'desc' : 'asc');
      } else {
        this.actives.splice(i, 1);
        this.directions.splice(i, 1);
      }
    } else {
      this.actives.push(sortable.id);
      this.directions.push(sortable.start || this.start);
    }
  }

  private isActive(sortable: MatSortable) {
    const i = this.actives.findIndex((activeId) => activeId === sortable.id);
    return i > -1;
  }

  private activeDirection(sortable: MatSortable): SortDirection {
    const i = this.actives.findIndex((activeId) => activeId === sortable.id);
    return this.directions[i] || sortable.start || this.start;
  }
}
