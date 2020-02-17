// @flow
import {objectIncludes, DIRECTION, type Selection} from '../core/utils.js';
import ActionDetails from '../core/action-details.js';
import MaskedDate from '../masked/date.js';
import createMask, {maskedClass} from '../masked/factory.js';
import type Masked from '../masked/base.js';
import {type Mask} from '../masked/base.js';
import MaskElement from './mask-element.js';
import HTMLMaskElement from './html-mask-element.js';
import HTMLContenteditableMaskElement from './html-contenteditable-mask-element.js';
import IMask from '../core/holder.js';


/** Listens to element events and controls changes between element and {@link Masked} */
export default
class InputMask {
  /**
    View element
    @readonly
  */
  el: MaskElement;

  /**
    Internal {@link Masked} model
    @readonly
  */
  masked: Masked<*>;
  alignCursor: () => void;
  alignCursorFriendly: () => void;

  _listeners: {[string]: Array<Function>};
  _value: string;
  _changingCursorPos: number;
  _unmaskedValue: string;
  _saveSelection: (?Event) => void;
  _selection: Selection;
  _onInput: () => void;
  _onChange: () => void;
  _onDrop: (Event) => void;
  _onFocus: (Event) => void;
  _onClick: (Event) => void;
  _cursorChanging: ?TimeoutID;

