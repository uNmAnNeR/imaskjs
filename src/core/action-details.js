// @flow
import {type Direction, type Selection, DIRECTION} from './utils.js';


/** Provides details of changing input */
export default
class ActionDetails {
  /** Current input value */
  value: string;
  /** Current cursor position */
  cursorPos: number;
  /** Old input value */
  oldValue: string;
  /** Old selection */
  oldSelection: Selection;

  constructor (
    value: string,
    cursorPos: number,
    oldValue: string,
    oldSelection: Selection
  ) {
    this.value = value;
    this.cursorPos = cursorPos;
    this.oldValue = oldValue;
    this.oldSelection = oldSelection;

    // double check if left part was changed (autofilling, other non-standard input triggers)
    while (this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos)) {
      --this.oldSelection.start;
    }
  }

  /**
    Start changing position
    @readonly
  */
  get startChangePos (): number {
    return Math.min(this.cursorPos, this.oldSelection.start);
  }

  /**
    Inserted symbols count
    @readonly
  */
  get insertedCount (): number {
    return this.cursorPos - this.startChangePos;
  }

  /**
    Inserted symbols
    @readonly
  */
  get inserted (): string {
    return this.value.substr(this.startChangePos, this.insertedCount);
  }

  /**
    Removed symbols count
    @readonly
  */
  get removedCount (): number {
    // Math.max for opposite operation
    return Math.max((this.oldSelection.end - this.startChangePos) ||
      // for Delete
      this.oldValue.length - this.value.length, 0);
  }

  /**
    Removed symbols
    @readonly
  */
  get removed (): string {
    return this.oldValue.substr(this.startChangePos, this.removedCount);
  }

  /**
    Unchanged head symbols
    @readonly
  */
  get head (): string {
    return this.value.substring(0, this.startChangePos);
  }

  /**
    Unchanged tail symbols
    @readonly
  */
  get tail (): string {
    return this.value.substring(this.startChangePos + this.insertedCount);
  }

  /**
    Remove direction
    @readonly
  */
  get removeDirection (): Direction {
    if (!this.removedCount || this.insertedCount) return DIRECTION.NONE;

    // align right if delete at right or if range removed (event with backspace)
    return (this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos) ?
      DIRECTION.RIGHT :
      DIRECTION.LEFT;
  }
}
