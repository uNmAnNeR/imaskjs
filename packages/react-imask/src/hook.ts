import IMask from 'imask';
import { useEffect, useRef } from 'react';


export default
function useIMask (opts: IMask.AnyMaskedOptions, { onAccept, onComplete }: { onAccept?: () => void, onComplete?: () => void } = {}) {
  const ref = useRef(null);
  const maskRef = useRef(null);

  // methods
  function _initMask () {
    const el = ref.current;

    if (!el || !opts?.mask) return;

    maskRef.current = IMask(el, opts)
      .on('accept', _onAccept)
      .on('complete', _onComplete);

    if (el.defaultValue !== maskRef.current.value) {
      _onAccept();
    }
  }

  function _destroyMask () {
    if (maskRef.current) {
      maskRef.current.destroy();
      maskRef.current = null;
    }
  }

  function _onAccept () {
    if (onAccept) onAccept();
  }

  function _onComplete () {
    if (onComplete) onComplete();
  }


  // lifecycle
  useEffect(() => {
    const el = ref.current;
    if (!el || !opts?.mask) return _destroyMask();

    const mask = maskRef.current;
    if (!mask) {
      _initMask();
    } else {
      mask.updateOptions(opts);
    }
  }, [opts]);

  useEffect(() => _destroyMask, []);


  return {
    ref, maskRef,
  };
}
