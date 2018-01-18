import IMask from 'imask';


export
const IMaskComponent = {
  name: 'imask-input',
  template: '<input>',

  mounted () {
    const {options, values} = this._options;

    this.maskRef = new IMask(this.$el, options)
      .on('accept', this._onAccept.bind(this))
      .on('complete', this._onComplete.bind(this));

    this._updateValues(values);
  },

  destroyed () {
    this.maskRef.destroy();
  },

  computed: {
    _options () {
      return this._extractFromProps(this.$props);
    }
  },

  watch: {
    _options({options, values}) {
      this.maskRef.updateOptions(options);
      this._updateValues(values);
    }
  },

  methods: {
    _extractFromProps (props) {
      props = {...props};

      const {value, unmaskedValue} = props;

      // keep only defined props
      Object.keys(props)
        .filter(prop => props[prop] === undefined)
        .forEach(undefinedProp => {
          delete props[undefinedProp];
        });

      delete props.value;
      delete props.unmaskedValue;

      return {options: props, values: {value, unmaskedValue}};
    },

    _updateValues (values) {
      for (const prop in values) {
        if (values[prop] != null) this.maskRef[prop] = values[prop];
      }
    },

    _onAccept (value, ...args) {
      if ('unmaskedValue' in this.$props) value = this.maskRef.unmaskedValue;
      this.$emit('accept', value, ...args);
    },

    _onComplete (value, ...args) {
      if ('unmaskedValue' in this.$props) value = this.maskRef.unmaskedValue;
      this.$emit('complete', value, ...args)
    }
  },

  props: {
    // common
    mask: {
      required: true
    },
    value: String,
    unmaskedValue: String,
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
