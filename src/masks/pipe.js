import BaseMask from './base';
import {extendDetailsAdjustments} from '../utils';


export default
class PipeMask extends BaseMask {
  constructor (el, opts) {
    super(el, opts);

    this.multipass = opts.multipass;

    this._compiledMasks = this.mask.map(m => IMask.MaskFactory(el, m));
  }

  resolve (str, details) {
    var res = this._pipe(str, details);
    if (!this.multipass) return res;

    var cursorPos = details.cursorPos;

    var stepRes;
    var tempRes = res;

    while (stepRes !== tempRes) {
      stepRes = tempRes;
      tempRes = this._pipe(stepRes, {
        cursorPos: stepRes.length,
        oldValue: stepRes,
        oldSelection: {
          start: 0,
          end: stepRes.length
        }
      });
    }

    details.cursorPos = cursorPos - (res.length - stepRes.length);

    return stepRes;
  }

  _pipe (str, details) {
    return this._compiledMasks.reduce((s, m) => {
      var d = extendDetailsAdjustments(s, details);
      var res = m.resolve(s, d);
      details.cursorPos = d.cursorPos;
      return res;
    }, str);
  }

  bindEvents () {
    super.bindEvents();
    this._compiledMasks.forEach(m => {
      m.bindEvents();
      // disable basemask events for child masks
      BaseMask.prototype.unbindEvents.apply(m);
    });
  }

  unbindEvents () {
    super.unbindEvents();
    this._compiledMasks.forEach(m => m.unbindEvents());
  }
}
