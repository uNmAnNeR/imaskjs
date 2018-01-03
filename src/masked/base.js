// @flow
import ChangeDetails from '../core/change-details.js';
import {type Direction} from '../core/utils.js';


export
type Mask = string | String | RegExp | Class<Number> | Class<Date> | Array<any> | Function | Masked<*> | Class<Masked<*>>;

export
type AppendFlags = {
  input?: boolean,
  tail?: boolean,
  raw?: boolean
};

export
type ExtractFlags = {
  raw?: boolean
};

export
type MaskedOptions<MaskType> = {
  mask: $PropertyType<Masked<MaskType>, 'mask'>,
  prepare?: $PropertyType<Masked<MaskType>, 'prepare'>,
  validate?: $PropertyType<Masked<MaskType>, 'validate'>,
  commit?: $PropertyType<Masked<MaskType>, 'commit'>,
};

export default
class Masked<MaskType> {
  static DEFAULTS: any; // $Shape<MaskedOptions>; TODO after fix https://github.com/facebook/flow/issues/4773

  mask: MaskType;
  prepare: (string, Masked<MaskType>, AppendFlags) => string;
  validate: (string, Masked<MaskType>, AppendFlags) => boolean;
  commit: (string, AppendFlags) => void;
  isInitialized: boolean;
  _value: string;
  _refreshing: boolean;

  constructor (opts: {[string]: any}) {
    this._value = '';
    this._update({
      ...Masked.DEFAULTS,
      ...opts
    });
    this.isInitialized = true;
  }

  updateOptions (opts: {[string]: any}) {
    this.withValueRefresh(this._update.bind(this, opts));
  }

  _update (opts: {[string]: any}) {
    Object.assign(this, opts);
  }

  clone (): Masked<MaskType> {
    const m = new Masked(this);
    m._value = this.value.slice();
    return m;
  }

  reset () {
    this._value = '';
  }

  get value (): string {
    return this._value;
  }

  set value (value: string) {
    this.resolve(value);
  }

  resolve (value: string): string {
    this.reset();
    this._append(value, {input: true});
    this._appendTail();
    this.doCommit();
    return this.value;
  }

  get unmaskedValue (): string {
    return this.value;
  }

  set unmaskedValue (value: string) {
    this.reset();
    this._append(value);
    this._appendTail();
    this.doCommit();
  }

  get rawInputValue (): string {
    return this.extractInput(0, this.value.length, {raw: true});
  }

  set rawInputValue (value: string) {
    this.reset();
    this._append(value, {raw: true});
    this._appendTail();
    this.doCommit();
  }

  get isComplete (): boolean {
    return true;
  }

  nearestInputPos (cursorPos: number, direction?: Direction): number {
    return cursorPos;
  }

  extractInput (fromPos: number=0, toPos: number=this.value.length, flags?: ExtractFlags): string {
    return this.value.slice(fromPos, toPos);
  }

  _extractTail (fromPos: number=0, toPos: number=this.value.length): any {
    return this.extractInput(fromPos, toPos);
  }

  _appendTail (tail: any=""): ChangeDetails {
    return this._append(tail, {tail: true});
  }

  _append (str: string, flags: AppendFlags={}): ChangeDetails {
    const oldValueLength = this.value.length;
    let consistentValue: Masked<MaskType> = this.clone();
    let overflow = false;

    str = this.doPrepare(str, flags);

    for (let ci=0; ci<str.length; ++ci) {
      this._value += str[ci];
      if (this.doValidate(flags) === false) {
        // $FlowFixMe
        Object.assign(this, consistentValue);
        if (!flags.input) {
          // in `input` mode dont skip invalid chars
          overflow = true;
          break;
        }
      }

      consistentValue = this.clone();
    }

    return new ChangeDetails({
      inserted: this.value.slice(oldValueLength),
      overflow
    });
  }

  appendWithTail (str: string, tail: string): ChangeDetails {
    // TODO refactor
    const aggregateDetails = new ChangeDetails();
    let consistentValue = this.clone();
    let consistentAppended: Masked<MaskType>;

    for (let ci=0; ci<str.length; ++ci) {
      const ch = str[ci];

      const appendDetails = this._append(ch, {input: true});
      consistentAppended = this.clone();
      const tailAppended = !appendDetails.overflow && !this._appendTail(tail).overflow;
      if (!tailAppended || this.doValidate({tail: true}) === false) {
        // $FlowFixMe
        Object.assign(this, consistentValue);
        break;
      }

      // $FlowFixMe
      Object.assign(this, consistentAppended);
      consistentValue = this.clone();
      aggregateDetails.aggregate(appendDetails);
    }

    // TODO needed for cases when
    // 1) REMOVE ONLY AND NO LOOP AT ALL
    // 2) last loop iteration removes tail
    // 3) when breaks on tail insert

    // aggregate only shift from tail
    aggregateDetails.shift += this._appendTail(tail).shift;

    return aggregateDetails;
  }

  remove (from: number=0, count: number=this.value.length-from) {
    this._value = this.value.slice(0, from) + this.value.slice(from + count);
  }

  withValueRefresh<T>(fn: () => T): T {
    if (this._refreshing || !this.isInitialized) return fn();
    this._refreshing = true;

    const unmasked = this.unmaskedValue;

    const ret = fn();

    this.unmaskedValue = unmasked;

    delete this._refreshing;
    return ret;
  }

  doPrepare (str: string, flags: AppendFlags={}): string {
    return this.prepare(str, this, flags);
  }

  doValidate (flags: AppendFlags): boolean {
    return this.validate(this.value, this, flags);
  }

  doCommit () {
    this.commit(this.value, this);
  }

  // TODO
  // insert (str, fromPos, flags)

  splice (start: number, deleteCount: number, inserted: string, removeDirection: Direction): ChangeDetails {
    const tailPos = start + deleteCount;
    const tail = this._extractTail(tailPos);

    const startChangePos = this.nearestInputPos(start, removeDirection);
    this.remove(startChangePos);
    const changeDetails = this.appendWithTail(inserted, tail);

    // adjust shift if start was aligned
    changeDetails.shift += startChangePos - start;
    return changeDetails;
  }
}

Masked.DEFAULTS = {
  prepare: val => val,
  validate: () => true,
  commit: () => {},
};
