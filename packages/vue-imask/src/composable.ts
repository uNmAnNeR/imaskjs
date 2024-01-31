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
  emit?: <E extends ComposableEmitEvent>(eventName: E, value: ComposableEmitValue<E, Opts>, e?: InputEvent) => void,
  onAccept?: (e?: InputEvent) => void,
  onComplete?: (e?: InputEvent) => void,
}

export default
function useIMask<
  MaskElement extends InputMaskElement,
  Opts extends FactoryOpts
> (props: Opts | Ref<Opts>, { emit, onAccept, onComplete }: ComposableParams<Opts>={}): {
  el: Ref<MaskElement | undefined>,
  mask: DeepReadonly<Ref<InputMask<Opts> | undefined>>,
  masked: Ref<InputMask<Opts>['value']>,
  unmasked: Ref<InputMask<Opts>['unmaskedValue']>,
  typed: Ref<InputMask<Opts>['typedValue']>,
} {
  const _props = isRef(props) ? props : ref(props);
  const el: Ref<MaskElement | undefined> = ref();
  const mask: Ref<InputMask<Opts> | undefined> = ref();
  const masked: Ref<InputMask<Opts>['value']> = ref('');
  const unmasked: Ref<InputMask<Opts>['unmaskedValue']> = ref('');
  const typed: Ref<InputMask<Opts>['typedValue']> = ref(null);
  const initialized = ref(false);
  let $el: MaskElement | undefined;
  let $lastAcceptedValue: InputMask<Opts>['value'] | undefined;
  let $lastAcceptedUnmaskedValue: InputMask<Opts>['unmaskedValue'] | undefined;
  let $lastAcceptedTypedValue: InputMask<Opts>['typedValue'] | undefined;

  function _onAccept (event?: InputEvent) {
    $lastAcceptedTypedValue = typed.value = (mask.value as InputMask<Opts>).typedValue;
    $lastAcceptedUnmaskedValue = unmasked.value = (mask.value as InputMask<Opts>).unmaskedValue;
    $lastAcceptedValue = masked.value = (mask.value as InputMask<Opts>).value;

    if (emit) {
      emit('accept', masked.value, event);
      emit('accept:masked', masked.value, event);
      emit('accept:typed', typed.value, event);
      emit('accept:unmasked', unmasked.value, event);
    }
    if (onAccept) onAccept(event);
  }

  function _onComplete (event?: InputEvent) {
    if (emit) {
      emit('complete', (mask.value as InputMask<Opts>).value, event);
      emit('complete:masked', (mask.value as InputMask<Opts>).value, event);
      emit('complete:typed', (mask.value as InputMask<Opts>).typedValue, event);
      emit('complete:unmasked', (mask.value as InputMask<Opts>).unmaskedValue, event);
    }
    if (onComplete) onComplete(event);
  }

  function _initMask () {
    $el = el.value;
    const $props = _props.value;

    if (!$el || !$props?.mask) return;

    mask.value = IMask($el, $props)
      .on('accept', _onAccept)
      .on('complete', _onComplete);

    _onAccept();

    initialized.value = true;
  }

  function _destroyMask () {
    if (!initialized.value) return;
    mask.value?.destroy();
    mask.value = undefined;
  }

  onMounted(_initMask);
  onUnmounted(_destroyMask);

  watch(unmasked, () => {
    if (mask.value && initialized.value) {
      if ($lastAcceptedUnmaskedValue !== unmasked.value) mask.value.unmaskedValue = unmasked.value;
      $lastAcceptedUnmaskedValue = undefined;
    }
  });

  watch(masked, () => {
    if (mask.value && initialized.value) {
      if ($lastAcceptedValue !== masked.value) mask.value.value = masked.value;
      $lastAcceptedValue = undefined;
    }
  });

  watch(typed, () => {
    if (mask.value && initialized.value) {
      if ($lastAcceptedTypedValue !== typed.value) mask.value.typedValue = typed.value;
      $lastAcceptedTypedValue = undefined;
    }
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
