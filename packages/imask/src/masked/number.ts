import { escapeRegExp, type Direction, DIRECTION } from '../core/utils';
import ChangeDetails from '../core/change-details';
import { type TailDetails } from '../core/tail-details';

import Masked, { type MaskedOptions, type ExtractFlags, type AppendFlags } from './base';
import IMask from '../core/holder';


export
type MaskedNumberOptions = MaskedOptions<MaskedNumber,
  | 'radix'
  | 'thousandsSeparator'
  | 'mapToRadix'
  | 'scale'
  | 'min'
  | 'max'
  | 'normalizeZeros'
  | 'padFractionalZeros'
>;

/** Number mask */
export default
class MaskedNumber extends Masked<number> {
  static UNMASKED_RADIX = '.';
  static EMPTY_VALUES: Array<null | undefined | string | number> = [...Masked.EMPTY_VALUES, 0];
  static DEFAULTS = {
    ...Masked.DEFAULTS,
    mask: Number,
    radix: ',',
    thousandsSeparator: '',
    mapToRadix: [MaskedNumber.UNMASKED_RADIX],
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    scale: 2,
    normalizeZeros: true,
    padFractionalZeros: false,
    parse: Number,
    format: (n: number) => n.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
  };

  declare mask: NumberConstructor;
  /** Single char */
  declare radix: string;
  /** Single char */
  declare thousandsSeparator: string;
  /** Array of single chars */
  declare mapToRadix: Array<string>;
  /** */
  declare min: number;
  /** */
  declare max: number;
  /** Digits after point */
  declare scale: number;
  /** Flag to remove leading and trailing zeros in the end of editing */
  declare normalizeZeros: boolean;
  /** Flag to pad trailing zeros after point in the end of editing */
  declare padFractionalZeros: boolean;
  /** Enable characters overwriting */
  declare overwrite?: boolean | 'shift' | undefined;
  /** */
  declare eager?: boolean | 'remove' | 'append' | undefined;
  /** */
  declare skipInvalid?: boolean | undefined;
  /** */
  declare autofix?: boolean | 'pad' | undefined;
  /** Format typed value to string */
  declare format: (value: number, masked: Masked) => string;
  /** Parse string to get typed value */
  declare parse: (str: string, masked: Masked) => number;

  declare _numberRegExp: RegExp;
  declare _thousandsSeparatorRegExp: RegExp;
  declare _mapToRadixRegExp: RegExp;
  declare _separatorsProcessed: boolean;

  constructor (opts?: MaskedNumberOptions) {
    super({
      ...MaskedNumber.DEFAULTS,
      ...opts,
    });
  }

  override updateOptions (opts: Partial<MaskedNumberOptions>) {
    super.updateOptions(opts);
  }

  override _update (opts: Partial<MaskedNumberOptions>) {
    super._update(opts);
    this._updateRegExps();
  }

