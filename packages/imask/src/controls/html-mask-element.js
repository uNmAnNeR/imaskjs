// @flow
import MaskElement, {type ElementEvent} from './mask-element.js';


export default
class HTMLMaskElement extends MaskElement {
  static EVENTS_MAP: {[ElementEvent]: string};
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

  get _unsafeSelectionStart (): number {
    return this.input.selectionStart;
  }

  get _unsafeSelectionEnd (): number {
    return this.input.selectionEnd;
  }

  _unsafeSelect (start: number, end: number) {
    this.input.setSelectionRange(start, end);
  }

  get value (): string {
    return this.input.value;
  }

  set value (value: string) {
    this.input.value = value;
  }

  bindEvents (handlers: {[ElementEvent]: Function}) {
    Object.keys(handlers)
      .forEach(event => this._toggleEventHandler(HTMLMaskElement.EVENTS_MAP[event], handlers[event]));
  }

  unbindEvents () {
    Object.keys(this._handlers)
      .forEach(event => this._toggleEventHandler(event));
  }

  _toggleEventHandler (event: string, handler?: Function): void {
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
HTMLMaskElement.EVENTS_MAP = {
  selectionChange: 'keydown',
  input: 'input',
  drop: 'drop',
  click: 'click',
  focus: 'focus',
  commit: 'change',
};
