import VueTypes from 'vue-types';
import IMask from 'imask';

const optionsTypes = VueTypes.shape({
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
});

const component = {
  render(fn) {
    return fn('input', {
      ref: 'input',
      domProps: {
        value: this.value
      }
    })
  },
  name: 'MaskedInput',
  props: {
    options: optionsTypes
  },
  mounted() {
    this._mask = new IMask(this.$refs.input, this.options);
    this._mask.on('accept', () => {this.$emit('accept', this._mask)});
    this._mask.on('complete', () => {this.$emit('complete', this._mask)});
  },
  destroyed() {
    this._mask.destroy();
  },
  computed: {
    _options() {
      return this.$props.options;
    }
  },
  watch: {
    _options(val) {
      this._mask.updateOptions(val);
    }
  }
}

export default component;
