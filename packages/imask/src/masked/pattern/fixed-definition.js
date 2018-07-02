// @flow
import ChangeDetails from '../../core/change-details.js';
import {DIRECTION, type Direction} from '../../core/utils.js';
import {type ExtractFlags, type AppendFlags, type MaskedState} from '../base.js';
import {type PatternBlock} from './block.js';


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
      case DIRECTION.LEFT: return minPos;
      case DIRECTION.NONE:
      case DIRECTION.RIGHT:
      default: return maxPos;
    }
  }

  extractInput (fromPos?: number=0, toPos?: number=this._value.length, flags?: ExtractFlags={}) {
    return flags.raw && this._isRawInput && this._value.slice(fromPos, toPos) || '';
  }

  get isComplete (): boolean {
    return true;
  }

  _append (str: string, flags: AppendFlags) {
    if (this._value) {
      return new ChangeDetails({
        overflow: true
      });
    }

    const details = new ChangeDetails();

    const appended = this.char === str[0];
    const isResolved = appended && (this.isUnmasking || flags.input || flags.raw) && !flags.tail;
    if (appended) details.rawInserted = this.char;
    this._value = details.inserted = this.char;
    details.overflow = !isResolved;
    this._isRawInput = isResolved && (flags.raw || flags.input);

    return details;
  }

  _appendPlaceholder (): ChangeDetails {
    const details = new ChangeDetails();
    if (this._value) return details;

    this._value = details.inserted = this.char;
    return details;
  }

  _extractTail (): TailInputChunk {
    return {value: '', stop: null};
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
