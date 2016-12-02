import {conform, isString} from './utils';

import MaskResolver from './resolvers/mask-resolver';
import FuncResolver from './resolvers/func-resolver';
import RegExpResolver from './resolvers/regexp-resolver';
import PatternResolver from './resolvers/pattern-resolver';

// TODO
// - empty placeholder
// - !progressive
// - validateOnly
// - add comments


export default
class IMask {
  constructor (el, opts={}) {
    this.el = el;
    this.resolver = IMask.ResolverFactory(opts.mask, opts);
    this.charResolver = IMask.ResolverFactory(opts.charMask, opts);

    this._listeners = {};

    el.addEventListener('keydown', this._saveCursor.bind(this));
    el.addEventListener('input', this._processInput.bind(this));
    el.addEventListener('drop', this._onDrop.bind(this));
    this._saveCursor();
    this._processInput();

    // refresh
    this.rawValue = this.el.value;
  }

  _onDrop (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  _saveCursor (ev) {
    this._oldValue = this.el.value;
    this._oldSelection = {
      start: this.el.selectionStart,
      end: this.el.selectionEnd
    }
  }

  _processInput (ev) {
    this._conform();
  }

  on (ev, handler) {
    if (!this._listeners[ev]) this._listeners[ev] = [];
    this._listeners[ev].push(handler);
  }

  off (ev, handler) {
    if (!this._listeners[ev]) return;
    if (!handler) {
      delete this._listeners[ev];
      return;
    }
    var hIndex = this._listeners[ev].indexOf(handler);
    if (hIndex >= 0) this._listeners.splice(hIndex, 1);
  }

  _conform () {
    var inputValue = this.el.value;
    // use selectionEnd for handle Undo
    var cursorPos = this.el.selectionEnd;

    let res = inputValue
      .split('')
      .map((ch, ...args) => {
        var res = this.charResolver.resolve(ch, ...args);
        return conform(res, ch);
      })
      .join('');

    // var maxCursorPos = Math.max(cursorPos, this._oldSelection.end);
    var details = {
      oldSelection: this._oldSelection,
      cursorPos: cursorPos,
      oldValue: this._oldValue
    };

    res = conform(this.resolver.resolve(res, details),
      res,
      this._oldValue);
    if (res !== inputValue) {
      // var cursorPos = this.el.selectionStart;
      // var afterCursorCount = inputValue.length - cursorPos;
      // var cursorPos = res.length - afterCursorCount;
      this.el.value = res;
      this.el.selectionStart = this.el.selectionEnd = details.cursorPos;
    }

    if (res !== this._oldValue) {
      var listeners = this._listeners.accept || [];
      listeners.forEach(l => l());
    }
  }

  get rawValue () {
    return this.el.value;
  }

  set rawValue (str) {
    var details = {
      startChangePos: 0,
      oldSelection: {
        start: 0,
        end: this.el.value.length
      },
      removedCount: this.el.value.length,
      insertedCount: str.length,
      oldValue: this.el.value
    };
    this.el.value = conform(this.resolver.resolve(str, details), this.el.value);
  }

  get unmaskedValue () {
    return this.resolver.extractUnmasked(this.el.value);
  }

  set unmaskedValue (value) {
    this.el.value = this.resolver.resolveUnmasked(value);
  }

  static ResolverFactory (mask, opts) {
    if (mask instanceof MaskResolver) return mask;
    if (mask instanceof RegExp) return new RegExpResolver(mask, opts);
    if (mask instanceof Function) return new FuncResolver(mask, opts);
    if (isString(mask)) return new PatternResolver(mask, opts);
    return new MaskResolver(mask, opts);
  }
}
IMask.MaskResolver = MaskResolver;
IMask.FuncResolver = FuncResolver;
IMask.RegExpResolver = RegExpResolver;
IMask.PatternResolver = PatternResolver;
window.IMask = IMask;
