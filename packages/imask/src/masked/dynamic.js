// @flow
import { objectIncludes } from '../core/utils.js';
import ChangeDetails from '../core/change-details.js';
import createMask from './factory.js';
import Masked, { type AppendFlags, type MaskedState } from './base.js';
import { normalizePrepare, DIRECTION } from '../core/utils.js';
import { type TailDetails } from '../core/tail-details.js';
import IMask from '../core/holder.js';


type MaskedDynamicState = {|
  ...MaskedState,
  _rawInputValue: string,
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
  dispatch: (string, Masked<*>, AppendFlags, string | String | TailDetails) => Masked<*>;

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
    if ('mask' in opts) {
      // mask could be totally dynamic with only `dispatch` option
      this.compiledMasks = Array.isArray(opts.mask) ?
        opts.mask.map(m => createMask(m)) :
        [];

      // this.currentMask = this.doDispatch(''); // probably not needed but lets see
    }
  }

  /**
    @override
  */
  _appendCharRaw (ch: string, flags: AppendFlags={}): ChangeDetails {
    const details = this._applyDispatch(ch, flags);

    if (this.currentMask) {
      details.aggregate(this.currentMask._appendChar(ch, this.currentMaskFlags(flags)));
    }

    return details;
  }

  _applyDispatch (appended: string='', flags: AppendFlags={}, tail: string | String | TailDetails = ''): ChangeDetails {
    const prevValueBeforeTail = flags.tail && flags._beforeTailState != null ?
      flags._beforeTailState._value :
      this.value;
    const inputValue = this.rawInputValue;
    const insertValue = flags.tail && flags._beforeTailState != null ?
      // $FlowFixMe - tired to fight with type system
      flags._beforeTailState._rawInputValue :
      inputValue;
    const tailValue = inputValue.slice(insertValue.length);
    const prevMask = this.currentMask;
    const details = new ChangeDetails();

    const prevMaskState = prevMask?.state;

    // clone flags to prevent overwriting `_beforeTailState`
    this.currentMask = this.doDispatch(appended, { ...flags }, tail);

    // restore state after dispatch
    if (this.currentMask) {
      if (this.currentMask !== prevMask) {
        // if mask changed reapply input
        this.currentMask.reset();

        if (insertValue) {
          // $FlowFixMe - it's ok, we don't change current mask above
          const d = this.currentMask.append(insertValue, {raw: true});
          details.tailShift = d.inserted.length - prevValueBeforeTail.length;
        }

        if (tailValue) {
          // $FlowFixMe - it's ok, we don't change current mask above
          details.tailShift += this.currentMask.append(tailValue, {raw: true, tail: true}).tailShift;
        }
      } else {
        // Dispatch can do something bad with state, so
        // restore prev mask state
        this.currentMask.state = prevMaskState;
      }
    }

    return details;
  }

  _appendPlaceholder (...args: *): ChangeDetails {
    const details = this._applyDispatch(...args);

    if (this.currentMask) {
      details.aggregate(this.currentMask._appendPlaceholder());
    }

    return details;
  }

   /**
    @override
  */
  _appendEager (...args: *): ChangeDetails {
    const details = this._applyDispatch(...args);

    if (this.currentMask) {
      details.aggregate(this.currentMask._appendEager());
    }

    return details;
  }

  appendTail (tail: string | String | TailDetails): ChangeDetails {
    const details = new ChangeDetails();
    if (tail) details.aggregate(this._applyDispatch('', {}, tail));

    return details.aggregate(this.currentMask ?
      this.currentMask.appendTail(tail) :
      super.appendTail(tail));
  }

  currentMaskFlags (flags: AppendFlags): AppendFlags {
    return {
      ...flags,
      _beforeTailState: flags._beforeTailState?.currentMaskRef === this.currentMask && flags._beforeTailState?.currentMask ||
        flags._beforeTailState,
    };
  }

  /**
    @override
  */
  doDispatch(appended: string, flags: AppendFlags={}, tail: string | String | TailDetails=''): ?Masked<*> {
    return this.dispatch(appended, this, flags, tail);
  }

  /**
    @override
  */
  doValidate (flags: AppendFlags): boolean {
    return super.doValidate(flags) && (
      !this.currentMask || this.currentMask.doValidate(this.currentMaskFlags(flags))
    );
  }

  /**
    @override
  */
  doPrepare (str: string, flags: AppendFlags={}): string | [string, ChangeDetails] {
    let [s, details] = normalizePrepare(super.doPrepare(str, flags));

    if (this.currentMask) {
      let currentDetails;
      ([s, currentDetails] = normalizePrepare(super.doPrepare(s, this.currentMaskFlags(flags))));
      details = details.aggregate(currentDetails);
    }

    return [s, details];
  }

  /**
    @override
  */
  reset () {
    this.currentMask?.reset();
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

  get displayValue (): string {
    return this.currentMask ? this.currentMask.displayValue : '';
  }

  /**
    @override
  */
  get isComplete (): boolean {
    return Boolean(this.currentMask?.isComplete);
  }

  /**
    @override
  */
  get isFilled (): boolean {
    return Boolean(this.currentMask?.isFilled);
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
      _rawInputValue: this.rawInputValue,
      compiledMasks: this.compiledMasks.map(m => m.state),
      currentMaskRef: this.currentMask,
      currentMask: this.currentMask?.state,
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
  extractTail (...args: *): TailDetails {
    return this.currentMask ?
      this.currentMask.extractTail(...args) :
      super.extractTail(...args);
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
  nearestInputPos(...args: *): number {
    return this.currentMask ?
      this.currentMask.nearestInputPos(...args) :
      super.nearestInputPos(...args);
  }

  get overwrite (): ?boolean | 'shift' {
    return this.currentMask ?
      this.currentMask.overwrite :
      super.overwrite;
  }

  set overwrite (overwrite: *) {
    console.warn('"overwrite" option is not available in dynamic mask, use this option in siblings');
  }

  get eager (): boolean | 'remove' | 'append' {
    return this.currentMask ?
      this.currentMask.eager :
      super.eager;
  }

  set eager (eager: *) {
    console.warn('"eager" option is not available in dynamic mask, use this option in siblings');
  }

  get skipInvalid (): boolean {
    return this.currentMask ?
      this.currentMask.skipInvalid :
      super.skipInvalid;
  }

  set skipInvalid (skipInvalid: boolean) {
    if (this.isInitialized || skipInvalid !== Masked.DEFAULTS.skipInvalid) {
      console.warn('"skipInvalid" option is not available in dynamic mask, use this option in siblings');
    }
  }

  /**
    @override
  */
  maskEquals (mask: any): boolean {
    return Array.isArray(mask) &&
      this.compiledMasks.every((m, mi) => {
        if (!mask[mi]) return;

        const { mask: oldMask, ...restOpts } = mask[mi];
        return objectIncludes(m, restOpts) && m.maskEquals(oldMask);
      });
  }

  /**
    @override
  */
  typedValueEquals (value: any): boolean {
    return Boolean(this.currentMask?.typedValueEquals(value));
  }
}

MaskedDynamic.DEFAULTS = {
  dispatch: (appended, masked, flags, tail) => {
    if (!masked.compiledMasks.length) return;

    const inputValue = masked.rawInputValue;

    // simulate input
    const inputs = masked.compiledMasks.map((m, index) => {
      if (m.rawInputValue !== inputValue) {
        m.reset();
        m.append(inputValue, { raw: true });
      } else {
        m.remove(m.nearestInputPos(m.value.length, DIRECTION.FORCE_LEFT));
      }
      m.append(appended, masked.currentMaskFlags(flags));
      m.appendTail(tail);
      const weight = m.rawInputValue.length;
      const totalInputPositions = m.totalInputPositions(0, m.nearestInputPos(m.value.length, DIRECTION.FORCE_LEFT));

      return { weight, totalInputPositions, index };
    });

    // pop masks with longer values first
    inputs.sort((i1, i2) => i2.weight - i1.weight || i2.totalInputPositions - i1.totalInputPositions);

    return masked.compiledMasks[inputs[0].index];
  }
};


IMask.MaskedDynamic = MaskedDynamic;
