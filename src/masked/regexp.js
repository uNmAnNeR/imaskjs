// @flow
import Masked, {type MaskedOptions} from './base.js';


export default
class MaskedRegExp extends Masked<RegExp> {
  _update (opts: $Shape<MaskedOptions<RegExp>>) {
    opts.validate = (value) => value.search(opts.mask) >= 0;
    super._update(opts);
  }
}
