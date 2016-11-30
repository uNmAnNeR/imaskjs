import MaskResolver from './mask-resolver';

export default
class RegExpResolver extends MaskResolver {
  resolve (str) {
    return this.mask.test(str);
  }
}
