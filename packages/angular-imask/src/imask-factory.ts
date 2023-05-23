import IMask, { type InputMaskElement, type InputMask, type FactoryArg } from 'imask';

export interface IMaskFactory {
    create<Opts extends FactoryArg>(el: InputMaskElement, opts: Opts): InputMask<Opts>
}
