export as namespace IMask;
export = IMask;


declare function IMask (el: HTMLInputElement | HTMLTextAreaElement): IMask.InputMask;

declare namespace IMask {
  type HTMLMaskingElement = HTMLTextAreaElement | HTMLInputElement;
  export type ElementEvent =
    'selectionChange' |
    'input' |
    'drop' |
    'click' |
    'focus' |
    'commit';

  export class MaskElement {
    value: string;
    readonly selectionStart: number;
    readonly selectionEnd: number;
    readonly isActive: boolean;
    select (start: number, end: number): void;
    bindEvents (handlers: {[key in ElementEvent]: Function}): void;
    unbindEvents (): void;
  }

  export class HTMLMaskElement extends MaskElement {
    static EVENTS_MAP: {[key in ElementEvent]: string};
    input: HTMLMaskingElement;
    constructor (input: HTMLMaskingElement);
  }

  export class Masked<T> {

  }

  export class MaskedPattern extends Masked<string> {

  }

  export class MaskedEnum extends MaskedPattern {

  }

  export class MaskedRange extends MaskedPattern {

  }

  // TODO any
  export class MaskedNumber extends Masked<any> {

  }

  export class MaskedDate extends MaskedPattern {

  }

  export class MaskedRegExp extends Masked<RegExp> {

  }

  export class MaskedFunction extends Masked<Function> {

  }

  // TODO any
  export class MaskedDynamic extends Masked<any> {

  }

  // TODO any
  export function createMask (opts: any): Masked<any>;

  export type Mask = any; // TODO
  export class InputMask {
    el: MaskElement;
    masked: Masked<any>; // TODO any?
    mask: Mask;
    value: string;
    unmaskedValue: string;
    typedValue: any;
    cursorPos: number;
    readonly selectionStart: number;

    constructor (el: MaskElement | HTMLMaskingElement, opts: {[key: string]: any});  // TODO opts types

    alignCursor (): void;
    alignCursorFriendly (): void;
    updateValue (): void;
    updateControl (): void;
    updateOptions (opts: {[key: string]: any}): void;
    updateCursor (cursorPos: number): void;
    on (ev: string, handler: Function): this;
    off (ev: string, handler: Function): this;
    destroy (): void;
  }
}
