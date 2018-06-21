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
    opts.mask = '0'.repeat(maxLength);

    super._update(opts);
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
