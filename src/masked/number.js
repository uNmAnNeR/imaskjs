import {escapeRegExp, DIRECTION, indexInDirection} from '../core/utils';
import Masked from './base';


export default
class MaskedNumber extends Masked {
  constructor (opts) {
    opts.postFormat = Object.assign({}, MaskedNumber.DEFAULTS.postFormat, opts.postFormat);
    super({
      ...MaskedNumber.DEFAULTS,
      ...opts
    });
  }

  _update (opts) {
    opts.postFormat = Object.assign({}, this.postFormat, opts.postFormat);

    super._update(opts);
    this._updateRegExps();
  }

  _updateRegExps () {
    // TODO refactor?
    let regExpStrSoft = '^';
    let regExpStr = '^';

    if (this.allowNegative) {
      regExpStrSoft += '([+|\\-]?|([+|\\-]?(0|([1-9]+\\d*))))';
      regExpStr += '[+|\\-]?';
    } else {
      regExpStrSoft += '(0|([1-9]+\\d*))';
    }
    regExpStr += '\\d*';

    if (this.scale) {
      regExpStrSoft += '(' + this.radix + '\\d{0,' + this.scale + '})?';
      regExpStr += '(' + this.radix + '\\d{0,' + this.scale + '})?';
    }

    regExpStrSoft += '$';
    regExpStr += '$';

    this._numberRegExpSoft = new RegExp(regExpStrSoft);
    this._numberRegExp = new RegExp(regExpStr);
    this._mapToRadixRegExp = new RegExp('[' +
      this.mapToRadix.map(escapeRegExp).join('') +
    ']', 'g');
    this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
  }

  extractTail (fromPos=0, toPos=this.value.length) {
    return this._removeThousandsSeparators(super.extractTail(fromPos, toPos));
  }

  _removeThousandsSeparators (value) {
    return value.replace(this._thousandsSeparatorRegExp, '');
  }

  _insertThousandsSeparators (value) {
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    const parts = value.split(this.radix);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
    return parts.join(this.radix);
  }

  doPrepare (str, soft) {
    return super.doPrepare(this._removeThousandsSeparators(str.replace(this._mapToRadixRegExp, this.radix)), soft);
  }

  appendWithTail (str, tail) {
    const oldValueLength = this.value.length;
    this._value = this._removeThousandsSeparators(this.value);
    let removedSeparatorsCount = oldValueLength - this.value.length;


    const appended = super.appendWithTail(str, tail);


    this._value = this._insertThousandsSeparators(this.value);

    let beforeTailPos = oldValueLength + appended - removedSeparatorsCount;
    let insertedSeparatorsBeforeTailCount = 0;
    for (let pos = 0; pos <= beforeTailPos; ++pos) {
      if (this.value[pos] === this.thousandsSeparator) {
        ++insertedSeparatorsBeforeTailCount;
        ++beforeTailPos;
      }
    }

    return appended - removedSeparatorsCount + insertedSeparatorsBeforeTailCount;
  }

  nearestInputPos (cursorPos, direction=DIRECTION.LEFT) {
    if (!direction) return cursorPos;

    const nextPos = indexInDirection(cursorPos, direction);
    if (this.value[nextPos] === this.thousandsSeparator) cursorPos += direction;
    return cursorPos;
  }

  doValidate (soft) {
    const regexp = soft ? this._numberRegExpSoft : this._numberRegExp;

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

    return valid && super.doValidate(soft);
  }

  doCommit () {
    const number = this.number;
    let validnum = number;

    // check bounds
    if (this.min != null) validnum = Math.max(validnum, this.min);
    if (this.max != null) validnum = Math.min(validnum, this.max);

    if (validnum !== number) this.unmaskedValue = '' + validnum;

    let formatted = this.value;

    if (this.postFormat.normalizeZeros) formatted = this._normalizeZeros(formatted);
    if (this.postFormat.padFractionalZeros) formatted = this._padFractionalZeros(formatted);

    this._value = formatted;
    super.doCommit();
  }

  _normalizeZeros (value) {
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

  _padFractionalZeros (value) {
    const parts = value.split(this.radix);
    if (parts.length < 2) parts.push('');
    parts[1] = parts[1].padEnd(this.scale, '0');
    return parts.join(this.radix);
  }

  get number () {
    let numstr =
      this._removeThousandsSeparators(
        this._normalizeZeros(
          this.unmaskedValue))
      .replace(this.radix, '.');

    return Number(numstr);
  }

  set number (number) {
    this.unmaskedValue = ('' + number).replace('.', this.radix);
  }

  get allowNegative () {
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
  postFormat: {
    normalizeZeros: true,
    padFractionalZeros: false
  }
};
