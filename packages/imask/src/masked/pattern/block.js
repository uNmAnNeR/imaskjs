// @flow
import type Masked from '../base.js';
import type MaskedPattern from '../pattern.js';
import type ChangeDetails from '../../core/change-details.js';
import {type ExtractFlags, type AppendFlags} from '../base.js';
import {type Direction} from '../../core/utils.js';


export
interface PatternBlock {
  +value: string;
  +unmaskedValue: string;
  +isComplete: boolean;

  reset (): void;
  remove (fromPos: ?number, toPos: ?number): void;
  extractInput (fromPos: number, toPos: number, flags?: ExtractFlags): string;
  _append (str: string, flags: AppendFlags): ChangeDetails;
  _appendPlaceholder (): ChangeDetails;
  _extractTail (fromPos: number, toPos: number): TailDetails;
  doCommit (): void;
  assign (source: PatternBlock): PatternBlock;
  nearestInputPos (cursorPos: number, direction: Direction): number;
}
