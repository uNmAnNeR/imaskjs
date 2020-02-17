// @flow
import MaskedPattern from './pattern.js';
import MaskedRange from './range.js';
import IMask from '../core/holder.js';


/** Date mask */
export default
class MaskedDate extends MaskedPattern {
  static GET_DEFAULT_BLOCKS: () => {[string]: any};
  static DEFAULTS: any;

  /** Pattern mask for date according to {@link MaskedDate#format} */
  pattern: string;
  /** Start date */
  min: ?Date;
  /** End date */
  max: ?Date;
  /** */
  autofix: boolean;

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
    if (opts.pattern) opts.mask = opts.pattern;

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

    // add autofix
    Object.keys(opts.blocks).forEach(bk => {
      const b = opts.blocks[bk];
      if (!('autofix' in b)) b.autofix = opts.autofix;
    });

    super._update(opts);
  }

  /**
    @override
  */
  doValidate (...args: *): boolean {
    const date = this.date;

    return super.doValidate(...args) &&
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
  get date (): ?Date {
    return this.typedValue;
  }
  set date (date: Date) {
    this.typedValue = date;
  }

  /**
    @override
  */
  get typedValue (): ?Date {
    return this.isComplete ? super.typedValue : null;
  }
  set typedValue (value: Date) {
    super.typedValue = value;
  }
}
MaskedDate.DEFAULTS = {
  pattern: 'd{.}`m{.}`Y',
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
MaskedDate.GET_DEFAULT_BLOCKS = () => ({
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


IMask.MaskedDate = MaskedDate;
