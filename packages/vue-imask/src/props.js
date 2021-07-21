export default {
  // common
  mask: {},
  prepare: Function,
  validate: Function,
  commit: Function,
  overwrite: {
    type: Boolean,
    required: false,
    default: undefined,
  },

  // pattern
  placeholderChar: String,
  lazy: {
    type: Boolean,
    required: false,
    default: undefined,
  },
  definitions: Object,
  blocks: Object,

  // date
  pattern: String,
  format: Function,
  parse: Function,
  autofix: {
    type: Boolean,
    required: false,
    default: undefined,
  },

  // number
  radix: String,
  thousandsSeparator: String,
  mapToRadix: Array,
  scale: Number,
  signed: {
    type: Boolean,
    required: false,
    default: undefined,
  },
  normalizeZeros: {
    type: Boolean,
    required: false,
    default: undefined,
  },
  padFractionalZeros: {
    type: Boolean,
    required: false,
    default: undefined,
  },
  min: [Number, Date],
  max: [Number, Date],

  // dynamic
  dispatch: Function
}