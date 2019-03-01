export type ElementEvent = 'selectionChange' | 'input' | 'drop' | 'click' | 'focus' | 'commit';

export class MaskElement {
    value: string;

    get selectionStart(): number;
    get selectionEnd(): number;
    get isActive(): boolean;

    select(start: number, end: number);
    bindEvents(handlers: {[prop: ElementEvent]: Function});
    unbindEvents(): void;
}

interface MaskOptions {
    mask: string | String | RegExp | Function | Class<Number> | Class<Date> | any[];
    prepare?: (value: string, masked: any) => string;
    validate?: (value: string, masked: any) => boolean;
    commit?: (value: string, masked: any) => void;
    scale: number;
    signed: boolean;
    thousandsSeparator: string;
    padFractionalZeros: boolean;
    normalizeZeros: boolean;
    radix: string;
    mapToRadix: string[];
    min: number;
    max: number;
}

export type Element = MaskElement | HTMLInputElement | HTMLTextAreaElement;

export class InputMask {
    el: MaskElement;
    masked: any; // ?

    constructor(el: Element, opts: MaskOptions)

    get mask(): any; // : Mask
    set mask(mask: any); // mask: Mask

    get value(): string;
    set value(str: string);

    get unmaskedValue(): string;
    set unmaskedValue(str: string);

    get typedValue(): any;
    set typedValue(val: any);

    get selectionStart(): number;

    get cursorPos(): number;
    set cursorPos(pos: number);

    updateValue(): void;
    updateControl(): void;
    updateOptions(opts: MaskOptions): void;
    updateCursor(cursorPos: number): void;
    alignCursor(): void;
    alignCursorFriendly(): void;

    on(ev: string, handler: Function): this;
    off(ev: string, handler: Function): this;

    destroy(): void;
}

export default class IMask extends InputMask {
    static InputMask = InputMask;
}
