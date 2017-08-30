import ActionDetails from '../core/action-details';
import createMask from '../masked/factory';


export default
class InputMask {
  constructor (el, opts) {
    this.el = el;
    this.masked = createMask(opts);

    this._listeners = {};
    this._value = '';
    this._unmaskedValue = '';

    this.saveSelection = this.saveSelection.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onDrop = this._onDrop.bind(this);
    this._alignCursor = this._alignCursor.bind(this);
    this._alignCursorFriendly = this._alignCursorFriendly.bind(this);
  }

  update (opts) {
    const unmasked = this.masked ? this.masked.unmaskedValue : null;

    const mask = opts.mask;
    if (mask) this.mask = mask;

    for (const k in opts) {
      if (k === 'mask') continue;
      this.masked[k] = opts[k];
    }

    if (unmasked != null) this.masked.unmaskedValue = unmasked;
    this.updateControl();
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
    const hIndex = this._listeners[ev].indexOf(handler);
    if (hIndex >= 0) this._listeners.splice(hIndex, 1);
    return this;
  }

  get mask () { return this.masked.mask; }
  set mask (mask) {
    if (typeof mask === typeof this.masked.mask) this.masked.mask = mask;
    this.masked = createMask(this.masked);
  }

  get value () {
    return this._value;
  }

  set value (str) {
    this.masked.value = str;
    this.updateControl();
    this._alignCursor();
  }

  bindEvents () {
    this.el.addEventListener('keydown', this.saveSelection);
    this.el.addEventListener('input', this._onInput);
    this.el.addEventListener('drop', this._onDrop);
    this.el.addEventListener('click', this._alignCursorFriendly);
    this.el.addEventListener('change', this._onChange);
  }

  unbindEvents () {
    this.el.removeEventListener('keydown', this.saveSelection);
    this.el.removeEventListener('input', this._onInput);
    this.el.removeEventListener('drop', this._onDrop);
    this.el.removeEventListener('click', this._alignCursorFriendly);
    this.el.removeEventListener('change', this._onChange);
  }

  fireEvent (ev) {
    const listeners = this._listeners[ev] || [];
    listeners.forEach(l => l());
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

  saveSelection (/* ev */) {
    if (this.value !== this.el.value) {
      console.warn('Uncontrolled input change, refresh mask manually!'); // eslint-disable-line no-console
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
    this.updateControl();
    this._alignCursor();
  }

  updateControl () {
    const newUnmaskedValue = this.masked.unmaskedValue;
    const newValue = this.masked.value;
    const isChanged = (this.unmaskedValue !== newUnmaskedValue ||
      this.value !== newValue);

    this._unmaskedValue = newUnmaskedValue;
    this._value = newValue;

    if (this.el.value !== newValue) this.el.value = newValue;
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

  _abortUpdateCursor () {
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

  _onInput () {
    this._abortUpdateCursor();

    const details = new ActionDetails(
      // new state
      this.el.value, this.cursorPos,
      // old state
      this.value, this._selection);

    const insertedCount = this.masked.splice(
      details.startChangePos,
      details.removed.length,
      details.inserted,
      details.removeDirection);

    const cursorPos = this.masked.nearestInputPos(
      details.startChangePos + insertedCount,
      // if none was removed - align to right
      details.removeDirection);

    this.updateControl();
    this.updateCursor(cursorPos);
  }

  _onChange () {
    if (this.value !== this.el.value) this.value = this.el.value;
  }

  _onDrop (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
}
