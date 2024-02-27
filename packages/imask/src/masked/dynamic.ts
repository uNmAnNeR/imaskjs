import { objectIncludes } from '../core/utils';
import ChangeDetails from '../core/change-details';
import createMask, { type FactoryArg, type ExtendFactoryArgOptions, type NormalizedOpts, normalizeOpts } from './factory';
import Masked, { type AppendFlags, type MaskedState, type MaskedOptions, type ExtractFlags } from './base';
import { DIRECTION, type Direction } from '../core/utils';
import { type TailDetails } from '../core/tail-details';
import IMask from '../core/holder';


type MaskedDynamicNoRefState = MaskedState & {
  compiledMasks: Array<MaskedState>
};

type MaskedDynamicRefState = MaskedDynamicNoRefState & {
  currentMaskRef: Masked,
  currentMask: MaskedState,
};

export
type MaskedDynamicState = MaskedDynamicNoRefState | MaskedDynamicRefState;

export
type DynamicMaskType = Array<ExtendFactoryArgOptions<{ expose?: boolean }>> | ArrayConstructor;

export
type MaskedDynamicOptions = MaskedOptions<MaskedDynamic, 'dispatch'>;

type HandleState = MaskedDynamicState | MaskedState;

/** Dynamic mask for choosing appropriate mask in run-time */
export default
class MaskedDynamic<Value=any> extends Masked<Value> {
  declare mask: DynamicMaskType;
  /** Currently chosen mask */
  declare currentMask?: Masked;
  /** Currently chosen mask */
  declare exposeMask?: Masked;
  /** Compliled {@link Masked} options */
  declare compiledMasks: Array<Masked>;
  /** Chooses {@link Masked} depending on input value */
  declare dispatch: (appended: string, masked: MaskedDynamic, flags: AppendFlags<HandleState>, tail: string | String | TailDetails) => (Masked | undefined);

  declare _overwrite?: this['overwrite'];
  declare _eager?: this['eager'];
  declare _skipInvalid?: this['skipInvalid'];
  declare _autofix?: this['autofix'];

