// @flow
import HTMLMaskElement from './html-mask-element.js';
import IMask from '../core/holder.js';


export default
class HTMLContenteditableMaskElement extends HTMLMaskElement {
  /**
    Returns HTMLElement selection start
    @override
  */
  get _unsafeSelectionStart (): number {
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
  get _unsafeSelectionEnd (): number {
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
  _unsafeSelect (start: number, end: number) {
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
  get value (): string {
    // $FlowFixMe
    return this.input.textContent;
  }
  set value (value: string) {
    this.input.textContent = value;
  }
}


IMask.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;
