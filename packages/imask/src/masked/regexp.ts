import Masked, { type MaskedOptions } from './base';
import IMask from '../core/holder';


/** Masking by RegExp */
export default
class MaskedRegExp<Parent extends Masked=any> extends Masked<RegExp, Parent> {
  /**
    @override
    @param {Object} opts
  */
  override _update (opts: Partial<MaskedOptions<RegExp, Parent>>) {
    if (opts.mask) opts.validate = (value) => value.search(opts.mask) >= 0;
    super._update(opts);
  }
}


IMask.MaskedRegExp = MaskedRegExp;
