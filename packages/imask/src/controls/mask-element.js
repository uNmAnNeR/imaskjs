// @flow

/**
  Generic element API to use with mask
  @interface
*/
export default
class MaskElement {
  +selectionStart: number;
  +selectionEnd: number;
  value: string;

  select (start: number, end: number): void {}
  isActive (): boolean { return false; }

  onSelectionChange (fn?: Function): void {}
  onInput (fn?: Function): void {}
  onDrop (fn?: Function): void {}
  onClick (fn?: Function): void {}
  onFocus (fn?: Function): void {}
  onChange (fn?: Function): void {}

  unbind (): void {}
}
