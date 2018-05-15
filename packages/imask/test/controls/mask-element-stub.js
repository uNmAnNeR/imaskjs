import MaskElement from '../../src/controls/mask-element';


export default
class MaskElementStub extends MaskElement {
  constructor () {
    super();
    this.value = '';
    this.selectionStart = 0;
    this.selectionEnd = 0;
  }

  isActive () {
    return true;
  }

  select (start, end) {
    this.selectionStart = start;
    this.selectionEnd = end;
  }
}
