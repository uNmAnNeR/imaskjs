// @flow
import {type Direction, type Selection, DIRECTION} from './utils.js';


export default
class ActionDetails {
  value: string;
  cursorPos: number;
  oldValue: string;
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

  get startChangePos (): number {
    return Math.min(this.cursorPos, this.oldSelection.start);
  }

  get insertedCount (): number {
    return this.cursorPos - this.startChangePos;
  }

  get inserted (): string {
    return this.value.substr(this.startChangePos, this.insertedCount);
  }

  get removedCount (): number {
    // Math.max for opposite operation
    return Math.max((this.oldSelection.end - this.startChangePos) ||
      // for Delete
      this.oldValue.length - this.value.length, 0);
  }

  get removed (): string {
    return this.oldValue.substr(this.startChangePos, this.removedCount);
  }

  get head (): string {
    return this.value.substring(0, this.startChangePos);
  }

  get tail (): string {
    return this.value.substring(this.startChangePos + this.insertedCount);
  }

  get removeDirection (): Direction {
    if (!this.removedCount || this.insertedCount) return DIRECTION.NONE;

    // align right if delete at right or if range removed (event with backspace)
    return (this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos) ?
      DIRECTION.RIGHT :
      DIRECTION.LEFT;
  }
}
