export default
class MaskResolver {
  constructor (mask) {
    this.mask = mask;
  }

  resolve (str) {
    return str;
  };

  get unmaskedValue () {}
  set unmaskedValue (value) {}
}
