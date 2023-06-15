import MaskedPattern, { type MaskedPatternOptions } from './pattern';
import { AppendFlags } from './base';
import IMask from '../core/holder';


export
type MaskedEnumOptions = Omit<MaskedPatternOptions, 'mask'> & Pick<MaskedEnum, 'enum'>;

export
type MaskedEnumPatternOptions = MaskedPatternOptions & Partial<Pick<MaskedEnum, 'enum'>>;


/** Pattern which validates enum values */
export default
class MaskedEnum extends MaskedPattern {
  declare enum: Array<string>;

  override updateOptions (opts: Partial<MaskedEnumOptions>) {
    super.updateOptions(opts);
  }

  override _update (opts: Partial<MaskedEnumOptions>) {
    const { enum: _enum, ...eopts }: MaskedEnumPatternOptions = opts;
    this.enum = _enum;
    if (_enum) eopts.mask = '*'.repeat(_enum[0].length);

    super._update(eopts);
  }

  override doValidate (flags: AppendFlags): boolean {
    return this.enum.some(e => e.indexOf(this.unmaskedValue) >= 0) &&
      super.doValidate(flags);
  }
}


IMask.MaskedEnum = MaskedEnum;
