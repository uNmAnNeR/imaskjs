export as namespace IMask;
export default IMask;

declare function IMask<Opts extends IMask.AnyMaskedOptions>(
  el: IMask.MaskElement | IMask.HTMLMaskingElement,
  opts: Opts
): IMask.InputMask<Opts>;

declare namespace IMask {
  export type HTMLMaskingElement = HTMLElement;
  export type ElementEvent =
    | 'selectionChange'
    | 'input'
    | 'drop'
    | 'click'
    | 'focus'
    | 'commit';

  export class MaskElement {
    value: string;
    readonly selectionStart: number;
    readonly selectionEnd: number;
    readonly isActive: boolean;
    select(start: number, end: number): void;
    bindEvents(handlers: { [key in ElementEvent]: Function }): void;
    unbindEvents(): void;
  }

  export class HTMLMaskElement extends MaskElement {
    static EVENTS_MAP: { [key in ElementEvent]: string };
    input: HTMLMaskingElement;
    constructor (el: HTMLMaskingElement);
  }

  export class HTMLContenteditableMaskElement extends HTMLMaskElement {}

  type AppendFlags = {
    input?: boolean;
    tail?: boolean;
    raw?: boolean;
  };
  type ExtractFlags = {
    raw?: boolean;
  };
  type Direction = 'NONE' | 'LEFT' | 'FORCE_LEFT' | 'RIGHT' | 'FORCE_RIGHT';
  interface AppendTail {
    append(str: string, flags?: AppendFlags): ChangeDetails;
  }
  interface TailDetails {
    from: number;
    stop?: number;
    state: any;

    toString(): string;
    extend(value: string | TailDetails): void;
    appendTo(masked: AppendTail): ChangeDetails;
    shiftBefore(pos: number): string;
  }
  class ChangeDetails {
    inserted: string;
    skip: boolean;
    tailShift: number;
    rawInserted: string;
    readonly offset: number;

    constructor(details?: {
      inserted?: string;
      skip?: boolean;
      tailShift?: number;
      rawInserted?: string;
    });

    aggregate(details: ChangeDetails): ChangeDetails;
  }

  type BaseMaskedOptions<MaskType> = {
    mask: MaskType;
  } & Partial<
    Pick<
      Masked<MaskType>,
      'parent' | 'prepare' | 'validate' | 'commit' | 'overwrite' | 'eager'
    >
  >;
  type MaskedTypedValue<MaskType> = MaskType extends (typeof Number)
    ? number
    : MaskType extends (typeof Date)
    ? Date
    : string;
  export class Masked<MaskType> {
    mask: MaskType;
    state: any;
    value: string;
    unmaskedValue: string;
    typedValue: MaskedTypedValue<MaskType>;
    rawInputValue: string;
    readonly isComplete: boolean;
    parent?: AnyMasked;
    prepare: (
      value: string,
      masked: Masked<MaskType>,
      flags: AppendFlags,
    ) => string | [string, ChangeDetails];
    validate: (
      value: string,
      masked: Masked<MaskType>,
      flags: AppendFlags,
    ) => boolean;
    commit: (value: string, masked: Masked<MaskType>) => void;
    overwrite?: boolean | 'shift';
    eager?: boolean;
    isInitialized: boolean;

    constructor(opts: BaseMaskedOptions<MaskType>);
    updateOptions(opts: Partial<BaseMaskedOptions<MaskType>>): void;
    reset(): void;
    resolve(value: string): string;
    nearestInputPos(cursorPos: number, direction?: Direction): number;
    extractTail(fromPos?: number, toPos?: number): TailDetails;
    appendTail(tail: string | TailDetails): ChangeDetails;
    append(
      str: string,
      flags?: AppendFlags,
      tail?: string | TailDetails
    ): ChangeDetails;
    remove(fromPos?: number, toPos?: number): ChangeDetails;
    doPrepare(str: string, flags: AppendFlags): string | [string, ChangeDetails];
    doValidate(flags: AppendFlags): boolean;
    doCommit(): boolean;
    splice(
      start: number,
      deleteCount: number,
      inserted: string,
      removeDirection: Direction
    ): ChangeDetails;

    runIsolated<Result>(fn: (masked: Masked<MaskType>) => Result): Result;
  }
  interface AnyMasked extends Masked<AnyMask> {}

