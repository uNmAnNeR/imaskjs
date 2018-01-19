import IMask from 'imask';


export
const IMaskDirective = {
  name: 'imask',

  bind (el, {value: options}) {
    if (!options) return;

    initMask(el, options);
  },

  update (el, {value: options}) {
    if (options) {
      if (el.maskRef) el.maskRef.updateOptions(options);
      else initMask(el, options);
    } else {
      destroyMask(el);
    }
  },

  unbind (el) {
    destroyMask(el);
  }
};


function fireEvent (el, eventName, data) {
  var e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, true, true, data);
  el.dispatchEvent(e);
}

function initMask (el, opts) {
  el.maskRef = new IMask(el, opts)
    .on('accept', () => {
      fireEvent(el, 'accept', el.maskRef);
    })
    .on('complete', () => {
      fireEvent(el, 'complete', el.maskRef);
    });
}

function destroyMask (el) {
  if (el.maskRef) {
    el.maskRef.destroy();
    delete el.maskRef;
  }
}
