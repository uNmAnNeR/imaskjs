export default
class MaskResolver {
  constructor (mask) { this.mask = mask; }

  resolve (str) { return str; }
  resolveUnmasked (str) { return str; }

  extractUnmasked (str) { return str; }
}
