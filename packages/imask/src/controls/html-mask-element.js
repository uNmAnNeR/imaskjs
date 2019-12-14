// @flow
import MaskElement, {type ElementEvent} from './mask-element.js';
import IMask from '../core/holder.js';


/** Bridge between HTMLElement and {@link Masked} */
export default
class HTMLMaskElement extends MaskElement {
  /** Mapping between HTMLElement events and mask internal events */
  static EVENTS_MAP: {[ElementEvent]: string};
  /** HTMLElement to use mask on */
  input: HTMLTextAreaElement | HTMLInputElement;
  _handlers: {[string]: Function};

  /**
    @param {HTMLInputElement|HTMLTextAreaElement} input
  */
  constructor (input: HTMLTextAreaElement | HTMLInputElement) {
    super();
    this.input = input;
    this._handlers = {};
  }

  /** */
  // $FlowFixMe https://github.com/facebook/flow/issues/2839
  get rootElement (): HTMLDocument {
    return this.input.getRootNode
      ? this.input.getRootNode()
      : document;
  }

  /**
    Is element in focus
    @readonly
  */
  get isActive (): boolean {
    //$FlowFixMe
    return this.input === this.rootElement.activeElement;
  }

  /**
    Returns HTMLElement selection start
    @override
  */
  get _unsafeSelectionStart (): number {
    return this.input.selectionStart;
  }

  /**
    Returns HTMLElement selection end
    @override
  */
  get _unsafeSelectionEnd (): number {
    return this.input.selectionEnd;
  }

  /**
    Sets HTMLElement selection
    @override
  */
  _unsafeSelect (start: number, end: number) {
    this.input.setSelectionRange(start, end);
  }

  /**
    HTMLElement value
    @override
  */
  get value (): string {
    return this.input.value;
  }
  set value (value: string) {
    this.input.value = value;
  }

  /**
    Binds HTMLElement events to mask internal events
    @override
  */
  bindEvents (handlers: {[ElementEvent]: Function}) {
    Object.keys(handlers)
      .forEach(event => this._toggleEventHandler(HTMLMaskElement.EVENTS_MAP[event], handlers[event]));
  }

  /**
    Unbinds HTMLElement events to mask internal events
    @override
  */
  unbindEvents () {
    Object.keys(this._handlers)
      .forEach(event => this._toggleEventHandler(event));
  }

  /** */
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
  commit: 'blur',
};


IMask.HTMLMaskElement = HTMLMaskElement;
