// @flow
import Masked, {type MaskedOptions} from './base.js';


export default
class MaskedFunction extends Masked<Function> {
  _update (opts: MaskedOptions<Function>) {
    opts.validate = opts.mask;
    super._update(opts);
  }
}
