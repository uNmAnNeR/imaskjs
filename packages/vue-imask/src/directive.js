import IMask from 'imask';
import { isVue3 } from 'vue-demi';


export default {
  name: 'imask',

  [isVue3 ? 'beforeMount' : 'bind']: (el, {value: options}) => {
    if (!options) return;

    initMask(el, options);
  },

  [isVue3 ? 'updated' : 'update']: (el, {value: options}) => {
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

  [isVue3 ? 'unmounted' : 'unbind']: (el) => {
    destroyMask(el);
  }
};

function fireEvent (el, eventName, data) {
  var e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, true, true, data);
  el.dispatchEvent(e);
}

function initMask (el, opts) {
  el.maskRef = IMask(el, opts)
    .on('accept', () => fireEvent(el, 'accept', el.maskRef))
    .on('complete', () => fireEvent(el, 'complete', el.maskRef));
}

function destroyMask (el) {
  if (el.maskRef) {
    el.maskRef.destroy();
    delete el.maskRef;
  }
}
