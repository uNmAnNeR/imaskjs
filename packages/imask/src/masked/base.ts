import ChangeDetails from '../core/change-details';
import ContinuousTailDetails from '../core/continuous-tail-details';
import { type Direction, DIRECTION, isString, forceDirection } from '../core/utils';
import { type TailDetails } from '../core/tail-details';
import IMask from '../core/holder';


export
type MaskedState = {
  _value: string,
};

/** Append flags */
export
type AppendFlags<State=MaskedState> = {
  input?: boolean,
  tail?: boolean,
  raw?: boolean,
  _beforeTailState?: State,
};

/** Extract flags */
export
type ExtractFlags = {
  raw?: boolean
};

// see https://github.com/microsoft/TypeScript/issues/6223

export
type MaskedOptions<M extends Masked=Masked, Props extends keyof M=never> = Partial<Pick<M,
  | 'mask'
  | 'parent'
  | 'prepare'
  | 'validate'
  | 'commit'
  | 'format'
  | 'parse'
  | 'overwrite'
  | 'eager'
  | 'skipInvalid'
  | Props
>>;


/** Provides common masking stuff */
export default
class Masked<Value=any> {
  static DEFAULTS: Partial<MaskedOptions>;
  static EMPTY_VALUES: Array<any>;

  /** @type {Mask} */
  declare mask: unknown;
  /** */
  declare parent?: Masked;
  /** Transforms value before mask processing */
  declare prepare?: (chars: string, masked: this, flags: AppendFlags) => string | [string, ChangeDetails];
  /** Validates if value is acceptable */
  declare validate?: (value: string, masked: this, flags: AppendFlags) => boolean;
  /** Does additional processing in the end of editing */
  declare commit?: (value: string, masked: this) => void;
  /** Format typed value to string */
  declare format?: (value: Value, masked: this) => string;
  /** Parse strgin to get typed value */
  declare parse?: (str: string, masked: this) => Value;
  /** Enable characters overwriting */
  declare overwrite?: boolean | 'shift' | undefined;
  /** */
  declare eager?: boolean | 'remove' | 'append' | undefined;
  /** */
  declare skipInvalid?: boolean | undefined;

  /** */
  declare _initialized: boolean;

  declare _value: string;
  declare _refreshing?: boolean;
  declare _isolated?: boolean;

  constructor (opts: MaskedOptions) {
    this._value = '';
    this._update({
      ...Masked.DEFAULTS,
      ...opts,
    });
    this._initialized = true;
  }

  /** Sets and applies new options */
  updateOptions (opts: Partial<MaskedOptions>) {
    if (!Object.keys(opts).length) return;

    this.withValueRefresh(this._update.bind(this, opts));
  }

  /** Sets new options */
  _update (opts: Partial<MaskedOptions>) {
    Object.assign(this, opts);
  }

  /** Mask state */
  get state (): MaskedState {
    return {
      _value: this.value,
    };
  }

  set state (state: MaskedState) {
    this._value = state._value;
  }

  /** Resets value */
  reset () {
    this._value = '';
  }

  get value (): string {
    return this._value;
  }

  set value (value: string) {
    this.resolve(value, { input: true });
  }

  /** Resolve new value */
  resolve (value: string, flags: AppendFlags={ input: true }): void {
    this.reset();
    this.append(value, flags, '');
    this.doCommit();
  }

  get unmaskedValue (): string {
    return this.value;
  }

  set unmaskedValue (value: string) {
    this.resolve(value, {});
  }

  get typedValue (): Value {
    return this.parse ? this.parse(this.value, this) : this.unmaskedValue as Value;
  }

  set typedValue (value: Value) {
    if (this.format) {
      this.value = this.format(value, this);
    } else {
      this.unmaskedValue = String(value);
    }
  }

  /** Value that includes raw user input */
  get rawInputValue (): string {
    return this.extractInput(0, this.value.length, {raw: true});
  }

  set rawInputValue (value: string) {
    this.resolve(value, { raw: true });
  }

  get displayValue (): string {
    return this.value;
  }

