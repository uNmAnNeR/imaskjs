import IMask from "imask";
import { h } from "vue";

export default {
  name: "imask-input",

  data() {
    return { maskRef: null };
  },

  render() {
    const props = {
      domProps: {
        value: this.maskRef ? this.maskRef.value : this.modelValue
      },
      attrs: { ...this.$attrs }
    };

    // if there is no mask use default input event
    if (!this.$props.mask) {
      props.attrs.onInput = event =>
        this.$emit("update:modelValue", event.target.value);
    } else {
      delete props.attrs.onInput;
    }

    return h("input", props);
  },

  mounted() {
    if (!this.$props.mask) return;

    this._initMask();
  },

  unmounted() {
    this._destroyMask();
  },

  computed: {
    maskOptions() {
      return this._extractOptionsFromProps(this.$props);
    }
  },

  watch: {
    $props: {
      handler(props) {
        const maskOptions = this.maskOptions;

        if (maskOptions.mask) {
          if (this.maskRef) {
            this.maskRef.updateOptions(maskOptions);

            if (
              "modelValue" in props &&
              (props.modelValue !== this._maskValue() ||
                // handle cases like Number('') === 0,
                // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
                (typeof props.modelValue !== "string" &&
                  this.maskRef.value === "" &&
                  !this.maskRef.el.isActive))
            ) {
              this._updateValue();
            }
          } else {
            this._initMask(maskOptions);

            if (props.modelValue !== this._maskValue()) this._onAccept();
          }
        } else {
          this._destroyMask();

          if ("modelValue" in props) this.$el.value = props.modelValue;
        }
      },
      deep: true
    }
  },

  methods: {
    _extractOptionsFromProps(props) {
      props = { ...props };

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

    _maskValue() {
      if (this.unmask === "typed") return this.maskRef.typedValue;

      if (this.unmask) return this.maskRef.unmaskedValue;

      return this.maskRef.value;
    },

    _updateValue() {
      const value = this.modelValue == null ? "" : this.modelValue;

      if (this.unmask === "typed") this.maskRef.typedValue = value;
      else if (this.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
    },

    _onAccept() {
      const val = this._maskValue();

      this.$emit("update:modelValue", val);
      this.$emit("accept", val);
    },

    _onComplete() {
      this.$emit("complete", this._maskValue());
    },

    _initMask(maskOptions = this.maskOptions) {
      this.maskRef = IMask(this.$el, maskOptions)
        .on("accept", this._onAccept.bind(this))
        .on("complete", this._onComplete.bind(this));

      this._updateValue();
    },

    _destroyMask() {
      if (this.maskRef) {
        this.maskRef.destroy();

        delete this.maskRef;
      }
    }
  },

  props: {
    // common
    mask: {},
    modelValue: String,
    unmask: {
      validator: function (value) {
        return value === "typed" || typeof value === "boolean";
      }
    },
    prepare: Function,
    validate: Function,
    commit: Function,
    overwrite: {
      type: Boolean,
      required: false,
      default: undefined
    },

    // pattern
    placeholderChar: String,
    lazy: {
      type: Boolean,
      required: false,
      default: undefined
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
      default: undefined
    },

    // number
    radix: String,
    thousandsSeparator: String,
    mapToRadix: Array,
    scale: Number,
    signed: {
      type: Boolean,
      required: false,
      default: undefined
    },
    normalizeZeros: {
      type: Boolean,
      required: false,
      default: undefined
    },
    padFractionalZeros: {
      type: Boolean,
      required: false,
      default: undefined
    },
    min: [Number, Date],
    max: [Number, Date],

    // dynamic
    dispatch: Function
  }
};
