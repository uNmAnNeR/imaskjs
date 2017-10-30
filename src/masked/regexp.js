import Masked from './base.js';


export default
class MaskedRegExp extends Masked {
  constructor (opts={}) {
    opts.validate = (value) => value.search(opts.mask) >= 0;
    super(opts);
  }
}
