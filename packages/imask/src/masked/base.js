// @flow
import ChangeDetails from '../core/change-details.js';
import {type Direction, DIRECTION} from '../core/utils.js';
import {type TailDetails} from '../core/tail-details.js';


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
  raw?: boolean
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
};


/** Provides common masking stuff */
export default
class Masked<MaskType> {
  static DEFAULTS: any; // $Shape<MaskedOptions>; TODO after fix https://github.com/facebook/flow/issues/4773

  /** @type {Mask} */
  mask: MaskType;
  /** */ // $FlowFixMe TODO no ideas
  parent: ?Masked<*>;
  /** Transforms value before mask processing */
  prepare: (string, Masked<MaskType>, AppendFlags) => string;
  /** Validates if value is acceptable */
  validate: (string, Masked<MaskType>, AppendFlags) => boolean;
  /** Does additional processing in the end of editing */
  commit: (string, AppendFlags) => void;
  /** */
  isInitialized: boolean;
  _value: string;
  _refreshing: boolean;

  constructor (opts: {[string]: any}) {
    this._value = '';
    this._update(opts);
    this.isInitialized = true;
  }

  /** Sets and applies new options */
  updateOptions (opts: {[string]: any}) {
    this.withValueRefresh(this._update.bind(this, opts));
  }

  /**
    Sets new options
    @protected
  */
  _update (opts: {[string]: any}) {
    Object.assign(this, opts);
  }

  get state (): any {
    return {
      _value: this._value,
    };
  }

  set state (state: any) {
    Object.assign(this, state);
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
    this._append(value, {input: true}, {value: ''});
    this.doCommit();
    return this.value;
  }

  /** */
  get unmaskedValue (): string {
    return this.value;
  }

  set unmaskedValue (value: string) {
    this.reset();
    this._append(value, {}, {value: ''});
    this.doCommit();
  }

  /** */
  get typedValue (): any {
    return this.unmaskedValue;
  }

  set typedValue (value: any) {
    this.unmaskedValue = value;
  }

  /** Value that includes raw user input */
  get rawInputValue (): string {
    return this.extractInput(0, this.value.length, {raw: true});
  }

  set rawInputValue (value: string) {
    this.reset();
    this._append(value, {raw: true}, {value: ''});
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
  _extractTail (fromPos?: number=0, toPos?: number=this.value.length): TailDetails {
    return {
      value: this.extractInput(fromPos, toPos),
    };
  }

  /** Appends tail */
  _appendTail (tail?: TailDetails): ChangeDetails {
    return this._append(tail ? tail.value: '', {tail: true});
  }

  _appendCharInternal (ch: string, flags: AppendFlags={}): ChangeDetails {
    this._value += ch;
    return new ChangeDetails({
      inserted: ch,
      rawInserted: ch,
    });
  }

  /** Appends char */
  _appendChar (ch: string, flags: AppendFlags={}, checkTail?: TailDetails): ChangeDetails {
    ch = this.doPrepare(ch, flags);
    if (!ch) return new ChangeDetails();

    const consistentState: MaskedState = this.state;
    const details: ChangeDetails = this._appendCharInternal(ch, flags);
    if (details.inserted) {
      let appended = this.doValidate(flags) !== false;

      if (appended && checkTail != null) {
        // validation ok, check tail
        const insertedState = this.state;
        const tailDetails = this._appendTail(checkTail);

        appended = tailDetails.rawInserted === checkTail.value;

        // if ok, rollback state after tail
        if (appended && tailDetails.inserted) this.state = insertedState;
      }

      // revert all if something went wrong
      if (!appended) {
        details.rawInserted = details.inserted = '';
        this.state = consistentState;
      }
    }
    return details;
  }

  /** Appends symbols considering flags */
  _append (str: string, flags: AppendFlags={}, tail?: TailDetails): ChangeDetails {
    const oldValueLength = this.value.length;
    const details = new ChangeDetails();

    str = this.doPrepare(str, flags);

    for (let ci=0; ci<str.length; ++ci) {
      const chDetails = this._appendChar(str[ci], flags, tail);
      details.aggregate(chDetails);

      // if not in `input` mode dont skip invalid chars
      // if (!chDetails.rawInserted && !flags.input) {
      //   break;
      // }
      // TODO if !resolved and !skip
    }

    // append tail but aggregate only shift
    if (tail != null) details.shift += this._appendTail(tail).shift;

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

    const unmasked = this.unmaskedValue;
    const value = this.value;

    const ret = fn();

    // try to update with raw value first to keep fixed chars
    if (this.resolve(value) !== value) {
      // or fallback to unmasked
      this.unmaskedValue = unmasked;
    }

    delete this._refreshing;
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

  // TODO
  // insert (str, fromPos, flags)

  /** */
  splice (start: number, deleteCount: number, inserted: string, removeDirection: Direction): ChangeDetails {
    const tailPos: number = start + deleteCount;
    const tail: TailDetails = this._extractTail(tailPos);

    let startChangePos: number = this.nearestInputPos(start, removeDirection);
    const changeDetails: ChangeDetails = new ChangeDetails({
      shift: startChangePos - start  // adjust shift if start was aligned
    }).aggregate(this.remove(startChangePos))
      .aggregate(this._append(inserted, {input: true}, tail));

    return changeDetails;
  }
}
