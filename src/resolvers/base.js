export
class State {
  constructor (value='') {
    this.value = value;
  }

  slice (from=0, to=this.value.length) {
    return new State(this.value.slice(from, to));
  }
}


export default
class BaseResolver {
  constructor () {
    this.state = new State();
  }

  get state () {
    return this._state;
  }

  set state (state) {
    this._state = state;
  }

  nearestInputPos (cursorPos, direction) {
    return cursorPos;
  }

  get rawValue () {
    return this.state.value;
  }

  set rawValue (rawValue) {
    // TODO
    this.state.value = rawValue;
  }

  extractInput (fromPos=0, toPos=this.state.value.length) {
    return this.state.value.slice(fromPos, toPos);
  }

  _extractTail (fromPos=0, toPos=this.state.value.length) {
    return this.extractInput(fromPos, toPos);
  }

  _appendTail (tail) {
    return this.append(tail);
  }

  append (str, skipUnresolvedInput=true) {
    // TODO
  }

  appendWithTail (str, tail) {
    var consistentState = this.state.slice();

    for (var ci=0; ci<str.length; ++ci) {
      var ch = str[ci];
      if (this.append(ch, false) === false || this._appendTail(tail) === false) {
        this.state = consistentState;
        return false;
      }

      consistentState = this.state.slice();
    }

    return true;
  }

  splice (start, deleteCount, inserted, removeDirection) {
    var tailPos = start + deleteCount;
    var tail = this._extractTail(tailPos);

    start = this.nearestInputPos(start, removeDirection);
    this.state = this.state.slice(0, start);
    this.appendWithTail(inserted, tail);
  }

  resolve (str, details) {
    // var startChangePos = details.startChangePos;
    // var inserted = details.inserted;
    // var deleteCount = details.removed.length;
    // var tailPos = startChangePos + deleteCount;

    // if remove at left - adjust start change pos to trim holes and fixed at the end
    // var startInputPos = this.nearestInputPos(startChangePos, details.removeDirection);
    // TODO. SOURCE WAS:
    // var startInputPos = details.removeDirection === DIRECTION.LEFT ?
    //   this.nearestInputPos(startChangePos) :
    //   startChangePos;

    // var tail = this._extractTail(tailPos);

    // this.state = this.state.slice(0, startInputPos);

    // var insertStates = this._generateInsertStates(inserted);
    // for (var istep=insertStates.length-1; istep >= 0; --istep) {
    //   this.state = insertStates[istep];
    //   // TODO overflow?
    //   var stateInserted = this._appendTail(tail);
    //   if (stateInserted) {
    //     this.state = stateInserted;
    //     break;
    //   }
    // }

    // this.appendWithTail(inserted, tail);
    this.splice(
      details.startChangePos,
      details.removed.length,
      details.inserted,
      details.removeDirection);

    details.cursorPos = this._nearestInputPos(this.state.value.length, details.removeDirection);

    return this.state.value;
  }
}
