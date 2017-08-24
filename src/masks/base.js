import {extendDetailsAdjustments} from '../utils';
import createMask from '../core/factory';


export default
class BaseMask {
  constructor (el, opts) {
    this.el = el;
    this.masked = createMask(opts);
    this.mask = opts.mask;

    this._listeners = {};
    this._rawValue = '';
    this._unmaskedValue = '';

    this.saveSelection = this.saveSelection.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onDrop = this._onDrop.bind(this);
    this._alignCursor = this._alignCursor.bind(this);
    this._alignCursorFriendly = this._alignCursorFriendly.bind(this);
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

  get mask () { return this.masked.mask; }
  set mask (mask) {
    // TODO check
    this.masked.mask = mask;
    this.masked = createMask(this.masked);
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

  bindEvents () {
    this.el.addEventListener('keydown', this.saveSelection);
    this.el.addEventListener('input', this._onInput);
    this.el.addEventListener('drop', this._onDrop);
    this.el.addEventListener('click', this._alignCursorFriendly);
  }

  unbindEvents () {
    this.el.removeEventListener('keydown', this.saveSelection);
    this.el.removeEventListener('input', this._onInput);
    this.el.removeEventListener('drop', this._onDrop);
    this.el.removeEventListener('click', this._alignCursorFriendly);
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

    this.resolve(inputValue, details);

    this.updateValue();
    this.updateCursor(details.cursorPos)
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
      console.warn('Uncontrolled input change, refresh mask manually!');
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

  get unmaskedValue () {
    return this._unmaskedValue;
  }

  set unmaskedValue (str) {
    this.masked.unmaskedValue = str;
    this.updateValue();
    this._alignCursor();
  }

  updateValue () {
    var newUnmaskedValue = this.masked.unmaskedValue;
    var newRawValue = this.masked.value;
    var isChanged = (this.unmaskedValue !== newUnmaskedValue ||
      this.rawValue !== newRawValue);

    this._unmaskedValue = newUnmaskedValue;
    this._rawValue = newRawValue;

    if (this.el.value !== newRawValue) this.el.value = newRawValue;
    if (isChanged) this._fireChangeEvents();
  }

  _fireChangeEvents () {
    this.fireEvent('accept');
    if (this.masked.isComplete) this.fireEvent('complete');
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
      this.cursorPos = this._changingCursorPos;
      this._abortUpdateCursor();
    }, 10);
  }

  _abortUpdateCursor() {
    if (this._cursorChanging) {
      clearTimeout(this._cursorChanging);
      delete this._cursorChanging;
    }
  }

  _alignCursor () {
    this.cursorPos = this.masked.nearestInputPos(this.cursorPos);
  }

  _alignCursorFriendly () {
    if (this.selectionStart !== this.cursorPos) return;
    this._alignCursor();
  }

  _onInput (ev) {
    this._abortUpdateCursor();
    this.processInput(this.el.value);
  }

  _onDrop (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  resolve (str, details) {
    var insertedCount = this.masked.splice(
      details.startChangePos,
      details.removed.length,
      details.inserted,
      details.removeDirection);

    details.cursorPos = this.masked.nearestInputPos(details.startChangePos + insertedCount, details.removeDirection);
  }
}
