import { Pipe, PipeTransform } from '@angular/core';

import IMask from 'imask';


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
  transform (...args: Parameters<typeof IMask.pipe>): ReturnType<typeof IMask.pipe> {
    return IMask.pipe(...args);
  }
}

export const PIPE_TYPE = IMask.PIPE_TYPE;
