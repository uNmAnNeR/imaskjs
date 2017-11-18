import ChangeDetails from '../core/change-details.js';
import createMask from './factory.js';
import Masked from './base.js';


export default
class MaskedDynamic extends Masked {
  constructor (opts) {
    super({
      ...MaskedDynamic.DEFAULTS,
      ...opts
    });

    this.currentMask = null;
  }

  _update (opts) {
    super._update(opts);
    this.compiledMasks = Array.isArray(opts.mask) ?
      opts.mask.map(m => createMask(m)) :
      [];
  }

  _append (str, ...args) {
    const oldValueLength = this.value.length;
    const details = new ChangeDetails();

    str = this.doPrepare(str, ...args);

    const inputValue = this.rawInputValue;
    this.currentMask = this.doDispatch(str, ...args);
    if (this.currentMask) {
      // update current mask
      this.currentMask.rawInputValue = inputValue;
      details.shift = this.value.length - oldValueLength;
      details.aggregate(this.currentMask._append(str, ...args));
    }

    return details;
  }

  appendWithTail (str, tail) {
    // TODO seems strange
    // call append to do dispatch and get offset
    return this._append('').aggregate(super.appendWithTail(str, tail));
  }

  doDispatch(appended, flags) {
    return this.dispatch(appended, this, flags);
  }

  clone () {
    const m = new MaskedDynamic(this);
    m._value = this.value;
    if (this.currentMask) m.currentMask = this.currentMask.clone();
    return m;
  }

  reset () {
    if (this.currentMask) this.currentMask.reset();
    this.compiledMasks.forEach(cm => cm.reset());
  }

  get value () {
    return this.currentMask ? this.currentMask.value : '';
  }

  set value (value) {
    this.resolve(value);
  }

  get isComplete () {
    return !!this.currentMask && this.currentMask.isComplete;
  }

  _unmask () {
    return this.currentMask ? this.currentMask._unmask() : '';
  }

  remove (...args) {
    if (this.currentMask) this.currentMask.remove(...args);
  }

  extractInput (...args) {
    return this.currentMask ?
      this.currentMask.extractInput(...args) :
      '';
  }

  doCommit () {
    if (this.currentMask) this.currentMask.doCommit();
    super.doCommit();
  }

  nearestInputPos(...args) {
    return this.currentMask ?
      this.currentMask.nearestInputPos(...args) :
      super.nearestInputPos(...args);
  }
}

MaskedDynamic.DEFAULTS = {
  dispatch: (appended, masked, flags) => {
    if (!masked.compiledMasks.length) return;

    const inputValue = masked.rawInputValue;

    // update all
    masked.compiledMasks.forEach(cm => {
      cm.rawInputValue = inputValue;
      cm._append(appended, flags);
    });

    // pop masks with longer values first
    const inputs = masked.compiledMasks.map((cm, index) => ({value: cm.rawInputValue.length, index}));
    inputs.sort((i1, i2) => i2.value - i1.value);

    return masked.compiledMasks[inputs[0].index];
  }
};
