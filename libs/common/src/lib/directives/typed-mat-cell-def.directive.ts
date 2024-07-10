import { CdkCellDef } from '@angular/cdk/table';
import { Directive, forwardRef, input } from '@angular/core';
import { MatCellDef, MatTable } from '@angular/material/table';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[matCellDef]',
  providers: [{ provide: CdkCellDef, useExisting: forwardRef(() => TypedMatCellDefDirective) }],
  standalone: true,
})
export class TypedMatCellDefDirective<T> extends MatCellDef {
  // leveraging syntactic-sugar syntax when we use *matCellDef
  matCellDefTable = input.required<MatTable<T>>();

  // ngTemplateContextGuard flag to help with the Language Service
  static ngTemplateContextGuard<T>(
    _dir: TypedMatCellDefDirective<T>,
    _ctx: unknown,
  ): _ctx is {
    $implicit: T;
    index: number;
    dataIndex: number;
    renderIndex: number;
    count: number;
    first: boolean;
    last: boolean;
    even: boolean;
    odd: boolean;
  } {
    return true;
  }
}
