import IMask from 'imask';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export abstract class IMaskFactory {
    abstract create<Opts extends IMask.AnyMaskedOptions>(el: IMask.MaskElement | IMask.HTMLMaskingElement, opts: Opts): IMask.InputMask<Opts>
}
