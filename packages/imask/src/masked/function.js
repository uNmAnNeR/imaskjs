// @flow
import Masked, {type MaskedOptions} from './base.js';


/** Masking by custom Function */
export default
class MaskedFunction extends Masked<Function> {
  /**
    @override
    @param {Object} opts
  */
  _update (opts: MaskedOptions<Function>) {
    if (opts.mask) opts.validate = opts.mask;
    super._update(opts);
  }
}
