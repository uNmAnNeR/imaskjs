import HTMLMaskElement from './html-mask-element';
import IMask from '../core/holder';


export default
class HTMLContenteditableMaskElement extends HTMLMaskElement<HTMLElement> {
  /**
    Returns HTMLElement selection start
    @override
  */
  override get _unsafeSelectionStart (): number {
    const root = this.rootElement;
    const selection = root.getSelection && root.getSelection();
    const anchorOffset = selection && selection.anchorOffset;
    const focusOffset = selection && selection.focusOffset;
    if (focusOffset == null || anchorOffset == null || anchorOffset < focusOffset) {
      return anchorOffset;
    }
    return focusOffset;
  }

  /**
    Returns HTMLElement selection end
    @override
  */
  override get _unsafeSelectionEnd (): number {
    const root = this.rootElement;
    const selection = root.getSelection && root.getSelection();
    const anchorOffset = selection && selection.anchorOffset;
    const focusOffset = selection && selection.focusOffset;
    if (focusOffset == null || anchorOffset == null || anchorOffset > focusOffset) {
      return anchorOffset;
    }
    return focusOffset;
  }

  /**
    Sets HTMLElement selection
    @override
  */
  override _unsafeSelect (start: number, end: number) {
    if (!this.rootElement.createRange) return;

    const range = this.rootElement.createRange();
    range.setStart(this.input.firstChild || this.input, start);
    range.setEnd(this.input.lastChild || this.input, end);
    const root = this.rootElement;
    const selection = root.getSelection && root.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
    HTMLElement value
    @override
  */
  override get value (): string {
    return this.input.textContent;
  }
  override set value (value: string) {
    this.input.textContent = value;
  }
}


IMask.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;
