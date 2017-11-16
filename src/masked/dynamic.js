import createMask from './factory.js';
import Masked from './base.js';


export default
class MaskedDynamic extends Masked {
  constructor (opts) {
    super({
      ...MaskedDynamic.DEFAULTS,
      ...opts
    });

    this.currentMasked = null;
  }

  _update (opts) {
    super._update(opts);
    this._compiledMasks = Array.isArray(opts.mask) ?
      opts.mask.map(m => createMask(m)) :
      [];
  }

  _append (str, ...args) {
    const oldValueLength = this.value.length;

    str = this.doPrepare(str, ...args);

    const inputValue = this.rawInputValue;
    this.currentMasked = this.doDispatch(str, ...args);

    // update current mask
    this.currentMasked.rawInputValue = inputValue;
    return this.value.length - oldValueLength + this.currentMasked._append(str, ...args);
  }

  appendWithTail (str, tail) {
    // TODO seems strange
    // call append to do dispatch and get offset
    const offset = !str ? this._append('') : 0;
    return offset + super.appendWithTail(str, tail);
  }

  doDispatch(appended, flags) {
    return this.dispatch(appended, this, flags);
  }

  clone () {
    const m = new MaskedDynamic(this);
    m._value = this.value;
    m.currentMasked = this.currentMasked.clone();
    m._compiledMasks.forEach((cm, i) => cm._value = this._compiledMasks[i].value);
    return m;
  }

  reset () {
    if (this.currentMasked) this.currentMasked.reset();
    this._compiledMasks.forEach(cm => cm.reset());
  }

  get value () {
    return this.currentMasked ? this.currentMasked.value : '';
  }

  set value (value) {
    super.value = value;
  }

  get isComplete () {
    return !!this.currentMasked && this.currentMasked.isComplete;
  }

  _unmask () {
    return this.currentMasked ? this.currentMasked._unmask() : '';
  }

  clear (...args) {
    if (this.currentMasked) this.currentMasked.clear(...args);
    this._compiledMasks.forEach(cm => cm.clear(...args));
  }

  extractInput (...args) {
    return this.currentMasked ?
      this.currentMasked.extractInput(...args) :
      '';
  }

  doCommit () {
    if (this.currentMasked) this.currentMasked.doCommit();
    super.doCommit();
  }
}

MaskedDynamic.DEFAULTS = {
  dispatch: (appended, masked, flags) => {
    if (!masked._compiledMasks.length) return;

    const inputValue = masked.rawInputValue;

    // update all
    masked._compiledMasks.forEach(cm => {
      cm.rawInputValue = inputValue;
      cm._append(appended, flags);
    });

    // pop masks with longer values first
    const inputs = masked._compiledMasks.map((cm, index) => ({value: cm.rawInputValue.length, index}));
    inputs.sort((i1, i2) => i2.value - i1.value);

    return masked._compiledMasks[inputs[0].index];
  }
};
