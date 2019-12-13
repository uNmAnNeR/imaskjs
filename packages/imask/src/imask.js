import '@ungap/global-this';

import InputMask from './controls/input.js';

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
// $FlowFixMe
globalThis.IMask = IMask;

export default IMask;
