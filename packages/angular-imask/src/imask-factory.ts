import { Injectable } from '@angular/core';

type AnyMaskedOptions = import('imask').default.AnyMaskedOptions;
type HTMLMaskingElement = import('imask').default.HTMLMaskingElement;
type MaskElement = import('imask').default.MaskElement;
type InputMask<T> = import('imask').default.InputMask<T>;

@Injectable({providedIn: "root"})
export abstract class IMaskFactory {
    abstract create<Opts extends AnyMaskedOptions>(el: MaskElement | HTMLMaskingElement, opts: Opts): InputMask<Opts>
}
