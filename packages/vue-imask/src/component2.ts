import { Vue2, type VNode } from 'vue-demi';
import IMask, { type InputMask, type FactoryOpts } from 'imask';
import props from './props';
import { extractOptionsFromProps } from './utils';


export default Vue2?.extend({
  name: 'imask-input',

  data () {
    return {} as { maskRef?: InputMask<FactoryOpts> };
  },

  render (createElement): VNode {
    const data = {
      domProps: {
        value: this.maskRef ? this.maskRef.value : this.value
      },
      on: {...this.$listeners},
    };

    // if there is no mask use default input event
    if (!this.$props.mask) {
      data.on.input = (event: InputEvent) => this.$emit('input', (event.target as HTMLInputElement).value);
    } else {
      delete data.on.input;
    }

    return createElement('input', data);
  },

  mounted () {
    if (!this.$props.mask) return;

    this._initMask();
  },

  destroyed () {
    this._destroyMask();
  },

  computed: {
    maskOptions (): FactoryOpts {
      return extractOptionsFromProps(this.$props, ['value', 'unmask']) as FactoryOpts;
    },
  },

  watch: {
    '$props': {
      handler (props) {
        const maskOptions = this.maskOptions;
        if (maskOptions.mask) {
          if (this.maskRef) {
            this.maskRef.updateOptions(maskOptions);
            if ('value' in props) this._updateValue();
          } else {
            this._initMask(maskOptions);
            if (props.value !== this._maskValue()) this._onAccept();
          }
        } else {
          this._destroyMask();
          if ('value' in props) (this.$el as HTMLInputElement).value = props.value;
        }
      },
      deep: true
    }
  },

  methods: {
    _maskValue (): any {
      if (this.unmask === 'typed') return this.maskRef?.typedValue;
      if (this.unmask) return this.maskRef?.unmaskedValue;
      return this.maskRef?.value;
    },

    _updateValue (): void {
      if (!this.maskRef) return;

      const value = this.value == null && this.unmask !== 'typed' ? '' : this.value;
      if (this.unmask === 'typed') this.maskRef.typedValue = value;
      else if (this.unmask) this.maskRef.unmaskedValue = value as string;
      else this.maskRef.value = value as string;
    },

    _onAccept (): void {
      const val = this._maskValue();
      this.$emit('input', val);
      this.$emit('accept', val);
    },

    _onComplete (): void {
      this.$emit('complete', this._maskValue());
    },

    _initMask (maskOptions?: FactoryOpts): void {
      if (!maskOptions) maskOptions = this.maskOptions;

      this.maskRef = IMask((this.$el as HTMLInputElement), maskOptions)
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

  props: {
    value: {},
    unmask: {
      validator: (value) => value === 'typed' || typeof value === 'boolean',
    },
    ...props,
  },
});
