// @flow
import type { TailDetails, AppendTail } from './tail-details.js';
import type ChangeDetails from './change-details.js';


type ContinuousTailState = {
  value: $PropertyType<ContinuousTailDetails, 'value'>,
  from: $PropertyType<ContinuousTailDetails, 'from'>,
  stop?: $PropertyType<ContinuousTailDetails, 'stop'>,
};

/** Provides details of continuous extracted tail */
export default
class ContinuousTailDetails implements TailDetails {
  /** Tail value as string */
  value: string;
  /** Tail start position */
  from: number;
  /** Start position */
  stop: ?number;

  constructor (value?: string='', from?: number=0, stop?: number) {
    this.value = value;
    this.from = from;
    this.stop = stop;
  }

  toString (): string { return this.value; }

  extend (tail: string | TailDetails): void {
    this.value += String(tail);
  }

  appendTo (masked: AppendTail): ChangeDetails {
    return masked.append(this.toString(), { tail: true })
      .aggregate(masked._appendPlaceholder());
  }

  get state (): ContinuousTailState {
    return {
      value: this.value,
      from: this.from,
      stop: this.stop,
    };
  }

  set state (state: ContinuousTailState) {
    Object.assign(this, state);
  }

  unshift (beforePos?: number): string {
    if (!this.value.length || (beforePos != null && this.from >= beforePos)) return '';

    const shiftChar = this.value[0];
    this.value = this.value.slice(1);
    return shiftChar;
  }

  shift (): string {
    if (!this.value.length) return '';

    const shiftChar = this.value[this.value.length-1];
    this.value = this.value.slice(0, -1);
    return shiftChar;
  }
}
