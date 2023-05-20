import HTMLMaskElement from './html-mask-element';
import IMask from '../core/holder';

export
type InputElement = HTMLTextAreaElement | HTMLInputElement;

/** Bridge between InputElement and {@link Masked} */
export default
class HTMLInputMaskElement extends HTMLMaskElement {
  /** InputElement to use mask on */
  declare input: InputElement;

  /**
    @param {HTMLInputElement|HTMLTextAreaElement} input
  */
  constructor (input: InputElement) {
    super(input);
    this.input = input;
    this._handlers = {};
  }

  /**
    Returns InputElement selection start
    @override
  */
  // @ts-ignore
  override get _unsafeSelectionStart (): number {
    return this.input.selectionStart;
  }

  /**
    Returns InputElement selection end
    @override
  */
  // @ts-ignore
  override get _unsafeSelectionEnd (): number {
    return this.input.selectionEnd;
  }

  /**
    Sets InputElement selection
    @override
  */
  _unsafeSelect (start: number, end: number) {
    this.input.setSelectionRange(start, end);
  }

  /**
    InputElement value
    @override
  */
  // @ts-ignore
  override get value (): string {
    return this.input.value;
  }
  override set value (value: string) {
    this.input.value = value;
  }
}


IMask.HTMLMaskElement = HTMLMaskElement;
