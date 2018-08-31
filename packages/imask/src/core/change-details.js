// @flow


/**
  Provides details of changing model value
  @param {Object} [details]
  @param {string} [details.inserted] - Inserted symbols
  @param {boolean} [details.skip] - Can skip chars
  @param {number} [details.removeCount] - Removed symbols count
  @param {number} [details.shift] - Additional offset if any changes occurred before current position
*/
export default
class ChangeDetails {
  /** Inserted symbols */
  inserted: string;
  /** Can skip chars */
  skip: boolean;
  /** Additional offset if any changes occurred before current position */
  shift: number;
  /** Raw inserted is used by dynamic mask */
  rawInserted: string;

  constructor (details?: {
    inserted?: $PropertyType<ChangeDetails, 'inserted'>,
    rawInserted?: $PropertyType<ChangeDetails, 'rawInserted'>,
    skip?: $PropertyType<ChangeDetails, 'skip'>,
    shift?: $PropertyType<ChangeDetails, 'shift'>,
  }) {
    Object.assign(this, {
      inserted: '',
      rawInserted: '',
      skip: false,
      shift: 0,
    }, details);
  }

  /**
    Aggregate changes
    @returns {ChangeDetails} `this`
  */
  aggregate (details: ChangeDetails): ChangeDetails {
    this.rawInserted += details.rawInserted;
    this.skip = this.skip || details.skip;
    this.shift += details.shift < 0 ?
      // trim inserted if available
      Math.min(this.inserted.length + details.shift, 0) :
      // or just add shift
      details.shift;
    if (details.shift < 0) this.inserted = this.inserted.slice(0, details.shift);
    this.inserted += details.inserted;
    return this;
  }

  /** Total offset considering all changes */
  get offset (): number {
    return this.shift + this.inserted.length;
  }

  /** Raw inserted is used by dynamic mask */
  // get rawInserted (): string {
  //   return this._rawInserted != null ?
  //     this._rawInserted :
  //     this.inserted;
  // }

  // set rawInserted (rawInserted: string): void {
  //   this._rawInserted = rawInserted;
  // }
}
