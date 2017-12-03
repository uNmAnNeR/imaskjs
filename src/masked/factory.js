import {g, isString} from '../core/utils.js';


export
function maskedClass (mask) {
  if (mask == null) {
    throw new Error('mask property should be defined');
  }

  if (mask instanceof RegExp) return g.IMask.MaskedRegExp;
  if (isString(mask)) return g.IMask.MaskedPattern;
  if (mask.prototype instanceof g.IMask.Masked) return mask;
  if (Array.isArray(mask) || mask === Array) return g.IMask.MaskedDynamic;
  if (mask instanceof Number || typeof mask === 'number' || mask === Number) return g.IMask.MaskedNumber;
  if (mask instanceof Date || mask === Date) return g.IMask.MaskedDate;
  if (mask instanceof Function) return g.IMask.MaskedFunction;

  console.warn('Mask not found for mask', mask);  // eslint-disable-line no-console
  return g.IMask.Masked;
}


export default
function createMask (opts) {
  opts = Object.assign({}, opts);  // clone
  const mask = opts.mask;

  if (mask instanceof g.IMask.Masked) return mask;

  const MaskedClass = maskedClass(mask);
  return new MaskedClass(opts);
}
