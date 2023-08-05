import type { DeepReadonly, Ref } from 'vue-demi';
import type { FactoryOpts, InputMaskElement, InputMask } from 'imask';
import { ref, readonly, nextTick, unref, watch, onMounted, onUnmounted } from 'vue-demi';
import IMask from 'imask';

type MaybeRef<T> = T | Ref<T>

export
type ComposableEmitEventBase = 'accept' | 'complete';

export
type ComposableEmitEvent = ComposableEmitEventBase | `${ComposableEmitEventBase}:masked` | `${ComposableEmitEventBase}:typed` | `${ComposableEmitEventBase}:unmasked`;

export
type ComposableEmitValue<E extends ComposableEmitEvent, Opts extends FactoryOpts> =
  E extends ComposableEmitEventBase | `${ComposableEmitEventBase}:masked` ? InputMask<Opts>['value'] :
  E extends `${ComposableEmitEventBase}:unmasked` ? InputMask<Opts>['unmaskedValue'] :
  E extends `${ComposableEmitEventBase}:typed` ? InputMask<Opts>['typedValue'] :
  never;

export
type ComposableParams<Opts extends FactoryOpts> = {
  emit?: <E extends ComposableEmitEvent>(eventName: E, value: ComposableEmitValue<E, Opts>) => void,
  onAccept?: () => void,
  onComplete?: () => void,
}

export
type ComposableReturn<MaskElement extends InputMaskElement | undefined, Opts extends FactoryOpts> = {
    el: Ref<MaskElement | undefined>,
    mask: DeepReadonly<Ref<InputMask<Opts> | undefined>>,
    masked: Ref<InputMask<Opts>['value']>,
    unmasked: Ref<InputMask<Opts>['unmaskedValue']>,
    typed: Ref<InputMask<Opts>['typedValue']>,
  };

export default
function useIMask<
  MaskElement extends InputMaskElement,
  Opts extends FactoryOpts
> (props: MaybeRef<Opts>, { emit, onAccept, onComplete }: ComposableParams<Opts> = {}): ComposableReturn<MaskElement, Opts> {
  const el = ref<MaskElement | undefined>();

  const mask = ref<InputMask<Opts>>();
  const masked = ref<InputMask<Opts>['value']>('');
  const unmasked = ref<InputMask<Opts>['unmaskedValue']>('');
  const typed = ref<InputMask<Opts>['typedValue']>(null);

  function _onAccept () {
    typed.value = mask.value!.typedValue;
    unmasked.value = mask.value!.unmaskedValue;
    masked.value = mask.value!.value;

    if (emit) {
      emit('accept', masked.value);
      emit('accept:masked', masked.value);
      emit('accept:typed', typed.value);
      emit('accept:unmasked', unmasked.value);
    }
    if (onAccept) onAccept();
  }

  function _onComplete () {
    if (emit) {
      emit('complete', masked.value);
      emit('complete:masked', masked.value);
      emit('complete:typed', typed.value);
      emit('complete:unmasked', unmasked.value);
    }
    if (onComplete) onComplete();
  }

  function _initMask () {
    const $props = unref(props);

    if (!el.value || !$props?.mask) return;

    mask.value = IMask(el.value, $props)
      .on('accept', _onAccept)
      .on('complete', _onComplete);

    _onAccept();
  }

  function _destroyMask () {
    if (mask.value) {
      mask.value.destroy();
      mask.value = undefined;
    }
  }

  onMounted(_initMask);
  onUnmounted(_destroyMask);

  watch(unmasked, () => {
    if (mask.value) mask.value.unmaskedValue = unmasked.value;
  });

  watch(masked, () => {
    if (mask.value) mask.value.value = masked.value;
  });

  watch(typed, () => {
    if (mask.value) mask.value.typedValue = typed.value;
  });

  watch([el, () => unref(props)], ([$newEl, $props], [$el]) => {
    nextTick(() => {
      if (!$props?.mask || $newEl !== $el) _destroyMask();
      if ($newEl) {
        if (!mask.value) {
          _initMask();
        } else {
          mask.value.updateOptions($props as any);
        }
      }
    });
  }, { deep: true });

  return {
    el,
    mask: readonly(mask),
    masked,
    unmasked,
    typed,
  };
}
