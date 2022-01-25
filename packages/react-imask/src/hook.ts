import IMask from 'imask';
import { useEffect, useCallback, useRef } from 'react';
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

  const destroyMask = useCallback(() => {
    maskRef.current?.destroy();
    maskRef.current = null;
  }, []);

  const handleOnAccept = useCallback(
    (event?: InputEvent) => maskRef.current && onAccept?.(maskRef.current.value, maskRef.current, event),
    [onAccept],
  );

  const handleOnComplete = useCallback(
    () => maskRef.current && onComplete?.(maskRef.current.value, maskRef.current),
    [onComplete],
  );

  useEffect(() => {
    const el = ref.current;

    if (!el || !opts?.mask) return destroyMask();

    const mask = maskRef.current;

    if (!mask && el && opts?.mask) {
      maskRef.current = IMask(el, opts);

      if (el.defaultValue !== maskRef.current.value) {
        handleOnAccept();
      }
    } else {
      mask?.updateOptions(opts);
    }
  }, [opts, destroyMask, handleOnAccept]);

  useEffect(() => {
    if (!maskRef.current) return;

    const mask = maskRef.current;

    mask.on('accept', handleOnAccept);
    mask.on('complete', handleOnComplete);

    return () => {
      mask.off('accept', handleOnAccept);
      mask.off('complete', handleOnComplete);
    };
  }, [handleOnAccept, handleOnComplete]);

  useEffect(() => destroyMask, [destroyMask]);

  return {
    ref,
    maskRef,
  };
}
