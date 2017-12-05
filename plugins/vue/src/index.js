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
  template: '<input type="text">',
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
    _extractFromProps (props) {
      props = {...props};

      const value = props.value;
      const unmaskedValue = props.unmaskedValue;

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
        if (values[prop] != null) this._mask[prop] = values[prop];
      }
    }
  }
}

export default component;
