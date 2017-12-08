// @flow

export default
class ChangeDetails {
  inserted: string;
  overflow: boolean;
  removedCount: number;
  shift: number;
  _rawInserted: string;

  constructor (details?: {
    inserted?: $PropertyType<ChangeDetails, 'inserted'>,
    overflow?: $PropertyType<ChangeDetails, 'overflow'>,
    removedCount?: $PropertyType<ChangeDetails, 'removedCount'>,
    shift?: $PropertyType<ChangeDetails, 'shift'>,
  }) {
    Object.assign(this, {
      inserted: '',
      overflow: false,
      removedCount: 0,
      shift: 0,
    }, details);
  }

  aggregate (details: ChangeDetails): ChangeDetails {
    this.inserted += details.inserted;
    this.removedCount += details.removedCount;
    this.shift += details.shift;
    this.overflow = this.overflow || details.overflow;
    if (details.rawInserted) this.rawInserted += details.rawInserted;
    return this;
  }

  get offset (): number {
    return this.shift + this.inserted.length - this.removedCount;
  }

  get rawInserted (): string {
    return this._rawInserted != null ?
      this._rawInserted :
      this.inserted;
  }

  set rawInserted (rawInserted: string): void {
    this._rawInserted = rawInserted;
  }
}
