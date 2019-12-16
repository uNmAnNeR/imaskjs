/**
 * Applies mask on element.
 * @constructor
 * @param {HTMLInputElement|HTMLTextAreaElement|MaskElement} el - Element to apply mask
 * @param {Object} opts - Custom mask options
 * @return {InputMask}
 */
export default
function IMask (el, opts={}) {
  // currently available only for input-like elements
  return new IMask.InputMask(el, opts);
}
