import {conform, extendDetailsAdjustments} from '../utils';


export default
class BaseMask {
  constructor (el, opts) {
    this.el = el;
    this.mask = opts.mask;

    this._listeners = {};
    this._refreshingCount = 0;
    this._rawValue = "";
    this._unmaskedValue = "";

    this.saveSelection = this.saveSelection.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onDrop = this._onDrop.bind(this);
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

  get rawValue () {
    return this._rawValue;
  }

  set rawValue (str) {
    this.processInput(str, {
      cursorPos: str.length,
      oldValue: this.rawValue,
      oldSelection: {
        start: 0,
        end: this.rawValue.length
      }
    });
  }

  get unmaskedValue () {
    return this._unmaskedValue;
  }

  set unmaskedValue (value) {
    this.rawValue = value;
  }


  bindEvents () {
    this.el.addEventListener('keydown', this.saveSelection);
    this.el.addEventListener('input', this._onInput);
    this.el.addEventListener('drop', this._onDrop);
  }

  unbindEvents () {
    this.el.removeEventListener('keydown', this.saveSelection);
    this.el.removeEventListener('input', this._onInput);
    this.el.removeEventListener('drop', this._onDrop);
  }

  fireEvent (ev) {
    var listeners = this._listeners[ev] || [];
    listeners.forEach(l => l());
  }

  processInput (inputValue, details) {
    details = {
      cursorPos: this.cursorPos,
      oldSelection: this._selection,
      oldValue: this.rawValue,
      oldUnmaskedValue: this.unmaskedValue,
      ...details
    };

    details = extendDetailsAdjustments(inputValue, details);

    var res = conform(this.resolve(inputValue, details),
      inputValue,
      this.rawValue);

    this.updateElement(res, details.cursorPos);
    return res;
  }


  get selectionStart () {
    return this._cursorChanging ?
      this._changingCursorPos :

      this.el.selectionStart;
  }

  get cursorPos () {
    return this._cursorChanging ?
      this._changingCursorPos :

      this.el.selectionEnd;
  }

  set cursorPos (pos) {
    if (this.el !== document.activeElement) return;

    this.el.setSelectionRange(pos, pos);
    this.saveSelection();
  }

  saveSelection (ev) {
    if (this.rawValue !== this.el.value) {
      console.warn("Uncontrolled input change, refresh mask manually!");
    }
    this._selection = {
      start: this.selectionStart,
      end: this.cursorPos
    };
  }

  destroy () {
    this.unbindEvents();
    this._listeners.length = 0;
  }

  updateElement (value, cursorPos) {
    var unmaskedValue = this._calcUnmasked(value);
    var isChanged = (this.unmaskedValue !== unmaskedValue ||
      this.rawValue !== value);

    this._unmaskedValue = unmaskedValue;
    this._rawValue = value;

    if (this.el.value !== value) this.el.value = value;
    this.updateCursor(cursorPos);

    if (isChanged) this._fireChangeEvents();
  }

  _fireChangeEvents () {
    this.fireEvent("accept");
  }

  updateCursor (cursorPos) {
    if (cursorPos == null) return;
    this.cursorPos = cursorPos;

    // also queue change cursor for mobile browsers
    this._delayUpdateCursor(cursorPos);
  }

  _delayUpdateCursor (cursorPos) {
    this._abortUpdateCursor();
    this._changingCursorPos = cursorPos;
    this._cursorChanging = setTimeout(() => {
      this._abortUpdateCursor();
      this.cursorPos = this._changingCursorPos;
    }, 10);
  }

  _abortUpdateCursor() {
    if (this._cursorChanging) {
      clearTimeout(this._cursorChanging);
      delete this._cursorChanging;
    }
  }

  _onInput (ev) {
    this._abortUpdateCursor();
    this.processInput(this.el.value);
  }

  _onDrop (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  // override
  resolve (str, details) { return str; }

  _calcUnmasked (value) { return value; }
}
