import {isString} from '../core/utils';

import Masked from './base';
import MaskedPattern from './pattern';


export default
function createMask (opts) {
  const mask = opts.mask;
  if (mask instanceof Masked) return mask;
  if (mask instanceof RegExp) return new Masked({
    ...opts,
    validate: (value) => mask.test(value)
  });
  if (isString(mask)) return new MaskedPattern(opts);
  if (mask.prototype instanceof Masked) {
    opts = {...opts};
    delete opts.mask;
    return new mask(opts);
  }
  if (mask instanceof Function){
    return new Masked({
      ...opts,
      validate: mask
    });
  }
  return new Masked(opts);
}
