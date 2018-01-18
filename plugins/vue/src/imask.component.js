import IMask from 'imask';


export
const IMaskComponent = {
  name: 'imask-input',
  template: '<input>',

  model: {
    prop: 'value',
    event: 'accept'
  },

  mounted () {
    this.maskRef = new IMask(this.$el, this._maskOptions)
      .on('accept', this._onAccept.bind(this))
      .on('complete', this._onComplete.bind(this));
    this._updateValue();
  },

  destroyed () {
    this.maskRef.destroy();
  },

  computed: {
    maskValue () {
      return this.$props.unmask ?
        this.maskRef.unmaskedValue :
        this.maskRef.value;
    },
    _maskOptions () {
      return this._extractOptionsFromProps(this.$props);
    }
  },

  watch: {
    '$props': {
      handler () {
        this.maskRef.updateOptions(this._maskOptions);
        this._updateValue();
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

    _updateValue () {
      const value = this.value || '';
      if (this.$props.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
    },

    _onAccept () {
      this.$emit('accept', this.maskValue);
    },

    _onComplete () {
      this.$emit('complete', this.maskValue)
    }
  },

  props: {
    // common
    mask: {
      required: true
    },
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
