// @flow
import type { AppendFlags } from '../masked/base.js';
import type ChangeDetails from './change-details.js';


export
interface AppendTail {
  append (str: string, flags?: AppendFlags): ChangeDetails;
  _appendPlaceholder (): ChangeDetails;
}

/** Provides details of extracted tail */
export
interface TailDetails {
  /** Tail start position */
  from: number;
  /** Start position */
  stop: ?number;
  /** */
  state: any;

  toString (): string;
  extend (value: string | TailDetails): void;
  appendTo (masked: AppendTail): ChangeDetails;
  shiftBefore (pos: number): string;
}
