import Masked from './masked/base';
import PatternMasked from './masked/pattern';

import InputMask from './controls/input';


export default
function IMask (el, opts={}) {
  const mask = new InputMask(el, opts);
  mask.bindEvents();
  // refresh
  mask.value = el.value;
  return mask;
}


IMask.InputMask = InputMask;

IMask.Masked = Masked;
IMask.PatternMasked = PatternMasked;

window.IMask = IMask;
