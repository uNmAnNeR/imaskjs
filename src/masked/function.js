import Masked from './base.js';


export default
class MaskedFunction extends Masked {
  _update (opts) {
    opts.validate = opts.mask;
    super._update(opts);
  }
}
