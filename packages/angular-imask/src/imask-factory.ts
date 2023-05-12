import IMask, { type MaskElement, type InputMask } from 'imask';

export interface IMaskFactory {
    create<Opts extends IMask.AnyMaskedOptions>(el: MaskElement | HTMLElement, opts: Opts): InputMask<Opts>
}
