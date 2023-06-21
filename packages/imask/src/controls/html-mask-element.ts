import MaskElement, { type ElementEvent } from './mask-element';
import IMask from '../core/holder';


/** Bridge between HTMLElement and {@link Masked} */
export default
abstract class HTMLMaskElement extends MaskElement {
  /** Mapping between HTMLElement events and mask internal events */
  static EVENTS_MAP = {
    selectionChange: 'keydown',
    input: 'input',
    drop: 'drop',
    click: 'click',
    focus: 'focus',
    commit: 'blur',
  } as const;
  /** HTMLElement to use mask on */
  declare input: HTMLElement;
  declare _handlers: {[k: string]: EventListener};
  abstract value: string;

  constructor (input: HTMLElement) {
    super();
    this.input = input;
    this._handlers = {};
  }

  get rootElement (): HTMLDocument {
    return (this.input.getRootNode?.() ?? document) as HTMLDocument;
  }

  /**
    Is element in focus
  */
  get isActive (): boolean {
    return this.input === this.rootElement.activeElement;
  }

  /**
    Binds HTMLElement events to mask internal events
  */
  override bindEvents (handlers: {[key in ElementEvent]: EventListener}) {
    (Object.keys(handlers) as Array<ElementEvent>)
      .forEach(event => this._toggleEventHandler(HTMLMaskElement.EVENTS_MAP[event], handlers[event]));
  }

  /**
    Unbinds HTMLElement events to mask internal events
  */
  override unbindEvents () {
    Object.keys(this._handlers)
      .forEach(event => this._toggleEventHandler(event));
  }

  _toggleEventHandler (event: string, handler?: EventListener): void {
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


IMask.HTMLMaskElement = HTMLMaskElement;
