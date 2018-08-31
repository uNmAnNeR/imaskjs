// @flow
import ChangeDetails from '../core/change-details.js';
import createMask from './factory.js';
import Masked, {type AppendFlags, type MaskedState} from './base.js';
import {type TailDetails} from '../core/tail-details.js';

type MaskedDynamicState = {|
  ...MaskedState,
  compiledMasks: Array<*>,
  currentMaskRef: ?Masked<*>,
  currentMask: *,
|};

type DynamicMaskType = Array<{[string]: any}>;
/** Dynamic mask for choosing apropriate mask in run-time */
export default
class MaskedDynamic extends Masked<DynamicMaskType> {
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
    // mask could be totally dynamic with only `dispatch` option
    this.compiledMasks = Array.isArray(opts.mask) ?
      opts.mask.map(m => createMask(m)) :
      [];
  }

  /**
    @override
  */
  _appendCharInternal (ch: string, ...args: *): ChangeDetails {
    const details = this._applyDispatch(ch, ...args);

    if (this.currentMask) {
      details.aggregate(this.currentMask._appendChar(ch, ...args));
    }

    return details;
  }

  _applyDispatch (appended: string='', ...args: *) {
    const oldValueLength = this.value.length;
    const inputValue = this.rawInputValue;
    const oldMask = this.currentMask;
    const details = new ChangeDetails();

    // dispatch SHOULD NOT modify mask
    this.currentMask = this.doDispatch(appended, ...args);

    // restore state after dispatch
    if (this.currentMask && this.currentMask !== oldMask) {
      // if mask changed reapply input
      this.currentMask.reset();
      details.shift = -oldValueLength;
      // $FlowFixMe - it's ok, we don't change current mask
      details.aggregate(this.currentMask._append(inputValue, {raw: true}));
    }

    return details;
  }

  /**
  */
  doDispatch(appended: string, flags: AppendFlags={}) {
    return this.dispatch(appended, this, flags);
  }

  /**
    @override
  */
  doValidate (...args: *): boolean {
    return super.doValidate(...args) && (
      !this.currentMask || this.currentMask.doValidate(...args));
  }

  /**
    @override
  */
  reset () {
    if (this.currentMask) this.currentMask.reset();
    this.compiledMasks.forEach(m => m.reset());
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
  get typedValue (): any {
    return this.currentMask ? this.currentMask.typedValue : '';
  }

  // probably typedValue should not be used with dynamic
  set typedValue (value: any) {
    let unmaskedValue = String(value);

    // double check it
    if (this.currentMask) {
      this.currentMask.typedValue = value;
      unmaskedValue = this.currentMask.unmaskedValue;
    }
    this.unmaskedValue = unmaskedValue;
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
  remove (...args: *): ChangeDetails {
    const details: ChangeDetails = new ChangeDetails();
    if (this.currentMask) {
      details.aggregate(this.currentMask.remove(...args))
        // update with dispatch
        .aggregate(this._applyDispatch());
    }

    return details;
  }

  /**
    @override
  */
  get state (): MaskedDynamicState {
    return {
      ...super.state,
      compiledMasks: this.compiledMasks.map(m => m.state),
      currentMaskRef: this.currentMask,
      currentMask: this.currentMask && this.currentMask.state,
    };
  }

  set state (state: MaskedDynamicState) {
    const {compiledMasks, currentMaskRef, currentMask, ...maskedState} = state;
    this.compiledMasks.forEach((m, mi) => m.state = compiledMasks[mi]);
    if (currentMaskRef != null) {
      this.currentMask = currentMaskRef;
      this.currentMask.state = currentMask;
    }
    super.state = maskedState;
  }

  /**
    @override
  */
  extractInput (...args: *): string {
    return this.currentMask ?
      this.currentMask.extractInput(...args) :
      '';
  }

  /**
    @override
  */
  _extractTail (...args: *): TailDetails {
    return this.currentMask ?
      this.currentMask._extractTail(...args) :
      super._extractTail(...args);
  }

  /**
    @override
  */
  // SHOULD WORK BECAUSE OF `_appendCharInternal`
  // _appendTail (tail?: TailDetails): ChangeDetails {
  //   const details = new ChangeDetails();
  //   if (tail) details.aggregate(this._applyDispatch(tail.value));

  //   return details.aggregate(this.currentMask ?
  //     this.currentMask._appendTail(tail) :
  //     super._appendTail(tail));
  // }

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
  nearestInputPos(...args: *): number {
    return this.currentMask ?
      this.currentMask.nearestInputPos(...args) :
      super.nearestInputPos(...args);
  }
}

MaskedDynamic.DEFAULTS = {
  dispatch: (appended, masked, flags) => {
    if (!masked.compiledMasks.length) return;

    const inputValue = masked.rawInputValue;

    // simulate input
    const inputs = masked.compiledMasks.map((m, index) => {
      const mState = m.state;

      m.rawInputValue = inputValue;
      m._append(appended, flags);
      const weight = m.rawInputValue.length;

      m.state = mState;

      return {weight, index};
    });

    // pop masks with longer values first
    inputs.sort((i1, i2) => i2.weight - i1.weight);

    return masked.compiledMasks[inputs[0].index];
  }
};
