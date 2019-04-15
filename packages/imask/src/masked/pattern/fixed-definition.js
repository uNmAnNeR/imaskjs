// @flow
import ChangeDetails from '../../core/change-details.js';
import { DIRECTION, type Direction, isString } from '../../core/utils.js';
import { type TailDetails } from '../../core/tail-details.js';
import ContinuousTailDetails from '../../core/continuous-tail-details.js';
import { type ExtractFlags, type AppendFlags, type MaskedState } from '../base.js';
import { type PatternBlock } from './block.js';


/** */
type PatternFixedDefinitionOptions = {
  char: $PropertyType<PatternFixedDefinition, 'char'>,
  isUnmasking?: $PropertyType<PatternFixedDefinition, 'isUnmasking'>,
};

type PatternFixedDefinitionState = {|
  ...MaskedState,
  _isRawInput: ?boolean,
|};

export default
class PatternFixedDefinition implements PatternBlock {
  /** */
  _value: string;
  /** */
  char: string;
  /** */
  isUnmasking: ?boolean;
  /** */
  _isRawInput: ?boolean;

  constructor(opts: PatternFixedDefinitionOptions) {
    Object.assign(this, opts);
    this._value = '';
  }

  get value (): string {
    return this._value;
  }

  get unmaskedValue (): string {
    return this.isUnmasking ? this.value : '';
  }

  reset () {
    this._isRawInput = false;
    this._value = '';
  }

  remove (fromPos?: number=0, toPos?: number=this._value.length): ChangeDetails {
    this._value = this._value.slice(0, fromPos) + this._value.slice(toPos);
    if (!this._value) this._isRawInput = false;

    return new ChangeDetails();
  }

  nearestInputPos (cursorPos: number, direction: Direction=DIRECTION.NONE): number {
    const minPos = 0;
    const maxPos = this._value.length;

    switch (direction) {
      case DIRECTION.LEFT:
      case DIRECTION.FORCE_LEFT:
        return minPos;
      case DIRECTION.NONE:
      case DIRECTION.RIGHT:
      case DIRECTION.FORCE_RIGHT:
      default: return maxPos;
    }
  }

  extractInput (fromPos?: number=0, toPos?: number=this._value.length, flags?: ExtractFlags={}) {
    return flags.raw && this._isRawInput && this._value.slice(fromPos, toPos) || '';
  }

  get isComplete (): boolean {
    return true;
  }

  _appendChar (str: string, flags?: AppendFlags={}) {
    const details = new ChangeDetails();

    if (this._value) return details;

    const appended = this.char === str[0];
    const isResolved = appended && (this.isUnmasking || flags.input || flags.raw) && !flags.tail;
    if (isResolved) details.rawInserted = this.char;
    this._value = details.inserted = this.char;
    this._isRawInput = isResolved && (flags.raw || flags.input);

    return details;
  }

  _appendPlaceholder (): ChangeDetails {
    const details = new ChangeDetails();
    if (this._value) return details;

    this._value = details.inserted = this.char;
    return details;
  }

  extractTail (fromPos?: number=0, toPos?: number=this.value.length): TailDetails {
    return new ContinuousTailDetails('');
  }

  // $FlowFixMe no ideas
  appendTail (tail: string | TailDetails): ChangeDetails {
    if (isString(tail)) tail = new ContinuousTailDetails(String(tail));

    return tail.appendTo(this);
  }

  append (str: string, flags?: AppendFlags, tail?: TailDetails): ChangeDetails {
    const details = this._appendChar(str, flags);

    if (tail != null) {
      details.tailShift += this.appendTail(tail).tailShift;
    }

    return details;
  }

  doCommit () {}

  get state (): PatternFixedDefinitionState {
    return {
      _value: this._value,
      _isRawInput: this._isRawInput,
    };
  }

  set state (state: PatternFixedDefinitionState) {
    Object.assign(this, state);
  }
}
