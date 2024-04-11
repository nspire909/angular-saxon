import { CdkRowDef } from '@angular/cdk/table';
import { Directive, input } from '@angular/core';
import { MatRowDef, MatTable } from '@angular/material/table';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[matRowDef]',
  providers: [{ provide: CdkRowDef, useExisting: TypedMatRowDefDirective }],
  standalone: true,
})
export class TypedMatRowDefDirective<T> extends MatRowDef<T> {
  // leveraging syntactic-sugar syntax when we use *matCellDef
  matRowDefTable = input.required<MatTable<T>>();
  matRowDefColumns = input.required<Iterable<string>>();
  matRowDefWhen = input<(index: number, rowData: T) => boolean>();

  // ngTemplateContextGuard flag to help with the Language Service
  static ngTemplateContextGuard<T>(
    _dir: TypedMatRowDefDirective<T>,
    _ctx: unknown,
  ): _ctx is {
    $implicit: T;
  } {
    return true;
  }
}