  _updateRegExps () {
    const start = '^' + (this.allowNegative ? '[+|\\-]?' : '');
    const mid = '\\d*';
    const end = (this.scale ?
      `(${escapeRegExp(this.radix)}\\d{0,${this.scale}})?` :
      '') + '$';

    this._numberRegExp = new RegExp(start + mid + end);
    this._mapToRadixRegExp = new RegExp(`[${this.mapToRadix.map(escapeRegExp).join('')}]`, 'g');
    this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
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

  override doPrepareChar (ch: string, flags: AppendFlags={}): [string, ChangeDetails] {
    const [prepCh, details] = super.doPrepareChar(this._removeThousandsSeparators(
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
    ), flags);
    if (ch && !prepCh) details.skip = true;

    if (prepCh && !this.allowPositive && !this.value && prepCh !== '-') details.aggregate(this._appendChar('-'));

    return [prepCh, details];
  }

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

  _separatorsCountFromSlice (slice: string=this._value): number {
    return this._separatorsCount(this._removeThousandsSeparators(slice).length, true);
  }

  override extractInput (fromPos: number=0, toPos: number=this.displayValue.length, flags?: ExtractFlags): string {
    [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);

    return this._removeThousandsSeparators(super.extractInput(fromPos, toPos, flags));
  }

  
  override _appendCharRaw (ch: string, flags: AppendFlags={}): ChangeDetails {
    const prevBeforeTailValue = flags.tail && flags._beforeTailState ?
      flags._beforeTailState._value :
      this._value;
    const prevBeforeTailSeparatorsCount = this._separatorsCountFromSlice(prevBeforeTailValue);
    this._value = this._removeThousandsSeparators(this.value);

    const oldValue = this._value;

    this._value += ch;

    const num = this.number;
    let accepted = !isNaN(num);
    let skip = false;

    if (accepted) {
      let fixedNum;
      if (this.min != null && this.min < 0 && this.number < this.min) fixedNum = this.min;
      if (this.max != null && this.max > 0 && this.number > this.max) fixedNum = this.max;

      if (fixedNum != null) {
        if (this.autofix) {
          this._value = this.format(fixedNum, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
          skip ||= oldValue === this._value && !flags.tail; // if not changed on tail it's still ok to proceed
        } else {
          accepted = false;
        }
      }
      accepted &&= Boolean(this._value.match(this._numberRegExp));
    }

    let appendDetails;
    if (!accepted) {
      this._value = oldValue;
      appendDetails = new ChangeDetails();
    } else {
      appendDetails = new ChangeDetails({
        inserted: this._value.slice(oldValue.length),
        rawInserted: skip ? '' : ch,
        skip,
      });
    }

    this._value = this._insertThousandsSeparators(this._value);
    const beforeTailValue = flags.tail && flags._beforeTailState ?
      flags._beforeTailState._value :
      this._value;
    const beforeTailSeparatorsCount = this._separatorsCountFromSlice(beforeTailValue);

    appendDetails.tailShift += (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length;
    return appendDetails;
  }

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

  
  override remove (fromPos: number=0, toPos: number=this.displayValue.length): ChangeDetails {
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

  override doCommit () {
    if (this.value) {
      const number = this.number;
      let validnum = number;

      // check bounds
      if (this.min != null) validnum = Math.max(validnum, this.min);
      if (this.max != null) validnum = Math.min(validnum, this.max);

      if (validnum !== number) this.unmaskedValue = this.format(validnum, this);

      let formatted = this.value;

      if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
      if (this.padFractionalZeros && this.scale > 0) formatted = this._padFractionalZeros(formatted);

      this._value = formatted;
    }

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

  override doSkipInvalid (ch: string, flags: AppendFlags={}, checkTail?: TailDetails): boolean {
    const dropFractional = this.scale === 0 && ch !== this.thousandsSeparator && (
      ch === this.radix ||
      ch === MaskedNumber.UNMASKED_RADIX ||
      this.mapToRadix.includes(ch)
    )
    return super.doSkipInvalid(ch, flags, checkTail) && !dropFractional;
  }

  override get unmaskedValue (): string {
    return this._removeThousandsSeparators(this._normalizeZeros(this.value))
      .replace(this.radix, MaskedNumber.UNMASKED_RADIX);
  }

  override set unmaskedValue (unmaskedValue: string) {
    super.unmaskedValue = unmaskedValue;
  }

  override get typedValue (): number {
    return this.parse(this.unmaskedValue, this);
  }

  override set typedValue (n: number) {
    this.rawInputValue = this.format(n, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
  }

  /** Parsed Number */
  get number (): number {
    return this.typedValue;
  }

  set number (number: number) {
    this.typedValue = number;
  }

  get allowNegative (): boolean {
    return (this.min != null && this.min < 0) || (this.max != null && this.max < 0);
  }

  get allowPositive (): boolean {
    return (this.min != null && this.min > 0) || (this.max != null && this.max > 0);
  }

  override typedValueEquals (value: any): boolean {
    // handle  0 -> '' case (typed = 0 even if value = '')
    // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
    return (
      super.typedValueEquals(value) ||
      MaskedNumber.EMPTY_VALUES.includes(value) && MaskedNumber.EMPTY_VALUES.includes(this.typedValue)
    ) && !(value === 0 && this.value === '');
  }
}


IMask.MaskedNumber = MaskedNumber;
