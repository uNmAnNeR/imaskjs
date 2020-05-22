import { IMaskFactory } from "./imask-factory";
import IMask from 'imask';
import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class DefaultImaskFactory implements IMaskFactory {
    create<Opts extends IMask.AnyMaskedOptions>(el: IMask.MaskElement | IMask.HTMLMaskingElement, opts: Opts) {
        return IMask(el, opts);
    }
}