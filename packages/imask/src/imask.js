import {g} from './core/utils.js';

import InputMask from './controls/input.js';

import Masked from './masked/base.js';
import MaskedPattern from './masked/pattern.js';
import MaskedEnum from './masked/enum.js';
import MaskedRange from './masked/range.js';
import MaskedNumber from './masked/number.js';
import MaskedDate from './masked/date.js';
import MaskedRegExp from './masked/regexp.js';
import MaskedFunction from './masked/function.js';
import MaskedDynamic from './masked/dynamic.js';
import createMask from './masked/factory.js';
import MaskElement from './controls/mask-element.js';
import HTMLMaskElement from './controls/html-mask-element.js';


/**
 * Applies mask on element.
 * @constructor
 * @param {HTMLInputElement|HTMLTextAreaElement|MaskElement} el - Element to apply mask
 * @param {Object} opts - Custom mask options
 * @return {InputMask}
 */
function IMask (el, opts={}) {
	// currently available only for input-like elements
  return new InputMask(el, opts);
}

/** {@link InputMask} */
IMask.InputMask = InputMask;

/** {@link Masked} */
IMask.Masked = Masked;
/** {@link MaskedPattern} */
IMask.MaskedPattern = MaskedPattern;
/** {@link MaskedEnum} */
IMask.MaskedEnum = MaskedEnum;
/** {@link MaskedRange} */
IMask.MaskedRange = MaskedRange;
/** {@link MaskedNumber} */
IMask.MaskedNumber = MaskedNumber;
/** {@link MaskedDate} */
IMask.MaskedDate = MaskedDate;
/** {@link MaskedRegExp} */
IMask.MaskedRegExp = MaskedRegExp;
/** {@link MaskedFunction} */
IMask.MaskedFunction = MaskedFunction;
/** {@link MaskedDynamic} */
IMask.MaskedDynamic = MaskedDynamic;
/** {@link createMask} */
IMask.createMask = createMask;
/** {@link MaskElement} */
IMask.MaskElement = MaskElement;
/** {@link HTMLMaskElement} */
IMask.HTMLMaskElement = HTMLMaskElement;

g.IMask = IMask;

export default IMask;
export {
  InputMask,
  Masked,
  MaskedPattern,
  MaskedEnum,
  MaskedRange,
  MaskedNumber,
  MaskedDate,
  MaskedRegExp,
  MaskedFunction,
  MaskedDynamic,
  createMask,
  MaskElement,
  HTMLMaskElement,
};
