import IMask from 'imask';

export interface IMaskFactory {
    create<Opts extends IMask.AnyMaskedOptions>(el: IMask.MaskElement | IMask.HTMLMaskingElement, opts: Opts): IMask.InputMask<Opts>
}
