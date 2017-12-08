// @flow
import type MaskedPattern from '../pattern.js';
import {type AppendFlags} from '../base.js';


export
interface PatternGroupTemplate {
  validate: $PropertyType<PatternGroup, 'validate'>;
  mask: $PropertyType<PatternGroup, 'mask'>;
}

type PatternGroupOptions = PatternGroupTemplate & {
  name: $PropertyType<PatternGroup, 'name'>,
  offset: $PropertyType<PatternGroup, 'offset'>,
};

export default
class PatternGroup {
  static Range: Class<RangeGroup>;
  static Enum: Class<EnumGroup>;

  masked: MaskedPattern;
  name: string;
  offset: number;
  mask: string;
  validate: (string, PatternGroup, AppendFlags) => boolean;

  constructor(masked: MaskedPattern, {name, offset, mask, validate}: PatternGroupOptions) {
    this.masked = masked;
    this.name = name;
    this.offset = offset;
    this.mask = mask;
    this.validate = validate || (() => true);
  }

  get value (): string {
    return this.masked.value.slice(
      this.masked.mapDefIndexToPos(this.offset),
      this.masked.mapDefIndexToPos(this.offset + this.mask.length));
  }

  get unmaskedValue (): string {
    return this.masked.extractInput(
      this.masked.mapDefIndexToPos(this.offset),
      this.masked.mapDefIndexToPos(this.offset + this.mask.length));
  }

  doValidate (flags: AppendFlags) {
    return this.validate(this.value, this, flags);
  }
}

export
class RangeGroup implements PatternGroupTemplate {
  mask: $PropertyType<PatternGroup, 'mask'>;
  validate: $PropertyType<PatternGroup, 'validate'>;
  _maxLength: number;
  _from: number;
  _to: number;

  constructor ([from, to]: [number, number], maxlen: number=String(to).length) {
    this._from = from;
    this._to = to;
    this._maxLength = maxlen;
    this.validate = this.validate.bind(this);

    this._update();
  }

  get to (): number {
    return this._to;
  }

  set to (to: number) {
    this._to = to;
    this._update();
  }

  get from (): number {
    return this._from;
  }

  set from (from: number) {
    this._from = from;
    this._update();
  }

  get maxLength (): number {
    return this._maxLength;
  }

  set maxLength (maxLength: number) {
    this._maxLength = maxLength;
    this._update();
  }

  get _matchFrom (): number {
    return this.maxLength - String(this.from).length;
  }

  _update() {
    this._maxLength = Math.max(this._maxLength, String(this.to).length);
    this.mask = '0'.repeat(this._maxLength);
  }

  validate (str: string): boolean {
    let minstr = '';
    let maxstr = '';

    const [, placeholder, num] = str.match(/^(\D*)(\d*)(\D*)/) || [];
    if (num) {
      minstr = ('0'.repeat(placeholder.length) + num);
      maxstr = ('9'.repeat(placeholder.length) + num);
    }

    const firstNonZero = str.search(/[^0]/);
    if (firstNonZero === -1 && str.length <= this._matchFrom) return true;

    minstr = minstr.padEnd(this._maxLength, '0');
    maxstr = maxstr.padEnd(this._maxLength, '9');

    return this.from <= Number(maxstr) && Number(minstr) <= this.to;
  }
}

export
function EnumGroup (enums: Array<string>): PatternGroupTemplate {
  return {
    mask: '*'.repeat(enums[0].length),
    validate: (value: string, group: PatternGroup, flags: AppendFlags) => enums.some(e => e.indexOf(group.unmaskedValue) >= 0)
  };
}

PatternGroup.Range = RangeGroup;
PatternGroup.Enum = EnumGroup;
