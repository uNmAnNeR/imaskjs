// @flow
import type Masked from '../base.js';
import type MaskedPattern from '../pattern.js';


export
interface PatternBlock {
  +value: string;
  +unmaskedValue: string;
  +isComplete: boolean;

  reset (): void;
  remove (fromPos: number, toPos: number): void;
  extractInput (fromPos: number, toPos: number, flags?: ExtractFlags): string;
  _append (str: string, flags: AppendFlags): ChangeDetails;
  doCommit (): void;
  assign (source: PatternBlock): PatternBlock;
}
