// @flow
import {escapeRegExp, indexInDirection, posInDirection, type Direction} from '../core/utils.js';
import ChangeDetails from '../core/change-details.js';
import {type TailDetails} from '../core/tail-details.js';

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
};

/**
  Number mask
  @param {Object} opts
  @param {string} opts.radix - Single char
  @param {string} opts.thousandsSeparator - Single char
  @param {Array<string>} opts.mapToRadix - Array of single chars
  @param {number} opts.min
  @param {number} opts.max
  @param {number} opts.scale - Digits after point
  @param {boolean} opts.signed - Allow negative
  @param {boolean} opts.normalizeZeros - Flag to remove leading and trailing zeros in the end of editing
  @param {boolean} opts.padFractionalZeros - Flag to pad trailing zeros after point in the end of editing
*/
export default
class MaskedNumber extends Masked<Number> {
  static DEFAULTS: $Shape<MaskedNumberOptions>;

  /** Single char */
  radix: string;
  /** Single char */
  thousandsSeparator: string;
  /** Array of single chars */
  mapToRadix: Array<string>;
  /** */
  min: number;
  /** */
  max: number;
  /** Digits after point */
  scale: number;
  /** */
  signed: boolean;
  /** Flag to remove leading and trailing zeros in the end of editing */
  normalizeZeros: boolean;
  /** Flag to pad trailing zeros after point in the end of editing */
  padFractionalZeros: boolean;
  _numberRegExp: RegExp;
  _numberRegExpInput: RegExp;
  _thousandsSeparatorRegExp: RegExp;
  _mapToRadixRegExp: RegExp;
  _separatorsProcessed: boolean;

  constructor (opts: $Shape<MaskedNumberOptions>) {
    super({
      ...MaskedNumber.DEFAULTS,
      ...opts
    });
  }

  /**
    @override
  */
  _update (opts: MaskedNumberOptions) {
    super._update(opts);
    this._updateRegExps();
  }

  /** */
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

  /**
    @override
  */
  _extractTail (fromPos: number=0, toPos: number=this.value.length): TailDetails {
    const tail = super._extractTail(fromPos, toPos);

    // $FlowFixMe no ideas
    return {
      ...tail,
      value: this._removeThousandsSeparators(tail.value),
    };
  }

  /** */
  _removeThousandsSeparators (value: string): string {
    return value.replace(this._thousandsSeparatorRegExp, '');
  }

  /** */
  _insertThousandsSeparators (value: string): string {
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    const parts = value.split(this.radix);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
    return parts.join(this.radix);
  }

  /**
    @override
  */
  doPrepare (str: string, ...args: *) {
    return super.doPrepare(this._removeThousandsSeparators(str.replace(this._mapToRadixRegExp, this.radix)), ...args);
  }

  /**
    @override
  */
  _appendChar (...args: *): ChangeDetails {
    // if (this._separatorsProcessed) return super._appendChar(...args);
    // this._separatorsProcessed = true;

    console.log('append with', ...args);
    let previousValue = this.value;
    this._value = this._removeThousandsSeparators(this.value);
    let startChangePos = this.value.length;

    const appendDetails = super._appendChar(...args);

    if (!appendDetails.inserted) {
      this._value = previousValue;
      return appendDetails;
    }

    this._value = this._insertThousandsSeparators(this.value);

    // calculate offsets after insert separators
    let beforeTailPos = startChangePos + appendDetails.inserted.length;
    for (let pos = 0; pos <= beforeTailPos; ++pos) {
      if (this.value[pos] === this.thousandsSeparator) {
        if (
          pos < startChangePos ||
          // check high bound
          // if separator is still there - consider it also
          (pos === startChangePos && previousValue[pos] === this.thousandsSeparator)
        ) {
          ++startChangePos;
        }
        if (pos < beforeTailPos) ++beforeTailPos;
      }
    }

    // adjust details with separators
    appendDetails.inserted = this.value.slice(startChangePos, beforeTailPos);
    appendDetails.shift += startChangePos - previousValue.length;


    // this._separatorsProcessed = false;
    return appendDetails;
  }

  /**
    @override
  */
  nearestInputPos (cursorPos: number, direction?: Direction): number {
    if (!direction) return cursorPos;

    const nextPos = indexInDirection(cursorPos, direction);
    if (this.value[nextPos] === this.thousandsSeparator) cursorPos = posInDirection(cursorPos, direction);
    return cursorPos;
  }

  /**
    @override
  */
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

  /**
    @override
  */
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

    this._value = this._insertThousandsSeparators(formatted);
    super.doCommit();
  }

  /** */
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

  /** */
  _padFractionalZeros (value: string): string {
    if (!value) return value;

    const parts = value.split(this.radix);
    if (parts.length < 2) parts.push('');
    parts[1] = parts[1].padEnd(this.scale, '0');
    return parts.join(this.radix);
  }

  /**
    @override
  */
  get unmaskedValue (): string {
    return this._removeThousandsSeparators(
      this._normalizeZeros(
        this.value))
      .replace(this.radix, '.');
  }

  set unmaskedValue (unmaskedValue: string) {
    super.unmaskedValue = unmaskedValue.replace('.', this.radix);
  }

  /** Parsed Number */
  get number (): number {
    return Number(this.unmaskedValue);
  }

  set number (number: number) {
    this.unmaskedValue = String(number);
  }

  /**
    @override
  */
  get typedValue (): number {
    return this.number;
  }

  set typedValue (value: number) {
    this.number = value;
  }

  /**
    Is negative allowed
    @readonly
  */
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
