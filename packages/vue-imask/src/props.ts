import { type PropType } from 'vue-demi';
import { type FactoryOpts, type MaskedDynamicOptions } from 'imask';

export default {
  // common
  mask: undefined as unknown as PropType<FactoryOpts['mask']>,
  prepare: Function as PropType<FactoryOpts['prepare']>,
  prepareChar: Function as PropType<FactoryOpts['prepareChar']>,
  validate: Function as PropType<FactoryOpts['validate']>,
  commit: Function as PropType<FactoryOpts['commit']>,
  overwrite: {
    type: Boolean,
    required: false,
    default: undefined,
  },
  eager: {
    required: false,
    default: undefined,
    validator: (value: unknown) => ['append', 'remove'].includes(value as string) || typeof value === 'boolean',
  },
  skipInvalid: { type: Boolean, required: false, default: undefined },

  // pattern
  placeholderChar: String,
  displayChar: String,
  lazy: { type: Boolean, required: false, default: undefined },
  definitions: Object,
  blocks: Object,

  // enum
  enum: Array,

  // range
  maxLength: Number,
  from: Number,
  to: Number,

  // date
  pattern: String,
  format: Function as PropType<FactoryOpts['format']>,
  parse: Function as PropType<FactoryOpts['parse']>,
  autofix: {
    required: false,
    default: undefined,
    validator: (value: unknown) => value === 'pad' || typeof value === 'boolean',
  },

  // number
  radix: String,
  thousandsSeparator: String,
  mapToRadix: Array,
  scale: Number,
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
  dispatch: Function as PropType<MaskedDynamicOptions['dispatch']>
};
