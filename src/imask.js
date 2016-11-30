import {conform, isString} from './utils';

import MaskResolver from './resolvers/mask-resolver';
import FuncResolver from './resolvers/func-resolver';
import RegExpResolver from './resolvers/regexp-resolver';
import PatternResolver from './resolvers/pattern-resolver';

// TODO
// - empty placeholder (+ as option)
// - escape defs
// - !progressive
// - validateOnly
// - get/set unmasked
// - add comments


// TODO opts = {
//   placeholder: '_',
//   definitions: {},
//   progressive: true,
//   validateOnly: false
// }


export default
class IMask {
  constructor (el, opts={}) {
    var inputValue = el.value;

    this.el = el;
    this.resolver = IMask.ResolverFactory(opts.mask);
    this.charResolver = IMask.ResolverFactory(opts.charMask);

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

    var startChangePos = Math.min(cursorPos, this._oldSelection.start);
    // var maxCursorPos = Math.max(cursorPos, this._oldSelection.end);
    var details = {
      startChangePos: startChangePos,
      oldSelection: this._oldSelection,
      cursorPos: cursorPos,
      // Math.max for opposite operation
      removedCount: Math.max((this._oldSelection.end - startChangePos) ||
        // for Delete
        this._oldValue.length - inputValue.length, 0),
      insertedCount: cursorPos - startChangePos,
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
      if (details.cursorPos != null) cursorPos = details.cursorPos;
      this.el.selectionStart = this.el.selectionEnd = cursorPos;
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
    const resUnmasked = this.resolver.unmaskedValue;
    return resUnmasked != null ? resUnmasked : this.el.value;
  }

  set unmaskedValue (value) {
    this.resolver.unmaskedValue = value;
  }

  static ResolverFactory (mask) {
    if (mask instanceof RegExp) return new RegExpResolver(mask);
    if (mask instanceof Function) return new FuncResolver(mask);
    if (isString(mask)) return new PatternResolver(mask);
    return new MaskResolver(mask);
  }
}
IMask.MaskResolver = MaskResolver;
IMask.FuncResolver = FuncResolver;
IMask.RegExpResolver = RegExpResolver;
IMask.PatternResolver = PatternResolver;
window.IMask = IMask;
