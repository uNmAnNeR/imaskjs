import IMask from 'imask/esm/imask';


function fireEvent (el, eventName, data) {
  var e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, true, true, data);
  el.dispatchEvent(e);
}

function initMask (el, opts) {
  return IMask(el, opts)
    .on('accept', () => fireEvent(el, 'accept', maskRef))
    .on('complete', () => fireEvent(el, 'complete', maskRef));
}


export default
function IMaskAction (el, options) {
  let maskRef = initMask(el, options);

  function destroy () {
    if (maskRef) {
      maskRef.destroy();
      maskRef = null;
    }
  }

  function update (options) {
    if (options) {
      if (maskRef) maskRef.updateOptions(options);
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
