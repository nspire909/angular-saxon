import { Pipe, PipeTransform } from '@angular/core';

/**
 * This pipe allows you to call functions as a pure pipe.  Keep in mind, 'this' will not be set, so if you are using
 *   a method on your component be sure to use fat arrow ('=>') or otherwise bind the method to your component.
 */
@Pipe({
  standalone: true,
  name: 'pure',
  pure: true,
})
export class PurePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform<T, A extends any[], P extends (value: T, ...args: A) => any>(value: T, func: P, ...args: A): ReturnType<P> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return func(value, ...args);
  }
}
