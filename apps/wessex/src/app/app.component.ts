import { assertPresent } from '@angular-saxon/common';
import { CITIES, City, TableComponent, getCityEntity } from '@angular-saxon/components';
import { JsonPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, HostBinding, inject, signal } from '@angular/core';
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
    HttpClientModule,
  ],
  selector: 'ngsx-wessex',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  fb = inject(NonNullableFormBuilder);
  tableOptions = this.fb.group({
    rowAction: this.fb.control<'select' | 'expand' | 'link' | 'none'>('none'),
    multi: this.fb.control<boolean>(false),
    dense: this.fb.control<boolean>(true),
    showFilter: this.fb.control<boolean>(true),
    showPaginator: this.fb.control<boolean>(false),
    showActions: this.fb.control<boolean>(true),
    showActionRow: this.fb.control<boolean>(true),
    cellWrapping: this.fb.control<boolean>(false),
    multiSort: this.fb.control<boolean>(true),
    emptyMessage: this.fb.control<string>(''),
  });

  colorMode = this.fb.control<string>(window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  @HostBinding('class.dark') get dark() {
    return this.colorMode.value === 'dark';
  }

  constructor() {
    inject(HttpClient)
      .get<{ items: City[] }>('cities.json')
      .subscribe((cities) => this.data.set(cities.items.slice(0, 10000)));
  }

  data = signal(CITIES);

  entity = signal(getCityEntity());

  addData() {
    const randomElementIndex = Math.floor(Math.random() * CITIES.length);
    this.data.update((data) => [...data, assertPresent(CITIES[randomElementIndex])]);
  }

  removeData() {
    this.data.update((data) => data.slice(0, -1));
  }

  resetColumns() {
    this.entity.update(() => getCityEntity());
  }
}
