import IMask, { type InputMask, type FactoryOpts } from 'imask';
import { h, defineComponent, type PropType } from 'vue-demi';
import props from './props';
import { extractOptionsFromProps } from './utils';

export
type MaskProps = FactoryOpts & {
  modelValue: string,
  value: string,
  unmasked: string,
  typed: any,
}

type ComponentValueProp = typeof VALUE_PROPS[number];
type MaskValueProp = 'value' | 'unmaskedValue' | 'typedValue';

// order does matter = priority
const VALUE_PROPS = ['typed', 'unmasked', 'value', 'modelValue'] as const; 

export default defineComponent({
  name: 'imask-input',
  inheritAttrs: false,

  props: {
    // plugin
    modelValue: String,
    value: String,
    unmasked: String,
    typed: Object as PropType<any>,

    ...props,
  },

  emits: [
    'update:modelValue',
    'update:value',
    'update:unmasked',
    'update:typed',
    'accept',
    'accept:value',
    'accept:unmasked',
    'accept:typed',
    'complete',
    'complete:value',
    'complete:unmasked',
    'complete:typed',
  ],

  data () {
    return {} as { maskRef?: InputMask<FactoryOpts> };
  },

  render () {
    const data = {
      ...this.$attrs,
      modelValue: this.maskRef ? this.maskRef.value : this.modelValue,
    } as any;

    // TODO should this somehow work at all?
    delete data.value;

    if (!this.$props.mask) {
      data.onInput = (event: InputEvent) => this.$emit('update:modelValue', (event.target as HTMLInputElement).value);
    }

    return h('input', data);
  },

  mounted (): void {
    if (!this.$props.mask) return;

    this._initMask();
  },

  destroyed (): void {
    this._destroyMask();
  },

  computed: {
    maskOptions (): FactoryOpts {
      return extractOptionsFromProps(this.$props, VALUE_PROPS) as FactoryOpts;
    },
  },

  watch: {
    '$props': {
      handler (props): void {
        const maskOptions = this.maskOptions;
        if (maskOptions.mask) {
          if (this.maskRef) {
            this.maskRef.updateOptions(maskOptions);
            const [cprop] = this._getMaskProps();

            if (cprop) this._updateValue();
          } else {
            this._initMask();
          }
        } else {
          this._destroyMask();
          if ('modelValue' in props) (this.$el as HTMLInputElement).value = props.modelValue;
        }
      },
      deep: true
    },
  },

  methods: {
    _getMaskProps (): [ComponentValueProp, MaskValueProp] {
      const cprop = this._getComponentMaskProp();
      return [cprop, this._getMaskPropFromComponent(cprop)];
    },

    _getComponentMaskProp (): ComponentValueProp {
      return VALUE_PROPS.find(prop => prop in this.$props) || 'value';
    },

    _getMaskPropFromComponent (componentProp: ComponentValueProp): MaskValueProp {
      switch (componentProp) {
        case 'unmasked': return 'unmaskedValue';
        case 'typed': return 'typedValue';
        default: return 'value';
      }
    },

    _updateValue (): void {
      if (!this.maskRef) return;

      const [cprop, mprop]: [ComponentValueProp, MaskValueProp] = this._getMaskProps();
      this.maskRef[mprop] = this[cprop] == null && cprop !== 'typed' ? '' : this[cprop];
      if (this.$props[cprop] !== this.maskRef[mprop]) this._onAccept();
    },

    _onAccept (): void {
      const typedValue = (this.maskRef as any).typedValue;
      const unmaskedValue = (this.maskRef as any).unmaskedValue;
      const value = (this.maskRef as any).value;

      this.$emit('update:modelValue', value);
      this.$emit('update:value', value);

      this.$emit('accept', value);
      this.$emit('accept:value', value);

      this.$emit('update:unmasked', unmaskedValue);
      this.$emit('accept:unmasked', unmaskedValue);

      this.$emit('update:typed', typedValue);
      this.$emit('accept:typed', typedValue);
    },

    _onComplete (): void {
      const typedValue = (this.maskRef as any).typedValue;
      const unmaskedValue = (this.maskRef as any).unmaskedValue;
      const value = (this.maskRef as any).value;

      this.$emit('complete', value);
      this.$emit('complete:value', value);
      this.$emit('complete:unmasked', unmaskedValue);
      this.$emit('complete:typed', typedValue);
    },

    _initMask (): void {
      this.maskRef = IMask(this.$el as HTMLInputElement, this.maskOptions as any)
        .on('accept', this._onAccept.bind(this))
        .on('complete', this._onComplete.bind(this));
      this._updateValue();
    },

    _destroyMask (): void {
      if (this.maskRef) {
        this.maskRef.destroy();
        delete this.maskRef;
      }
    }
  },
});
