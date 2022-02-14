import IMask from 'imask';
import { h } from 'vue-demi';
import props from './props';


// order does matter = priority
const VALUE_PROPS = ['typed', 'unmasked', 'value', 'modelValue']; 


export default {
  name: 'imask-input',
  inheritAttrs: false,

  data () {
    return { maskRef: null };
  },

  render () {
    const data = {
      ...this.$attrs,
      modelValue: this.maskRef ? this.maskRef.value : this.modelValue,
    };

    // TODO should this somehow work at all?
    delete data.value;

    if (!this.$props.mask) {
      data.onInput = event => this.$emit('update:modelValue', event.target.value);
    }

    return h('input', data);
  },

  mounted () {
    if (!this.$props.mask) return;

    this._initMask();
  },

  destroyed () {
    this._destroyMask();
  },

  computed: {
    maskOptions () {
      return this._extractOptionsFromProps(this.$props);
    },
  },

  watch: {
    '$props': {
      handler (props) {
        const maskOptions = this.maskOptions;
        if (maskOptions.mask) {
          if (this.maskRef) {
            this.maskRef.updateOptions(maskOptions);
            const [cprop, mprop] = this._getMaskProps();

            if (cprop) this._updateValue();
          } else {
            this._initMask();
          }
        } else {
          this._destroyMask();
          if ('modelValue' in props) this.$el.value = props.modelValue;
        }
      },
      deep: true
    }
  },

  methods: {
    _extractOptionsFromProps (props) {
      props = {...props};

      // keep only defined props
      Object.keys(props)
        .filter(prop => props[prop] === undefined)
        .forEach(undefinedProp => {
          delete props[undefinedProp];
        });

      VALUE_PROPS.forEach(p => delete props[p]);

      return props;
    },

    _getMaskProps () {
      const cprop = this._getComponentMaskProp();
      return [cprop, this._getMaskPropFromComponent(cprop)];
    },

    _getComponentMaskProp () {
      return VALUE_PROPS.find(prop => prop in this.$props);
    },

    _getMaskPropFromComponent (componentProp) {
      switch (componentProp) {
        case 'unmasked': return 'unmaskedValue';
        case 'typed': return 'typedValue';
        default: return 'value';
      }
    },

    _updateValue () {
      const [cprop, mprop] = this._getMaskProps();

      this.maskRef[mprop] = this[cprop] == null && cprop !== 'typed' ? '' : this[cprop];
      if (props[cprop] !== this.maskRef[mprop]) this._onAccept();
    },

    _onAccept () {
      const typedValue = this.maskRef.typedValue;
      const unmaskedValue = this.maskRef.unmaskedValue;
      const value = this.maskRef.value;

      this.$emit('update:modelValue', value);
      this.$emit('update:value', value);

      this.$emit('accept', value);
      this.$emit('accept:value', value);

      this.$emit('update:unmasked', unmaskedValue);
      this.$emit('accept:unmasked', unmaskedValue);

      this.$emit('update:typed', typedValue);
      this.$emit('accept:typed', typedValue);
    },

    _onComplete () {
      const typedValue = this.maskRef.typedValue;
      const unmaskedValue = this.maskRef.unmaskedValue;
      const value = this.maskRef.value;

      this.$emit('complete', value);
      this.$emit('complete:value', value);
      this.$emit('complete:unmasked', unmaskedValue);
      this.$emit('complete:typed', typedValue);
    },

    _initMask () {
      this.maskRef = IMask(this.$el, this.maskOptions)
        .on('accept', this._onAccept.bind(this))
        .on('complete', this._onComplete.bind(this));
      this._updateValue();
    },

    _destroyMask () {
      if (this.maskRef) {
        this.maskRef.destroy();
        delete this.maskRef;
      }
    }
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
}