  static DEFAULTS: typeof Masked.DEFAULTS & Pick<MaskedDynamic, 'dispatch'> = {
    ...Masked.DEFAULTS,
    dispatch: (appended, masked, flags, tail) => {
      if (!masked.compiledMasks.length) return;

      const inputValue = masked.rawInputValue;

      // simulate input
      const inputs = masked.compiledMasks.map((m, index) => {
        const isCurrent = masked.currentMask === m;
        const startInputPos = isCurrent ? m.displayValue.length : m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT);

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
            Math.max(startInputPos, m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT)),
          ),
        };
      });

      // pop masks with longer values first
      inputs.sort((i1, i2) => i2.weight - i1.weight || i2.totalInputPositions - i1.totalInputPositions);

      return masked.compiledMasks[inputs[0].index];
    }
  };

  constructor (opts?: MaskedDynamicOptions) {
    super({
      ...MaskedDynamic.DEFAULTS,
      ...opts
    });

    this.currentMask = undefined;
  }

  override updateOptions (opts: Partial<MaskedDynamicOptions>) {
    super.updateOptions(opts);
  }

  override _update (opts: Partial<MaskedDynamicOptions>) {
    super._update(opts);

    if ('mask' in opts) {
      this.exposeMask = undefined;
      // mask could be totally dynamic with only `dispatch` option
      this.compiledMasks = Array.isArray(opts.mask) ?
        opts.mask.map(m => {
          const { expose, ...maskOpts } = normalizeOpts(m) as NormalizedOpts<FactoryArg> & { expose?: boolean };

          const masked = createMask({
            overwrite: this._overwrite,
            eager: this._eager,
            skipInvalid: this._skipInvalid,
            ...maskOpts,
          });

          if (expose) this.exposeMask = masked;

          return masked;
        }) :
        [];

      // this.currentMask = this.doDispatch(''); // probably not needed but lets see
    }
  }

  override _appendCharRaw (ch: string, flags: AppendFlags<HandleState>={}): ChangeDetails {
    const details = this._applyDispatch(ch, flags);

    if (this.currentMask) {
      details.aggregate(this.currentMask._appendChar(ch, this.currentMaskFlags(flags)));
    }

    return details;
  }

  _applyDispatch (appended: string='', flags: AppendFlags<HandleState>={}, tail: string | String | TailDetails = ''): ChangeDetails {
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
          this.currentMask.append(insertValue, { raw: true });
          details.tailShift = this.currentMask.value.length - prevValueBeforeTail.length;
        }

        if (tailValue) {
          details.tailShift += this.currentMask.append(tailValue, { raw: true, tail: true }).tailShift;
        }
      } else if (prevMaskState) {
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

  currentMaskFlags (flags: AppendFlags<HandleState>): AppendFlags {
    return {
      ...flags,
      _beforeTailState:
        (flags._beforeTailState as MaskedDynamicRefState)?.currentMaskRef === this.currentMask &&
        (flags._beforeTailState as MaskedDynamicRefState)?.currentMask ||
        flags._beforeTailState,
    };
  }

  doDispatch(appended: string, flags: AppendFlags<HandleState>={}, tail: string | String | TailDetails=''): Masked | undefined {
    return this.dispatch(appended, this, flags, tail);
  }

  override doValidate (flags: AppendFlags<HandleState>): boolean {
    return super.doValidate(flags) && (
      !this.currentMask || this.currentMask.doValidate(this.currentMaskFlags(flags))
    );
  }

  override doPrepare (str: string, flags: AppendFlags<HandleState>={}): [string, ChangeDetails] {
    let [s, details] = super.doPrepare(str, flags);

    if (this.currentMask) {
      let currentDetails;
      ([s, currentDetails] = super.doPrepare(s, this.currentMaskFlags(flags)));
      details = details.aggregate(currentDetails);
    }

    return [s, details];
  }

  override doPrepareChar (str: string, flags: AppendFlags<HandleState>={}): [string, ChangeDetails] {
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
    return this.exposeMask ? this.exposeMask.value :
      this.currentMask ? this.currentMask.value :
      '';
  }

  override set value (value: string) {
    if (this.exposeMask) {
      this.exposeMask.value = value;
      this.currentMask = this.exposeMask;
      this._applyDispatch();
    }
    else super.value = value;
  }

  override get unmaskedValue (): string {
    return this.exposeMask ? this.exposeMask.unmaskedValue :
      this.currentMask ? this.currentMask.unmaskedValue :
      '';
  }

  override set unmaskedValue (unmaskedValue: string) {
    if (this.exposeMask) {
      this.exposeMask.unmaskedValue = unmaskedValue;
      this.currentMask = this.exposeMask;
      this._applyDispatch();
    }
    else super.unmaskedValue = unmaskedValue;
  }

  override get typedValue (): Value {
    return this.exposeMask ? this.exposeMask.typedValue :
      this.currentMask ? this.currentMask.typedValue :
      '';
  }

  override set typedValue (typedValue: Value) {
    if (this.exposeMask) {
      this.exposeMask.typedValue = typedValue;
      this.currentMask = this.exposeMask;
      this._applyDispatch();
      return;
    }

    let unmaskedValue = String(typedValue);

    // double check it
    if (this.currentMask) {
      this.currentMask.typedValue = typedValue;
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

  override set state (state: HandleState) {
    const { compiledMasks, currentMaskRef, currentMask, ...maskedState } = state as MaskedDynamicRefState;
    if (compiledMasks) this.compiledMasks.forEach((m, mi) => m.state = compiledMasks[mi]);
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

  override get overwrite (): boolean | 'shift' | undefined {
    return this.currentMask ?
      this.currentMask.overwrite :
      this._overwrite;
  }

  override set overwrite (overwrite: boolean | 'shift' | undefined) {
    this._overwrite = overwrite;
  }

  override get eager (): boolean | 'remove' | 'append' | undefined {
    return this.currentMask ?
      this.currentMask.eager :
      this._eager;
  }

  override set eager (eager: boolean | 'remove' | 'append' | undefined) {
    this._eager = eager;
  }

  override get skipInvalid (): boolean | undefined {
    return this.currentMask ?
      this.currentMask.skipInvalid :
      this._skipInvalid;
  }

  override set skipInvalid (skipInvalid: boolean | undefined) {
    this._skipInvalid = skipInvalid;
  }

  override get autofix (): boolean | 'pad' | undefined {
    return this.currentMask ?
      this.currentMask.autofix :
      this._autofix;
  }

  override set autofix (autofix: boolean | 'pad' | undefined) {
    this._autofix = autofix;
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


IMask.MaskedDynamic = MaskedDynamic;
