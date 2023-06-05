import { objectIncludes } from '../core/utils';
import ChangeDetails from '../core/change-details';
import createMask, { type FactoryArg } from './factory';
import Masked, { type AppendFlags, type MaskedState, type MaskedOptions, type ExtractFlags } from './base';
import { DIRECTION, type Direction } from '../core/utils';
import { type TailDetails } from '../core/tail-details';
import IMask from '../core/holder';


export
type MaskedDynamicState = MaskedState & {
  _rawInputValue: string,
  compiledMasks: Array<MaskedState>,
  currentMaskRef?: Masked,
  currentMask: MaskedState,
};

export
type DynamicMaskType = Array<FactoryArg> | ArrayConstructor;

export
type MaskedDynamicOptions = MaskedOptions<MaskedDynamic, 'dispatch'>;


/** Dynamic mask for choosing appropriate mask in run-time */
export default
class MaskedDynamic<Value=any> extends Masked<Value> {
  static DEFAULTS: Partial<MaskedDynamicOptions>;

  declare mask: DynamicMaskType;
  // TODO types
  /** Currently chosen mask */
  declare currentMask?: Masked;
  /** Compliled {@link Masked} options */
  declare compiledMasks: Array<Masked>; // TODO FactoryReturnMasked<?>
  /** Chooses {@link Masked} depending on input value */
  declare dispatch: (appended: string, masked: MaskedDynamic, flags: AppendFlags<MaskedDynamicState>, tail: string | String | TailDetails) => Masked;

  constructor (opts?: MaskedDynamicOptions) {
    super({
      ...MaskedDynamic.DEFAULTS,
      ...opts
    });

    this.currentMask = null;
  }

  override updateOptions (opts: Partial<MaskedDynamicOptions>) {
    super.updateOptions(opts);
  }

  override _update (opts: Partial<MaskedDynamicOptions>) {
    super._update(opts);
    if ('mask' in opts) {
      // mask could be totally dynamic with only `dispatch` option
      this.compiledMasks = Array.isArray(opts.mask) ?
        opts.mask.map(m => createMask(m)) :
        [];

      // this.currentMask = this.doDispatch(''); // probably not needed but lets see
    }
  }

  override _appendCharRaw (ch: string, flags: AppendFlags<MaskedDynamicState>={}): ChangeDetails {
    const details = this._applyDispatch(ch, flags);

    if (this.currentMask) {
      details.aggregate(this.currentMask._appendChar(ch, this.currentMaskFlags(flags)));
    }

    return details;
  }

  _applyDispatch (appended: string='', flags: AppendFlags<MaskedDynamicState>={}, tail: string | String | TailDetails = ''): ChangeDetails {
    const prevValueBeforeTail = flags.tail && flags._beforeTailState != null ?
      flags._beforeTailState._value :
      this.value;
    const inputValue = this.rawInputValue;
    const insertValue = flags.tail && flags._beforeTailState != null ?
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
          const d = this.currentMask.append(insertValue, {raw: true});
          details.tailShift = d.inserted.length - prevValueBeforeTail.length;
        }

