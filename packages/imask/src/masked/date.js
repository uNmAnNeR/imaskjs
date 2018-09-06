// @flow
import MaskedPattern from './pattern.js';
import MaskedRange from './range.js';


/** Date mask */
export default
class MaskedDate extends MaskedPattern {
  static GET_DEFAULT_BLOCKS: () => {[string]: any};
  static DEFAULTS: any;

  /** Parse string to Date */
  parse: (string) => Date;
  /** Format Date to string */
  format: (Date) => string;
  /** Check if Date is exist */
  isDateExist: (str: string, masked: MaskedDate) => boolean;
  /** Pattern mask for date according to {@link MaskedDate#format} */
  pattern: string;
  /** Start date */
  min: ?Date;
  /** End date */
  max: ?Date;

  /**
    @param {Object} opts
  */
  constructor (opts: any) {
    super({
      ...MaskedDate.DEFAULTS,
      ...opts
    });
  }

  /**
    @override
  */
  _update (opts: any) {
    if (opts.mask === Date) delete opts.mask;
    if (opts.pattern) {
      opts.mask = opts.pattern;
      delete opts.pattern;
    }

    const blocks = opts.blocks;
    opts.blocks = Object.assign({}, MaskedDate.GET_DEFAULT_BLOCKS());
    // adjust year block
    if (opts.min) opts.blocks.Y.from = opts.min.getFullYear();
    if (opts.max) opts.blocks.Y.to = opts.max.getFullYear();
    if (opts.min && opts.max && opts.blocks.Y.from === opts.blocks.Y.to
    ) {
      opts.blocks.m.from = opts.min.getMonth() + 1;
      opts.blocks.m.to = opts.max.getMonth() + 1;

      if (opts.blocks.m.from === opts.blocks.m.to) {
        opts.blocks.d.from = opts.min.getDate();
        opts.blocks.d.to = opts.max.getDate();
      }
    }
    Object.assign(opts.blocks, blocks);

    super._update(opts);
  }

  /**
    @override
  */
  doValidate (...args: *): boolean {
    const date = this.date;

    return super.doValidate(...args) &&
      (!this.isComplete ||
        this.isDateExist(this.value, this) && date != null &&
        (this.min == null || this.min <= date) &&
        (this.max == null || date <= this.max));
  }

  /** Parsed Date */
  get date (): ?Date {
    return this.isComplete ?
      this.parse(this.value) :
      null;
  }
  set date (date: Date) {
    this.value = this.format(date);
  }

  /**
    @override
  */
  get typedValue (): ?Date {
    return this.date;
  }
  set typedValue (value: Date) {
    this.date = value;
  }
}
MaskedDate.DEFAULTS = {
  pattern: 'd{.}`m{.}`Y',
  isDateExist: (str, masked) => masked.format(masked.parse(str)) === str,
  format: date => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return [day, month, year].join('.');
  },
  parse: str => {
    const [day, month, year] = str.split('.');
    return new Date(year, month - 1, day);
  },
};
MaskedDate.GET_DEFAULT_BLOCKS = () => {
  return {
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
  };
};
