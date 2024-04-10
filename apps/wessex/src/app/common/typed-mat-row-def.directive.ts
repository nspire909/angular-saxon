import { CdkRowDef } from '@angular/cdk/table';
import { Directive, input } from '@angular/core';
import { MatRowDef, MatTable } from '@angular/material/table';

@Directive({
  selector: '[matRowDef]',
  providers: [{ provide: CdkRowDef, useExisting: TypedMatRowDef }],
  standalone: true,
})
export class TypedMatRowDef<T> extends MatRowDef<T> {
  // leveraging syntactic-sugar syntax when we use *matCellDef
  matRowDefTable = input.required<MatTable<T>>();
  matRowDefColumns = input.required<string[]>();

  // ngTemplateContextGuard flag to help with the Language Service
  static ngTemplateContextGuard<T>(
    _dir: TypedMatRowDef<T>,
    _ctx: unknown,
  ): _ctx is { $implicit: T; index: number; dataIndex: number; renderIndex: number } {
    return true;
  }
}
