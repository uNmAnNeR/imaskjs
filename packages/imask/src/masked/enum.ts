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

  constructor (opts?: MaskedEnumOptions) {
    super(opts as MaskedPatternOptions); // mask will be created in _update
  }

  override updateOptions (opts: Partial<MaskedEnumOptions>) {
    super.updateOptions(opts);
  }

  override _update (opts: Partial<MaskedEnumOptions>) {
    const { enum: _enum, ...eopts }: MaskedEnumPatternOptions = opts;

    if (_enum) {
      const lengths = _enum.map(e => e.length);
      const requiredLength = Math.min(...lengths);
      const optionalLength = Math.max(...lengths) - requiredLength;

      eopts.mask = '*'.repeat(requiredLength);
      if (optionalLength) eopts.mask += '[' + '*'.repeat(optionalLength) + ']';

      this.enum = _enum;
    }

    super._update(eopts);
  }

  override doValidate (flags: AppendFlags): boolean {
    return this.enum.some(e => e.indexOf(this.unmaskedValue) === 0) &&
      super.doValidate(flags);
  }
}


IMask.MaskedEnum = MaskedEnum;
