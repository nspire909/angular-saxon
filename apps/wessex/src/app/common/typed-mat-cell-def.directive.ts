import { CdkCellDef } from '@angular/cdk/table';
import { Directive, input } from '@angular/core';
import { MatCellDef, MatTable } from '@angular/material/table';

@Directive({
  selector: '[matCellDef]',
  providers: [{ provide: CdkCellDef, useExisting: TypedMatCellDef }],
  standalone: true,
})
export class TypedMatCellDef<T> extends MatCellDef {
  // leveraging syntactic-sugar syntax when we use *matCellDef
  matCellDefTable = input.required<MatTable<T>>();

  // ngTemplateContextGuard flag to help with the Language Service
  static ngTemplateContextGuard<T>(
    _dir: TypedMatCellDef<T>,
    _ctx: unknown,
  ): _ctx is { $implicit: T; index: number; dataIndex: number; renderIndex: number } {
    return true;
  }
}
