// @flow
import type Masked from '../base.js';
import {type AppendFlags} from '../base.js';


/** */
export
interface PatternGroupTemplate {
  validate: (string, any, AppendFlags) => boolean;
  mask: string;
}

/** */
// type PatternGroupOptions = PatternGroupTemplate & {
//   name: $PropertyType<PatternGroup, 'name'>,
//   offset: $PropertyType<PatternGroup, 'offset'>,
// };

/**
  Pattern group symbols from parent
  @param {Masked} masked - Internal {@link masked} model
  @param {Object} opts
  @param {string} opts.name - Group name
  @param {number} opts.offset - Group offset in masked definitions array
  @param {string} opts.mask - Group mask
  @param {Function} [opts.validate] - Custom group validator
*/

const PatternGroup = {};
export default PatternGroup;
// class PatternGroup implements PatternBlock {
//   /** */
//   static Range: typeof RangeGroup;
//   /** */
//   static Enum: typeof EnumGroup;

//   /** Internal {@link masked} model */
//   masked: Masked;
//   /** Group name */
//   name: string;
//   /** Group offset in masked definitions array */
//   offset: number;
//   /** Group mask */
//   mask: string;
//   /** Custom group validator */
//   validate: (string, PatternGroup, AppendFlags) => boolean;

//   constructor(masked: Masked, {name, offset, mask, validate}: PatternGroupOptions) {
//     this.masked = masked;
//     this.name = name;
//     this.offset = offset;
//     this.mask = mask;
//     this.validate = validate || (() => true);
//   }

//   /** Slice of internal {@link masked} value */
//   get value (): string {
//     return this.masked.value.slice(
//       this.masked.mapDefIndexToPos(this.offset),
//       this.masked.mapDefIndexToPos(this.offset + this.mask.length));
//   }

//   /** Unmasked slice of internal {@link masked} value */
//   get unmaskedValue (): string {
//     return this.masked.extractInput(
//       this.masked.mapDefIndexToPos(this.offset),
//       this.masked.mapDefIndexToPos(this.offset + this.mask.length));
//   }

//   /** Validates if current value is acceptable */
//   doValidate (flags: AppendFlags) {
//     return this.validate(this.value, this, flags);
//   }
// }

/**
  Pattern group that validates number ranges
  @param {number[]} range - [from, to]
  @param {?number} maxlen - Maximum number length, will be padded with leading zeros
*/
export
class RangeGroup implements PatternGroupTemplate {
  /** @type {string} */
  mask: $PropertyType<PatternGroupTemplate, 'mask'>;
  /** @type {Function} */
  validate: $PropertyType<PatternGroupTemplate, 'validate'>;
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

/** Pattern group that validates enum values */
export
function EnumGroup (enums: Array<string>): PatternGroupTemplate {
  return {
    mask: '*'.repeat(enums[0].length),
    validate: (value: string, group: any, flags: AppendFlags) => enums.some(e => e.indexOf(group.unmaskedValue) >= 0)
  };
}

PatternGroup.Range = RangeGroup;
PatternGroup.Enum = EnumGroup;
