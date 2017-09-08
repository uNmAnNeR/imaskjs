import {isString} from '../core/utils';


export default
function createMask (opts) {
  opts = Object.create(opts);  // clone
  const mask = opts.mask;

  if (mask instanceof IMask.Masked) {
    return mask;
  }
  if (mask instanceof RegExp) {
    opts.validate = (value) => mask.test(value);
    return new IMask.Masked(opts);
  }
  if (isString(mask)) {
    return new IMask.MaskedPattern(opts);
  }
  if (mask.prototype instanceof IMask.Masked) {
    delete opts.mask;
    return new mask(opts);
  }
  if (mask instanceof Number || typeof mask === 'number' || mask === Number) {
    delete opts.mask;
    return new IMask.MaskedNumber(opts);
  }
  if (mask instanceof Date || mask === Date) {
    delete opts.mask;
    if (opts.pattern) {
      opts.mask = opts.pattern;
      delete opts.pattern;
    }
    return new IMask.MaskedDate(opts);
  }
  if (mask instanceof Function){
    opts.validate = mask;
    return new IMask.Masked(opts);
  }

  console.warn('Mask not found for', opts);  // eslint-disable-line no-console
  return new IMask.Masked(opts);
}
