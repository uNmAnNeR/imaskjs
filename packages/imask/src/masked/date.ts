import MaskedPattern, { type MaskedPatternOptions } from './pattern';
import { type MaskedRangeOptions } from './range';
import MaskedRange from './range';
import IMask from '../core/holder';
import type Masked from './base';
import { type AppendFlags } from './base';
import { isString } from '../core/utils';


export
type DateMaskType = DateConstructor;

type DateOptionsKeys =
  | 'pattern'
  | 'min'
  | 'max'
  | 'autofix'
;

export
type DateValue = Date | null;

const DefaultPattern = 'd{.}`m{.}`Y'

// Make format and parse required when pattern is provided
type RequiredDateOptions = ({ pattern?: never |  typeof DefaultPattern; format?: MaskedDate["format"]; parse?: MaskedDate["parse"] } |
  { pattern: MaskedDate["pattern"]; format: MaskedDate["format"]; parse: MaskedDate["parse"] })

export
type MaskedDateOptions =
  Omit<MaskedPatternOptions<DateValue>, 'mask'> &
  Partial<Pick<MaskedDate, DateOptionsKeys>> &
  { mask?: string | DateMaskType } &
  RequiredDateOptions;

/** Date mask */
export default
class MaskedDate extends MaskedPattern<DateValue> {
  static GET_DEFAULT_BLOCKS: () => { [k: string]: MaskedRangeOptions } = () => ({
    d: {
      mask: MaskedRange,
      from: 1,
      to: 31,
      maxLength: 2,
    },
    m: {
      mask: MaskedRange,
      from: 1,
      to: 12,
      maxLength: 2,
    },
    Y: {
      mask: MaskedRange,
      from: 1900,
      to: 9999,
    }
  });
  static DEFAULTS = {
    ...MaskedPattern.DEFAULTS,
    mask: Date,
    pattern: DefaultPattern,
    format: (date: DateValue, masked: Masked): string => {
      if (!date) return '';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return [day, month, year].join('.');
    },
    parse: (str: string, masked: Masked): DateValue => {
      const [day, month, year] = str.split('.').map(Number);
      return new Date(year, month - 1, day);
    },
  } satisfies Partial<MaskedDateOptions>;

  static extractPatternOptions (opts: Partial<MaskedDateOptions>): Partial<Omit<MaskedDateOptions, 'mask' | 'pattern'> & { mask: MaskedPatternOptions['mask'] }> {
    const { mask, pattern, ...patternOpts } = opts;
    return {
      ...patternOpts,
      mask: isString(mask) ? mask : pattern,
    };
  }

  /** Pattern mask for date according to {@link MaskedDate#format} */
  declare pattern: string;
  /** Start date */
  declare min?: Date;
  /** End date */
  declare max?: Date;
  /** Format typed value to string */
  declare format: (value: DateValue, masked: Masked) => string;
  /** Parse string to get typed value */
  declare parse: (str: string, masked: Masked) => DateValue;


  constructor (opts?: MaskedDateOptions) {
    super(MaskedDate.extractPatternOptions({
      ...(MaskedDate.DEFAULTS as MaskedDateOptions),
      ...opts,
    }));
  }

  override updateOptions (opts: Partial<MaskedDateOptions> & RequiredDateOptions) {
    super.updateOptions(opts as Partial<MaskedPatternOptions<DateValue>>);
  }

  override _update (opts: Partial<MaskedDateOptions>) {
    const { mask, pattern, blocks, ...patternOpts } = {
      ...MaskedDate.DEFAULTS,
      ...opts,
    };

    const patternBlocks = Object.assign({}, MaskedDate.GET_DEFAULT_BLOCKS());
    // adjust year block
    if (opts.min) patternBlocks.Y.from = opts.min.getFullYear();
    if (opts.max) patternBlocks.Y.to = opts.max.getFullYear();
    if (opts.min && opts.max && patternBlocks.Y.from === patternBlocks.Y.to
    ) {
      patternBlocks.m.from = opts.min.getMonth() + 1;
      patternBlocks.m.to = opts.max.getMonth() + 1;

      if (patternBlocks.m.from === patternBlocks.m.to) {
        patternBlocks.d.from = opts.min.getDate();
        patternBlocks.d.to = opts.max.getDate();
      }
    }
    Object.assign(patternBlocks, this.blocks, blocks);

    super._update({
      ...patternOpts,
      mask: isString(mask) ? mask : pattern,
      blocks: patternBlocks,
    });
  }

  override doValidate (flags: AppendFlags): boolean {
    const date = this.date;

    return super.doValidate(flags) &&
      (!this.isComplete ||
        this.isDateExist(this.value) && date != null &&
        (this.min == null || this.min <= date) &&
        (this.max == null || date <= this.max));
  }

  /** Checks if date is exists */
  isDateExist (str: string): boolean {
    return this.format(this.parse(str, this), this).indexOf(str) >= 0;
  }

  /** Parsed Date */
  get date (): DateValue {
    return this.typedValue;
  }
  set date (date: DateValue) {
    this.typedValue = date;
  }

  override get typedValue (): DateValue {
    return this.isComplete ? super.typedValue : null;
  }
  override set typedValue (value: DateValue) {
    super.typedValue = value;
  }

  override maskEquals (mask: any): boolean {
    return mask === Date || super.maskEquals(mask);
  }

  override optionsIsChanged (opts: Partial<MaskedDateOptions>): boolean {
    return super.optionsIsChanged(MaskedDate.extractPatternOptions(opts));
  }
}


IMask.MaskedDate = MaskedDate;
