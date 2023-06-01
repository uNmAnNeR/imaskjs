import { ref, readonly, isRef, watch, onMounted, onUnmounted, type DeepReadonly, type Ref } from 'vue-demi';
import IMask, { type FactoryOpts, type InputMaskElement, type InputMask } from 'imask';

export
type ComposableEmitEventBase = 'accept' | 'complete';

export
type ComposableEmitEvent = ComposableEmitEventBase | `${ComposableEmitEventBase}:masked` | `${ComposableEmitEventBase}:typed` | `${ComposableEmitEventBase}:unmasked`;

export
type ComposableEmitValue<E extends ComposableEmitEvent, Opts extends FactoryOpts> =
  E extends ComposableEmitEventBase | `${ComposableEmitEventBase}:masked` ? InputMask<Opts>['value'] :
  E extends `${ComposableEmitEventBase}:unmasked` ? InputMask<Opts>['unmaskedValue'] :
  E extends `${ComposableEmitEventBase}:typed` ? InputMask<Opts>['typedValue'] :
  never
;

export
type ComposableParams<Opts extends FactoryOpts> = {
  emit?: <E extends ComposableEmitEvent>(eventName: E, value: ComposableEmitValue<E, Opts>) => void,
  onAccept?: () => void,
  onComplete?: () => void,
}

export default
function useIMask<
  MaskElement extends InputMaskElement,
  Opts extends FactoryOpts
> (props: Opts | Ref<Opts>, { emit, onAccept, onComplete }: ComposableParams<Opts>={}): {
  el: Ref<MaskElement>,
  mask: DeepReadonly<Ref<InputMask<Opts>>>,
  masked: Ref<InputMask<Opts>['value']>,
  unmasked: Ref<InputMask<Opts>['unmaskedValue']>,
  typed: Ref<InputMask<Opts>['typedValue']>,
} {
  const _props = isRef(props) ? props : ref(props);
  const el: Ref<MaskElement> = ref();
  const mask: Ref<InputMask<Opts>> = ref();
  const masked: Ref<InputMask<Opts>['value']> = ref();
  const unmasked: Ref<InputMask<Opts>['unmaskedValue']> = ref();
  const typed: Ref<InputMask<Opts>['typedValue']> = ref();
  let $el: MaskElement;
  let $masked: InputMask<Opts>['value'];
  let $unmasked: InputMask<Opts>['unmaskedValue'];
  let $typed: InputMask<Opts>['typedValue'];

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
    const $props = _props.value;

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

  watch([el, _props], () => {
    const $newEl = el.value;
    const $props = _props.value;

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
