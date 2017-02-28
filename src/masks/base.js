import {conform} from '../utils';


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

  _changeState (details) {
    details = {
      cursorPos: this.cursorPos,
      oldSelection: this._oldSelection,
      oldValue: this._oldValue,
      ...details
    };

    var inputValue = this.rawValue;
    var res = inputValue;
    res = conform(this.resolve(res, details),
      res,
      this._oldValue);

    if (res !== inputValue) {
      this.el.value = res;
      this.cursorPos = details.cursorPos;
      // also queue change cursor for some browsers
      setTimeout(() => this.cursorPos = details.cursorPos, 0);
    }

    this._onChangeState();

    return res;
  }

  _onChangeState () {
    this._fireChangeEvents();
    this.saveState();
  }

  _fireChangeEvents () {
    if (this.rawValue !== this._oldValue) this.fireEvent("accept");
  }

  processInput (ev) {
    if (this.rawValue === this._oldValue) return;
    this._changeState();
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
    this.el.value = str;
    this._changeState({
      cursorPos: str.length,
      oldSelection: {
        start: 0,
        end: str.length
      },
      oldValue: str
    });
  }

  get unmaskedValue () {
    return this.rawValue;
  }

  set unmaskedValue (value) {
    this.rawValue = value;
  }

  _onDrop (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
}
