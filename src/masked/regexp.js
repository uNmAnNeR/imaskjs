import Masked from './base';


export default
class MaskedRegExp extends Masked {
  constructor (opts={}) {
    opts.validate = (value) => opts.mask.test(value);
    super(opts);
  }
}