  get isComplete (): boolean {
    return true;
  }

  get isFilled (): boolean {
    return this.isComplete;
  }

  /** Finds nearest input position in direction */
  nearestInputPos (cursorPos: number, direction?: Direction): number {
    return cursorPos;
  }

  totalInputPositions (fromPos: number=0, toPos: number=this.value.length): number {
    return Math.min(this.value.length, toPos - fromPos);
  }

  /** Extracts value in range considering flags */
  extractInput (fromPos: number=0, toPos: number=this.value.length, flags?: ExtractFlags): string {
    return this.value.slice(fromPos, toPos);
  }

  /** Extracts tail in range */
  extractTail (fromPos: number=0, toPos: number=this.value.length): TailDetails {
    return new ContinuousTailDetails(this.extractInput(fromPos, toPos), fromPos);
  }

  /** Appends tail */
  appendTail (tail: string | String | TailDetails): ChangeDetails {
    if (isString(tail)) tail = new ContinuousTailDetails(String(tail));

    return (tail as TailDetails).appendTo(this);
  }

  /** Appends char */
  _appendCharRaw (ch: string, flags: AppendFlags={}): ChangeDetails {
    if (!ch) return new ChangeDetails();

    this._value += ch;
    return new ChangeDetails({
      inserted: ch,
      rawInserted: ch,
    });
  }

  /** Appends char */
  _appendChar (ch: string, flags: AppendFlags={}, checkTail?: TailDetails): ChangeDetails {
    const consistentState: MaskedState = this.state;
    let details: ChangeDetails;
    [ch, details] = this.doPrepare(ch, flags);

    details = details.aggregate(this._appendCharRaw(ch, flags));

    if (details.inserted) {
      let consistentTail;
      let appended = this.doValidate(flags) !== false;

      if (appended && checkTail != null) {
        // validation ok, check tail
        const beforeTailState = this.state;
        if (this.overwrite === true) {
          consistentTail = checkTail.state;
          checkTail.unshift(this.value.length - details.tailShift);
        }

        let tailDetails = this.appendTail(checkTail);
        appended = tailDetails.rawInserted === checkTail.toString();

        // not ok, try shift
        if (!(appended && tailDetails.inserted) && this.overwrite === 'shift') {
          this.state = beforeTailState;
          consistentTail = checkTail.state;
          checkTail.shift();

          tailDetails = this.appendTail(checkTail);
          appended = tailDetails.rawInserted === checkTail.toString();
        }

        // if ok, rollback state after tail
        if (appended && tailDetails.inserted) this.state = beforeTailState;
      }

      // revert all if something went wrong
      if (!appended) {
        details = new ChangeDetails();
        this.state = consistentState;
        if (checkTail && consistentTail) checkTail.state = consistentTail;
      }
    }
    return details;
  }

  /** Appends optional placeholder at end */
  _appendPlaceholder (): ChangeDetails {
    return new ChangeDetails();
  }

  /** Appends optional eager placeholder at end */
  _appendEager (): ChangeDetails {
    return new ChangeDetails();
  }

  /** Appends symbols considering flags */
  append (str: string, flags?: AppendFlags, tail?: string | String | TailDetails): ChangeDetails {
    if (!isString(str)) throw new Error('value should be string');
    const details = new ChangeDetails();
    const checkTail = isString(tail) ? new ContinuousTailDetails(String(tail)) : tail as TailDetails;
    if (flags?.tail) flags._beforeTailState = this.state;

    for (let ci=0; ci<str.length; ++ci) {
      const d = this._appendChar(str[ci], flags, checkTail);
      if (!d.rawInserted && !this.doSkipInvalid(str[ci], flags, checkTail)) break;
      details.aggregate(d);
    }

    // append tail but aggregate only tailShift
    if (checkTail != null) {
      details.tailShift += this.appendTail(checkTail).tailShift;
      // TODO it's a good idea to clear state after appending ends
      // but it causes bugs when one append calls another (when dynamic dispatch set rawInputValue)
      // this._resetBeforeTailState();
    }

    if ((this.eager === true || this.eager === 'append') && flags?.input && str) {
      details.aggregate(this._appendEager());
    }

    return details;
  }

