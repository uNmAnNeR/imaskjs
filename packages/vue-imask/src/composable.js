import { ref, readonly, isRef, watch, onMounted, onUnmounted } from 'vue-demi';
import IMask from 'imask';


export default
function useIMask (props, { emit, onAccept, onComplete }={}) {
  props = isRef(props) ? props : ref(props);
  const el = ref();
  const mask = ref();
  const masked = ref();
  const unmasked = ref();
  const typed = ref();
  let $el;
  let $masked;
  let $unmasked;
  let $typed;

  function _onAccept () {
    $typed = typed.value = mask.value.typedValue;
    $unmasked = unmasked.value = mask.value.unmaskedValue;
    $masked = masked.value = mask.value.value;

    if (emit) {
      emit('accept', $masked);
      emit('accept:masked', $masked);
      emit('accept:typed', $typed);
      emit('accept:unmasked', $unmasked);
    }
    if (onAccept) onAccept();
  }

  function _onComplete () {
    if (emit) {
      emit('complete', $masked);
      emit('complete:masked', $masked);
      emit('complete:typed', $typed);
      emit('complete:unmasked', $unmasked);
    }
    if (onComplete) onComplete();
  }

  function _updateValue () {
    const [cref, mprop] = _getMaskProps();

    console.log(mprop, mask.value[mprop], cref.value);
    mask.value[mprop] = cref.value == null ? '' : cref.value;
    if (cref.value !== mask.value[mprop]) _onAccept();
  }

  function _initMask () {
    $el = el.value;
    const $props = props.value;

    if (!$el || !$props || !$props.mask) return;

    mask.value = IMask($el, $props)
      .on('accept', _onAccept)
      .on('complete', _onComplete);

    _updateValue();
  }

  function _getComponentMaskProp () {
    return [typed, unmasked, masked].find(ref => ref.value != null) || masked;
  }

  function _getMaskPropFromComponent (cref) {
    switch (cref) {
      case unmasked: return 'unmaskedValue';
      case typed: return 'typedValue';
      default: return 'value';
    }
  }

  function _getMaskProps () {
    const cref = _getComponentMaskProp();
    return [cref, _getMaskPropFromComponent(cref)];
  }

  function _destroyMask () {
    if (mask.value) {
      mask.value.destroy();
      mask.value = null;
    }
  }

  onMounted(_initMask);
  onUnmounted(_destroyMask);

  function log (tag) {
    console.log(tag, { el: el.value, value: masked.value, props: props.value });
  }

  watch(unmasked, () => {
    if (mask.value && $unmasked !== unmasked.value) {
      $unmasked = mask.value.unmaskedValue = unmasked.value;
    }
  });

  watch(masked, () => {
    if (mask.value && $masked !== masked.value) {
      $masked = mask.value.value = masked.value;
    }
  });

  watch(typed, () => {
    if (mask.value && $typed !== typed.value) {
      $typed = mask.value.typedValue = typed.value;
    }
  });

  watch([el, props], () => {
    const $newEl = el.value;
    const $props = props.value;

    if (!$props || !$props.mask || $newEl !== $el) _destroyMask();
    if ($newEl) {
      const $mask = mask.value;
      if (!$mask) {
        _initMask();
      } else {
        $mask.updateOptions($props);

        const [cref, mprop] = _getMaskProps();
        const $cval = cref.value;

        if ($cval !== $mask[mprop] ||
          // handle cases like Number('') === 0,
          // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
          typeof $cval !== 'string' && $mask.value === '' && !$mask.el.isActive
        ) {
          _updateValue();
        }
      }
    }
  });

  return {
    el,
    mask: readonly(mask),
    masked,
    unmasked,
    typed,
  };
}
