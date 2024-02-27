import Masked, { type MaskedOptions } from './base';
import IMask from '../core/holder';


export
type MaskedRegExpOptions = MaskedOptions<MaskedRegExp>;

/** Masking by RegExp */
export default
class MaskedRegExp extends Masked<string> {
  /** */
  declare mask: RegExp;
  /** Enable characters overwriting */
  declare overwrite?: boolean | 'shift' | undefined;
  /** */
  declare eager?: boolean | 'remove' | 'append' | undefined;
  /** */
  declare skipInvalid?: boolean | undefined;
  /** */
  declare autofix?: boolean | 'pad' | undefined;

  override updateOptions (opts: Partial<MaskedRegExpOptions>) {
    super.updateOptions(opts);
  }

  override _update (opts: Partial<MaskedRegExpOptions>) {
    const mask = opts.mask;
    if (mask) opts.validate = (value) => value.search(mask) >= 0;
    super._update(opts);
  }
}


IMask.MaskedRegExp = MaskedRegExp;
