import 'core-js/fn/array/find';
import 'core-js/fn/object/keys';
import 'core-js/fn/string/repeat';
import 'core-js/fn/string/pad-start';
import 'core-js/fn/string/pad-end';


import Masked from './masked/base';
import MaskedPattern from './masked/pattern';
import MaskedNumber from './masked/number';
import MaskedDate from './masked/date';
import MaskedRegExp from './masked/regexp';
import MaskedFunction from './masked/function';

import InputMask from './controls/input';


export default
function IMask (el, opts={}) {
	// currently available only for input elements
  return new InputMask(el, opts);
}


IMask.InputMask = InputMask;

IMask.Masked = Masked;
IMask.MaskedPattern = MaskedPattern;
IMask.MaskedNumber = MaskedNumber;
IMask.MaskedDate = MaskedDate;
IMask.MaskedRegExp = MaskedRegExp;
IMask.MaskedFunction = MaskedFunction;

window.IMask = IMask;
