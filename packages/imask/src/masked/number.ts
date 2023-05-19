import { escapeRegExp, type Direction, DIRECTION, type ClassOptions } from '../core/utils';
import ChangeDetails from '../core/change-details';
import { type TailDetails } from '../core/tail-details';

import Masked, { type MaskedOptions, type ExtractFlags, type AppendFlags } from './base';
import IMask from '../core/holder';


export
type MaskedNumberOptions<Parent extends Masked=any> = MaskedOptions<NumberConstructor, Parent> & Partial<Pick<MaskedNumber,
  | 'radix'
  | 'thousandsSeparator'
  | 'mapToRadix'
  | 'scale'
  | 'signed'
  | 'normalizeZeros'
  | 'padFractionalZeros'
>>;

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
class MaskedNumber<Parent extends Masked=any> extends Masked<NumberConstructor, Parent> {
  static DEFAULTS: Partial<MaskedNumberOptions>;
  static UNMASKED_RADIX: string;

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
  _thousandsSeparatorRegExp: RegExp;
  _mapToRadixRegExp: RegExp;
  _separatorsProcessed: boolean;

  constructor (opts: MaskedNumberOptions) {
    super({
      ...MaskedNumber.DEFAULTS,
      ...opts,
    });
  }

  /**
    @override
  */
  override _update (opts: Partial<MaskedNumberOptions>) {
    super._update(opts);
    this._updateRegExps();
  }

  /** */
  _updateRegExps () {
    let start = '^' + (this.allowNegative ? '[+|\\-]?' : '');
    let mid = '\\d*';
    let end = (this.scale ?
      `(${escapeRegExp(this.radix)}\\d{0,${this.scale}})?` :
      '') + '$';

    this._numberRegExp = new RegExp(start + mid + end);
    this._mapToRadixRegExp = new RegExp(`[${this.mapToRadix.map(escapeRegExp).join('')}]`, 'g');
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
  override doPrepare (ch: string, flags: AppendFlags={}): [string, ChangeDetails] {
    ch = this._removeThousandsSeparators(
      this.scale && this.mapToRadix.length && (
        /*
          radix should be mapped when
          1) input is done from keyboard = flags.input && flags.raw
          2) unmasked value is set = !flags.input && !flags.raw
          and should not be mapped when
          1) value is set = flags.input && !flags.raw
          2) raw value is set = !flags.input && flags.raw
        */
        flags.input && flags.raw ||
        !flags.input && !flags.raw
      ) ? ch.replace(this._mapToRadixRegExp, this.radix) : ch
    );
    const [prepCh, details] = super.doPrepare(ch, flags);
    if (ch && !prepCh) details.skip = true;
    return [prepCh, details];
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
  override extractInput (fromPos: number=0, toPos: number=this.value.length, flags?: ExtractFlags): string {
    [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);

    return this._removeThousandsSeparators(super.extractInput(fromPos, toPos, flags));
  }

  /**
    @override
  */
  override _appendCharRaw (ch: string, flags: AppendFlags={}): ChangeDetails {
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
    appendDetails.skip = !appendDetails.rawInserted && ch === this.thousandsSeparator;
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
  override remove (fromPos: number=0, toPos: number=this.value.length): ChangeDetails {
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
  override nearestInputPos (cursorPos: number, direction?: Direction): number {
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
  override doValidate (flags: AppendFlags): boolean {
    // validate as string
    let valid = Boolean(this._removeThousandsSeparators(this.value).match(this._numberRegExp));

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
  override doCommit () {
    if (this.value) {
      const number = this.number;
      let validnum = number;

      // check bounds
      if (this.min != null) validnum = Math.max(validnum, this.min);
      if (this.max != null) validnum = Math.min(validnum, this.max);

      if (validnum !== number) this.unmaskedValue = this.doFormat(validnum);

      let formatted = this.value;

      if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
      if (this.padFractionalZeros && this.scale > 0) formatted = this._padFractionalZeros(formatted);

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

  /** */
  doSkipInvalid (ch: string, flags: AppendFlags={}, checkTail?: TailDetails): boolean {
    const dropFractional = this.scale === 0 && ch !== this.thousandsSeparator && (
      ch === this.radix ||
      ch === MaskedNumber.UNMASKED_RADIX ||
      this.mapToRadix.includes(ch)
    )
    return super.doSkipInvalid(ch, flags, checkTail) && !dropFractional;
  }

  /**
    @override
  */
  override get unmaskedValue (): string {
    return this._removeThousandsSeparators(
      this._normalizeZeros(
        this.value))
      .replace(this.radix, MaskedNumber.UNMASKED_RADIX);
  }

  override set unmaskedValue (unmaskedValue: string) {
    super.unmaskedValue = unmaskedValue;
  }

  /**
    @override
  */
  override get typedValue (): number {
    return this.doParse(this.unmaskedValue);
  }

  override set typedValue (n: number) {
    this.rawInputValue = this.doFormat(n).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
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

  /**
    @override
  */
  override typedValueEquals (value: any): boolean {
    // handle  0 -> '' case (typed = 0 even if value = '')
    // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
    return (
      super.typedValueEquals(value) ||
      MaskedNumber.EMPTY_VALUES.includes(value) && MaskedNumber.EMPTY_VALUES.includes(this.typedValue)
    ) && !(value === 0 && this.value === '');
  }
}

MaskedNumber.UNMASKED_RADIX = '.';
MaskedNumber.DEFAULTS = {
  radix: ',',
  thousandsSeparator: '',
  mapToRadix: [MaskedNumber.UNMASKED_RADIX],
  scale: 2,
  signed: false,
  normalizeZeros: true,
  padFractionalZeros: false,
  parse: Number,
  format: n => n.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
};
MaskedNumber.EMPTY_VALUES = [...Masked.EMPTY_VALUES, 0];

IMask.MaskedNumber = MaskedNumber;