  type MaskedPatternOptions<MaskType=string> = BaseMaskedOptions<MaskType> &
    Partial<
      Pick<MaskedPattern<MaskType>, 'blocks' | 'definitions' | 'placeholderChar' | 'lazy'>
    >;
  type MaskedPatternOptionsDefaults<MaskType=string> = Pick<
    MaskedPattern<MaskType>,
    'lazy' | 'placeholderChar'
  >;
  export class MaskedPattern<MaskType=string> extends Masked<MaskType> {
    static DEFAULTS: MaskedPatternOptionsDefaults<string>;
    static STOP_CHAR: string;
    static ESCAPE_CHAR: string;
    blocks: { [key: string]: AnyMaskedOptions; };
    definitions: MaskedPattern.Definitions;
    placeholderChar: string;
    lazy: boolean;

    constructor(opts: MaskedPatternOptions<MaskType>);
    updateOptions(opts: Partial<MaskedPatternOptions<MaskType>>): void;
    maskedBlock(name: string): MaskedPattern.PatternBlock | undefined;
    maskedBlocks(name: string): Array<MaskedPattern.PatternBlock>;
  }
  namespace MaskedPattern {
    interface PatternBlock {
      readonly value: string;
      readonly unmaskedValue: string;
      readonly isComplete: boolean;
      readonly _appendPlaceholder?: (value?: number) => ChangeDetails;
      state: any;

      reset(): void;
      remove(fromPos?: number, toPos?: number): ChangeDetails;
      extractInput(
        fromPos?: number,
        toPos?: number,
        flags?: ExtractFlags
      ): string;
      extractTail(fromPos?: number, toPos?: number): TailDetails;
      append(
        str: string,
        flags?: AppendFlags,
        tail?: TailDetails
      ): ChangeDetails;
      appendTail(tail: string | TailDetails): ChangeDetails;
      _appendChar(str: string, flags: AppendFlags): ChangeDetails;
      doCommit(): void;
      nearestInputPos(cursorPos: number, direction: Direction): number;
    }
    type Definitions = { [key: string]: AnyMask };
    type PatternInputDefinitionOptions = {
      mask: AnyMask;
    } & Pick<
      InputDefinition,
      'parent' | 'isOptional' | 'lazy' | 'placeholderChar'
    >;
    class InputDefinition implements PatternBlock {
      readonly masked: AnyMasked;
      readonly value: string;
      readonly unmaskedValue: string;
      readonly isComplete: boolean;
      state: any;
      parent: AnyMasked;
      isOptional: boolean;
      lazy: boolean;
      placeholderChar: string;

      constructor(opts: PatternInputDefinitionOptions);
      reset(): void;
      remove(fromPos?: number, toPos?: number): ChangeDetails;
      append(
        str: string,
        flags?: AppendFlags,
        tail?: string | TailDetails
      ): ChangeDetails;
      extractInput(
        fromPos?: number,
        toPos?: number,
        flags?: ExtractFlags
      ): string;
      nearestInputPos(cursorPos: number, direction?: Direction): number;
      extractTail(fromPos?: number, toPos?: number): TailDetails;
      appendTail(tail: string | TailDetails): ChangeDetails;
      _appendChar(str: string, flags: AppendFlags): ChangeDetails;
      doValidate(flags: AppendFlags): boolean;
      doCommit(): void;
    }
    type PatternFixedDefinitionOptions = Pick<
      FixedDefinition,
      'char' | 'isUnmasking'
    >;
    class FixedDefinition implements PatternBlock {
      readonly value: string;
      readonly unmaskedValue: string;
      readonly isComplete: boolean;
      state: any;
      char: string;
      isUnmasking?: boolean;
      constructor(opts: PatternFixedDefinitionOptions);
      reset(): void;
      remove(fromPos?: number, toPos?: number): ChangeDetails;
      append(
        str: string,
        flags?: AppendFlags,
        tail?: string | TailDetails
      ): ChangeDetails;
      extractInput(
        fromPos?: number,
        toPos?: number,
        flags?: ExtractFlags
      ): string;
      nearestInputPos(cursorPos: number, direction?: Direction): number;
      extractTail(fromPos?: number, toPos?: number): TailDetails;
      appendTail(tail: string | TailDetails): ChangeDetails;
      _appendChar(str: string, flags: AppendFlags): ChangeDetails;
      doCommit(): void;
    }
  }

