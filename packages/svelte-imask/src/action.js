import IMask from 'imask/esm/imask';


function fireEvent (el, eventName, data) {
  var e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, true, true, data);
  el.dispatchEvent(e);
}

function initMask (el, opts) {
  const maskRef = (opts instanceof IMask.InputMask ? opts : IMask(el, opts));
  return maskRef
    .on('accept', () => fireEvent(el, 'accept', maskRef))
    .on('complete', () => fireEvent(el, 'complete', maskRef));
}


export default
function IMaskAction (el, options) {
  let maskRef = options && initMask(el, options);

  function destroy () {
    if (maskRef) {
      maskRef.destroy();
      maskRef = undefined;
    }
  }

  function update (options) {
    if (options) {
      if (maskRef) {
        if (options instanceof IMask.InputMask) maskRef = options;
        else maskRef.updateOptions(options);
      }
      else maskRef = initMask(el, options);
    } else {
      destroy();
    }
  }

  return {
    update,
    destroy,
  };
}
