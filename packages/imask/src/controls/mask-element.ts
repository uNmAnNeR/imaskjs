import IMask from '../core/holder';


export
type ElementEvent =
  | 'selectionChange'
  | 'input'
  | 'drop'
  | 'click'
  | 'focus'
  | 'commit'
;

export
type EventHandlers = { [key in ElementEvent]: (...args: any[]) => void } & {
  undo?: (...args: any[]) => void;
  redo?: (...args: any[]) => void;
}

/**  Generic element API to use with mask */
export default
abstract class MaskElement {
  /** */
  abstract _unsafeSelectionStart: number | null;
  /** */
  abstract _unsafeSelectionEnd: number | null;
  /** */
  abstract value: string;

  /** Safely returns selection start */
  get selectionStart (): number {
    let start;
    try {
      start = this._unsafeSelectionStart;
    } catch {}

    return start != null ?
      start :
      this.value.length;
  }

  /** Safely returns selection end */
  get selectionEnd (): number {
    let end;
    try {
      end = this._unsafeSelectionEnd;
    } catch {}

    return end != null ?
      end :
      this.value.length;
  }

  /** Safely sets element selection */
  select (start: number, end: number) {
    if (start == null || end == null ||
      start === this.selectionStart && end === this.selectionEnd) return;

    try {
      this._unsafeSelect(start, end);
    } catch {}
  }

  /** */
  get isActive (): boolean { return false; }
  /** */
  abstract _unsafeSelect (start: number, end: number): void;
  /** */
  abstract bindEvents (handlers: EventHandlers): void;
  /** */
  abstract unbindEvents (): void
}


IMask.MaskElement = MaskElement;
