// @flow
import ChangeDetails from '../core/change-details.js';
import ContinuousTailDetails from '../core/continuous-tail-details.js';
import { type Direction, DIRECTION, isString } from '../core/utils.js';
import { type TailDetails } from '../core/tail-details.js';
import IMask from '../core/holder.js';


/** Supported mask type */
export
type Mask =
  string |
  String |
  RegExp |
  Class<Number> |
  Class<Date> |
  Array<any> |
  $PropertyType<Masked<*>, 'validate'> |
  Masked<*> |
  Class<Masked<*>>;

export
type MaskedState = {|
  _value: string,
|};

/** Append flags */
export
type AppendFlags = {
  input?: boolean,
  tail?: boolean,
  raw?: boolean,
  _beforeTailState?: any,  // TODO types...
};

/** Extract flags */
export
type ExtractFlags = {
  raw?: boolean
};

export
type MaskedOptions<MaskType> = {
  mask: $PropertyType<Masked<MaskType>, 'mask'>,
  parent?: $PropertyType<Masked<*>, 'parent'>,
  prepare?: $PropertyType<Masked<MaskType>, 'prepare'>,
  validate?: $PropertyType<Masked<MaskType>, 'validate'>,
  commit?: $PropertyType<Masked<MaskType>, 'commit'>,
  overwrite?: $PropertyType<Masked<MaskType>, 'overwrite'>,
  format?: $PropertyType<Masked<MaskType>, 'format'>,
  parse?: $PropertyType<Masked<MaskType>, 'parse'>,
};


/** Provides common masking stuff */
export default
class Masked<MaskType> {
  static DEFAULTS: any; // $Shape<MaskedOptions>; TODO after fix https://github.com/facebook/flow/issues/4773

  /** @type {Mask} */
  mask: MaskType;
  /** */ // $FlowFixMe no ideas
  parent: ?Masked<*>;
  /** Transforms value before mask processing */
  prepare: (string, Masked<MaskType>, AppendFlags) => string;
  /** Validates if value is acceptable */
  validate: (string, Masked<MaskType>, AppendFlags) => boolean;
  /** Does additional processing in the end of editing */
  commit: (string, Masked<MaskType>) => void;
  /** Format typed value to string */
  format: (any, Masked<MaskType>) => string;
  /** Parse strgin to get typed value */
  parse: (string, Masked<MaskType>) => any;
  /** Enable characters overwriting */
  overwrite: ?boolean;
  /** */
  isInitialized: boolean;
  _value: string;
  _refreshing: ?boolean;
  _isolated: ?boolean;

  constructor (opts: {[string]: any}) {
    this._value = '';
    this._update({
      ...Masked.DEFAULTS,
      ...opts,
    });
    this.isInitialized = true;
  }

  /** Sets and applies new options */
  updateOptions (opts: {[string]: any}) {
    if (!Object.keys(opts).length) return;
    this.withValueRefresh(this._update.bind(this, opts));
  }

  /**
    Sets new options
    @protected
  */
  _update (opts: {[string]: any}) {
    Object.assign(this, opts);
  }

  /** Mask state */
  get state (): any {
    return {
      _value: this.value,
    };
  }

  set state (state: any) {
    this._value = state._value;
  }

  /** Resets value */
  reset () {
    this._value = '';
  }

  /** */
  get value (): string {
    return this._value;
  }

  set value (value: string) {
    this.resolve(value);
  }

  /** Resolve new value */
  resolve (value: string): string {
    this.reset();
    this.append(value, {input: true}, '');
    this.doCommit();
    return this.value;
  }

  /** */
  get unmaskedValue (): string {
    return this.value;
  }

  set unmaskedValue (value: string) {
    this.reset();
    this.append(value, {}, '');
    this.doCommit();
  }

  /** */
  get typedValue (): any {
    return this.doParse(this.value);
  }

  set typedValue (value: any) {
    this.value = this.doFormat(value);
  }

  /** Value that includes raw user input */
  get rawInputValue (): string {
    return this.extractInput(0, this.value.length, {raw: true});
  }

  set rawInputValue (value: string) {
    this.reset();
    this.append(value, {raw: true}, '');
    this.doCommit();
  }

  /** */
  get isComplete (): boolean {
    return true;
  }

  /** Finds nearest input position in direction */
  nearestInputPos (cursorPos: number, direction?: Direction): number {
    return cursorPos;
  }

  /** Extracts value in range considering flags */
  extractInput (fromPos?: number=0, toPos?: number=this.value.length, flags?: ExtractFlags): string {
    return this.value.slice(fromPos, toPos);
  }

