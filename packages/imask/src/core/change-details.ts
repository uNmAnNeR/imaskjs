import IMask from "./holder";


export
type ChangeDetailsOptions = Pick<ChangeDetails,
  | 'inserted'
  | 'tailShift'
  | 'rawInserted'
  | 'consumed'
  | 'skip'
>;

/** Provides details of changing model value */
export default
class ChangeDetails {
  /** Inserted symbols */
  declare inserted: string;
  /** Additional offset if any changes occurred before tail */
  declare tailShift: number;
  /** Raw inserted is used by dynamic mask */
  declare rawInserted: string;
  /** Not inserted but handled in some way. 'consumed' is always >= then 'rawInserted' */
  declare consumed: string;
  /** Can skip chars */
  declare skip: boolean;


  static normalize (prep: string | [string, ChangeDetails]): [string, ChangeDetails] {
    return Array.isArray(prep) ? prep : [
      prep,
      new ChangeDetails(),
    ];
  }

  constructor (details?: Partial<ChangeDetailsOptions>) {
    Object.assign(this, {
      inserted: '',
      rawInserted: '',
      consumed: '',
      tailShift: 0,
      skip: false,
    }, details);
  }

  /** Aggregate changes */
  aggregate (details: ChangeDetails): this {
    this.inserted += details.inserted;
    this.rawInserted += details.rawInserted;
    this.consumed += details.consumed || details.rawInserted;
    this.tailShift += details.tailShift;
    this.skip = this.skip || details.skip;

    return this;
  }

  /** Total offset considering all changes */
  get offset (): number {
    return this.tailShift + this.inserted.length;
  }

  // get skip (): boolean {
  //   return this.rawInserted !== this.consumed;
  // }
}


IMask.ChangeDetails = ChangeDetails;
