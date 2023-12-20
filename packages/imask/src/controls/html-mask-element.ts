import MaskElement, { type ElementEvent } from './mask-element';
import IMask from '../core/holder';


/** Bridge between HTMLElement and {@link Masked} */
export default
abstract class HTMLMaskElement extends MaskElement {
  /** HTMLElement to use mask on */
  declare input: HTMLElement;
  declare _handlers: {[key: string]: EventListener};
  abstract value: string;

  constructor (input: HTMLElement) {
    super();
    this.input = input;
    this._onKeydown = this._onKeydown.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onCompositionEnd = this._onCompositionEnd.bind(this);
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
    this.input.addEventListener('keydown', this._onKeydown as EventListener);
    this.input.addEventListener('input', this._onInput as EventListener);
    this.input.addEventListener('compositionend', this._onCompositionEnd as EventListener);
    this.input.addEventListener('drop', handlers.drop);
    this.input.addEventListener('click', handlers.click);
    this.input.addEventListener('focus', handlers.focus);
    this.input.addEventListener('blur', handlers.commit);
    this._handlers = handlers;
  }

  _onKeydown (e: KeyboardEvent) {
    if (!e.isComposing) this._handlers.selectionChange(e);
  }

  _onCompositionEnd (e: CompositionEvent) {
    this._handlers.input(e);
  }

  _onInput (e: InputEvent) {
    if (!e.isComposing) this._handlers.input(e);
  }

  /**
    Unbinds HTMLElement events to mask internal events
  */
  override unbindEvents () {
    this.input.removeEventListener('keydown', this._onKeydown as EventListener);
    this.input.removeEventListener('input', this._onInput as EventListener);
    this.input.removeEventListener('compositionend', this._onCompositionEnd as EventListener);
    this.input.removeEventListener('drop', this._handlers.drop);
    this.input.removeEventListener('click', this._handlers.click);
    this.input.removeEventListener('focus', this._handlers.focus);
    this.input.removeEventListener('blur', this._handlers.commit);
    this._handlers = {};
  }
}


IMask.HTMLMaskElement = HTMLMaskElement;
