import {isString} from '../core/utils';
import Masked from './base';
import MaskedNumber from './number';


export default
function createMask (opts) {
  opts = Object.assign({}, opts);  // clone

  const mask = opts.mask;

  if (mask instanceof Masked) {
    return mask;
  }
  if (mask instanceof RegExp) {
    opts.validate = (value) => mask.test(value);
    return new Masked(opts);
  }
  if (isString(mask)) {
    return new IMask.MaskedPattern(opts);
  }
  if (mask.prototype instanceof Masked) {
    delete opts.mask;
    return new mask(opts);
  }
  if (mask instanceof Number || typeof mask === 'number' || mask === Number) {
    delete opts.mask;
    return new MaskedNumber(opts);
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
    return new Masked(opts);
  }

  console.warn('Mask not found for', opts);  // eslint-disable-line no-console
  return new Masked(opts);
}
