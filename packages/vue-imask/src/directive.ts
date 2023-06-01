import IMask, { type InputElement, type InputMask, type FactoryArg } from 'imask';
import { isVue3 } from 'vue-demi';


type DirectiveMaskElement = InputElement & { maskRef?: InputMask<FactoryArg> }

export default {
  name: 'imask',

  [isVue3 ? 'beforeMount' : 'bind']: (el: DirectiveMaskElement, { value: options }: { value: FactoryArg }) => {
    if (!options) return;

    initMask(el, options);
  },

  [isVue3 ? 'updated' : 'update']: (el: DirectiveMaskElement, { value: options }: { value: FactoryArg }) => {
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

  [isVue3 ? 'unmounted' : 'unbind']: (el: DirectiveMaskElement) => {
    destroyMask(el);
  }
};

function fireEvent (el: DirectiveMaskElement, eventName: string, data: any) {
  var e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, true, true, data);
  el.dispatchEvent(e);
}

function initMask (el: DirectiveMaskElement, opts: FactoryArg) {
  el.maskRef = IMask(el, opts)
    .on('accept', () => fireEvent(el, 'accept', el.maskRef))
    .on('complete', () => fireEvent(el, 'complete', el.maskRef));
}

function destroyMask (el: DirectiveMaskElement) {
  if (el.maskRef) {
    el.maskRef.destroy();
    delete el.maskRef;
  }
}
