import {DIRECTION} from './utils';


export default
class ActionDetails {
  constructor (value, cursorPos, oldValue, oldSelection) {
    this.value = value;
    this.cursorPos = cursorPos;
    this.oldValue = oldValue;
    this.oldSelection = oldSelection;
  }

  get startChangePos () {
    return Math.min(this.cursorPos, this.oldSelection.start);
  }

  get insertedCount () {
    return this.cursorPos - this.startChangePos;
  }

  get inserted () {
    return this.value.substr(this.startChangePos, this.insertedCount);
  }

  get removedCount () {
    // Math.max for opposite operation
    return Math.max((this.oldSelection.end - this.startChangePos) ||
      // for Delete
      this.oldValue.length - this.value.length, 0);
  }

  get removed () {
    return this.oldValue.substr(this.startChangePos, this.removedCount);
  }

  get head () {
    return this.value.substring(0, this.startChangePos);
  }

  get tail () {
    this.value.substring(this.startChangePos + this.insertedCount);
  }

  get removeDirection () {
    return this.removedCount &&
      ((this.oldSelection.end === this.cursorPos || this.insertedCount) ?
        DIRECTION.RIGHT :
        DIRECTION.LEFT);
  }
}
