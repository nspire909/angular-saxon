import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerService } from './spinner.service';
import { AsyncPipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [MatProgressSpinnerModule, AsyncPipe],
  selector: 'ngsx-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  protected readonly visible$ = inject(SpinnerService).visible$;
}
