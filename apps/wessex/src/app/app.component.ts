import { assertPresent } from '@angular-saxon/common';
import { ELEMENT_DATA, TableComponent, getEntity } from '@angular-saxon/components';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    TableComponent,
    MatButtonToggleModule,
    ReactiveFormsModule,
    JsonPipe,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  fb = inject(NonNullableFormBuilder);
  tableOptions = this.fb.group({
    rowAction: this.fb.control<'select' | 'expand' | 'link' | 'none'>('expand'),
    multi: this.fb.control<boolean>(false),
    showFilter: this.fb.control<boolean>(true),
    showPaginator: this.fb.control<boolean>(false),
    showActions: this.fb.control<boolean>(true),
    showActionRow: this.fb.control<boolean>(true),
    cellWrapping: this.fb.control<boolean>(false),
    multiSort: this.fb.control<boolean>(true),
    emptyMessage: this.fb.control<string>(''),
  });

  data = signal(ELEMENT_DATA);

  entity = signal(getEntity());

  addData() {
    const randomElementIndex = Math.floor(Math.random() * ELEMENT_DATA.length);
    this.data.update((data) => [...data, assertPresent(ELEMENT_DATA[randomElementIndex])]);
  }

  removeData() {
    this.data.update((data) => data.slice(0, -1));
  }

  resetColumns() {
    this.entity.update(() => getEntity());
  }
}
