import IMask, { type InputMask, type InputMaskElement, type FactoryOpts } from 'imask';
import { useEffect, useCallback, useState, useRef, Dispatch } from 'react';
import type { MutableRefObject } from 'react';


export default
function useIMask<
  MaskElement extends InputMaskElement,
  Opts extends FactoryOpts=FactoryOpts,
>(
  opts: Opts,
  {
    onAccept,
    onComplete,
    ref=useRef<MaskElement | null>(null),
    defaultValue,
    defaultUnmaskedValue,
    defaultTypedValue,
  }: {
    ref?: MutableRefObject<MaskElement | null>,
    onAccept?: (value: InputMask<Opts>['value'], maskRef: InputMask<Opts>, e?: InputEvent) => void;
    onComplete?: (value: InputMask<Opts>['value'], maskRef: InputMask<Opts>, e?: InputEvent) => void;
    defaultValue?: InputMask<Opts>['value'],
    defaultUnmaskedValue?: InputMask<Opts>['unmaskedValue'],
    defaultTypedValue?: InputMask<Opts>['typedValue'],
  } = {}
): {
  ref: MutableRefObject<MaskElement | null>,
  maskRef: MutableRefObject<InputMask<Opts> | null>,
  value: InputMask<Opts>['value'],
  setValue: Dispatch<InputMask<Opts>['value']>,
  unmaskedValue: InputMask<Opts>['unmaskedValue'],
  setUnmaskedValue: Dispatch<InputMask<Opts>['unmaskedValue']>,
  typedValue: InputMask<Opts>['typedValue'],
  setTypedValue: Dispatch<InputMask<Opts>['typedValue']>,
} {
  const maskRef = useRef<InputMask<Opts> | null>(null);
  const [lastAcceptState, setLastAcceptState] = useState<{
    value?: InputMask<Opts>['value'],
    unmaskedValue?: InputMask<Opts>['unmaskedValue'],
    typedValue?: InputMask<Opts>['typedValue'],
  }>({});
  const [value, setValue] = useState<InputMask<Opts>['value']>('');
  const [unmaskedValue, setUnmaskedValue] = useState<InputMask<Opts>['unmaskedValue']>('');
  const [typedValue, setTypedValue] = useState<InputMask<Opts>['typedValue']>();

  const _destroyMask = useCallback(() => {
    maskRef.current?.destroy();
    maskRef.current = null;
  }, []);

  const storeLastAcceptedValues = useCallback(() => {
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
  }, []);

  const _onAccept = useCallback(
    (event?: InputEvent) => {
      const m = maskRef.current;
      if (!m) return;

      storeLastAcceptedValues();

      onAccept?.(m.value, m, event);
    }, [onAccept]);

  const _onComplete = useCallback(
    (event?: InputEvent) => maskRef.current && onComplete?.(maskRef.current.value, maskRef.current, event),
    [onComplete],
  );

  useEffect(() => {
    const { value: lastAcceptValue, ...state } = lastAcceptState;
    const mask = maskRef.current;

    if (!mask || value === undefined) return;

    if (lastAcceptValue !== value) {
      mask.value = value;
      if (mask.value !== value) _onAccept();
    }
    setLastAcceptState(state);
  }, [value]);

  useEffect(() => {
    const { unmaskedValue: lastAcceptUnmaskedValue, ...state } = lastAcceptState;
    const mask = maskRef.current;

    if (!mask || unmaskedValue === undefined) return;

    if (lastAcceptUnmaskedValue !== unmaskedValue) {
      mask.unmaskedValue = unmaskedValue;
      if (mask.unmaskedValue !== unmaskedValue) _onAccept();
    }
    setLastAcceptState(state);
  }, [unmaskedValue]);

  useEffect(() => {
    const { typedValue: lastAcceptTypedValue, ...state } = lastAcceptState;
    const mask = maskRef.current;

    if (!mask || typedValue === undefined) return;

    if (lastAcceptTypedValue !== typedValue) {
      mask.typedValue = typedValue;
      if (!mask.masked.typedValueEquals(typedValue)) _onAccept();
    }
    setLastAcceptState(state);
  }, [typedValue]);

  useEffect(() => {
    const el = ref.current;

    if (!el || !opts?.mask) return _destroyMask();

    const mask = maskRef.current;

    if (!mask) {
      if (el && opts?.mask) {
        maskRef.current = IMask(el, opts);
        storeLastAcceptedValues();

        if (defaultValue !== undefined) setValue(defaultValue);
        if (defaultUnmaskedValue !== undefined) setUnmaskedValue(defaultUnmaskedValue);
        if (defaultTypedValue !== undefined) setTypedValue(defaultTypedValue);
      }
    } else {
      mask?.updateOptions(opts as any); // TODO fix no idea
    }
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

  useEffect(() => _destroyMask, [_destroyMask]);

  return {
    ref,
    maskRef,
    value, setValue,
    unmaskedValue, setUnmaskedValue,
    typedValue, setTypedValue,
  };
}