        if (tailValue) {
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

  override _appendPlaceholder (): ChangeDetails {
    const details = this._applyDispatch();

    if (this.currentMask) {
      details.aggregate(this.currentMask._appendPlaceholder());
    }

    return details;
  }

  override _appendEager (): ChangeDetails {
    const details = this._applyDispatch();

    if (this.currentMask) {
      details.aggregate(this.currentMask._appendEager());
    }

    return details;
  }

  override appendTail (tail: string | String | TailDetails): ChangeDetails {
    const details = new ChangeDetails();
    if (tail) details.aggregate(this._applyDispatch('', {}, tail));

    return details.aggregate(this.currentMask ?
      this.currentMask.appendTail(tail) :
      super.appendTail(tail));
  }

  currentMaskFlags (flags: AppendFlags<MaskedDynamicState>): AppendFlags {
    return {
      ...flags,
      _beforeTailState: flags._beforeTailState?.currentMaskRef === this.currentMask && flags._beforeTailState?.currentMask ||
        flags._beforeTailState,
    };
  }

  doDispatch(appended: string, flags: AppendFlags<MaskedDynamicState>={}, tail: string | String | TailDetails=''): Masked | undefined {
    return this.dispatch(appended, this, flags, tail);
  }

  override doValidate (flags: AppendFlags<MaskedDynamicState>): boolean {
    return super.doValidate(flags) && (
      !this.currentMask || this.currentMask.doValidate(this.currentMaskFlags(flags))
    );
  }

  override doPrepare (str: string, flags: AppendFlags<MaskedDynamicState>={}): [string, ChangeDetails] {
    let [s, details] = super.doPrepare(str, flags);

    if (this.currentMask) {
      let currentDetails;
      ([s, currentDetails] = super.doPrepare(s, this.currentMaskFlags(flags)));
      details = details.aggregate(currentDetails);
    }

    return [s, details];
  }

  override doPrepareChar (str: string, flags: AppendFlags<MaskedDynamicState>={}): [string, ChangeDetails] {
    let [s, details] = super.doPrepareChar(str, flags);

    if (this.currentMask) {
      let currentDetails;
      ([s, currentDetails] = super.doPrepareChar(s, this.currentMaskFlags(flags)));
      details = details.aggregate(currentDetails);
    }

    return [s, details];
  }

  override reset () {
    this.currentMask?.reset();
    this.compiledMasks.forEach(m => m.reset());
  }

  override get value (): string {
    return this.currentMask ? this.currentMask.value : '';
  }

  override set value (value: string) {
    super.value = value;
  }

  override get unmaskedValue (): string {
    return this.currentMask ? this.currentMask.unmaskedValue : '';
  }

  override set unmaskedValue (unmaskedValue: string) {
    super.unmaskedValue = unmaskedValue;
  }

  override get typedValue (): Value {
    return this.currentMask ? this.currentMask.typedValue : '';
  }

  // probably typedValue should not be used with dynamic
  override set typedValue (value: Value) {
    let unmaskedValue = String(value);

    // double check it
    if (this.currentMask) {
      this.currentMask.typedValue = value;
      unmaskedValue = this.currentMask.unmaskedValue;
    }
    this.unmaskedValue = unmaskedValue;
  }

  override get displayValue (): string {
    return this.currentMask ? this.currentMask.displayValue : '';
  }

  override get isComplete (): boolean {
    return Boolean(this.currentMask?.isComplete);
  }

  override get isFilled (): boolean {
    return Boolean(this.currentMask?.isFilled);
  }

  override remove (fromPos?: number, toPos?: number): ChangeDetails {
    const details: ChangeDetails = new ChangeDetails();
    if (this.currentMask) {
      details.aggregate(this.currentMask.remove(fromPos, toPos))
        // update with dispatch
        .aggregate(this._applyDispatch());
    }

    return details;
  }

  override get state (): MaskedDynamicState {
    return {
      ...super.state,
      _rawInputValue: this.rawInputValue,
      compiledMasks: this.compiledMasks.map(m => m.state),
      currentMaskRef: this.currentMask,
      currentMask: this.currentMask?.state,
    };
  }

  override set state (state: MaskedDynamicState) {
    const {compiledMasks, currentMaskRef, currentMask, ...maskedState} = state;
    this.compiledMasks.forEach((m, mi) => m.state = compiledMasks[mi]);
    if (currentMaskRef != null) {
      this.currentMask = currentMaskRef;
      this.currentMask.state = currentMask;
    }
    super.state = maskedState;
  }

  override extractInput (fromPos?: number, toPos?: number, flags?: ExtractFlags): string {
    return this.currentMask ?
      this.currentMask.extractInput(fromPos, toPos, flags) :
      '';
  }

  override extractTail (fromPos?: number, toPos?: number): TailDetails {
    return this.currentMask ?
      this.currentMask.extractTail(fromPos, toPos) :
      super.extractTail(fromPos, toPos);
  }

  override doCommit () {
    if (this.currentMask) this.currentMask.doCommit();
    super.doCommit();
  }

  override nearestInputPos(cursorPos: number, direction?: Direction): number {
    return this.currentMask ?
      this.currentMask.nearestInputPos(cursorPos, direction) :
      super.nearestInputPos(cursorPos, direction);
  }

  // @ts-ignore i don't mind overriding
  override get overwrite (): boolean | 'shift' | undefined {
    return this.currentMask ?
      this.currentMask.overwrite :
      super.overwrite;
  }

  override set overwrite (overwrite: boolean | 'shift') {
    console.warn('"overwrite" option is not available in dynamic mask, use this option in siblings');
  }

  // @ts-ignore i don't mind overriding
  override get eager (): boolean | 'remove' | 'append' | undefined {
    return this.currentMask ?
      this.currentMask.eager :
      super.eager;
  }

  override set eager (eager: boolean | 'remove' | 'append') {
    console.warn('"eager" option is not available in dynamic mask, use this option in siblings');
  }

  // @ts-ignore i don't mind overriding
  override get skipInvalid (): boolean | undefined {
    return this.currentMask ?
      this.currentMask.skipInvalid :
      super.skipInvalid;
  }

  override set skipInvalid (skipInvalid: boolean | undefined) {
    if (this._initialized || skipInvalid !== Masked.DEFAULTS.skipInvalid) {
      console.warn('"skipInvalid" option is not available in dynamic mask, use this option in siblings');
    }
  }

  override maskEquals (mask: any): boolean {
    return Array.isArray(mask) ?
      this.compiledMasks.every((m, mi) => {
        if (!mask[mi]) return;

        const { mask: oldMask, ...restOpts } = mask[mi];
        return objectIncludes(m, restOpts) && m.maskEquals(oldMask);
      }) : super.maskEquals(mask);
  }

  override typedValueEquals (value: any): boolean {
    return Boolean(this.currentMask?.typedValueEquals(value));
  }
}

MaskedDynamic.DEFAULTS = {
  dispatch: (appended, masked, flags, tail) => {
    if (!masked.compiledMasks.length) return;

    const inputValue = masked.rawInputValue;

    // simulate input
    const inputs = masked.compiledMasks.map((m, index) => {
      const isCurrent = masked.currentMask === m;
      const startInputPos = isCurrent ? m.value.length : m.nearestInputPos(m.value.length, DIRECTION.FORCE_LEFT);

      if (m.rawInputValue !== inputValue) {
        m.reset();
        m.append(inputValue, { raw: true });
      } else if (!isCurrent) {
        m.remove(startInputPos);
      }
      m.append(appended, masked.currentMaskFlags(flags));
      m.appendTail(tail);

      return {
        index,
        weight: m.rawInputValue.length,
        totalInputPositions: m.totalInputPositions(
          0,
          Math.max(startInputPos, m.nearestInputPos(m.value.length, DIRECTION.FORCE_LEFT)),
        ),
      };
    });

    // pop masks with longer values first
    inputs.sort((i1, i2) => i2.weight - i1.weight || i2.totalInputPositions - i1.totalInputPositions);

    return masked.compiledMasks[inputs[0].index];
  }
};


IMask.MaskedDynamic = MaskedDynamic;
