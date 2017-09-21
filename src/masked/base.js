import {refreshValueOnSet} from '../core/utils';


export default
class Masked {
  constructor ({
    mask,
    prepare=((val) => val),
    validate=(() => true),
    commit=(() => {}),
  }) {
    this._value = '';
    this.mask = mask;
    this.prepare = prepare;
    this.validate = validate;
    this.commit = commit;
    this.isInitialized = true;
  }

  get mask () {
    return this._mask;
  }

  @refreshValueOnSet
  set mask (mask) {
    this._mask = mask;
  }

  get prepare () {
    return this._prepare;
  }

  @refreshValueOnSet
  set prepare (prepare) {
    this._prepare = prepare;
  }

  get validate () {
    return this._validate;
  }

  @refreshValueOnSet
  set validate (validate) {
    this._validate = validate;
  }

  get commit () {
    return this._commit;
  }

  @refreshValueOnSet
  set commit (commit) {
    this._commit = commit;
  }

  clone () {
    const m = new Masked(this);
    m._value = this.value.slice();
    return m;
  }

  reset () {
    this._value = '';
  }

  get value () {
    return this._value;
  }

  set value (value) {
    this.reset();
    this.appendWithTail(value);
    this.doCommit();
  }

  get unmaskedValue () {
    return this._unmask();
  }

  set unmaskedValue (value) {
    this.reset();
    this._append(value);
    this.appendWithTail("");
    this.doCommit();
  }

  get isComplete () {
    return true;
  }

  nearestInputPos (cursorPos, /* direction */) {
    return cursorPos;
  }

  extractInput (fromPos=0, toPos=this.value.length) {
    return this.value.slice(fromPos, toPos);
  }

  extractTail (fromPos=0, toPos=this.value.length) {
    return this.extractInput(fromPos, toPos);
  }

  _appendTail (tail) {
    return !tail || this._append(tail);
  }

  _append (str, soft) {
    const oldValueLength = this.value.length;
    let consistentValue = this.clone();

    str = this.doPrepare(str, soft);
    for (let ci=0; ci<str.length; ++ci) {
      this._value += str[ci];
      if (this.doValidate(soft) === false) {
        Object.assign(this, consistentValue);
        if (!soft) return false;
      }

      consistentValue = this.clone();
    }

    return this.value.length - oldValueLength;

  }

  appendWithTail (str, tail) {
    // TODO refactor
    let appendCount = 0;
    let consistentValue = this.clone();
    let consistentAppended;

    for (let ci=0; ci<str.length; ++ci) {
      const ch = str[ci];

      const appended = this._append(ch, true);
      consistentAppended = this.clone();
      const tailAppended = appended !== false && this._appendTail(tail) !== false;
      if (tailAppended === false || this.doValidate(true) === false) {
        Object.assign(this, consistentValue);
        break;
      }

      consistentValue = this.clone();
      Object.assign(this, consistentAppended);
      appendCount += appended;
    }

    // TODO needed for cases when
    // 1) REMOVE ONLY AND NO LOOP AT ALL
    // 2) last loop iteration removes tail
    // 3) when breaks on tail insert
    this._appendTail(tail);

    return appendCount;
  }

  _unmask () {
    return this.value;
  }

  // TODO rename - refactor
  clear (from=0, to=this.value.length) {
    this._value = this.value.slice(0, from) + this.value.slice(to);
  }

  withValueRefresh (fn) {
    if (this._refreshing) return fn();
    this._refreshing = true;

    const unmasked = this.isInitialized ? this.unmaskedValue : null;

    const ret = fn();

    if (unmasked != null) this.unmaskedValue = unmasked;

    delete this._refreshing;
    return ret;
  }

  doPrepare (str, soft) {
    return this.prepare(str, this, soft);
  }

  doValidate (soft) {
    return this.validate(this.value, this, soft);
  }

  doCommit () {
    this.commit(this.value, this);
  }

  // TODO
  // resolve (inputRaw) -> outputRaw

  // TODO
  // insert (str, fromPos, soft)

  // splice (start, deleteCount, inserted, removeDirection) {
  //   const tailPos = start + deleteCount;
  //   const tail = this.extractTail(tailPos);

  //   start = this.nearestInputPos(start, removeDirection);
  //   this.clear(start);
  //   return this.appendWithTail(inserted, tail);
  // }
}
