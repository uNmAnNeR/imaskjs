// @flow
import {escapeRegExp, indexInDirection, type Direction} from '../core/utils.js';
import Masked, {type MaskedOptions, type AppendFlags} from './base.js';


type MaskedNumberOptions = {
  ...MaskedOptions<Number>,
  radix: $PropertyType<MaskedNumber, 'radix'>,
  thousandsSeparator: $PropertyType<MaskedNumber, 'thousandsSeparator'>,
  mapToRadix: $PropertyType<MaskedNumber, 'mapToRadix'>,
  scale: $PropertyType<MaskedNumber, 'scale'>,
  signed: $PropertyType<MaskedNumber, 'signed'>,
  normalizeZeros: $PropertyType<MaskedNumber, 'normalizeZeros'>,
  padFractionalZeros: $PropertyType<MaskedNumber, 'padFractionalZeros'>,
  postFormat: $PropertyType<MaskedNumber, 'postFormat'>, // TODO deprecarted, remove in 3.0
};

export default
class MaskedNumber extends Masked<Number> {
  static DEFAULTS: $Shape<MaskedNumberOptions>;

  radix: string;
  thousandsSeparator: string;
  mapToRadix: Array<string>;
  min: number;
  max: number;
  scale: number;
  signed: boolean;
  normalizeZeros: boolean;
  padFractionalZeros: boolean;
  postFormat: any; // TODO deprecarted, remove in 3.0
  _numberRegExp: RegExp;
  _numberRegExpInput: RegExp;
  _thousandsSeparatorRegExp: RegExp;
  _mapToRadixRegExp: RegExp;

  constructor (opts: $Shape<MaskedNumberOptions>) {
    super({
      ...MaskedNumber.DEFAULTS,
      ...opts
    });
  }

  _update (opts: MaskedNumberOptions) {
    if (opts.postFormat) {
      console.warn("'postFormat' option is deprecated and will be removed in next release, use plain options instead.");
      Object.assign(opts, opts.postFormat);
      delete opts.postFormat;
    }
    super._update(opts);
    this._updateRegExps();
  }

  _updateRegExps () {
    // use different regexp to process user input (more strict, input suffix) and tail shifting
    const start = '^'

    let midInput = '';
    let mid = '';
    if (this.allowNegative) {
      midInput += '([+|\\-]?|([+|\\-]?(0|([1-9]+\\d*))))';
      mid += '[+|\\-]?';
    } else {
      midInput += '(0|([1-9]+\\d*))';
    }
    mid += '\\d*';

    let end = (this.scale ?
      '(' + this.radix + '\\d{0,' + this.scale + '})?' :
      '') + '$';

    this._numberRegExpInput = new RegExp(start + midInput + end);
    this._numberRegExp = new RegExp(start + mid + end);
    this._mapToRadixRegExp = new RegExp('[' +
      this.mapToRadix.map(escapeRegExp).join('') +
    ']', 'g');
    this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
  }

  _extractTail (fromPos: number=0, toPos: number=this.value.length): string {
    return this._removeThousandsSeparators(super._extractTail(fromPos, toPos));
  }

  _removeThousandsSeparators (value: string): string {
    return value.replace(this._thousandsSeparatorRegExp, '');
  }

  _insertThousandsSeparators (value: string): string {
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    const parts = value.split(this.radix);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
    return parts.join(this.radix);
  }

  doPrepare (str: string, ...args: *) {
    return super.doPrepare(this._removeThousandsSeparators(str.replace(this._mapToRadixRegExp, this.radix)), ...args);
  }

  appendWithTail (...args: *) {
    let previousValue = this.value;
    this._value = this._removeThousandsSeparators(this.value);
    let startChangePos = this.value.length;

    const appendDetails = super.appendWithTail(...args);
    this._value = this._insertThousandsSeparators(this.value);

    // calculate offsets after insert separators
    let beforeTailPos = startChangePos + appendDetails.inserted.length;
    for (let pos = 0; pos <= beforeTailPos; ++pos) {
      if (this.value[pos] === this.thousandsSeparator) {
        if (pos < startChangePos ||
          // check high bound
          // if separator is still there - consider it also
          (pos === startChangePos && previousValue[pos] === this.thousandsSeparator)) {
          ++startChangePos;
        }
        if (pos < beforeTailPos) ++beforeTailPos;
      }
    }

    // adjust details with separators
    appendDetails.rawInserted = appendDetails.inserted;
    appendDetails.inserted = this.value.slice(startChangePos, beforeTailPos);
    appendDetails.shift += startChangePos - previousValue.length;

    return appendDetails;
  }

  nearestInputPos (cursorPos: number, direction?: Direction): number {
    if (!direction) return cursorPos;

    const nextPos = indexInDirection(cursorPos, direction);
    if (this.value[nextPos] === this.thousandsSeparator) cursorPos += direction;
    return cursorPos;
  }

  doValidate (flags: AppendFlags) {
    const regexp = flags.input ? this._numberRegExpInput : this._numberRegExp;

    // validate as string
    let valid = regexp.test(this._removeThousandsSeparators(this.value));

    if (valid) {
      // validate as number
      const number = this.number;
      valid = valid && !isNaN(number) &&
        // check min bound for negative values
        (this.min == null || this.min >= 0 || this.min <= this.number) &&
        // check max bound for positive values
        (this.max == null || this.max <= 0 || this.number <= this.max);
    }

    return valid && super.doValidate(flags);
  }

  doCommit () {
    const number = this.number;
    let validnum = number;

    // check bounds
    if (this.min != null) validnum = Math.max(validnum, this.min);
    if (this.max != null) validnum = Math.min(validnum, this.max);

    if (validnum !== number) this.unmaskedValue = String(validnum);

    let formatted = this.value;

    if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
    if (this.padFractionalZeros) formatted = this._padFractionalZeros(formatted);

    this._value = formatted;
    super.doCommit();
  }

  _normalizeZeros (value: string): string {
    const parts = this._removeThousandsSeparators(value).split(this.radix);

    // remove leading zeros
    parts[0] = parts[0].replace(/^(\D*)(0*)(\d*)/, (match, sign, zeros, num) => sign + num);
    // add leading zero
    if (value.length && !/\d$/.test(parts[0])) parts[0] = parts[0] + '0';

    if (parts.length > 1) {
      parts[1] = parts[1].replace(/0*$/, '');  // remove trailing zeros
      if (!parts[1].length) parts.length = 1;  // remove fractional
    }

    return this._insertThousandsSeparators(parts.join(this.radix));
  }

  _padFractionalZeros (value: string): string {
    if (!value) return value;

    const parts = value.split(this.radix);
    if (parts.length < 2) parts.push('');
    parts[1] = parts[1].padEnd(this.scale, '0');
    return parts.join(this.radix);
  }

  get number (): number {
    let numstr =
      this._removeThousandsSeparators(
        this._normalizeZeros(
          this.unmaskedValue))
      .replace(this.radix, '.');

    return Number(numstr);
  }

  set number (number: number) {
    this.unmaskedValue = String(number).replace('.', this.radix);
  }

  get allowNegative (): boolean {
    return this.signed ||
      (this.min != null && this.min < 0) ||
      (this.max != null && this.max < 0);
  }
}
MaskedNumber.DEFAULTS = {
  radix: ',',
  thousandsSeparator: '',
  mapToRadix: ['.'],
  scale: 2,
  signed: false,
  normalizeZeros: true,
  padFractionalZeros: false,
};
