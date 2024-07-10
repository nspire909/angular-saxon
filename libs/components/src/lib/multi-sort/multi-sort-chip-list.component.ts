import { type CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { AsyncPipe, JsonPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MultiSortDirective } from './multi-sort.directive';
import { startWith } from 'rxjs';
import { type Sort } from '@angular/material/sort';

@Component({
  standalone: true,
  selector: 'ngsx-multi-sort-chip-list',
  templateUrl: './multi-sort-chip-list.component.html',
  styleUrls: ['./multi-sort-chip-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatChipsModule,
    DragDropModule,
    NgTemplateOutlet,
    MatTooltipModule,
    MatCheckboxModule,
    FormsModule,
    MatIconModule,
    AsyncPipe,
    JsonPipe,
  ],
})
export class MultiSortChipListComponent<T> {
  public readonly sort = inject(MultiSortDirective);

  protected sort$ = this.sort.matMultiSortChange.pipe(
    startWith(
      this.sort.isMulti()
        ? this.sort.actives.map<Sort>((active, i) => ({ active, direction: this.sort.directions[i] ?? '' }))
        : [{ active: this.sort.active, direction: this.sort.direction }],
    ),
  );

  titles = input.required<Map<Extract<keyof T, string>, string>>();

  dropSort(event: CdkDragDrop<string[]>) {
    const actives = [...this.sort.actives];
    moveItemInArray(actives, event.previousIndex, event.currentIndex);
    const directions = [...this.sort.directions];
    moveItemInArray(directions, event.previousIndex, event.currentIndex);

    actives.map(() => this.remove(0));
    actives.map((active, i) =>
      this.sort.sort({
        id: active,
        start: directions[i] ?? '',
        disableClear: false,
      }),
    );
  }

  remove(id: number) {
    this.sort.sort({
      id: this.sort.actives[id] ?? '',
      start: this.sort.directions[id] === 'asc' ? 'desc' : 'asc',
      disableClear: false,
    });
  }

  updateDirection(id: number) {
    this.sort.sort({
      id: this.sort.actives[id] ?? '',
      start: this.sort.directions[id] ?? '',
      disableClear: true,
    });
  }
}
