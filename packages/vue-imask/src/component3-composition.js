import IMask from 'imask';
import { h, beforeUpdate, watch, toRef } from 'vue-demi';
import props from './props';
import useIMask from './composable';


// order does matter = priority
const VALUE_PROPS = ['typed', 'unmasked', 'value', 'modelValue']; 

function _extractOptionsFromProps (props) {
  props = {...props};

  // keep only defined props
  Object.keys(props)
    .filter(prop => props[prop] === undefined)
    .forEach(undefinedProp => {
      delete props[undefinedProp];
    });

  VALUE_PROPS.forEach(p => delete props[p]);

  return props;
}

export default {
  name: 'imask-input',
  inheritAttrs: false,

  setup (props, { attrs, slots, emit }) {
    const { el, mask, masked, unmasked, typed } = useIMask(_extractOptionsFromProps(props), {
      emit,
      onAccept: () => {
        // emit more events
        const v = masked.value;
        emit('accept:value', v);
        emit('update:value', v);
        emit('update:masked', v);
        emit('update:modelValue', v);

        emit('update:unmasked', unmasked.value);
        emit('update:typed', typed.value);
      },
      onComplete: () => {
        emit('complete:value', masked.value);
      },
    });

    const pvalue = toRef(props, 'value');
    const pmodelValue = toRef(props, 'modelValue');
    const punmasked = toRef(props, 'unmasked');
    const ptyped = toRef(props, 'typed');

    masked.value = pmodelValue.value || pvalue.value || '';
    unmasked.value = punmasked.value;
    typed.value = ptyped.value;

    watch(pvalue, v => masked.value = v);
    watch(pmodelValue, v => masked.value = v);
    watch(punmasked, v => unmasked.value = v);
    watch(ptyped, v => typed.value = v);

    return () => {
      const data = {
        ...attrs,
        value: props.value != null ? props.value : props.modelValue,
        ref: el,
      };

      if (!props.mask) {
        data.onInput = event => {
          emit('update:modelValue', event.target.value);
          emit('update:value', event.target.value);
        }
      }

      return h('input', data);
    };
  },

  props: {
    // plugin
    modelValue: String,
    value: String,
    unmasked: String,
    typed: {},

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
}
