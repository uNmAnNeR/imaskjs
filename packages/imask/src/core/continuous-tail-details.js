// @flow
import { type TailDetails } from './tail-details.js';


/** Provides details of extracted tail */
export default
class ContinuousTailDetails implements TailDetails {
  /** Tail value as string */
  +value: string;
  /** Tail start position */
  +from: ?number;
  /** Start position */
  stop: ?number;

  constructor (value: string, from?: number, stop?: number) {
    this.value = value;
    this.from = from;
    this.stop = stop;
  }
}
