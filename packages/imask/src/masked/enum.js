// @flow
import MaskedPattern from './pattern.js';
import IMask from '../core/holder.js';


/** Pattern which validates enum values */
export default
class MaskedEnum extends MaskedPattern {
  enum: Array<string>;

  /**
    @override
    @param {Object} opts
  */
  _update (opts: any) {  // TODO type
    if (opts.enum) opts.mask = '*'.repeat(opts.enum[0].length);

    super._update(opts);
  }

  /**
    @override
  */
  doValidate (...args: *): boolean {
    return this.enum.some(e => e.indexOf(this.unmaskedValue) >= 0) &&
      super.doValidate(...args);
  }
}


IMask.MaskedEnum = MaskedEnum;
