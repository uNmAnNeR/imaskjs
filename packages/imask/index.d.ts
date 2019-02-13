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

interface Options {
    [key: string]: any;
}

export default class IMask {
    constructor(el: MaskElement | HTMLInputElement | HTMLTextAreaElement, options: Options)
}
