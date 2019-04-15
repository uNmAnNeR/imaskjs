// @flow
import type { TailDetails, AppendTail } from './tail-details.js';
import type ChangeDetails from './change-details.js';


/** Provides details of extracted tail */
export default
class ContinuousTailDetails implements TailDetails {
  /** Tail value as string */
  +value: string;
  /** Tail start position */
  from: number;
  /** Start position */
  stop: ?number;

  constructor (value: string, from?: number=0, stop?: number) {
    this.value = value;
    this.from = from;
    this.stop = stop;
  }

  toString (): string { return this.value; }

  extend (tail: string | TailDetails): void {
    this.value += String(tail);
  }

  appendTo (masked: AppendTail): ChangeDetails {
    return masked.append(this.toString(), { tail: true });
  }
}
