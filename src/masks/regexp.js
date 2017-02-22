import BaseMask from './base';


export default
class RegExpMask extends BaseMask {
  resolve (str) {
    return this.mask.test(str);
  }
}
