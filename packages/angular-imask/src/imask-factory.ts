import { Injectable } from '@angular/core';

import IMask from 'imask';


@Injectable({ providedIn: 'root' })
export abstract class IMaskFactory {
    abstract create<Opts extends IMask.AnyMaskedOptions>(el: IMask.MaskElement | IMask.HTMLMaskingElement, opts: Opts): IMask.InputMask<Opts>
}
