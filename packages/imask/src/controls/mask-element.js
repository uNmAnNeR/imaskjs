// @flow
import IMask from '../core/holder.js';


export
type ElementEvent =
  'selectionChange' |
  'input' |
  'drop' |
  'click' |
  'focus' |
  'commit';

/**
  Generic element API to use with mask
  @interface
*/
export default
class MaskElement {
  /** */
  +_unsafeSelectionStart: number;
  /** */
  +_unsafeSelectionEnd: number;
  /** */
  value: string;

  /** Safely returns selection start */
  get selectionStart (): number {
    let start;
    try {
      start = this._unsafeSelectionStart;
    } catch (e) {}

    return start != null ?
      start :
      this.value.length;
  }

  /** Safely returns selection end */
  get selectionEnd (): number {
    let end;
    try {
      end = this._unsafeSelectionEnd;
    } catch (e) {}

    return end != null ?
      end :
      this.value.length;
  }

  /** Safely sets element selection */
  select (start: number, end: number) {
    if (start == null || end == null ||
      start === this.selectionStart && end === this.selectionEnd) return;

    try {
      this._unsafeSelect(start, end);
    } catch (e) {}
  }

  /** Should be overriden in subclasses */
  _unsafeSelect (start: number, end: number): void {}
  /** Should be overriden in subclasses */
  get isActive (): boolean { return false; }
  /** Should be overriden in subclasses */
  bindEvents (handlers: {[ElementEvent]: Function}) {}
  /** Should be overriden in subclasses */
  unbindEvents (): void {}
}


IMask.MaskElement = MaskElement;
