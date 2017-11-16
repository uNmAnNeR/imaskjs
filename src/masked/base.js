export default
class Masked {
  constructor (opts) {
    this._value = '';
    this._update({
      ...Masked.DEFAULTS,
      ...opts
    });
    this.isInitialized = true;
  }

  updateOptions (opts) {
    this.withValueRefresh(this._update.bind(this, opts));
  }

  _update (opts) {
    Object.assign(this, opts);
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

  get rawInputValue () {
    return this.extractInput(0, this.value.length, {raw: true});
  }

  set rawInputValue (value) {
    this.reset();
    this._append(value, {raw: true});
    this.appendWithTail("");
    this.doCommit();
  }

  get isComplete () {
    return true;
  }

  nearestInputPos (cursorPos, /* direction */) {
    return cursorPos;
  }

  extractInput (fromPos=0, toPos=this.value.length /*, flags */) {
    return this.value.slice(fromPos, toPos);
  }

  extractTail (fromPos=0, toPos=this.value.length) {
    return this.extractInput(fromPos, toPos);
  }

  _appendTail (tail) {
    return !tail || this._append(tail, {tail: true});
  }

  _append (str, flags={}) {
    const oldValueLength = this.value.length;
    let consistentValue = this.clone();

    str = this.doPrepare(str, flags);
    for (let ci=0; ci<str.length; ++ci) {
      this._value += str[ci];
      if (this.doValidate(flags) === false) {
        Object.assign(this, consistentValue);
        if (!flags.input) return false;
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

      const appended = this._append(ch, {input: true});
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
    if (this._refreshing || !this.isInitialized) return fn();
    this._refreshing = true;

    const unmasked = this.unmaskedValue;

    const ret = fn();

    this.unmaskedValue = unmasked;

    delete this._refreshing;
    return ret;
  }

  doPrepare (str, flags) {
    return this.prepare(str, this, flags);
  }

  doValidate (flags) {
    return this.validate(this.value, this, flags);
  }

  doCommit () {
    this.commit(this.value, this);
  }

  // TODO
  // resolve (inputRaw) -> outputRaw

  // TODO
  // insert (str, fromPos, flags)

  // splice (start, deleteCount, inserted, removeDirection) {
  //   const tailPos = start + deleteCount;
  //   const tail = this.extractTail(tailPos);

  //   start = this.nearestInputPos(start, removeDirection);
  //   this.clear(start);
  //   return this.appendWithTail(inserted, tail);
  // }
}

Masked.DEFAULTS = {
  prepare: val => val,
  validate: () => true,
  commit: () => {},
};
