import { DIRECTION, type Selection } from '../core/utils';
import ActionDetails from '../core/action-details';
import MaskedPattern, { type MaskedPatternOptions } from '../masked/pattern';
import IMask from '../core/holder';
import InputMask from './input';


export
type InputMaskEventListener = (e?: InputEvent) => void;


/** Listens to element events and controls changes between element and {@link Masked} */
export default
class InputGroupMask<Value=any> {
  declare inputs: Array<InputMask>;

  /** Internal {@link Masked} model */
  declare masked: MaskedPattern<Value>;

  declare _listeners: Record<string, Array<InputMaskEventListener>>;
  declare _value: string;
  declare _changingCursorPos: number;
  declare _unmaskedValue: string;
  declare _selection: Selection;
  declare _cursorChanging?: ReturnType<typeof setTimeout>;
  declare _inputEvent?: InputEvent;

  constructor (inputs: Array<InputMask>, opts: Partial<MaskedPatternOptions<Value>>) {
    this.inputs = inputs;

    this.rebuildMasked(opts);

    this._listeners = {};
    this._value = '';
    this._unmaskedValue = '';

    this._saveSelection = this._saveSelection.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onClick = this._onClick.bind(this);
    this.alignCursor = this.alignCursor.bind(this);
    this.alignCursorFriendly = this.alignCursorFriendly.bind(this);
    // this._handleKeyDown = this._handleKeyDown.bind(this);

    this._bindEvents();

    // refresh
    this.updateValue();
    this._onChange();
  }

  rebuildMasked (opts?: Partial<MaskedPatternOptions<Value>>) {
    this.masked = new MaskedPattern({
      mask: this.inputs.reduce((str, _, i) => str + i, ''),
      blocks: this.inputs.reduce((blocks, m, i) => ({ ...blocks, [i]: m.masked }), {}),
      ...opts,
    });
  }

  /** Raw value */
  get value (): string {
    return this.inputs.reduce((str, i) => str += i.value, '');
  }

  set value (str: string) {
    if (this.value === str) return;

    this.masked.value = str;
    this.updateControl();
    this.alignCursor();
  }

  /** Unmasked value */
  get unmaskedValue (): string {
    return this.inputs.reduce((str, i) => str += i.unmaskedValue, '');
  }

  set unmaskedValue (str: string) {
    if (this.unmaskedValue === str) return;

    this.masked.unmaskedValue = str;
    this.updateControl();
    this.alignCursor();
  }

  /** Typed unmasked value */
  get typedValue (): Value {
    return this.value as Value;
  }

  set typedValue (val: Value) {
    if (this.masked.typedValueEquals(val)) return;

    this.masked.typedValue = val;
    this.updateControl();
    this.alignCursor();
  }

  /** Display value */
  get displayValue (): string {
    return this.inputs.reduce((str, i) => str += i.displayValue, '');
  }

  /** Fires custom event */
  _fireEvent (ev: string, e?: InputEvent) {
    const listeners = this._listeners[ev];
    if (!listeners) return;

    listeners.forEach(l => l(e));
  }

  /** Current selection start */
  get selectionStart (): number {
    const ai = this.activeInput;
    if (!ai) return 0;

    return this._inputStartPos(this.inputs.indexOf(ai)) + ai.selectionStart;
  }

  get activeInput (): InputMask | undefined {
    return this.inputs.find(i => i.el.isActive);
  }

  _mapPosToInput (pos: number): { index: number, offset: number } | undefined {
    let accVal = '';
    for (let i=0; i<this.inputs.length; ++i) {
      const input = this.inputs[i];
      const inputStartPos = accVal.length;

      accVal += input.displayValue;

      if (pos <= accVal.length) {
        return {
          index: i,
          offset: pos - inputStartPos,
        };
      }
    }
  }

  _inputStartPos (inputIndex: number): number {
    return this.inputs
      .slice(0, inputIndex)
      .reduce((pos, i) => pos += i.displayValue.length, 0);
  }

  /** Current cursor position */
  get cursorPos (): number {
    const ai = this.activeInput;
    return !ai ? 0 : this._inputStartPos(this.inputs.indexOf(ai)) + ai.cursorPos;
  }
  set cursorPos (pos: number) {
    const activeInputPos = this._mapPosToInput(pos);
    if (activeInputPos) {
      const activeInput = this.inputs[activeInputPos.index];
      // TODO
      (activeInput.el as any).input.focus();
      activeInput.cursorPos = activeInputPos.offset;
    }
  }

  get elementValue () {
    return this.inputs.reduce((str, i) => str += i.el.value, '');
  }

  /** Stores current selection */
  _saveSelection (/* ev */) {
    if (this.displayValue !== this.elementValue) {
      console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'); // eslint-disable-line no-console
    }
    this._selection = {
      start: this.selectionStart,
      end: this.cursorPos,
    };
  }

  /** Syncronizes model value from view */
  updateValue () {
    this.masked.value = this.elementValue;
    this._value = this.masked.value;
  }

  /** Syncronizes view from model value, fires change events */
  updateControl () {
    const newUnmaskedValue = this.masked.unmaskedValue;
    const newValue = this.masked.value;
    const isChanged = (this.unmaskedValue !== newUnmaskedValue || this.value !== newValue);

    this._unmaskedValue = newUnmaskedValue;
    this._value = newValue;

    if (this.elementValue !== this.displayValue) {
      this.inputs.forEach((input, i) => {
        input.masked.state = this.masked._blocks[i].state;
        input.updateControl();
      });
    }
    if (isChanged) this._fireChangeEvents();
  }

  /** Updates options with deep equal check, recreates {@link Masked} model if mask type changes */
  // updateOptions(opts: UpdateOpts<Opts>) {
  //   const { mask, ...restOpts } = opts;

  //   const updateMask = !this.maskEquals(mask);
  //   const updateOpts = !objectIncludes(this.masked, restOpts);

  //   if (updateMask) this.mask = mask;
  //   if (updateOpts) this.masked.updateOptions(restOpts);

  //   if (updateMask || updateOpts) this.updateControl();
  // }

  /** Updates cursor */
  updateCursor (cursorPos: number) {
    if (cursorPos == null) return;
    this.cursorPos = cursorPos;
  }

  /** Fires custom events */
  _fireChangeEvents () {
    this._fireEvent('accept', this._inputEvent);
    if (this.masked.isComplete) this._fireEvent('complete', this._inputEvent);
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

    const details = new ActionDetails({
      // new state
      value: this.elementValue,
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
    if (this.displayValue !== this.elementValue) {
      this.updateValue();
    }
    this.masked.doCommit();
    this.updateControl();
    this._saveSelection();
  }

  // // TODO type
  // _handleKeyDown (e: any) {
  //   const input = e.target;
  //   switch (e.key) {
  //     case "ArrowLeft":
  //         // Left pressed
  //         break;
  //     case "ArrowRight":
  //         // Right pressed
  //         break;
  //   }
  // }

  /** Restore last selection on focus */
  _onFocus (ev: Event) {
    this.alignCursorFriendly();
  }

  /** Restore last selection on focus */
  _onClick (ev: Event) {
    this.alignCursorFriendly();
  }

  _bindEvents () {
    this.inputs.forEach(i => {
      i.el.bindEvents({
        input: this._onInput,
        selectionChange: this._saveSelection,
        commit: this._onChange,
        click: this._onClick,
        focus: this._onFocus,
      });
      // (i.el as any)._toggleEventHandler('keydown', this._handleKeyDown);
    });
  }
}


IMask.InputGroupMask = InputGroupMask;
