import Masked, { type MaskedOptions } from './base';
import IMask from '../core/holder';


/** Masking by custom Function */
export default
class MaskedFunction<Mask extends Masked<Mask, any>['validate']=any, Parent extends Masked=any> extends Masked<Mask, Parent> {
  /**
    @override
    @param {Object} opts
  */
  override _update (opts: Partial<MaskedOptions<Mask, Parent>>) {
    super._update({
      ...opts,
      validate: opts.mask,
    });
  }
}


IMask.MaskedFunction = MaskedFunction;
