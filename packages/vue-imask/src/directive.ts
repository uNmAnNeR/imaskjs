import IMask, { type InputElement, type InputMask, type FactoryArg } from 'imask';
import { isVue3 } from 'vue-demi';


type DirectiveMaskElement<Opts> = InputElement & { maskRef?: InputMask<Opts> }

export default {
  name: 'imask',

  [isVue3 ? 'beforeMount' : 'bind']: <Opts extends FactoryArg>(el: DirectiveMaskElement<Opts>, { value: options }: { value: Opts }) => {
    if (!options) return;

    initMask(el, options);
  },

  [isVue3 ? 'updated' : 'update']: <Opts extends FactoryArg>(el: DirectiveMaskElement<Opts>, { value: options }: { value: Opts }) => {
    if (options) {
      if (el.maskRef) {
        el.maskRef.updateOptions(options);
        if (el.value !== el.maskRef.value) el.maskRef._onChange();
      }
      else initMask(el, options);
    } else {
      destroyMask(el);
    }
  },

  [isVue3 ? 'unmounted' : 'unbind']: <Opts extends FactoryArg>(el: DirectiveMaskElement<Opts>) => {
    destroyMask(el);
  }
};

function fireEvent<Opts extends FactoryArg> (el: DirectiveMaskElement<Opts>, eventName: string, data: InputMask<Opts>) {
  const e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, true, true, data);
  el.dispatchEvent(e);
}

function initMask<Opts extends FactoryArg> (el: DirectiveMaskElement<Opts>, opts: Opts) {
  el.maskRef = IMask(el, opts)
    .on('accept', () => fireEvent(el, 'accept', el.maskRef))
    .on('complete', () => fireEvent(el, 'complete', el.maskRef));
}

function destroyMask <Opts extends FactoryArg>(el: DirectiveMaskElement<Opts>) {
  if (el.maskRef) {
    el.maskRef.destroy();
    delete el.maskRef;
  }
}
