// @flow
import { isString } from '../core/utils.js';
import type Masked from './base.js';
import { type Mask } from './base.js';
import IMask from '../core/holder.js';


/** Get Masked class by mask type */
export
function maskedClass (mask: Mask): Class<Masked<*>> {
  if (mask == null) {
    throw new Error('mask property should be defined');
  }

  // $FlowFixMe
  if (mask instanceof RegExp) return IMask.MaskedRegExp;
  // $FlowFixMe
  if (isString(mask)) return IMask.MaskedPattern;
  // $FlowFixMe
  if (mask instanceof Date || mask === Date) return IMask.MaskedDate;
  // $FlowFixMe
  if (mask instanceof Number || typeof mask === 'number' || mask === Number) return IMask.MaskedNumber;
  // $FlowFixMe
  if (Array.isArray(mask) || mask === Array) return IMask.MaskedDynamic;
  // $FlowFixMe
  if (IMask.Masked && mask.prototype instanceof IMask.Masked) return mask;
  // $FlowFixMe
  if (mask instanceof Function) return IMask.MaskedFunction;

  console.warn('Mask not found for mask', mask);  // eslint-disable-line no-console
  // $FlowFixMe
  return IMask.Masked;
}

/** Creates new {@link Masked} depending on mask type */
export default
function createMask (opts: {mask: Mask} | Masked<*>): Masked<*> {
  // $FlowFixMe
  if (IMask.Masked && opts instanceof IMask.Masked) return opts;

  opts = {...opts};
  const mask = opts.mask;

  // $FlowFixMe
  if (IMask.Masked && mask instanceof IMask.Masked) return mask;

  const MaskedClass = maskedClass(mask);
  if (!MaskedClass) throw new Error('Masked class is not found for provided mask, appropriate module needs to be import manually before creating mask.');
  return new MaskedClass(opts);
}


IMask.createMask = createMask;
