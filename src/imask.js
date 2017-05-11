import {isString} from './utils';

import BaseMask from './masks/base';
import RegExpMask from './masks/regexp';
import FuncMask from './masks/func';
import PatternMask from './masks/pattern';
import PipeMask from './masks/pipe';


export default
function IMask (el, opts={}) {
  var mask = IMask.MaskFactory(el, opts);
  mask.bindEvents();
  // refresh
  mask.rawValue = el.value;
  return mask;
}

IMask.MaskFactory = function (el, opts) {
  var mask = opts.mask;
  if (mask instanceof BaseMask) return mask;
  if (mask instanceof RegExp) return new RegExpMask(el, opts);
  if (mask instanceof Array) return new PipeMask(el, opts);
  if (isString(mask)) return new PatternMask(el, opts);
  if (mask.prototype instanceof BaseMask) return new mask(el, opts);
  if (mask instanceof Function) return new FuncMask(el, opts);
  return new BaseMask(el, opts);
}
IMask.BaseMask = BaseMask;
IMask.FuncMask = FuncMask;
IMask.RegExpMask = RegExpMask;
IMask.PatternMask = PatternMask;
window.IMask = IMask;
