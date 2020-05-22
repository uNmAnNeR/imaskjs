import IMask from 'imask/esm/imask';
// add needed features
import 'imask/esm/masked/number';
import { IMaskFactory } from "angular-imask";
import { Injectable } from '@angular/core';

@Injectable()
export class NumberIMaskFactory extends IMaskFactory{
    create<Opts extends IMask.AnyMaskedOptions>(
        el: IMask.HTMLMaskingElement | IMask.MaskElement, opts: Opts): IMask.InputMask<Opts> {
        return IMask(el, opts);
    }
}