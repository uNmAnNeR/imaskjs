import MaskElement from '../../src/controls/mask-element';


export default
class MaskElementStub extends MaskElement {
  constructor () {
    super();
    this.value = '';
    this.select(0, 0);
  }

  isActive () {
    return true;
  }

  select (start, end) {
    this._unsafeSelectionStart = start;
    this._unsafeSelectionEnd = end;
  }
}
