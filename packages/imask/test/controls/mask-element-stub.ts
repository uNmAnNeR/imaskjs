import MaskElement from '../../src/controls/mask-element';


export default
class MaskElementStub extends MaskElement {
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
