import { type FactoryOpts } from 'imask';
import { h, watch, toRef, defineComponent, PropType } from 'vue-demi';
import props from './props';
import useIMask, { type ComposableParams } from './composable';
import { extractOptionsFromProps } from './utils';


export
type MaskProps = FactoryOpts & {
  modelValue: string,
  value: string,
  unmasked: string,
  typed: any,
}

// order does matter = priority
const VALUE_PROPS = ['typed', 'unmasked', 'value', 'modelValue'] as const; 


export default defineComponent<MaskProps>({
  name: 'imask-input',
  inheritAttrs: false,

  props: {
    // plugin
    modelValue: String,
    value: String,
    unmasked: String,
    typed: { validator: () => true } as unknown as PropType<any>,

    ...props,
  },

  emits: [
    'update:modelValue',
    'update:masked',
    'update:value',
    'update:unmasked',
    'update:typed',
    'accept',
    'accept:value',
    'accept:masked',
    'accept:unmasked',
    'accept:typed',
    'complete',
    'complete:value',
    'complete:masked',
    'complete:unmasked',
    'complete:typed',
  ],

  setup (props, { attrs, emit }) {
    const { el, mask, masked, unmasked, typed } = useIMask(extractOptionsFromProps(props as MaskProps, VALUE_PROPS) as FactoryOpts, {
      emit,
      onAccept: (event?: InputEvent) => {
        // emit more events
        const v = masked.value;
        emit('accept:value', v, event);
        emit('update:value', v, event);
        emit('update:masked', v, event);
        emit('update:modelValue', v, event);

        emit('update:unmasked', unmasked.value, event);
        emit('update:typed', typed.value, event);
      },
      onComplete: (event?: InputEvent) => {
        emit('complete:value', masked.value, event);
      },
    } as ComposableParams<MaskProps>);

    const pvalue = toRef(props, 'value');
    const pmodelValue = toRef(props, 'modelValue');
    const punmasked = toRef(props, 'unmasked');
    const ptyped = toRef(props, 'typed');

    masked.value = pmodelValue.value || pvalue.value || '';
    unmasked.value = punmasked.value || '';
    typed.value = ptyped.value;

    watch(pvalue, v => masked.value = v);
    watch(pmodelValue, v => masked.value = v);
    watch(punmasked, v => unmasked.value = v);
    watch(ptyped, v => typed.value = v);

    return () => {
      // TODO type?
      const data: Record<string, any> = {
        ...attrs,
        value: props.value != null ? props.value :
          props.modelValue != null ? props.modelValue :
          mask.value ? mask.value.displayValue :
          '',
        ref: el,
      };

      if (!props.mask) {
        data.onInput = (event: InputEvent) => {
          emit('update:modelValue', (event.target as HTMLInputElement).value);
          emit('update:value', (event.target as HTMLInputElement).value);
        }
      }

      return h('input', data);
    };
  },
});
