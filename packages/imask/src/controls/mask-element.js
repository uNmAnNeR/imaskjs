// @flow

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
  +_unsafeSelectionStart: number;
  +_unsafeSelectionEnd: number;
  value: string;

  get selectionStart (): number {
    let start;
    try {
      start = this._unsafeSelectionStart;
    } catch (e) {}

    return start != null ?
      start :
      this.value.length;
  }

  get selectionEnd (): number {
    let end;
    try {
      end = this._unsafeSelectionEnd;
    } catch (e) {}

    return end != null ?
      end :
      this.value.length;
  }

  select (start: number, end: number) {
    if (start == null || end == null ||
      start === this.selectionStart && end === this.selectionEnd) return;

    try {
      this._unsafeSelect(start, end);
    } catch (e) {}
  }

  _unsafeSelect (start: number, end: number): void {}
  isActive (): boolean { return false; }

  bindEvents (handlers: {[ElementEvent]: Function}) {}
  unbindEvents (): void {}
}
