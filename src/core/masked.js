export default
class Masked {
  constructor ({mask, validate}) {
    this._value = '';
    this.mask = mask;
    this.validate = validate || (() => true);
  }

  _validate () {
    return this.validate(this);
  }

  clone () {
    var m = new Masked(this);
    m._value = this.value.slice();
    return m;
  }

  reset () {
    this._value = '';
  }

  get value () {
    return this._value || '';
  }

  set value (value) {
    this.reset();
    this.append(value, false);
  }

  get unmaskedValue () {
    return this._unmask();
  }

  set unmaskedValue (value) {
    this.reset();
    this.append(value);
  }

  get isComplete () {
    return true;
  }

  nearestInputPos (cursorPos, direction) {
    return cursorPos;
  }

  extractInput (fromPos=0, toPos=this.value.length) {
    return this.value.slice(fromPos, toPos);
  }

  _extractTail (fromPos=0, toPos=this.value.length) {
    return this.extractInput(fromPos, toPos);
  }

  _appendTail (tail) {
    return this.append(tail);
  }

  append (str, skipUnresolvedInput=true) {
    var oldValueLength = this.value.length;
    var consistentValue = this.clone();

    for (var ci=0; ci<str.length; ++ci) {
      this._value += str[ci];
      if (this._validate() === false) {
        Object.assign(this, consistentValue);
        if (skipUnresolvedInput) return false;
      }

      consistentValue = this.clone();
    }

    return this.value.length - oldValueLength;

  }

  // TODO
  // insert (str, fromPos, skipUnresolved)

  appendWithTail (str, tail) {
    // TODO refactor
    var appendCount = 0;
    var consistentValue = this.clone();
    var consistentAppended;

    for (var ci=0; ci<str.length; ++ci) {
      var ch = str[ci];

      var appended = this.append(ch, false);
      consistentAppended = this.clone();
      var tailAppended = appended !== false && this._appendTail(tail) !== false;
      if (tailAppended === false) {
        Object.assign(this, consistentValue);
        return false;
      }

      consistentValue = this.clone();
      Object.assign(this, consistentAppended);
      appendCount += appended;
    }

    // TODO needed for cases when
    // 1) REMOVE ONLY AND NO LOOP AT ALL
    // 2) last loop iteration removes tail
    this._appendTail(tail);

    return appendCount;
  }

  _unmask () {
    return this.value;
  }

  clear (from=0, to=this.value.length) {
    this._value = this.value.slice(0, from) + this.value.slice(to);
  }

  splice (start, deleteCount, inserted, removeDirection) {
    var tailPos = start + deleteCount;
    var tail = this._extractTail(tailPos);

    start = this.nearestInputPos(start, removeDirection);
    this.clear(start);
    return this.appendWithTail(inserted, tail);
  }
}
