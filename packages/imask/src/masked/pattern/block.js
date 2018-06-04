// @flow
import type Masked from '../base.js';
import type MaskedPattern from '../pattern.js';


export default
class PatternBlock {
  +masked: Masked<*>;
  +patternMasked: MaskedPattern;
  +value: string;
  +unmaskedValue: string;
  +isComplete: boolean;

  constructor (patternMasked: MaskedPattern, blockMasked: Masked<*>) {
    this.patternMasked = patternMasked;
    this.masked = blockMasked;
  }

  reset () {
    this.masked.reset();
  }

  remove (...args: *) {
    this.masked.remove(...args);
  }

  extractInput (...args: *) {
    return this.masked.extractInput(...args);
  }

  _append (...args: *) {
    return this.masked._append(...args);
  }

  get isComplete (): boolean {
    return this.masked.isComplete;
  }
}
