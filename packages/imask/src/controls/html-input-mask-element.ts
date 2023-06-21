import HTMLMaskElement from './html-mask-element';
import IMask from '../core/holder';

export
type InputElement = HTMLTextAreaElement | HTMLInputElement;

/** Bridge between InputElement and {@link Masked} */
export default
class HTMLInputMaskElement extends HTMLMaskElement {
  /** InputElement to use mask on */
  declare input: InputElement;

  constructor (input: InputElement) {
    super(input);
    this.input = input;
    this._handlers = {};
  }

  /** Returns InputElement selection start */
  override get _unsafeSelectionStart (): number {
    return this.input.selectionStart;
  }

  /** Returns InputElement selection end */
  override get _unsafeSelectionEnd (): number {
    return this.input.selectionEnd;
  }

  /** Sets InputElement selection */
  _unsafeSelect (start: number, end: number) {
    this.input.setSelectionRange(start, end);
  }

  override get value (): string {
    return this.input.value;
  }
  override set value (value: string) {
    this.input.value = value;
  }
}


IMask.HTMLMaskElement = HTMLMaskElement;
