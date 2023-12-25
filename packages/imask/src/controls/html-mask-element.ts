import MaskElement, { EventHandlers } from './mask-element';
import IMask from '../core/holder';


const KEY_Z = 90;
const KEY_Y = 89;

/** Bridge between HTMLElement and {@link Masked} */
export default
abstract class HTMLMaskElement extends MaskElement {
  /** HTMLElement to use mask on */
  declare input: HTMLElement;
  declare _handlers: EventHandlers;
  abstract value: string;

  constructor (input: HTMLElement) {
    super();
    this.input = input;
    this._onKeydown = this._onKeydown.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onBeforeinput = this._onBeforeinput.bind(this);
    this._onCompositionEnd = this._onCompositionEnd.bind(this);
  }

  get rootElement (): HTMLDocument {
    return (this.input.getRootNode?.() ?? document) as HTMLDocument;
  }

  /** Is element in focus */
  get isActive (): boolean {
    return this.input === this.rootElement.activeElement;
  }

  /** Binds HTMLElement events to mask internal events */
  override bindEvents (handlers: EventHandlers) {
    this.input.addEventListener('keydown', this._onKeydown as EventListener);
    this.input.addEventListener('input', this._onInput as EventListener);
    this.input.addEventListener('beforeinput', this._onBeforeinput as EventListener);
    this.input.addEventListener('compositionend', this._onCompositionEnd as EventListener);
    this.input.addEventListener('drop', handlers.drop);
    this.input.addEventListener('click', handlers.click);
    this.input.addEventListener('focus', handlers.focus);
    this.input.addEventListener('blur', handlers.commit);
    this._handlers = handlers;
  }

  _onKeydown (e: KeyboardEvent) {
    if (this._handlers.redo && (
      (e.keyCode === KEY_Z && e.shiftKey && (e.metaKey || e.ctrlKey)) ||
      (e.keyCode === KEY_Y && e.ctrlKey)
    )) {
      e.preventDefault();
      return this._handlers.redo(e);
    }

    if (this._handlers.undo && e.keyCode === KEY_Z && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      return this._handlers.undo(e);
    }

    if (!e.isComposing) this._handlers.selectionChange(e);
  }

  _onBeforeinput (e: InputEvent) {
    if (e.inputType === 'historyUndo' && this._handlers.undo) {
      e.preventDefault();
      return this._handlers.undo(e);
    }

    if (e.inputType === 'historyRedo' && this._handlers.redo) {
      e.preventDefault();
      return this._handlers.redo(e);
    }
  }

  _onCompositionEnd (e: CompositionEvent) {
    this._handlers.input(e);
  }

  _onInput (e: InputEvent) {
    if (!e.isComposing) this._handlers.input(e);
  }

  /** Unbinds HTMLElement events to mask internal events */
  override unbindEvents () {
    this.input.removeEventListener('keydown', this._onKeydown as EventListener);
    this.input.removeEventListener('input', this._onInput as EventListener);
    this.input.removeEventListener('beforeinput', this._onBeforeinput as EventListener);
    this.input.removeEventListener('compositionend', this._onCompositionEnd as EventListener);
    this.input.removeEventListener('drop', this._handlers.drop);
    this.input.removeEventListener('click', this._handlers.click);
    this.input.removeEventListener('focus', this._handlers.focus);
    this.input.removeEventListener('blur', this._handlers.commit);
    this._handlers = {} as EventHandlers;
  }
}


IMask.HTMLMaskElement = HTMLMaskElement;
