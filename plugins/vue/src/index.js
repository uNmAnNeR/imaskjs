import VueTypes from 'vue-types';
import IMask from 'imask';

VueTypes.sensibleDefaults = false;

const optionsTypes = {
  // common
  mask: VueTypes.oneOfType([
    VueTypes.array,
    VueTypes.func,
    VueTypes.string,
    VueTypes.instanceOf(RegExp),
    VueTypes.oneOf([Date, Number]),
    VueTypes.instanceOf(IMask.Masked),
  ]).isRequired,
  value: VueTypes.string,
  unmaskedValue: VueTypes.string,
  prepare: VueTypes.func,
  validate: VueTypes.func,
  commit: VueTypes.func,

  // events
  onAccept: VueTypes.func,
  onComplete: VueTypes.func,

  // pattern
  placeholderChar: VueTypes.string,
  placeholderLazy: VueTypes.bool,
  definitions: VueTypes.object,
  groups: VueTypes.object,

  // date
  pattern: VueTypes.string,
  format: VueTypes.func,
  parse: VueTypes.func,

  // number
  radix: VueTypes.string,
  thousandsSeparator: VueTypes.string,
  mapToRadix: VueTypes.arrayOf(VueTypes.string),
  scale: VueTypes.number,
  signed: VueTypes.bool,
  normalizeZeros: VueTypes.bool,
  padFractionalZeros: VueTypes.bool,

  // dynamic
  dispatch: VueTypes.func
};

const component = {
  name: 'MaskedInput',
  render(createElement) {
    return createElement('input', {
      domProps: this._extractNonMaskProps(this.$props)
    })
  },
  props: optionsTypes,
  mounted() {
    const {options, values} = this._extractFromProps(this.$props);

    this._mask = new IMask(this.$el, options)
      .on('accept', () => {this.$emit('accept', this._mask)})
      .on('complete', () => {this.$emit('complete', this._mask)});

    this._updateValues(values);
  },
  destroyed() {
    this._mask.destroy();
  },
  computed: {
    _options() {
      return this._extractFromProps(this.$props);
    }
  },
  watch: {
    _options(props) {
      const {options, values} = props;
      this._mask.updateOptions(options);
      this._updateValues(values);
    }
  },
  methods: {
    _extractMaskProps (props) {
      props = {...props};

      // keep only non mask props
      Object.keys(props)
        .filter(prop => !optionsTypes.hasOwnProperty(prop) || props[prop] === undefined)
        .forEach(nonMaskProp => {
          delete props[nonMaskProp];
        });

      return props;
    },

    _extractNonMaskProps (props) {
      props = {...props};

      Object.keys(optionsTypes).forEach(maskProp => {
        delete props[maskProp];
      });

      return props;
    },

    _extractFromProps (props) {
      props = {...props};

      const value = props.value;
      const unmaskedValue = props.unmaskedValue;

      const maskProps = this._extractMaskProps(props);

      delete maskProps.value;
      delete maskProps.unmaskedValue;

      return {options: maskProps, values: {value, unmaskedValue}};
    },

    _updateValues (values) {
      for (const prop in values) {
        if (values[prop] != null) this._mask[prop] = values[prop];
      }
    }
  }
}

export default component;
