/**
 * Ensures that an object literal becomes strongly typed based on the supplied type
 *
 * @example
 *  this.dialog.open(PocDialogForDetailComponent, {
 *      width: '1200px',
 *      height: '730px',
 *      data: asA<PocDialogOptions>({
 *        allowEdit: this.stopForm.enabled,
 *        carrier,
 *        ...
 *      })
 *  })
 */
export function asA<T>(t: T): T {
  return t;
}

/**
 * Type guard that can be used to strip null and/or undefined from a type, useful
 * for filter functions (both array, and observable).
 *
 * @example
 *   function example(values: Array<string | null>) {
 *     return values.filter(isPresent).map(v => v.toUpperCase());
 *   }
 */
export function isPresent<T>(t: T | null | undefined): t is T {
  return t !== null && t !== undefined;
}

/**
 * Returns the value with null & undefined removed from the type, but will
 *   throw if the value is null or undefined.  This is an alternative
 *   to non-null-assertions.
 *
 * @example
 *   function example(value: string | null | undefined) {
 *     value.toUpperCase(); //TS2533: Object is possibly 'null' or 'undefined'
 *     const a = assertPresent(value);
 *     a.toUpperCase();
 *   }
 */
export function assertPresent<T>(t: T | null | undefined): T {
  if (!isPresent(t)) {
    throw new Error('Expected value to be defined');
  }
  return t;
}

/**
 * Asserts that control should never reach this call.
 *
 * This is useful to ensure all options of a discriminated union have been exhausted.
 *
 * @example
 *   function example(item: 'foo' | 'bar' | 'baz') {
 *     switch (item) {
 *       case 'foo': return 1;
 *       case 'bar': return 0;
 *        //TS2345: Argument of type '"baz"' is not assignable to parameter of type 'never'.
 *       default: assertNever(item);
 *     }
 *   }
 */
export function assertNever(n: never): never {
  //Twisting, turning through the never
  throw new Error(`Expected nothing, found something ${n}`);
}

/**
 * Changes a type so all of it's properties can be undefined or null,
 *   same as Partial except it also adds null
 */
export type Optional<T> = {
  [P in keyof T]?: T[P] | null;
};

/**
 * Replaces the type of a property on A with the type of a property on B
 *
 * NOTE: B will not throw error if property being replaced isn't on A
 *
 * @example
 * interface Number {
 *    one: number;
 *    two: number;
 * }
 *
 * type NewType = Replace<Number, { two: string }> // two is now a string
 */
export type Replace<A, B> = Omit<A, keyof B> & B;
