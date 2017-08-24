import BaseMask from './base';
import PatternResolver from '../resolvers/pattern';


export default
class PatternMask extends BaseMask {
  // constructor (el, opts) {
    // super(el, opts);

    // var {placeholder, definitions} = opts;

    // this.resolver = new PatternResolver({
    //   placeholder,
    //   definitions
    // });

    // this._alignCursor = this._alignCursor.bind(this);
    // this._alignCursorFriendly = this._alignCursorFriendly.bind(this);
  // }

  // _alignCursorFriendly () {
  //   if (this.selectionStart !== this.cursorPos) return;
  //   this._alignCursor();
  // }

  // bindEvents () {
  //   super.bindEvents();
  //   this.el.addEventListener('click', this._alignCursorFriendly);
  // }

  // unbindEvents () {
  //   super.unbindEvents();
  //   this.el.removeEventListener('click', this._alignCursorFriendly);
  // }

  // _fireChangeEvents () {
  //   // fire 'complete' after 'accept' event
  //   super._fireChangeEvents();
  //   if (this.isComplete) this.fireEvent("complete");
  // }

  // get isComplete () {
  //   return this.resolver.isComplete;
  // }

  get unmaskedValue () {
    return this._unmaskedValue;
  }

  set unmaskedValue (str) {
    // TODO
    this._hollows.length = 0;
    var res;
    [res, this._hollows] = this._appendTail('', str);
    this.updateElement(this._appendPlaceholderEnd(res));

    this._alignCursor();
  }

  get placeholder () { return this.resolver.placeholder; }
  set placeholder (ph) { this.resolver.placeholder = ph; }


  get definitions () { return this.resolver.definitions; }
  set definitions (defs) { this.resolver.definitions = defs; }

  get mask () { return this.resolver.mask; }
  set mask (mask) {this.resolver.mask = mask;}
}
