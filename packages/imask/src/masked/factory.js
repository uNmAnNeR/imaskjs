// @flow
import {g, isString} from '../core/utils.js';
import type Masked from './base.js';
import {type Mask} from './base.js';


/** Get Masked class by mask type */
export
function maskedClass (mask: Mask): Class<Masked<*>> {
  if (mask == null) {
    throw new Error('mask property should be defined');
  }

  if (mask instanceof RegExp) return g.IMask.MaskedRegExp;
  if (isString(mask)) return g.IMask.MaskedPattern;
  if (mask instanceof Date || mask === Date) return g.IMask.MaskedDate;
  if (mask instanceof Number || typeof mask === 'number' || mask === Number) return g.IMask.MaskedNumber;
  if (Array.isArray(mask) || mask === Array) return g.IMask.MaskedDynamic;
  // $FlowFixMe
  if (mask.prototype instanceof g.IMask.Masked) return mask;
  // $FlowFixMe
  if (mask instanceof Function) return g.IMask.MaskedFunction;

  console.warn('Mask not found for mask', mask);  // eslint-disable-line no-console
  return g.IMask.Masked;
}

/** Creates new {@link Masked} depending on mask type */
export default
function createMask (opts: {mask: Mask} | Masked<*>): Masked<*> {
  if (opts instanceof g.IMask.Masked) return opts;

  opts = {...opts};
  const mask = opts.mask;

  if (mask instanceof g.IMask.Masked) return mask;

  const MaskedClass = maskedClass(mask);
  return new MaskedClass(opts);
}
