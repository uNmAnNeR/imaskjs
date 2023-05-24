import IMask from 'imask';
import { useEffect, useCallback, useState, useRef, Dispatch } from 'react';
import type { MutableRefObject } from 'react';
import type { ReactMaskProps, ReactElement } from './mixin';


export default
function useIMask<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  MaskElement extends ReactElement=HTMLInputElement,
>(
  opts: Opts,
  { onAccept, onComplete }: Partial<Pick<ReactMaskProps<Opts, true, IMask.InputMask<Opts>['value'], MaskElement>, 'onAccept' | 'onComplete'>> = {}
): {
  ref: MutableRefObject<MaskElement>,
  maskRef: MutableRefObject<IMask.InputMask<Opts>>,
  value: IMask.InputMask<Opts>['value'],
  setValue: Dispatch<IMask.InputMask<Opts>['value']>,
  unmaskedValue: IMask.InputMask<Opts>['unmaskedValue'],
  setUnmaskedValue: Dispatch<IMask.InputMask<Opts>['unmaskedValue']>,
  typedValue: IMask.InputMask<Opts>['typedValue'],
  setTypedValue: Dispatch<IMask.InputMask<Opts>['typedValue']>,
} {
  const ref = useRef<MaskElement>(null);
  const maskRef = useRef<IMask.InputMask<Opts>>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [lastAcceptState, setLastAcceptState] = useState<{
    value?: IMask.InputMask<Opts>['value'],
    unmaskedValue?: IMask.InputMask<Opts>['unmaskedValue'],
    typedValue?: IMask.InputMask<Opts>['typedValue'],
  }>({});
  const [value, setValue] = useState<IMask.InputMask<Opts>['value']>('');
  const [unmaskedValue, setUnmaskedValue] = useState<IMask.InputMask<Opts>['unmaskedValue']>('');
  const [typedValue, setTypedValue] = useState<IMask.InputMask<Opts>['typedValue']>();

  const _destroyMask = useCallback(() => {
    maskRef.current?.destroy();
    maskRef.current = null;
  }, []);

  const _onAccept = useCallback(
    (event?: InputEvent) => {
      const m = maskRef.current;
      if (!m) return;

      setLastAcceptState({
        value: m.value,
        unmaskedValue: m.unmaskedValue,
        typedValue: m.typedValue,
      });
      setTypedValue(m.typedValue);
      setUnmaskedValue(m.unmaskedValue);
      setValue(m.value);
      onAccept?.(m.value, m, event);
    },
    [onAccept],
  );

  const _onComplete = useCallback(
    () => maskRef.current && onComplete?.(maskRef.current.value, maskRef.current),
    [onComplete],
  );

  useEffect(() => {
    const el = ref.current;

    if (!el || !opts?.mask) return _destroyMask();

    const mask = maskRef.current;

    if (!mask) {
      if (el && opts?.mask) {
        maskRef.current = IMask(el, opts);
        _onAccept();
      }
    } else {
      mask?.updateOptions(opts);
    }
    setInitialized(Boolean(maskRef.current));
  }, [opts, _destroyMask, _onAccept]);

  useEffect(() => {
    if (!maskRef.current) return;

    const mask = maskRef.current;

    mask.on('accept', _onAccept);
    mask.on('complete', _onComplete);

    return () => {
      mask.off('accept', _onAccept);
      mask.off('complete', _onComplete);
    };
  }, [_onAccept, _onComplete]);

  useEffect(() => {
    const { value: lastAcceptValue, ...state } = lastAcceptState;
    const mask = maskRef.current;
    if (mask && initialized && lastAcceptValue !== value) mask.value = value;
    setLastAcceptState(state);
  }, [value]);

  useEffect(() => {
    const { unmaskedValue: lastAcceptUnmaskedValue, ...state } = lastAcceptState;
    const mask = maskRef.current;
    if (mask && initialized && lastAcceptUnmaskedValue !== unmaskedValue) mask.unmaskedValue = unmaskedValue;
    setLastAcceptState(state);
  }, [unmaskedValue]);

  useEffect(() => {
    const { typedValue: lastAcceptTypedValue, ...state } = lastAcceptState;
    const mask = maskRef.current;
    if (mask && initialized && lastAcceptTypedValue !== typedValue) mask.typedValue = typedValue;
    setLastAcceptState(state);
  }, [typedValue]);

  useEffect(() => _destroyMask, [_destroyMask]);

  return {
    ref,
    maskRef,
    value, setValue,
    unmaskedValue, setUnmaskedValue,
    typedValue, setTypedValue,
  };
}
