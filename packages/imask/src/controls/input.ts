import { DIRECTION, type Selection } from '../core/utils';
import ActionDetails from '../core/action-details';
import createMask, { type UpdateOpts, maskedClass, type FactoryArg, type FactoryReturnMasked } from '../masked/factory';
import Masked from '../masked/base';
import MaskElement from './mask-element';
import HTMLInputMaskElement, { type InputElement } from './html-input-mask-element';
import HTMLContenteditableMaskElement from './html-contenteditable-mask-element';
import IMask from '../core/holder';


export
type InputMaskElement = MaskElement | InputElement | HTMLElement;

export
type InputMaskEventListener = (e?: InputEvent) => void;

/** Listens to element events and controls changes between element and {@link Masked} */
export default
class InputMask<Opts extends FactoryArg = FactoryArg> {
  /**
    View element
  */
  declare el: MaskElement;

  /** Internal {@link Masked} model */
  declare masked: FactoryReturnMasked<Opts>;

  declare _listeners: Record<string, Array<InputMaskEventListener>>;
  declare _value: string;
  declare _changingCursorPos: number;
  declare _unmaskedValue: string;
  declare _selection: Selection;
  declare _cursorChanging?: ReturnType<typeof setTimeout>;
  declare _inputEvent?: InputEvent;

