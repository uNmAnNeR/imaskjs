// @flow
import ChangeDetails from '../core/change-details.js';
import createMask from './factory.js';
import Masked, {type AppendFlags} from './base.js';


/** Dynamic mask for choosing apropriate mask in run-time */
export default
class MaskedDynamic extends Masked<Array<{[string]: any}>> {
  /** Currently chosen mask */
  currentMask: ?Masked<*>;
  /** Compliled {@link Masked} options */
  compiledMasks: Array<Masked<*>>;
  /** Chooses {@link Masked} depending on input value */
  dispatch: (string, Masked<*>, AppendFlags) => Masked<*>;

  /**
    @param {Object} opts
  */
  constructor (opts: any) {
    super({
      ...MaskedDynamic.DEFAULTS,
      ...opts
    });

    this.currentMask = null;
  }

  /**
    @override
  */
  _update (opts: any) {
    super._update(opts);
    this.compiledMasks = Array.isArray(opts.mask) ?
      opts.mask.map(m => createMask(m)) :
      [];
  }

  /**
    @override
  */
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

  /**
    @override
  */
  doDispatch(appended: string, flags: AppendFlags={}) {
    return this.dispatch(appended, this, flags);
  }

  /**
    @override
  */
  clone () {
    const m = new MaskedDynamic(this);
    m._value = this.value;
    if (this.currentMask) m.currentMask = this.currentMask.clone();
    return m;
  }

  /**
    @override
  */
  reset () {
    if (this.currentMask) this.currentMask.reset();
    this.compiledMasks.forEach(cm => cm.reset());
  }

  /**
    @override
  */
  get value (): string {
    return this.currentMask ? this.currentMask.value : '';
  }

  set value (value: string) {
    super.value = value;
  }

  /**
    @override
  */
  get unmaskedValue (): string {
    return this.currentMask ? this.currentMask.unmaskedValue : '';
  }

  set unmaskedValue (unmaskedValue: string) {
    super.unmaskedValue = unmaskedValue;
  }

  /**
    @override
  */
  get isComplete (): boolean {
    return !!this.currentMask && this.currentMask.isComplete;
  }

  /**
    @override
  */
  remove (...args: *) {
    if (this.currentMask) this.currentMask.remove(...args);
  }

  /**
    @override
  */
  extractInput (...args: *) {
    return this.currentMask ?
      this.currentMask.extractInput(...args) :
      '';
  }

  /**
    @override
  */
  doCommit () {
    if (this.currentMask) this.currentMask.doCommit();
    super.doCommit();
  }

  /**
    @override
  */
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
