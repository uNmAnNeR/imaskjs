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

  function _initMask () {
    $el = el.value;
    const $props = props.value;

    if (!$el || !$props?.mask) return;

    mask.value = IMask($el, $props)
      .on('accept', _onAccept)
      .on('complete', _onComplete);

    _onAccept();
  }

  function _destroyMask () {
    if (mask.value) {
      mask.value.destroy();
      mask.value = null;
    }
  }

  onMounted(_initMask);
  onUnmounted(_destroyMask);

  watch(unmasked, () => {
    if (mask.value) $unmasked = mask.value.unmaskedValue = unmasked.value;
  });

  watch(masked, () => {
    if (mask.value) $masked = mask.value.value = masked.value;
  });

  watch(typed, () => {
    if (mask.value) $typed = mask.value.typedValue = typed.value;
  });

  watch([el, props], () => {
    const $newEl = el.value;
    const $props = props.value;

    if (!$props?.mask || $newEl !== $el) _destroyMask();
    if ($newEl) {
      if (!mask.value) {
        _initMask();
      } else {
        mask.value.updateOptions($props);
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