  remove (fromPos: number=0, toPos: number=this.value.length): ChangeDetails {
    this._value = this.value.slice(0, fromPos) + this.value.slice(toPos);
    return new ChangeDetails();
  }

  /** Calls function and reapplies current value */
  withValueRefresh<T>(fn: () => T): T {
    if (this._refreshing || !this._initialized) return fn();
    this._refreshing = true;

    const rawInput = this.rawInputValue;
    const value = this.value;

    const ret = fn();

    this.rawInputValue = rawInput;
    // append lost trailing chars at end
    if (this.value && this.value !== value && value.indexOf(this.value) === 0) {
      this.append(value.slice(this.value.length), {}, '');
    }

    delete this._refreshing;
    return ret;
  }

  runIsolated<T>(fn: (masked: this) => T): T {
    if (this._isolated || !this._initialized) return fn(this);
    this._isolated = true;
    const state = this.state;

    const ret = fn(this);

    this.state = state;
    delete this._isolated;

    return ret;
  }

  doSkipInvalid (ch: string, flags: AppendFlags={}, checkTail?: TailDetails): boolean {
    return Boolean(this.skipInvalid);
  }

  /** Prepares string before mask processing */
  doPrepare (str: string, flags: AppendFlags={}): [string, ChangeDetails] {
    return ChangeDetails.normalize(this.prepare ?
      this.prepare(str, this, flags) :
      str);
  }

  /** Validates if value is acceptable */
  doValidate (flags: AppendFlags): boolean {
    return (!this.validate || this.validate(this.value, this, flags)) &&
      (!this.parent || this.parent.doValidate(flags));
  }

  /** Does additional processing in the end of editing */
  doCommit () {
    if (this.commit) this.commit(this.value, this);
  }

  splice (start: number, deleteCount: number, inserted: string, removeDirection: Direction = DIRECTION.NONE, flags: AppendFlags = { input: true }): ChangeDetails {
    const tailPos: number = start + deleteCount;
    const tail: TailDetails = this.extractTail(tailPos);

    const eagerRemove = this.eager === true || this.eager === 'remove';

    let oldRawValue;
    if (eagerRemove)  {
      removeDirection = forceDirection(removeDirection);
      oldRawValue = this.extractInput(0, tailPos, {raw: true});
    }

    let startChangePos: number = start;
    const details: ChangeDetails = new ChangeDetails();

    // if it is just deletion without insertion
    if (removeDirection !== DIRECTION.NONE) {
      startChangePos = this.nearestInputPos(start,
        deleteCount > 1 && start !== 0 && !eagerRemove ?
        DIRECTION.NONE :
        removeDirection
      );

      // adjust tailShift if start was aligned
      details.tailShift = startChangePos - start;
    }

    details.aggregate(this.remove(startChangePos));

    if (eagerRemove && removeDirection !== DIRECTION.NONE && oldRawValue === this.rawInputValue) {
      if (removeDirection === DIRECTION.FORCE_LEFT) {
        let valLength;
        while (oldRawValue === this.rawInputValue && (valLength = this.value.length)) {
          details
            .aggregate(new ChangeDetails({ tailShift: -1 }))
            .aggregate(this.remove(valLength-1));
        }
      } else if (removeDirection === DIRECTION.FORCE_RIGHT) {
        tail.unshift();
      }
    }

    return details.aggregate(this.append(inserted, flags, tail));
  }

  maskEquals (mask: any): boolean {
    return this.mask === mask;
  }

  typedValueEquals (value: any): boolean {
    const tval = this.typedValue;

    return value === tval ||
      Masked.EMPTY_VALUES.includes(value) && Masked.EMPTY_VALUES.includes(tval) ||
      this.format && this.format(value, this) === this.format(this.typedValue, this);
  }
}
Masked.DEFAULTS = {
  skipInvalid: true,
};
Masked.EMPTY_VALUES = [undefined, null, ''];


IMask.Masked = Masked;
