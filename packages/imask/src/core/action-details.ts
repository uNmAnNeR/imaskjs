import { type Direction, type Selection, DIRECTION } from './utils';

export
type ActionDetailsOptions = Pick<ActionDetails,
  | 'value'
  | 'cursorPos'
  | 'oldValue'
  | 'oldSelection'
>;


/** Provides details of changing input */
export default
class ActionDetails {
  /** Current input value */
  declare value: string;
  /** Current cursor position */
  declare cursorPos: number;
  /** Old input value */
  declare oldValue: string;
  /** Old selection */
  declare oldSelection: Selection;

  constructor (opts: ActionDetailsOptions) {
    Object.assign(this, opts);

    // double check if left part was changed (autofilling, other non-standard input triggers)
    while (this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos)) {
      --this.oldSelection.start;
    }

    if (this.insertedCount) {
      // double check right part
      while (this.value.slice(this.cursorPos) !== this.oldValue.slice(this.oldSelection.end)) {
        if (this.value.length - this.cursorPos < this.oldValue.length - this.oldSelection.end) ++this.oldSelection.end;
        else ++this.cursorPos;
      }
    }
  }

  /** Start changing position */
  get startChangePos (): number {
    return Math.min(this.cursorPos, this.oldSelection.start);
  }

  /** Inserted symbols count */
  get insertedCount (): number {
    return this.cursorPos - this.startChangePos;
  }

  /** Inserted symbols */
  get inserted (): string {
    return this.value.substr(this.startChangePos, this.insertedCount);
  }

  /** Removed symbols count */
  get removedCount (): number {
    // Math.max for opposite operation
    return Math.max((this.oldSelection.end - this.startChangePos) ||
      // for Delete
      this.oldValue.length - this.value.length, 0);
  }

  /** Removed symbols */
  get removed (): string {
    return this.oldValue.substr(this.startChangePos, this.removedCount);
  }

  /** Unchanged head symbols */
  get head (): string {
    return this.value.substring(0, this.startChangePos);
  }

  /** Unchanged tail symbols */
  get tail (): string {
    return this.value.substring(this.startChangePos + this.insertedCount);
  }

  /** Remove direction */
  get removeDirection (): Direction {
    if (!this.removedCount || this.insertedCount) return DIRECTION.NONE;

    // align right if delete at right
    return (
      (this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos) &&
      // if not range removed (event with backspace)
      this.oldSelection.end === this.oldSelection.start
    ) ?
      DIRECTION.RIGHT :
      DIRECTION.LEFT;
  }
}
