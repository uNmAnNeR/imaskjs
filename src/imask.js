import Masked from './masked/base';
import MaskedPattern from './masked/pattern';
import MaskedNumber from './masked/number';

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

window.IMask = IMask;
