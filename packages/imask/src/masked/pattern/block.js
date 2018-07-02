// @flow
import type Masked from '../base.js';
import type MaskedPattern from '../pattern.js';
import type ChangeDetails from '../../core/change-details.js';
import {type TailDetails} from '../../core/tail-details.js';
import {type ExtractFlags, type AppendFlags} from '../base.js';
import {type Direction} from '../../core/utils.js';


export
interface PatternBlock {
  +value: string;
  +unmaskedValue: string;
  +isComplete: boolean;
  +_appendPlaceholder?: () => ChangeDetails;
  state: any;

  reset (): void;
  remove (fromPos?: number, toPos?: number): ChangeDetails;
  extractInput (fromPos?: number, toPos?: number, flags?: ExtractFlags): string;
  _extractTail (fromPos?: number, toPos?: number): TailDetails;
  _append (str: string, flags: AppendFlags): ChangeDetails;
  doCommit (): void;
  nearestInputPos (cursorPos: number, direction: Direction): number;
}
