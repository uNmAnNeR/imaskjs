// @flow
import {escapeRegExp, indexInDirection, posInDirection, type Direction, DIRECTION} from '../core/utils.js';
import ChangeDetails from '../core/change-details.js';

import Masked, {type MaskedOptions, type ExtractFlags, type AppendFlags} from './base.js';
import IMask from '../core/holder.js';


type MaskedNumberOptions = {
  ...MaskedOptions<Class<Number>>,
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
class MaskedNumber extends Masked<Class<Number>> {
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
    let start = '^' + (this.allowNegative ? '[+|\\-]?' : '');
    let midInput = '(0|([1-9]+\\d*))?';
    let mid = '\\d*';

    let end = (this.scale ?
      '(' + escapeRegExp(this.radix) + '\\d{0,' + this.scale + '})?' :
      '') + '$';

    this._numberRegExpInput = new RegExp(start + midInput + end);
    this._numberRegExp = new RegExp(start + mid + end);
    this._mapToRadixRegExp = new RegExp('[' +
      this.mapToRadix.map(escapeRegExp).join('') +
    ']', 'g');
    this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
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

  /** */
  _separatorsCount (to: number, extendOnSeparators: boolean=false): number {
    let count = 0;

    for (let pos = 0; pos < to; ++pos) {
      if (this._value.indexOf(this.thousandsSeparator, pos) === pos) {
        ++count;
        if (extendOnSeparators) to += this.thousandsSeparator.length;
      }
    }

    return count;
  }

  /** */
  _separatorsCountFromSlice (slice: string=this._value): number {
    return this._separatorsCount(this._removeThousandsSeparators(slice).length, true);
  }

  /**
    @override
  */
  extractInput (fromPos?: number=0, toPos?: number=this.value.length, flags?: ExtractFlags): string {
    [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);

    return this._removeThousandsSeparators(super.extractInput(fromPos, toPos, flags));
  }

  /**
    @override
  */
  _appendCharRaw (ch: string, flags: AppendFlags={}): ChangeDetails {
    if (!this.thousandsSeparator) return super._appendCharRaw(ch, flags);

    const prevBeforeTailValue = flags.tail && flags._beforeTailState ?
      flags._beforeTailState._value :
      this._value;
    const prevBeforeTailSeparatorsCount = this._separatorsCountFromSlice(prevBeforeTailValue);
    this._value = this._removeThousandsSeparators(this.value);

    const appendDetails = super._appendCharRaw(ch, flags);

    this._value = this._insertThousandsSeparators(this._value);
    const beforeTailValue = flags.tail && flags._beforeTailState ?
      flags._beforeTailState._value :
      this._value;
    const beforeTailSeparatorsCount = this._separatorsCountFromSlice(beforeTailValue);

    appendDetails.tailShift += (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length;
    return appendDetails;
  }

  /** */
  _findSeparatorAround (pos: number): number {
    if (this.thousandsSeparator) {
      const searchFrom = pos - this.thousandsSeparator.length + 1;
      const separatorPos = this.value.indexOf(this.thousandsSeparator, searchFrom);
      if (separatorPos <= pos) return separatorPos;
    }

    return -1;
  }

  _adjustRangeWithSeparators (from: number, to: number): [number, number] {
    const separatorAroundFromPos = this._findSeparatorAround(from);
    if (separatorAroundFromPos >= 0) from = separatorAroundFromPos;

    const separatorAroundToPos = this._findSeparatorAround(to);
    if (separatorAroundToPos >= 0) to = separatorAroundToPos + this.thousandsSeparator.length;
    return [from, to];
  }

  /**
    @override
  */
  remove (fromPos?: number=0, toPos?: number=this.value.length): ChangeDetails {
    [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);

    const valueBeforePos = this.value.slice(0, fromPos);
    const valueAfterPos = this.value.slice(toPos);

    const prevBeforeTailSeparatorsCount = this._separatorsCount(valueBeforePos.length);
    this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(valueBeforePos + valueAfterPos));
    const beforeTailSeparatorsCount = this._separatorsCountFromSlice(valueBeforePos);

    return new ChangeDetails({
      tailShift: (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length,
    });
  }

  /**
    @override
  */
  nearestInputPos (cursorPos: number, direction?: Direction): number {
    if (!this.thousandsSeparator) return cursorPos;

    switch (direction) {
      case DIRECTION.NONE:
      case DIRECTION.LEFT:
      case DIRECTION.FORCE_LEFT: {
        const separatorAtLeftPos = this._findSeparatorAround(cursorPos - 1);
        if (separatorAtLeftPos >= 0) {
          const separatorAtLeftEndPos = separatorAtLeftPos + this.thousandsSeparator.length;
          if (cursorPos < separatorAtLeftEndPos ||
            this.value.length <= separatorAtLeftEndPos ||
            direction === DIRECTION.FORCE_LEFT
          ) {
            return separatorAtLeftPos;
          }
        }
        break;
      }
      case DIRECTION.RIGHT:
      case DIRECTION.FORCE_RIGHT: {
        const separatorAtRightPos = this._findSeparatorAround(cursorPos);
        if (separatorAtRightPos >= 0) {
          return separatorAtRightPos + this.thousandsSeparator.length;
        }
      }
    }

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
    if (this.value) {
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
    }

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

  /**
    @override
  */
  get typedValue (): number {
    return Number(this.unmaskedValue);
  }

  set typedValue (n: number) {
    super.unmaskedValue = String(n);
  }

  /** Parsed Number */
  get number (): number {
    return this.typedValue;
  }

  set number (number: number) {
    this.typedValue = number;
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


IMask.MaskedNumber = MaskedNumber;
