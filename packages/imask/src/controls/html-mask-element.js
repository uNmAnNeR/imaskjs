// @flow
import MaskElement from './mask-element.js';


export default
class HTMLMaskElement extends MaskElement {
  input: HTMLTextAreaElement | HTMLInputElement;
  _handlers: {[string]: Function};

  constructor (input: HTMLTextAreaElement | HTMLInputElement) {
    super();
    this.input = input;
    this._handlers = {};
  }

  isActive (): boolean {
    return this.input === document.activeElement;
  }

  get selectionStart (): number {
    let start;
    try {
      start = this.input.selectionStart;
    } catch (e) {}

    return start != null ?
      start :
      this.input.value.length;
  }

  get selectionEnd (): number {
    let end;
    try {
      end = this.input.selectionEnd;
    } catch (e) {}

    return end != null ?
      end :
      this.input.value.length;
  }

  select (start: number, end: number) {
    if (start == null || end == null ||
      start === this.selectionStart && end === this.selectionEnd) return;

    try {
      this.input.setSelectionRange(start, end);
    } catch (e) {}
  }

  get value (): string {
    return this.input.value;
  }

  set value (value: string) {
    this.input.value = value;
  }

  onSelectionChange (fn?: Function) {
    this._toggleEventListener('keydown', fn);
  }

  onInput (fn?: Function) {
    this._toggleEventListener('input', fn);
  }

  onDrop (fn?: Function) {
    this._toggleEventListener('drop', fn);
  }

  onClick (fn?: Function) {
    this._toggleEventListener('click', fn);
  }

  onFocus (fn?: Function) {
    this._toggleEventListener('focus', fn);
  }

  onChange (fn?: Function) {
    this._toggleEventListener('change', fn);
  }

  unbind () {
    Object.keys(this._handlers).forEach(k => this._toggleEventListener(k));
  }

  _toggleEventListener (event: string, handler?: Function): void {
    if (this._handlers[event]) {
      this.input.removeEventListener(event, this._handlers[event]);
      delete this._handlers[event];
    }

    if (handler) {
      this.input.addEventListener(event, handler);
      this._handlers[event] = handler;
    }
  }
}
