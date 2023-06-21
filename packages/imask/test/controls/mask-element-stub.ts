import MaskElement from '../../src/controls/mask-element';


export default
class MaskElementStub extends MaskElement {
  declare _unsafeSelectionStart: number;
  declare _unsafeSelectionEnd: number;
  declare value: string;

  _unsafeSelect (): void {}
  bindEvents (): void {}
  unbindEvents (): void {}

  constructor () {
    super();
    this.value = '';
    this.select(0, 0);
  }

  get isActive () {
    return true;
  }

  override select (start: number, end: number) {
    (this._unsafeSelectionStart as any) = start;
    (this._unsafeSelectionEnd as any) = end;
  }
}
