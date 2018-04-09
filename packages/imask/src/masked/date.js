// @flow
import MaskedPattern from './pattern.js';
import PatternGroup from './pattern/group.js';


/** Date mask */
export default
class MaskedDate extends MaskedPattern {
  static GET_DEFAULT_GROUPS: () => {[string]: PatternGroup};
  static DEFAULTS: any;

  /** Parse string to Date */
  parse: (string) => Date;
  /** Format Date to string */
  format: (Date) => string;
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

    const groups = opts.groups;
    opts.groups = Object.assign({}, MaskedDate.GET_DEFAULT_GROUPS());
    // adjust year group
    if (opts.min) opts.groups.Y.from = opts.min.getFullYear();
    if (opts.max) opts.groups.Y.to = opts.max.getFullYear();
    Object.assign(opts.groups, groups);

    super._update(opts);
  }

  /**
    @override
  */
  doValidate (...args: *) {
    const valid = super.doValidate(...args);
    const date = this.date;

    return valid &&
      (!this.isComplete ||
        this.isDateExist(this.value) && date &&
        (this.min == null || this.min <= date) &&
        (this.max == null || date <= this.max));
  }

  /** Checks if date is exists */
  isDateExist (str: string): boolean {
    return this.format(this.parse(str)) === str;
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
MaskedDate.GET_DEFAULT_GROUPS = () => {
  return {
    d: new PatternGroup.Range([1, 31]),
    m: new PatternGroup.Range([1, 12]),
    Y: new PatternGroup.Range([1900, 9999]),
  };
}