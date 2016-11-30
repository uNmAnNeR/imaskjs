import MaskResolver from './mask-resolver';

export default
class FuncResolver extends MaskResolver {
  resolve (...args) {
    return this.mask(...args);
  }
}
