import Masked from './base.js';


export default
class MaskedFunction extends Masked {
  constructor (opts={}) {
    opts.validate = opts.mask;
    super(opts);
  }
}
