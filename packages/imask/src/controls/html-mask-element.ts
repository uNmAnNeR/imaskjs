import MaskElement, { type ElementEvent } from './mask-element';
import IMask from '../core/holder';


/** Bridge between HTMLElement and {@link Masked} */
export default
class HTMLMaskElement<Element extends HTMLElement=HTMLTextAreaElement | HTMLInputElement> extends MaskElement {
  /** Mapping between HTMLElement events and mask internal events */
  static EVENTS_MAP: {[k in ElementEvent]: string};
  /** HTMLElement to use mask on */
  input: HTMLTextAreaElement | HTMLInputElement;
  _handlers: {[k: string]: EventListener};

  /**
    @param {HTMLInputElement|HTMLTextAreaElement} input
  */
  constructor (input: Element) {
    super();
    this.input = input as unknown as HTMLTextAreaElement | HTMLInputElement;
    this._handlers = {};
  }

  /** */
  // $FlowFixMe https://github.com/facebook/flow/issues/2839
  get rootElement (): HTMLDocument {
    return (this.input.getRootNode?.() ?? document) as HTMLDocument;
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
  // @ts-ignore
  override get _unsafeSelectionStart (): number {
    return this.input.selectionStart;
  }

  /**
    Returns HTMLElement selection end
    @override
  */
  // @ts-ignore
  override get _unsafeSelectionEnd (): number {
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
  // @ts-ignore
  override get value (): string {
    return this.input.value;
  }
  override set value (value: string) {
    this.input.value = value;
  }

  /**
    Binds HTMLElement events to mask internal events
    @override
  */
  override bindEvents (handlers: {[key in ElementEvent]: EventListener}) {
    (Object.keys(handlers) as Array<ElementEvent>)
      .forEach(event => this._toggleEventHandler(HTMLMaskElement.EVENTS_MAP[event], handlers[event]));
  }

  /**
    Unbinds HTMLElement events to mask internal events
    @override
  */
  override unbindEvents () {
    Object.keys(this._handlers)
      .forEach(event => this._toggleEventHandler(event));
  }

  /** */
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
HTMLMaskElement.EVENTS_MAP = {
  selectionChange: 'keydown',
  input: 'input',
  drop: 'drop',
  click: 'click',
  focus: 'focus',
  commit: 'blur',
} as const;


IMask.HTMLMaskElement = HTMLMaskElement;