  /** Extracts tail in range */
  extractTail (fromPos?: number=0, toPos?: number=this.value.length): TailDetails {
    return new ContinuousTailDetails(this.extractInput(fromPos, toPos), fromPos);
  }

  /** Appends tail */
  // $FlowFixMe no ideas
  appendTail (tail: string | TailDetails): ChangeDetails {
    if (isString(tail)) tail = new ContinuousTailDetails(String(tail));

    return tail.appendTo(this);
  }

  /** Appends char */
  _appendCharRaw (ch: string, flags: AppendFlags={}): ChangeDetails {
    ch = this.doPrepare(ch, flags);
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
    let details: ChangeDetails = this._appendCharRaw(ch, flags);

    if (details.inserted) {
      let consistentTail;
      let appended = this.doValidate(flags) !== false;

      if (appended && checkTail != null) {
        // validation ok, check tail
        const beforeTailState = this.state;
        if (this.overwrite) {
          consistentTail = checkTail.state;
          checkTail.shiftBefore(this.value.length);
        }

        const tailDetails = this.appendTail(checkTail);

        appended = tailDetails.rawInserted === checkTail.toString();

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

  /** Appends symbols considering flags */
  // $FlowFixMe no ideas
  append (str: string, flags?: AppendFlags, tail?: string | TailDetails): ChangeDetails {
    if (!isString(str)) throw new Error('value should be string');
    const details = new ChangeDetails();
    const checkTail = isString(tail) ? new ContinuousTailDetails(String(tail)) : tail;
    if (flags.tail) flags._beforeTailState = this.state;

    for (let ci=0; ci<str.length; ++ci) {
      details.aggregate(this._appendChar(str[ci], flags, checkTail));
    }

    // append tail but aggregate only tailShift
    if (checkTail != null) {
      details.tailShift += this.appendTail(checkTail).tailShift;
      // TODO it's a good idea to clear state after appending ends
      // but it causes bugs when one append calls another (when dynamic dispatch set rawInputValue)
      // this._resetBeforeTailState();
    }

    return details;
  }

  /** */
  remove (fromPos?: number=0, toPos?: number=this.value.length): ChangeDetails {
    this._value = this.value.slice(0, fromPos) + this.value.slice(toPos);
    return new ChangeDetails();
  }

  /** Calls function and reapplies current value */
  withValueRefresh<T>(fn: () => T): T {
    if (this._refreshing || !this.isInitialized) return fn();
    this._refreshing = true;

    const rawInput = this.rawInputValue;
    const value = this.value;

    const ret = fn();

    this.rawInputValue = rawInput;
    // append lost trailing chars at end
    if (this.value !== value && value.indexOf(this._value) === 0) {
      this.append(value.slice(this._value.length), {}, '');
    }

    delete this._refreshing;
    return ret;
  }

  /** */
  runIsolated<T>(fn: (masked: any) => T): T {
    if (this._isolated || !this.isInitialized) return fn(this);
    this._isolated = true;
    const state = this.state;

    const ret = fn(this);

    this.state = state;
    delete this._isolated;

    return ret;
  }

  /**
    Prepares string before mask processing
    @protected
  */
  doPrepare (str: string, flags: AppendFlags={}): string {
    return this.prepare ?
      this.prepare(str, this, flags) :
      str;
  }

  /**
    Validates if value is acceptable
    @protected
  */
  doValidate (flags: AppendFlags): boolean {
    return (!this.validate || this.validate(this.value, this, flags)) &&
      (!this.parent || this.parent.doValidate(flags));
  }

  /**
    Does additional processing in the end of editing
    @protected
  */
  doCommit () {
    if (this.commit) this.commit(this.value, this);
  }

  /** */
  doFormat (value: any) {
    return this.format ? this.format(value, this) : value;
  }

  /** */
  doParse (str: string) {
    return this.parse ? this.parse(str, this) : str;
  }

  /** */
  splice (start: number, deleteCount: number, inserted: string, removeDirection: Direction): ChangeDetails {
    const tailPos: number = start + deleteCount;
    const tail: TailDetails = this.extractTail(tailPos);

    let startChangePos: number = this.nearestInputPos(start, removeDirection);
    const changeDetails: ChangeDetails = new ChangeDetails({
      tailShift: startChangePos - start  // adjust tailShift if start was aligned
    }).aggregate(this.remove(startChangePos))
      .aggregate(this.append(inserted, {input: true}, tail));

    return changeDetails;
  }
}
Masked.DEFAULTS = {
  format: v => v,
  parse: v => v,
};


IMask.Masked = Masked;
