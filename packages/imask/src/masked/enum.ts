import MaskedPattern, { type MaskedPatternOptions } from './pattern';
import Masked, { AppendFlags } from './base';
import IMask from '../core/holder';

export
type MaskedEnumOptions<Parent extends Masked=any> = MaskedPatternOptions<Parent> & { enum: MaskedEnum<Parent>['enum'] };


/** Pattern which validates enum values */
export default
class MaskedEnum<Parent extends Masked=any> extends MaskedPattern {
  enum: Array<string>;

  /**
    @override
    @param {Object} opts
  */
  override _update (opts: Partial<MaskedEnumOptions<Parent>>) {  // TODO type
    const eopts = { ...opts };
    if (opts.enum) eopts.mask = '*'.repeat(opts.enum[0].length),

    super._update(eopts);
  }

  /**
    @override
  */
  override doValidate (flags: AppendFlags): boolean {
    return this.enum.some(e => e.indexOf(this.unmaskedValue) >= 0) &&
      super.doValidate(flags);
  }
}


IMask.MaskedEnum = MaskedEnum;
