import Masked from './masked/base.js';
import MaskedPattern from './masked/pattern.js';
import MaskedNumber from './masked/number.js';
import MaskedDate from './masked/date.js';
import MaskedRegExp from './masked/regexp.js';
import MaskedFunction from './masked/function.js';
import MaskedDynamic from './masked/dynamic.js';

import InputMask from './controls/input.js';


export default
function IMask (el, opts={}) {
	// currently available only for input-like elements
  return new InputMask(el, opts);
}


IMask.InputMask = InputMask;

IMask.Masked = Masked;
IMask.MaskedPattern = MaskedPattern;
IMask.MaskedNumber = MaskedNumber;
IMask.MaskedDate = MaskedDate;
IMask.MaskedRegExp = MaskedRegExp;
IMask.MaskedFunction = MaskedFunction;
IMask.MaskedDynamic = MaskedDynamic;

window.IMask = IMask;
