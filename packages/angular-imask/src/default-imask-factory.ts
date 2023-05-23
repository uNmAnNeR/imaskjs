import IMask, { type InputMaskElement, type FactoryArg, type InputMask } from 'imask';
import { Injectable } from '@angular/core';
import { IMaskFactory } from './imask-factory';

@Injectable({ providedIn: 'root' })
export class DefaultImaskFactory implements IMaskFactory {
  create<Opts extends FactoryArg>(el: InputMaskElement, opts: Opts): InputMask<Opts> {
    return IMask(el, opts);
  }
}
