import MaskedPattern, { type MaskedPatternOptions } from './pattern';
import ChangeDetails from '../core/change-details';
import Masked, { type AppendFlags } from './base';
import IMask from '../core/holder';

export
type MaskedRangeOptions<Parent extends Masked=any> = MaskedPatternOptions<Parent> &
  Partial<Pick<MaskedRange, 'maxLength' | 'from' | 'to' | 'autofix'>>;


/** Pattern which accepts ranges */
export default
class MaskedRange<Parent extends Masked=any> extends MaskedPattern<Parent> {
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
  autofix: boolean | 'pad';

  get _matchFrom (): number {
    return this.maxLength - String(this.from).length;
  }

  /**
    @override
  */
  override _update (opts: Partial<MaskedRangeOptions>) {  // TODO type
    opts = {
      to: this.to || 0,
      from: this.from || 0,
      maxLength: this.maxLength || 0,
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
  override get isComplete (): boolean {
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

  // TODO str is a single char everytime
  /**
    @override
  */ 
  override doPrepare (ch: string, flags: AppendFlags={}): [string, ChangeDetails] {
    let details: ChangeDetails;
    [ch, details] = super.doPrepare(ch.replace(/\D/g, ''), flags);

    if (!this.autofix || !ch) return [ch, details];

    const fromStr = String(this.from).padStart(this.maxLength, '0');
    const toStr = String(this.to).padStart(this.maxLength, '0');

    let nextVal = this.value + ch;
    if (nextVal.length > this.maxLength) return ['', details];

    const [minstr, maxstr] = this.boundaries(nextVal);

    if (Number(maxstr) < this.from) return [fromStr[nextVal.length - 1], details];

    if (Number(minstr) > this.to) {
      if (this.autofix === 'pad' && nextVal.length < this.maxLength) {
        return ['', details.aggregate(this.append(fromStr[nextVal.length - 1]+ch, flags))];
      }
      return [toStr[nextVal.length - 1], details];
    }

    return [ch, details];
  }

  /**
    @override
  */
  override doValidate (flags: AppendFlags): boolean {
    const str = this.value;

    const firstNonZero = str.search(/[^0]/);
    if (firstNonZero === -1 && str.length <= this._matchFrom) return true;

    const [minstr, maxstr] = this.boundaries(str);

    return this.from <= Number(maxstr) && Number(minstr) <= this.to &&
      super.doValidate(flags);
  }
}


IMask.MaskedRange = MaskedRange;
