// @flow
import ChangeDetails from '../core/change-details.js';
import createMask from './factory.js';
import Masked, {type AppendFlags} from './base.js';


export default
class MaskedDynamic extends Masked<Array<{[string]: any}>> {
  currentMask: ?Masked<*>;
  compiledMasks: Array<Masked<*>>;
  dispatch: (string, Masked<*>, AppendFlags) => Masked<*>;

  constructor (opts: any) {
    super({
      ...MaskedDynamic.DEFAULTS,
      ...opts
    });

    this.currentMask = null;
  }

  _update (opts: any) {
    super._update(opts);
    this.compiledMasks = Array.isArray(opts.mask) ?
      opts.mask.map(m => createMask(m)) :
      [];
  }

  _append (str: string, ...args: *) {
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

  doDispatch(appended: string, flags: AppendFlags={}) {
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

  get value (): string {
    return this.currentMask ? this.currentMask.value : '';
  }

  set value (value: string) {
    super.value = value;
  }

  get unmaskedValue (): string {
    return this.currentMask ? this.currentMask.unmaskedValue : '';
  }

  set unmaskedValue (unmaskedValue: string) {
    super.unmaskedValue = unmaskedValue;
  }

  get isComplete (): boolean {
    return !!this.currentMask && this.currentMask.isComplete;
  }

  remove (...args: *) {
    if (this.currentMask) this.currentMask.remove(...args);
  }

  extractInput (...args: *) {
    return this.currentMask ?
      this.currentMask.extractInput(...args) :
      '';
  }

  doCommit () {
    if (this.currentMask) this.currentMask.doCommit();
    super.doCommit();
  }

  nearestInputPos(...args: *) {
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
