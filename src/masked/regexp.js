import Masked from './base.js';


export default
class MaskedRegExp extends Masked {
  _update (opts) {
    opts.validate = (value) => value.search(opts.mask) >= 0;
    super._update(opts);
  }
}