  /**
    @param {MaskElement|HTMLInputElement|HTMLTextAreaElement} el
    @param {Object} opts
  */
  constructor (el: MaskElement | HTMLTextAreaElement | HTMLInputElement, opts: {[string]: any}) {
    this.el =
      (el instanceof MaskElement) ? el :
      (el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') ? new HTMLContenteditableMaskElement(el) :
      new HTMLMaskElement(el);
    this.masked = createMask(opts);

    this._listeners = {};
    this._value = '';
    this._unmaskedValue = '';

    this._saveSelection = this._saveSelection.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onDrop = this._onDrop.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onClick = this._onClick.bind(this);
    this.alignCursor = this.alignCursor.bind(this);
    this.alignCursorFriendly = this.alignCursorFriendly.bind(this);

    this._bindEvents();

    // refresh
    this.updateValue();
    this._onChange();
  }

  /** Read or update mask */
  get mask (): Mask {
    return this.masked.mask;
  }

  maskEquals (mask: Mask) {
    return mask == null ||
      mask === this.masked.mask ||
      mask === Date && this.masked instanceof MaskedDate;
  }

  set mask (mask: Mask) {
    if (this.maskEquals(mask)) return;

    if (this.masked.constructor === maskedClass(mask)) {
      this.masked.updateOptions({mask});
      return;
    }

    const masked = createMask({mask});
    masked.unmaskedValue = this.masked.unmaskedValue;
    this.masked = masked;
  }

  /** Raw value */
  get value (): string {
    return this._value;
  }

  set value (str: string) {
    this.masked.value = str;
    this.updateControl();
    this.alignCursor();
  }

  /** Unmasked value */
  get unmaskedValue (): string {
    return this._unmaskedValue;
  }

  set unmaskedValue (str: string) {
    this.masked.unmaskedValue = str;
    this.updateControl();
    this.alignCursor();
  }

  /** Typed unmasked value */
  get typedValue (): any {
    return this.masked.typedValue;
  }

  set typedValue (val: any) {
    this.masked.typedValue = val;
    this.updateControl();
    this.alignCursor();
  }

  /**
    Starts listening to element events
    @protected
  */
  _bindEvents () {
    this.el.bindEvents({
      selectionChange: this._saveSelection,
      input: this._onInput,
      drop: this._onDrop,
      click: this._onClick,
      focus: this._onFocus,
      commit: this._onChange,
    });
  }

  /**
    Stops listening to element events
    @protected
   */
  _unbindEvents () {
    if (this.el) this.el.unbindEvents();
  }

  /**
    Fires custom event
    @protected
   */
  _fireEvent (ev: string) {
    const listeners = this._listeners[ev];
    if (!listeners) return;

    listeners.forEach(l => l());
  }

  /**
    Current selection start
    @readonly
  */
  get selectionStart (): number {
    return this._cursorChanging ?
      this._changingCursorPos :

      this.el.selectionStart;
  }

  /** Current cursor position */
  get cursorPos (): number {
    return this._cursorChanging ?
      this._changingCursorPos :

      this.el.selectionEnd;
  }
  set cursorPos (pos: number) {
    if (!this.el.isActive) return;

    this.el.select(pos, pos);
    this._saveSelection();
  }

  /**
    Stores current selection
    @protected
  */
  _saveSelection (/* ev */) {
    if (this.value !== this.el.value) {
      console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'); // eslint-disable-line no-console
    }
    this._selection = {
      start: this.selectionStart,
      end: this.cursorPos
    };
  }

  /** Syncronizes model value from view */
  updateValue () {
    this.masked.value = this.el.value;
    this._value = this.masked.value;
  }

  /** Syncronizes view from model value, fires change events */
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

  /** Updates options with deep equal check, recreates @{link Masked} model if mask type changes */
  updateOptions (opts: {[string]: any}) {
    const { mask, ...restOpts } = opts;

    const updateMask = !this.maskEquals(mask);
    const updateOpts = !objectIncludes(this.masked, restOpts);

    if (updateMask) this.mask = mask;
    if (updateOpts) this.masked.updateOptions(restOpts);

    if (updateMask || updateOpts) this.updateControl();
  }

  /** Updates cursor */
  updateCursor (cursorPos: number) {
    if (cursorPos == null) return;
    this.cursorPos = cursorPos;

    // also queue change cursor for mobile browsers
    this._delayUpdateCursor(cursorPos);
  }

  /**
    Delays cursor update to support mobile browsers
    @private
  */
  _delayUpdateCursor (cursorPos: number) {
    this._abortUpdateCursor();
    this._changingCursorPos = cursorPos;
    this._cursorChanging = setTimeout(() => {
      if (!this.el) return; // if was destroyed
      this.cursorPos = this._changingCursorPos;
      this._abortUpdateCursor();
    }, 10);
  }

  /**
    Fires custom events
    @protected
  */
  _fireChangeEvents () {
    this._fireEvent('accept');
    if (this.masked.isComplete) this._fireEvent('complete');
  }

  /**
    Aborts delayed cursor update
    @private
  */
  _abortUpdateCursor () {
    if (this._cursorChanging) {
      clearTimeout(this._cursorChanging);
      delete this._cursorChanging;
    }
  }

  /** Aligns cursor to nearest available position */
  alignCursor () {
    this.cursorPos = this.masked.nearestInputPos(this.cursorPos, DIRECTION.LEFT);
  }

  /** Aligns cursor only if selection is empty */
  alignCursorFriendly () {
    if (this.selectionStart !== this.cursorPos) return;  // skip if range is selected
    this.alignCursor();
  }

  /** Adds listener on custom event */
  on (ev: string, handler: Function) {
    if (!this._listeners[ev]) this._listeners[ev] = [];
    this._listeners[ev].push(handler);
    return this;
  }

  /** Removes custom event listener */
  off (ev: string, handler: Function) {
    if (!this._listeners[ev]) return this;
    if (!handler) {
      delete this._listeners[ev];
      return this;
    }
    const hIndex = this._listeners[ev].indexOf(handler);
    if (hIndex >= 0) this._listeners[ev].splice(hIndex, 1);
    return this;
  }

  /** Handles view input event */
  _onInput () {
    this._abortUpdateCursor();

    // fix strange IE behavior
    if (!this._selection) return this.updateValue();

    const details = new ActionDetails(
      // new state
      this.el.value, this.cursorPos,
      // old state
      this.value, this._selection);

    const oldRawValue = this.masked.rawInputValue;

    const offset = this.masked.splice(
      details.startChangePos,
      details.removed.length,
      details.inserted,
      details.removeDirection).offset;

    // force align in remove direction only if no input chars were removed
    // otherwise we still need to align with NONE (to get out from fixed symbols for instance)
    const removeDirection = oldRawValue === this.masked.rawInputValue ?
      details.removeDirection :
      DIRECTION.NONE;

    const cursorPos = this.masked.nearestInputPos(
      details.startChangePos + offset,
      removeDirection,
    );

    this.updateControl();
    this.updateCursor(cursorPos);
  }

  /** Handles view change event and commits model value */
  _onChange () {
    if (this.value !== this.el.value) {
      this.updateValue();
    }
    this.masked.doCommit();
    this.updateControl();
    this._saveSelection();
  }

  /** Handles view drop event, prevents by default */
  _onDrop (ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  /** Restore last selection on focus */
  _onFocus (ev: Event) {
    this.alignCursorFriendly();
  }

  /** Restore last selection on focus */
  _onClick (ev: Event) {
    this.alignCursorFriendly();
  }

  /** Unbind view events and removes element reference */
  destroy () {
    this._unbindEvents();
    // $FlowFixMe why not do so?
    this._listeners.length = 0;
    // $FlowFixMe
    delete this.el;
  }
}


IMask.InputMask = InputMask;
