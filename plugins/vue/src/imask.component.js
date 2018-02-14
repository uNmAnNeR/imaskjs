import IMask from 'imask';


export
const IMaskComponent = {
  name: 'imask-input',

  render (createElement) {
    const props = {
      domProps: {
        value: this.maskRef ? this.maskRef.value : this.value
      },
    };

    // if there is no mask use default input event
    if (!this.$props.mask) props.on = {
      input: event => this.$emit('input', event.target.value)
    };

    return createElement('input', props);
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
      handler () {
        const maskOptions = this.maskOptions;
        if (maskOptions.mask) {
          if (this.maskRef) {
            this.maskRef.updateOptions(maskOptions);
            this._updateValue();
          } else {
            this._initMask(maskOptions);
          }
        } else {
          this._destroyMask();
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
      return this.unmask ?
        this.maskRef.unmaskedValue :
        this.maskRef.value;
    },

    _updateValue () {
      const value = this.value || '';
      if (this.unmask) this.maskRef.unmaskedValue = value;
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
      this.maskRef = new IMask(this.$el, maskOptions)
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
    // common
    mask: {},
    value: String,
    unmask: Boolean,
    prepare: Function,
    validate: Function,
    commit: Function,

    // pattern
    placeholderChar: String,
    lazy: Boolean,
    definitions: Object,
    groups: Object,

    // date
    pattern: String,
    format: Function,
    parse: Function,

    // number
    radix: String,
    thousandsSeparator: String,
    mapToRadix: Array,
    scale: Number,
    signed: Boolean,
    normalizeZeros: Boolean,
    padFractionalZeros: Boolean,

    // dynamic
    dispatch: Function
  },
}
