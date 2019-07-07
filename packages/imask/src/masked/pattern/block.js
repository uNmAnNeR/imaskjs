// @flow
import type Masked from '../base.js';
import type MaskedPattern from '../pattern.js';
import type ChangeDetails from '../../core/change-details.js';
import { type TailDetails } from '../../core/tail-details.js';
import {type ExtractFlags, type AppendFlags} from '../base.js';
import {type Direction} from '../../core/utils.js';


/**
  Subset of {@link Masked} attributes used with pattern
  @interface
*/
export
interface PatternBlock {
  +value: string;
  +unmaskedValue: string;
  +isComplete: boolean;
  +lazy?: boolean;
  state: any;

  reset (): void;
  remove (fromPos?: number, toPos?: number): ChangeDetails;
  extractInput (fromPos?: number, toPos?: number, flags?: ExtractFlags): string;
  extractTail (fromPos?: number, toPos?: number): TailDetails;
  append (str: string, flags?: AppendFlags, tail?: TailDetails): ChangeDetails;
  appendTail (tail: string | TailDetails): ChangeDetails;
  _appendChar (str: string, flags: AppendFlags): ChangeDetails;
  _appendPlaceholder (?number): ChangeDetails;
  doCommit (): void;
  nearestInputPos (cursorPos: number, direction: Direction): number;
}
