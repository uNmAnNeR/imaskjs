// @flow
import Masked, {type MaskedOptions} from './base.js';


/** Masking by RegExp */
export default
class MaskedRegExp extends Masked<RegExp> {
  /**
    @override
    @param {Object} opts
  */
  _update (opts: $Shape<MaskedOptions<RegExp>>) {
    if (opts.mask) opts.validate = (value) => value.search(opts.mask) >= 0;
    super._update(opts);
  }
}
