// @flow
import MaskedPattern from './pattern.js';
import { type AppendFlags } from './base.js';
import IMask from '../core/holder.js';


/** Pattern which accepts ranges */
export default
class MaskedRange extends MaskedPattern {
  /**
    Optionally sets max length of pattern.
    Used when pattern length is longer then `to` param length. Pads zeros at start in this case.
  */
  maxLength: number;
  /** Min bound */
  from: number;
  /** Max bound */
  to: number;
  /** */
  autofix: boolean;

  get _matchFrom (): number {
    return this.maxLength - String(this.from).length;
  }

  /**
    @override
  */
  _update (opts: any) {  // TODO type
    opts = {
      to: this.to || 0,
      from: this.from || 0,
      ...opts,
    };

    let maxLength = String(opts.to).length;
    if (opts.maxLength != null) maxLength = Math.max(maxLength, opts.maxLength);
    opts.maxLength = maxLength;

    const fromStr = String(opts.from).padStart(maxLength, '0');
    const toStr = String(opts.to).padStart(maxLength, '0');
    let sameCharsCount = 0;
    while (sameCharsCount < toStr.length && toStr[sameCharsCount] === fromStr[sameCharsCount]) ++sameCharsCount;
    opts.mask = toStr.slice(0, sameCharsCount).replace(/0/g, '\\0') + '0'.repeat(maxLength - sameCharsCount);

    super._update(opts);
  }

  /**
    @override
  */
  get isComplete (): boolean {
    return super.isComplete && Boolean(this.value);
  }

  boundaries (str: string): [string, string] {
    let minstr = '';
    let maxstr = '';

    const [, placeholder, num] = str.match(/^(\D*)(\d*)(\D*)/) || [];
    if (num) {
      minstr = '0'.repeat(placeholder.length) + num;
      maxstr = '9'.repeat(placeholder.length) + num;
    }
    minstr = minstr.padEnd(this.maxLength, '0');
    maxstr = maxstr.padEnd(this.maxLength, '9');

    return [minstr, maxstr];
  }

  /**
    @override
  */
  doPrepare (str: string, flags: AppendFlags={}): string {
    str = super.doPrepare(str, flags).replace(/\D/g, '');
    if (!this.autofix) return str;

    const fromStr = String(this.from).padStart(this.maxLength, '0');
    const toStr = String(this.to).padStart(this.maxLength, '0');

    const val = this.value;
    let prepStr = '';
    for (let ci=0; ci<str.length; ++ci) {
      const nextVal = val + prepStr + str[ci];
      const [minstr, maxstr] = this.boundaries(nextVal);

      if (Number(maxstr) < this.from) prepStr += fromStr[nextVal.length - 1];
      else if (Number(minstr) > this.to) prepStr += toStr[nextVal.length - 1];
      else prepStr += str[ci];
    }

    return prepStr;
  }

  /**
    @override
  */
  doValidate (...args: *): boolean {
    const str = this.value;

    const firstNonZero = str.search(/[^0]/);
    if (firstNonZero === -1 && str.length <= this._matchFrom) return true;

    const [minstr, maxstr] = this.boundaries(str);

    return this.from <= Number(maxstr) && Number(minstr) <= this.to &&
      super.doValidate(...args);
  }
}


IMask.MaskedRange = MaskedRange;
