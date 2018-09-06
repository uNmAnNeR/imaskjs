// @flow


/**
  Provides details of changing model value
  @param {Object} [details]
  @param {string} [details.inserted] - Inserted symbols
  @param {boolean} [details.skip] - Can skip chars
  @param {number} [details.removeCount] - Removed symbols count
  @param {number} [details.tailShift] - Additional offset if any changes occurred before tail
*/
export default
class ChangeDetails {
  /** Inserted symbols */
  inserted: string;
  /** Can skip chars */
  skip: boolean;
  /** Additional offset if any changes occurred before tail */
  tailShift: number;
  /** Raw inserted is used by dynamic mask */
  rawInserted: string;

  constructor (details?: {
    inserted?: $PropertyType<ChangeDetails, 'inserted'>,
    rawInserted?: $PropertyType<ChangeDetails, 'rawInserted'>,
    skip?: $PropertyType<ChangeDetails, 'skip'>,
    tailShift?: $PropertyType<ChangeDetails, 'tailShift'>,
  }) {
    Object.assign(this, {
      inserted: '',
      rawInserted: '',
      skip: false,
      tailShift: 0,
    }, details);
  }

  /**
    Aggregate changes
    @returns {ChangeDetails} `this`
  */
  aggregate (details: ChangeDetails): ChangeDetails {
    this.rawInserted += details.rawInserted;
    this.skip = this.skip || details.skip;
    this.inserted += details.inserted;
    this.tailShift += details.tailShift;
    return this;
  }

  /** Total offset considering all changes */
  get offset (): number {
    return this.tailShift + this.inserted.length;
  }
}
