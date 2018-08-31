// @flow
import MaskedPattern from './pattern.js';


export default
class MaskedRange extends MaskedPattern {
  maxLength: number;
  from: number;
  to: number;

  get _matchFrom (): number {
    return this.maxLength - String(this.from).length;
  }

  /**
    @override
  */
  _update (opts: any) {  // TODO type
    let maxLength = String(opts.to).length;
    if (opts.maxLength != null) maxLength = Math.max(maxLength, opts.maxLength);
    opts.maxLength = maxLength;

    const toStr = String(opts.to).padStart(maxLength, '0');
    const fromStr = String(opts.from).padStart(maxLength, '0');
    let sameCharsCount = 0;
    while (sameCharsCount < toStr.length && toStr[sameCharsCount] === fromStr[sameCharsCount]) ++sameCharsCount;
    opts.mask = toStr.slice(0, sameCharsCount).replace(/0/g, '\\0') + '0'.repeat(maxLength - sameCharsCount);

    super._update(opts);
  }

  get isComplete (): boolean {
    return super.isComplete && Boolean(this.value);
  }

  doValidate (...args: *): boolean {
    const str = this.value;
    let minstr = '';
    let maxstr = '';

    const [, placeholder, num] = str.match(/^(\D*)(\d*)(\D*)/) || [];
    if (num) {
      minstr = ('0'.repeat(placeholder.length) + num);
      maxstr = ('9'.repeat(placeholder.length) + num);
    }

    const firstNonZero = str.search(/[^0]/);
    if (firstNonZero === -1 && str.length <= this._matchFrom) return true;

    minstr = minstr.padEnd(this.maxLength, '0');
    maxstr = maxstr.padEnd(this.maxLength, '9');

    return this.from <= Number(maxstr) && Number(minstr) <= this.to &&
      super.doValidate(...args);
  }
}
