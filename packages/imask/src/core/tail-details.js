// @flow


/** Provides details of extracted tail */
export
interface TailDetails {
  /** Tail value as string */
  +value: string;
  /** Position extracted from */
  +fromPos: ?number;
  /** Position extracted to */
  +toPos: ?number;
}
