import IMask from 'imask';
import { useEffect, useState, useRef } from 'react';


export default
function useIMask (opts, { onAccept, onComplete } = {}) {
  const ref = useRef(null);
  const maskRef = useRef(null);
  const [value, setValue] = useState('');
  const [unmaskedValue, setUnmaskedValue] = useState('');
  const [typedValue, setTypedValue] = useState('');


  // methods
  function _initMask () {
    const el = ref.current;

    if (!el || !opts?.mask) return;

    maskRef.current = IMask(el, opts)
      .on('accept', _onAccept)
      .on('complete', _onComplete);

    _onAccept();
  }

  function _destroyMask () {
    if (maskRef.current) {
      maskRef.current.destroy();
      maskRef.current = null;
    }
  }

  function _onAccept () {
    setTypedValue(maskRef.current.typedValue);
    setUnmaskedValue(maskRef.current.unmaskedValue);
    setValue(maskRef.current.value);

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

  useEffect(() => {
    const mask = maskRef.current;
    if (mask && mask.value !== value) {
      mask.value = value;
    }
  }, [value]);

  useEffect(() => {
    const mask = maskRef.current;
    if (mask && mask.unmaskedValue !== unmaskedValue) {
      mask.unmaskedValue = unmaskedValue;
    }
  }, [unmaskedValue]);

  useEffect(() => {
    const mask = maskRef.current;
    if (mask) mask.typedValue = typedValue;
  }, [typedValue]);

  useEffect(() => _destroyMask, []);


  return {
    ref, maskRef,
    value, setValue,
    unmaskedValue, setUnmaskedValue,
    typedValue, setTypedValue,
  };
}
