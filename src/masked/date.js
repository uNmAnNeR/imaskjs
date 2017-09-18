import {refreshValueOnSet} from '../core/utils';
import MaskedPattern from './pattern';
import PatternGroup from './pattern/group';


export default
class MaskedDate extends MaskedPattern {
  constructor (opts={}) {
    const groups = opts.groups;
    opts = Object.assign({}, MaskedDate.DEFAULTS, opts);
    const {min, max, format, parse} = opts;

    opts.groups = Object.assign({}, MaskedDate.DEFAULTS.groups);
    if (opts.groups.Y) {
      // adjust year group
      if (min) opts.groups.Y.from = min.getFullYear();
      if (max) opts.groups.Y.to = max.getFullYear();
    }

    Object.assign(opts.groups, groups);

    super(opts);
    delete this.isInitialized;

    this.min = min;
    this.max = max;
    this.format = format;
    this.parse = parse;

    this.isInitialized = true;
  }

  _validate (soft) {
    const valid = super._validate(soft);
    const date = this.date;

    return valid &&
      (!this.isComplete ||
        this.isDateExist(this.value) && date &&
        (this.min == null || this.min <= date) &&
        (this.max == null || date <= this.max));
  }

  isDateExist (str) {
    return this.format(this.parse(str)) === str;
  }

  get date () {
    return this.isComplete ?
      this.parse(this.value) :
      null;
  }

  set date (date) {
    this.value = this.format(date);
  }

  get min () {
    return this._min;
  }

  @refreshValueOnSet
  set min (min) {
    this._min = min;
  }

  get max () {
    return this._max;
  }

  @refreshValueOnSet
  set max (max) {
    this._max = max;
  }
}
MaskedDate.DEFAULTS = {
  mask: 'd{.}`m{.}`Y',
  format: date => {
    const day = ('' + date.getDate()).padStart(2, '0');
    const month = ('' + (date.getMonth() + 1)).padStart(2, '0');
    const year = date.getFullYear();

    return [day, month, year].join('.');
  },
  parse: str => {
    const [day, month, year] = str.split('.');
    return new Date(year, month - 1, day);
  },
  groups: {
    d: new PatternGroup.Range([1, 31]),
    m: new PatternGroup.Range([1, 12]),
    Y: new PatternGroup.Range([1900, 9999]),
  },
};
