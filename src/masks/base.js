import {conform} from '../utils';

// TODO
// - empty placeholder
// - validateOnly
// - add comments


export default
class BaseMask {
  constructor (el, opts) {
    this.el = el;
    this.mask = opts.mask;

    this._listeners = {};
    this._refreshingCount = 0;

    this.saveState = this.saveState.bind(this);
    this.processInput = this.processInput.bind(this);
    this._onDrop = this._onDrop.bind(this);
  }

  bindEvents () {
    this.el.addEventListener('keydown', this.saveState);
    this.el.addEventListener('input', this.processInput);
    this.el.addEventListener('drop', this._onDrop);
  }

  unbindEvents () {
    this.el.removeEventListener('keydown', this.saveState);
    this.el.removeEventListener('input', this.processInput);
    this.el.removeEventListener('drop', this._onDrop);
  }

  destroy () {
    this.unbindEvents();
    this._listeners.length = 0;
  }

  get selectionStart () {
    return this.el.selectionStart;
  }

  get cursorPos () {
    return this.el.selectionEnd;
  }

  set cursorPos (pos) {
    this.el.setSelectionRange(pos, pos);
  }

  saveState (ev) {
    this._oldValue = this.rawValue;
    this._oldSelection = {
      start: this.selectionStart,
      end: this.cursorPos
    }
  }

  processInput (ev) {
     var inputValue = this.rawValue;

    // use selectionEnd for handle Undo
    var cursorPos = this.cursorPos;
    var details = {
      oldSelection: this._oldSelection,
      cursorPos: cursorPos,
      oldValue: this._oldValue
    };

    var res = inputValue;
    res = conform(this.resolve(res, details),
      res,
      this._oldValue);

    if (res !== inputValue) {
      ++this._refreshingCount;
      this.rawValue = res;
      --this._refreshingCount;
      cursorPos = details.cursorPos;

      this.cursorPos = cursorPos;
      // also queue change cursor for some browsers
      setTimeout(() => this.cursorPos = cursorPos, 0);
    }

    if (res !== this._oldValue) this.fireEvent("accept");
    return res;
  }

  on (ev, handler) {
    if (!this._listeners[ev]) this._listeners[ev] = [];
    this._listeners[ev].push(handler);
    return this;
  }

  off (ev, handler) {
    if (!this._listeners[ev]) return;
    if (!handler) {
      delete this._listeners[ev];
      return;
    }
    var hIndex = this._listeners[ev].indexOf(handler);
    if (hIndex >= 0) this._listeners.splice(hIndex, 1);
    return this;
  }

  fireEvent (ev) {
    var listeners = this._listeners[ev] || [];
    listeners.forEach(l => l());
  }

  // override this
  resolve (str, details) { return str; }

  get rawValue () {
    return this.el.value;
  }

  set rawValue (str) {
    this.startRefresh();
    this.el.value = str;
    this.endRefresh();
  }

  get unmaskedValue () {
    return this.rawValue;
  }

  set unmaskedValue (value) {
    this.rawValue = value;
  }

  refresh () {
    if (this._refreshingCount) return;
    ++this._refreshingCount;

    var str = this.rawValue;
    // use unmasked value if value was not changed to update with options correctly
    if (this._oldRawValue === str) str = this._oldUnmaskedValue;
    delete this._oldRawValue;
    delete this._oldUnmaskedValue;

    var details = {
      cursorPos: str.length,
      startChangePos: 0,
      oldSelection: {
        start: 0,
        end: str.length
      },
      removedCount: str.length,
      insertedCount: str.length,
      oldValue: str
    };
    this.rawValue = conform(this.resolve(str, details), str);

    --this._refreshingCount;
  }

  startRefresh () {
    // store unmasked value to apply after changes
    if (!this._refreshingCount) {
      this._oldUnmaskedValue = this.unmaskedValue;
      this._oldRawValue = this.rawValue;
    }
    ++this._refreshingCount;
  }

  endRefresh () {
    --this._refreshingCount;
    if (!this._refreshingCount) this.refresh();
  }

  _onDrop (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
}