  type MaskedEnumOptions = MaskedPatternOptions &
    Partial<Pick<MaskedEnum, 'enum'>>;
  export class MaskedEnum extends MaskedPattern {
    readonly enum: Array<string>;

    constructor(opts: MaskedEnumOptions);
    updateOptions(opts: Partial<MaskedEnumOptions>): void;
  }

  type MaskedRangeOptions = MaskedPatternOptions &
    Partial<Pick<MaskedRange, 'maxLength' | 'from' | 'to' | 'autofix'>>;
  export class MaskedRange extends MaskedPattern {
    readonly maxLength: number;
    readonly from: number;
    readonly to: number;
    readonly autofix?: boolean | 'pad';

    constructor(opts: MaskedRangeOptions);
    updateOptions(opts: Partial<MaskedRangeOptions>): void;
  }

  type MaskedNumberOptions = BaseMaskedOptions<typeof Number> &
    Partial<
      Pick<
        MaskedNumber,
        | 'radix'
        | 'thousandsSeparator'
        | 'mapToRadix'
        | 'min'
        | 'max'
        | 'scale'
        | 'signed'
        | 'normalizeZeros'
        | 'padFractionalZeros'
      >
    >;
  export class MaskedNumber extends Masked<typeof Number> {
    static DEFAULTS: Pick<
      MaskedNumber,
      | 'radix'
      | 'thousandsSeparator'
      | 'mapToRadix'
      | 'scale'
      | 'signed'
      | 'normalizeZeros'
      | 'padFractionalZeros'
    >;
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
    number: number;

    constructor(opts: MaskedNumberOptions);
    updateOptions(opts: Partial<MaskedNumberOptions>): void;
  }

  type MaskedDateOptions = MaskedPatternOptions<typeof Date> &
    Partial<
      Pick<
        MaskedDate,
        'parse' | 'format' | 'pattern' | 'min' | 'max' | 'autofix'
      >
    >;
  export class MaskedDate extends MaskedPattern<typeof Date> {
    static GET_DEFAULT_BLOCKS: () => {
      d: {
        mask: typeof MaskedRange;
        from: number;
        to: number;
        maxLength: number;
      };
      m: {
        mask: typeof MaskedRange;
        from: number;
        to: number;
        maxLength: number;
      };
      Y: {
        mask: typeof MaskedRange;
        from: number;
        to: number;
      };
    };
    static DEFAULTS: MaskedPatternOptionsDefaults<typeof Date> &
      Pick<MaskedDate, 'pattern' | 'format' | 'parse'>;
    readonly parse: (value: string) => Date;
    readonly format: (value: Date) => string;
    readonly pattern: string;
    readonly min?: Date;
    readonly max?: Date;
    readonly autofix?: boolean | 'pad';
    date: Date;

    constructor(opts: MaskedDateOptions);
    updateOptions(opts: Partial<MaskedDateOptions>): void;
    isDateExist(str: string): boolean;
  }

  export class MaskedRegExp extends Masked<RegExp> {}
  export class MaskedFunction extends Masked<Function> {}

  type MaskedDynamicOptions = BaseMaskedOptions<AnyMaskedOptionsArray> &
    Partial<
      Pick<
        MaskedDynamic,
        | 'dispatch'
      >
    >;
  export class MaskedDynamic extends Masked<AnyMaskedOptionsArray> {
    static DEFAULTS: Pick<MaskedDynamic, 'dispatch'>;
    readonly currentMask?: AnyMasked;
    readonly compiledMasks: Array<AnyMasked>;
    dispatch: (
      value: string,
      masked: MaskedDynamic,
      flags: AppendFlags
    ) => AnyMasked;
    
    constructor(opts: MaskedDynamicOptions);
    updateOptions(opts: Partial<MaskedDynamicOptions>): void;
  }

  export type AnyMaskedOptions =
    | MaskedDateOptions
    | MaskedNumberOptions
    | MaskedPatternOptions
    | MaskedRangeOptions
    | MaskedDynamicOptions
    | BaseMaskedOptions<RegExp>
    | BaseMaskedOptions<Function>
    | BaseMaskedOptions<AnyMaskedOptionsArray>
    | BaseMaskedOptions<AnyMaskedOptionsMasked>
    | BaseMaskedOptions<MaskedFunction>
    | BaseMaskedOptions<MaskedRegExp>
    | BaseMaskedOptions<MaskedEnum>
    | BaseMaskedOptions<MaskedRange>
    | BaseMaskedOptions<typeof Masked>;

