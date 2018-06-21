// @flow
import MaskedPattern from './pattern.js';


/** Pattern group that validates enum values */
export default
class MaskedEnum extends MaskedPattern {
  enums: Array<string>;

  /**
    @override
  */
  _update (opts: any) {  // TODO type
    if (opts.enums) opts.mask = '*'.repeat(opts.enums[0].length);

    super._update(opts);
  }

  doValidate (...args: *): boolean {
    return this.enums.some(e => e.indexOf(this.unmaskedValue) >= 0) &&
      super.doValidate(...args);
  }
}
