import BaseMask from './base';


export default
class FuncMask extends BaseMask {
  resolve (...args) {
    return this.mask(...args);
  }
}
