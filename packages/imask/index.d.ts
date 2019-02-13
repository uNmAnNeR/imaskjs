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

export type Element = MaskElement | HTMLInputElement | HTMLTextAreaElement;

interface MaskOptions {
    [key: string]: any;
}

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

    updateValue();
    updateControl();
    updateOptions(opts: MaskOptions);
    updateCursor(cursorPos: number);
    alignCursor();
    alignCursorFriendly();

    on(ev: string, handler: Function): this;
    off(ev: string, handler: Function): undefined | this;

    destroy();
}

export default class IMask extends InputMask {
    static InputMask = InputMask;
}
