import IMask from 'imask';
import props from './props';


export default {
  name: 'imask-input',

  render (createElement) {
    const data = {
      domProps: {
        value: this.maskRef ? this.maskRef.value : this.value
      },
      on: {...this.$listeners},
    };

    // if there is no mask use default input event
    if (!this.$props.mask) {
      data.on.input = event => this.$emit('input', event.target.value);
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
            if ('value' in props) this._updateValue();
          } else {
            this._initMask(maskOptions);
            if (props.value !== this._maskValue()) this._onAccept();
          }
        } else {
          this._destroyMask();
          if ('value' in props) this.$el.value = props.value;
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

      delete props.value;
      delete props.unmask;

      return props;
    },

    _maskValue () {
      if (this.unmask === 'typed') return this.maskRef.typedValue;
      if (this.unmask) return this.maskRef.unmaskedValue;
      return this.maskRef.value;
    },

    _updateValue () {
      const value = this.value == null && this.unmask !== 'typed' ? '' : this.value;
      if (this.unmask === 'typed') this.maskRef.typedValue = value;
      else if (this.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
    },

    _onAccept () {
      const val = this._maskValue();
      this.$emit('input', val);
      this.$emit('accept', val);
    },

    _onComplete () {
      this.$emit('complete', this._maskValue());
    },

    _initMask (maskOptions=this.maskOptions) {
      this.maskRef = IMask(this.$el, maskOptions)
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
    value: {},
    unmask: {
      validator: function (value) {
        return value === 'typed' || typeof value === 'boolean';
      }
    },
    ...props,
  },
}