  export type AllMaskedOptions =
    & MaskedDateOptions
    & MaskedNumberOptions
    & MaskedPatternOptions
    & MaskedDynamicOptions
    & BaseMaskedOptions<RegExp>
    & BaseMaskedOptions<Function>
    & BaseMaskedOptions<AnyMaskedOptionsArray>
    & BaseMaskedOptions<AnyMaskedOptionsMasked>
    & BaseMaskedOptions<MaskedFunction>
    & BaseMaskedOptions<MaskedRegExp>
    & BaseMaskedOptions<MaskedEnum>
    & BaseMaskedOptions<MaskedRange>
    & BaseMaskedOptions<typeof Masked>;
  interface AnyMaskedOptionsArray extends Array<AnyMaskedOptions> {}
  interface AnyMaskedOptionsMasked extends Masked<AnyMaskedOptions> {}

  type DeduceMasked<Opts> =
    Opts extends AnyMasked
      ? Opts
      : Opts extends AnyMaskedOptions
        ? Opts extends MaskedPatternOptions
          ? MaskedPattern
          : Opts extends MaskedDateOptions
          ? MaskedDate
          : Opts extends MaskedNumberOptions
          ? MaskedNumber
          : Opts extends BaseMaskedOptions<RegExp>
          ? MaskedRegExp
          : Opts extends BaseMaskedOptions<Function>
          ? MaskedFunction
          : Opts extends BaseMaskedOptions<AnyMaskedOptionsArray>
          ? MaskedDynamic
          : Masked<Opts['mask']>
        : never;
  export function createMask<Opts extends AnyMaskedOptions>(
    opts: Opts
  ): DeduceMasked<Opts>;
  export function createMask<T extends AnyMasked>(masked: T): T;

  export type AnyMask = AnyMaskedOptions['mask'];
  export class InputMask<Opts extends (AnyMasked | AnyMaskedOptions)> {
    el: MaskElement;
    masked: DeduceMasked<Opts>;
    mask: Opts['mask'];
    value: string;
    unmaskedValue: string;
    typedValue: MaskedTypedValue<Opts['mask']>;
    cursorPos: number;
    readonly selectionStart: number;

    constructor(el: MaskElement | HTMLMaskingElement, opts: Opts);

    alignCursor(): void;
    alignCursorFriendly(): void;
    updateValue(): void;
    updateControl(): void;
    updateOptions(opts: Partial<AnyMaskedOptions>): void;
    updateCursor(cursorPos: number): void;
    on(ev: string, handler: Function): this;
    off(ev: string, handler?: Function): this;
    destroy(): void;
  }

  export
  const PIPE_TYPE: {
    MASKED: 'value',
    UNMASKED: 'unmaskedValue',
    TYPED: 'typedValue',
  };

  type PIPE_TYPE_VALUES = typeof PIPE_TYPE[keyof typeof PIPE_TYPE];
  export function createPipe(masked: AnyMasked | AnyMaskedOptions, from?: PIPE_TYPE_VALUES, to?: PIPE_TYPE_VALUES): any;
  export function pipe(value: any, masked: AnyMasked | AnyMaskedOptions, from?: PIPE_TYPE_VALUES, to?: PIPE_TYPE_VALUES): any;
}

export import InputMask = IMask.InputMask;
export import Masked = IMask.Masked;
export import MaskedPattern = IMask.MaskedPattern;
export import MaskedEnum = IMask.MaskedEnum;
export import MaskedRange = IMask.MaskedRange;
export import MaskedNumber = IMask.MaskedNumber;
export import MaskedDate = IMask.MaskedDate;
export import MaskedRegExp = IMask.MaskedRegExp;
export import MaskedFunction = IMask.MaskedFunction;
export import MaskedDynamic = IMask.MaskedDynamic;
export import createMask = IMask.createMask;
export import MaskElement = IMask.MaskElement;
export import HTMLMaskElement = IMask.HTMLMaskElement;
export import HTMLContenteditableMaskElement = IMask.HTMLContenteditableMaskElement;
export import pipe = IMask.pipe;
export import createPipe = IMask.createPipe;
export import PIPE_TYPE = IMask.PIPE_TYPE;
export import AnyMaskedOptions = IMask.AnyMaskedOptions;
