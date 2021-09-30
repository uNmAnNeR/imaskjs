import IMask from 'imask';
import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { ReactMaskProps, MaskedElement, Falsy } from './mixin';


export default
function useIMask<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue']
>(
  opts: Opts,
  { onAccept, onComplete }: Pick<ReactMaskProps<Opts, Unmask, Value>, 'onAccept' | 'onComplete'> = {}
): {
  ref: MutableRefObject<MaskedElement>,
  maskRef: MutableRefObject<IMask.InputMask<Opts>>,
} {
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

  function _onAccept (event?: InputEvent) {
    if (onAccept) onAccept(maskRef.current.value, maskRef.current, event);
  }

  function _onComplete () {
    if (onComplete) onComplete(maskRef.current.value, maskRef.current);
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
