// @flow
import { isString } from '../core/utils.js';
import type Masked from './base.js';
import { type Mask } from './base.js';


/** Get Masked class by mask type */
export
function maskedClass (mask: Mask): Class<Masked<*>> {
  if (mask == null) {
    throw new Error('mask property should be defined');
  }

  // $FlowFixMe
  if (mask instanceof RegExp) return globalThis.IMask.MaskedRegExp;
  // $FlowFixMe
  if (isString(mask)) return globalThis.IMask.MaskedPattern;
  // $FlowFixMe
  if (mask instanceof Date || mask === Date) return globalThis.IMask.MaskedDate;
  // $FlowFixMe
  if (mask instanceof Number || typeof mask === 'number' || mask === Number) return globalThis.IMask.MaskedNumber;
  // $FlowFixMe
  if (Array.isArray(mask) || mask === Array) return globalThis.IMask.MaskedDynamic;
  // $FlowFixMe
  if (globalThis.IMask && globalThis.IMask.Masked && mask.prototype instanceof globalThis.IMask.Masked) return mask;
  // $FlowFixMe
  if (mask instanceof Function) return globalThis.IMask.MaskedFunction;

  console.warn('Mask not found for mask', mask);  // eslint-disable-line no-console
  // $FlowFixMe
  return globalThis.IMask && globalThis.IMask.Masked;
}

/** Creates new {@link Masked} depending on mask type */
export default
function createMask (opts: {mask: Mask} | Masked<*>): Masked<*> {
  // $FlowFixMe
  if (globalThis.IMask && globalThis.IMask.Masked && opts instanceof globalThis.IMask.Masked) return opts;

  opts = {...opts};
  const mask = opts.mask;

  // $FlowFixMe
  if (globalThis.IMask && globalThis.IMask.Masked && mask instanceof globalThis.IMask.Masked) return mask;

  const MaskedClass = maskedClass(mask);
  if (!MaskedClass) throw new Error('Masked class is not found for provided mask, appropriate module needs to be import manually before creating mask.');
  return new MaskedClass(opts);
}


// $FlowFixMe
if (globalThis.IMask) globalThis.IMask.createMask = createMask;
