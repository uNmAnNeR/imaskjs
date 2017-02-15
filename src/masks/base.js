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
  }

  bindEvents () {
    this.el.addEventListener('keydown', this.saveState.bind(this));
    this.el.addEventListener('input', this.processInput.bind(this));
    this.el.addEventListener('drop', this._onDrop.bind(this));
  }

  saveState (ev) {
    this._oldValue = this.el.value;
    this._oldSelection = {
      start: this.el.selectionStart,
      end: this.el.selectionEnd
    }
  }

  processInput (ev) {
     var inputValue = this.el.value;
    // use selectionEnd for handle Undo
    var cursorPos = this.el.selectionEnd;

    // var res = inputValue
    //   .split('')
    //   .map((ch, ...args) => {
    //     var res = this.charResolver.resolve(ch, ...args);
    //     return conform(res, ch);
    //   })
    //   .join('');

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
      this.el.value = res;
      cursorPos = details.cursorPos;
    }
    this.el.selectionStart = this.el.selectionEnd = cursorPos;

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
    return this.el.value;
  }

  set unmaskedValue (value) {
    this.startRefresh();
    this.el.value = value;
    this.endRefresh();
  }

  refresh () {
    if (this._refreshingCount) return;
    var str = this.el.value;
    var details = {
      cursorPos: this.el.value.length,
      startChangePos: 0,
      oldSelection: {
        start: 0,
        end: this.el.value.length
      },
      removedCount: this.el.value.length,
      insertedCount: str.length,
      oldValue: this.el.value
    };
    this.el.value = conform(this.resolve(str, details), this.el.value);
  }

  startRefresh () {
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
