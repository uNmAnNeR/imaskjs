export default
class ChangeDetails {
  constructor (details) {
    Object.assign(this, {
      inserted: '',
      overflow: false,
      removedCount: 0,
      shift: 0,
    }, details);
  }

  aggregate (details) {
    this.inserted += details.inserted;
    this.removedCount += details.removedCount;
    this.shift += details.shift;
    this.overflow = this.overflow || details.overflow;
    if (details.rawInserted) this.rawInserted += details.rawInserted;
    return this;
  }

  get offset () {
    return this.shift + this.inserted.length - this.removedCount;
  }

  get rawInserted () {
    return this._rawInserted != null ?
      this._rawInserted :
      this.inserted;
  }

  set rawInserted (rawInserted) {
    this._rawInserted = rawInserted;
  }
}
