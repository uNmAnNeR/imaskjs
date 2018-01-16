import IMask from 'imask';


export default {
  name: 'imask',
  bind (el, {value}) {
    if (!value) return;

    initMask(el, value);
  },
  update (el, {value}) {
    if (value) {
      if (el.maskRef) el.maskRef.updateOptions(value);
      else initMask(el, value);
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
