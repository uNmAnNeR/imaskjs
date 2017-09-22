import Masked from './base';


export default
class MaskedFunction extends Masked {
  constructor (opts={}) {
    opts.validate = opts.mask;
    super(opts);
  }
}
