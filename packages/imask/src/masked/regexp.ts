import Masked, { type MaskedOptions } from './base';
import IMask from '../core/holder';


export
type MaskedRegExpOptions = MaskedOptions<MaskedRegExp>;

/** Masking by RegExp */
export default
class MaskedRegExp extends Masked<string> {
  declare mask: RegExp;

  override updateOptions (opts: Partial<MaskedRegExpOptions>) {
    super.updateOptions(opts);
  }

  /**
    @override
    @param {Object} opts
  */
  override _update (opts: Partial<MaskedRegExpOptions>) {
    if (opts.mask) opts.validate = (value) => value.search(opts.mask) >= 0;
    super._update(opts);
  }
}


IMask.MaskedRegExp = MaskedRegExp;
