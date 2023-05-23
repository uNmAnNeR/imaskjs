import { Pipe, PipeTransform } from '@angular/core';

import { pipe, type FactoryArg } from 'imask';
export { PIPE_TYPE, pipe } from 'imask';


/*
 * Transforms value through mask
 * Takes mask and optionally `from` and `to` pipe types.
 * Usage:
 *   value | imask:MASK_OR_MASKED:opt_from:opt_to
 * Example:
 *   {{ 2 | imask:mask }}
*/
@Pipe({name: 'imask', standalone: true})
export class IMaskPipe implements PipeTransform {
  transform<Opts extends FactoryArg> (...args: Parameters<typeof pipe<Opts>>): ReturnType<typeof pipe<Opts>> {
    return pipe(...args);
  }
}
