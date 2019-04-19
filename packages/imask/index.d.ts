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

  type AppendType = {
    input?: boolean,
    tail?: boolean,
    raw?: boolean,
  };
  type AppendFlags = {
    input?: boolean,
    tail?: boolean,
    raw?: boolean,
  };
  type ExtractFlags = {
    raw?: boolean,
  };
  type Direction =
    'NONE' |
    'LEFT' |
    'FORCE_LEFT' |
    'RIGHT' |
    'FORCE_RIGHT';
  interface AppendTail {
    append (str: string, flags?: AppendFlags): ChangeDetails;
  }
  interface TailDetails {
    from: number;
    stop?: number;
    state: any;

    toString (): string;
    extend (value: string | TailDetails): void;
    appendTo (masked: AppendTail): ChangeDetails;
    shiftBefore (pos: number): string;
  }
  class ChangeDetails {
    inserted: string;
    skip: boolean;
    tailShift: number;
    rawInserted: string;
    readonly offset: number;

    constructor (details?: {
      inserted?: string,
      skip?: boolean,
      tailShift?: number,
      rawInserted?: string,
    });

    aggregate (details: ChangeDetails): ChangeDetails;
  }

  export class Masked<MaskType> {
    static DEFAULTS: any; // TODO any
    mask: MaskType; // TODO any
    state: any;
    value: string;
    unmaskedValue: string;
    typedValue: any;
    rawInputValue: string;
    readonly isComplete: boolean;
    parent?: Masked<any>; // TODO any
    prepare: (value: string, masked: Masked<MaskType>, type: AppendType) => string;
    validate: (value: string, masked: Masked<MaskType>, type: AppendType) => boolean;
    commit: (value: string, masked: Masked<MaskType>) => void;
    ovewrite?: boolean;
    isInitialized: boolean;

    // TODO any
    constructor (opts: {[key: string]: any});
    updateOptions (opts: {[key: string]: any});
    reset ();
    resolve (value: string): string;
    nearestInputPos (cursorPos: number, direction?: Direction): number;
    extractTail (fromPos?: number, toPos?: number): TailDetails;
    appendTail (tail: string | TailDetails): ChangeDetails;
    append (str: string, flags?: AppendFlags, tail?: string | TailDetails): ChangeDetails;
    remove (fromPos?: number, toPos?: number): ChangeDetails;
    doPrepare (str: string, flags: AppendFlags): string;
    doValidate (flags: AppendFlags): boolean;
    doCommit (): boolean;
    splice (start: number, deleteCount: number, inserted: string, removeDirection: Direction): ChangeDetails;
  }

  export class MaskedPattern extends Masked<string> {
    static DEFAULTS: any; // TODO
    static STOP_CHAR: string;
    static ESCAPE_CHAR: string;
    blocks: {[key: string]: Masked<any>}; // TODO
    definitions: MaskedPattern.Definitions;
    placeholderChar: string;
    lazy: boolean;
    // TODO state

    constructor (opts: any); // TODO
    maskedBlock (name: string): MaskedPattern.PatternBlock | undefined;
    maskedBlocks (name: string): Array<MaskedPattern.PatternBlock>;
  }
  namespace MaskedPattern {
    interface PatternBlock {
      readonly value: string;
      readonly unmaskedValue: string;
      readonly isComplete: boolean;
      readonly _appendPlaceholder?: (number?) => ChangeDetails;
      state: any;

      reset (): void;
      remove (fromPos?: number, toPos?: number): ChangeDetails;
      extractInput (fromPos?: number, toPos?: number, flags?: ExtractFlags): string;
      extractTail (fromPos?: number, toPos?: number): TailDetails;
      append (str: string, flags?: AppendFlags, tail?: TailDetails): ChangeDetails;
      appendTail (tail: string | TailDetails): ChangeDetails;
      _appendChar (str: string, flags: AppendFlags): ChangeDetails;
      doCommit (): void;
      nearestInputPos (cursorPos: number, direction: Direction): number;
    }
    type Definitions = {[key: string]: Mask};
    type PatternInputDefinitionOptions = {
      parent: Masked<any>,
      mask: Mask,
      isOptional?: boolean,
      lazy?: boolean,
      placeholderChar: string,
    };
    class InputDefinition implements PatternBlock {
      readonly masked: Masked<any>; // TODO
      readonly value: string;
      readonly unmaskedValue: string;
      readonly isComplete: boolean;
      state: any;
      parent: Masked<any>; // TODO
      isOptional: boolean;
      lazy: boolean;
      placeholderChar: string;

      constructor(opts: PatternInputDefinitionOptions);
      reset ();
      remove (fromPos?: number, toPos?: number): ChangeDetails;
      append (str: string, flags?: AppendFlags, tail?: string | TailDetails): ChangeDetails;
      extractInput (fromPos?: number, toPos?: number, flags?: ExtractFlags): string;
      nearestInputPos (cursorPos: number, direction?: Direction): number;
      extractTail (fromPos?: number, toPos?: number): TailDetails;
      appendTail (tail: string | TailDetails): ChangeDetails;
      _appendChar (str: string, flags: AppendFlags): ChangeDetails;
      doValidate (flags: AppendFlags): boolean;
      doCommit (): void;
    }
    type PatternFixedDefinitionOptions = {
      char: string,
      isUnmasking?: boolean,
    };
    class FixedDefinition implements PatternBlock {
      readonly value: string;
      readonly unmaskedValue: string;
      readonly isComplete: boolean;
      state: any;
      char: string;
      isUnmasking?: boolean;
      constructor(opts: PatternFixedDefinitionOptions);
      reset ();
      remove (fromPos?: number, toPos?: number): ChangeDetails;
      append (str: string, flags?: AppendFlags, tail?: string | TailDetails): ChangeDetails;
      extractInput (fromPos?: number, toPos?: number, flags?: ExtractFlags): string;
      nearestInputPos (cursorPos: number, direction?: Direction): number;
      extractTail (fromPos?: number, toPos?: number): TailDetails;
      appendTail (tail: string | TailDetails): ChangeDetails;
      _appendChar (str: string, flags: AppendFlags): ChangeDetails;
      doCommit (): void;
    }
  }

  export class MaskedEnum extends MaskedPattern {
    readonly enum: Array<string>;
  }

  export class MaskedRange extends MaskedPattern {
    readonly maxLength: number;
    readonly from: number;
    readonly to: number;
  }

  // TODO any
  export class MaskedNumber extends Masked<any> {
    static DEFAULTS: { [key: string]: any }; // TODO shape
    readonly radix: string;
    readonly thousandsSeparator: string;
    readonly mapToRadix: Array<string>;
    readonly min: number;
    readonly max: number;
    readonly scale: number;
    readonly signed: boolean;
    readonly normalizeZeros: boolean;
    readonly padFractionalZeros: boolean;
    readonly allowNegative: boolean;
    typedValue: number;
    number: number;

    constructor (opts: { [key: string]: any }); // TODO shape
  }

  export class MaskedDate extends MaskedPattern {
    static GET_DEFAULT_BLOCKS: () => {[key: string]: any};
    static DEFAULTS: any;
    readonly parse: (string) => Date;
    readonly format: (Date) => string;
    readonly pattern: string;
    readonly min?: Date;
    readonly max?: Date;
    date: Date;
    typedValue: Date;
    isDateExist (str: string): boolean;
  }

  export class MaskedRegExp extends Masked<RegExp> {}
  export class MaskedFunction extends Masked<Function> {}

  // TODO any
  export class MaskedDynamic extends Masked<Array<{[key: string]: any}>> {
    static DEFAULTS: any;
    readonly currentMask?: Masked<any>;
    readonly compiledMasks: Array<Masked<any>>;
    dispatch: (value: string, masked: Masked<any>, flags: AppendFlags) => Masked<any>;
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
