import { Pipe, PipeTransform } from '@angular/core';

import { pipe } from 'imask';
export { PIPE_TYPE, pipe } from 'imask';


/*
 * Transforms value through mask
 * Takes mask and optionally `from` and `to` pipe types.
 * Usage:
 *   value | imask:MASK_OR_MASKED:opt_from:opt_to
 * Example:
 *   {{ 2 | imask:mask }}
*/
@Pipe({name: 'imask'})
export class IMaskPipe implements PipeTransform {
  transform (...args: Parameters<typeof pipe>): ReturnType<typeof pipe> {
    return pipe(...args);
  }
}
