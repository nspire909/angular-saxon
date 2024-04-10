import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-components',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './components.component.html',
  styleUrl: './components.component.css',
})
export class ComponentsComponent {}