  constructor (el: InputMaskElement, opts: Opts) {
    this.el =
      (el instanceof MaskElement) ? el :
      (el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') ? new HTMLContenteditableMaskElement(el) :
      new HTMLInputMaskElement(el as InputElement);

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

  maskEquals (mask: any): boolean {
    return mask == null || this.masked?.maskEquals(mask);
  }

  /** Masked */
  get mask (): FactoryReturnMasked<Opts>['mask'] {
    return this.masked.mask;
  }
  set mask (mask: any) {
    if (this.maskEquals(mask)) return;

    if (!((mask as Masked) instanceof IMask.Masked) && this.masked.constructor === maskedClass(mask as Masked)) {
      // TODO "any" no idea
      this.masked.updateOptions({ mask } as any);
      return;
    }

    const masked = (mask instanceof IMask.Masked ? mask : createMask({ mask } as Opts)) as FactoryReturnMasked<Opts>;
    masked.unmaskedValue = this.masked.unmaskedValue;
    this.masked = masked;
  }

  /** Raw value */
  get value (): string {
    return this._value;
  }

  set value (str: string) {
    if (this.value === str) return;

    this.masked.value = str;
    this.updateControl();
    this.alignCursor();
  }

  /** Unmasked value */
  get unmaskedValue (): string {
    return this._unmaskedValue;
  }

  set unmaskedValue (str: string) {
    if (this.unmaskedValue === str) return;

    this.masked.unmaskedValue = str;
    this.updateControl();
    this.alignCursor();
  }

  /** Typed unmasked value */
  get typedValue (): FactoryReturnMasked<Opts>['typedValue'] {
    return this.masked.typedValue;
  }

  set typedValue (val: FactoryReturnMasked<Opts>['typedValue']) {
    if (this.masked.typedValueEquals(val)) return;

    this.masked.typedValue = val;
    this.updateControl();
    this.alignCursor();
  }

  /** Display value */
  get displayValue (): string {
    return this.masked.displayValue;
  }

  /** Starts listening to element events */
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

  /** Stops listening to element events */
  _unbindEvents () {
    if (this.el) this.el.unbindEvents();
  }

  /** Fires custom event */
  _fireEvent (ev: string, e?: InputEvent) {
    const listeners = this._listeners[ev];
    if (!listeners) return;

    listeners.forEach(l => l(e));
  }

  /** Current selection start */
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
    if (!this.el || !this.el.isActive) return;

    this.el.select(pos, pos);
    this._saveSelection();
  }

  /** Stores current selection */
  _saveSelection (/* ev */) {
    if (this.displayValue !== this.el.value) {
      console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'); // eslint-disable-line no-console
    }
    this._selection = {
      start: this.selectionStart,
      end: this.cursorPos,
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
    const newDisplayValue = this.displayValue;
    const isChanged = (this.unmaskedValue !== newUnmaskedValue ||
      this.value !== newValue);

    this._unmaskedValue = newUnmaskedValue;
    this._value = newValue;

    if (this.el.value !== newDisplayValue) this.el.value = newDisplayValue;
    if (isChanged) this._fireChangeEvents();
  }

  /** Updates options with deep equal check, recreates {@link Masked} model if mask type changes */
  updateOptions(opts: UpdateOpts<Opts>) {
    const { mask, ...restOpts } = opts;

    const updateMask = !this.maskEquals(mask);
    const updateOpts = this.masked.optionsIsChanged(restOpts);

    if (updateMask) this.mask = mask;
    if (updateOpts) this.masked.updateOptions(restOpts);  // TODO

    if (updateMask || updateOpts) this.updateControl();
  }

  /** Updates cursor */
  updateCursor (cursorPos: number) {
    if (cursorPos == null) return;
    this.cursorPos = cursorPos;

    // also queue change cursor for mobile browsers
    this._delayUpdateCursor(cursorPos);
  }

  /** Delays cursor update to support mobile browsers */
  _delayUpdateCursor (cursorPos: number) {
    this._abortUpdateCursor();
    this._changingCursorPos = cursorPos;
    this._cursorChanging = setTimeout(() => {
      if (!this.el) return; // if was destroyed
      this.cursorPos = this._changingCursorPos;
      this._abortUpdateCursor();
    }, 10);
  }

  /** Fires custom events */
  _fireChangeEvents () {
    this._fireEvent('accept', this._inputEvent);
    if (this.masked.isComplete) this._fireEvent('complete', this._inputEvent);
  }

  /** Aborts delayed cursor update */
  _abortUpdateCursor () {
    if (this._cursorChanging) {
      clearTimeout(this._cursorChanging);
      delete this._cursorChanging;
    }
  }

  /** Aligns cursor to nearest available position */
  alignCursor () {
    this.cursorPos = this.masked.nearestInputPos(this.masked.nearestInputPos(this.cursorPos, DIRECTION.LEFT));
  }

  /** Aligns cursor only if selection is empty */
  alignCursorFriendly () {
    if (this.selectionStart !== this.cursorPos) return;  // skip if range is selected
    this.alignCursor();
  }

  /** Adds listener on custom event */
  on (ev: string, handler: InputMaskEventListener): this {
    if (!this._listeners[ev]) this._listeners[ev] = [];
    this._listeners[ev].push(handler);
    return this;
  }

  /** Removes custom event listener */
  off (ev: string, handler: InputMaskEventListener): this {
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
  _onInput (e: InputEvent): void {
    this._inputEvent = e;
    this._abortUpdateCursor();

    const details = new ActionDetails({
      // new state
      value: this.el.value,
      cursorPos: this.cursorPos,

      // old state
      oldValue: this.displayValue,
      oldSelection: this._selection,
    });

    const oldRawValue = this.masked.rawInputValue;

    const offset = this.masked.splice(
      details.startChangePos,
      details.removed.length,
      details.inserted,
      details.removeDirection,
      { input: true, raw: true },
    ).offset;

    // force align in remove direction only if no input chars were removed
    // otherwise we still need to align with NONE (to get out from fixed symbols for instance)
    const removeDirection = oldRawValue === this.masked.rawInputValue ?
      details.removeDirection :
      DIRECTION.NONE;

    let cursorPos = this.masked.nearestInputPos(
      details.startChangePos + offset,
      removeDirection,
    );
    if (removeDirection !== DIRECTION.NONE) cursorPos = this.masked.nearestInputPos(cursorPos, DIRECTION.NONE);

    this.updateControl();
    this.updateCursor(cursorPos);
    delete this._inputEvent;
  }

  /** Handles view change event and commits model value */
  _onChange () {
    if (this.displayValue !== this.el.value) {
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
    (this._listeners as any).length = 0;
    delete (this as any).el;
  }
}


IMask.InputMask = InputMask;
