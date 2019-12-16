import React from 'react';
import PropTypes from 'prop-types';
import IMask from 'imask/esm/imask';


const MASK_PROPS = {
  // common
  mask: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.func,
    PropTypes.string,
    PropTypes.instanceOf(RegExp),
    PropTypes.oneOf([Date, Number, IMask.Masked]),
    PropTypes.instanceOf(IMask.Masked),
  ]),
  value: PropTypes.any,
  unmask: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['typed']),
  ]),
  prepare: PropTypes.func,
  validate: PropTypes.func,
  commit: PropTypes.func,
  overwrite: PropTypes.bool,

  // events
  onAccept: PropTypes.func,
  onComplete: PropTypes.func,

  // pattern
  placeholderChar: PropTypes.string,
  lazy: PropTypes.bool,
  definitions: PropTypes.object,
  blocks: PropTypes.object,

  // date
  pattern: PropTypes.string,
  format: PropTypes.func,
  parse: PropTypes.func,
  autofix: PropTypes.bool,

  // number
  radix: PropTypes.string,
  thousandsSeparator: PropTypes.string,
  mapToRadix: PropTypes.arrayOf(PropTypes.string),
  scale: PropTypes.number,
  signed: PropTypes.bool,
  normalizeZeros: PropTypes.bool,
  padFractionalZeros: PropTypes.bool,
  min: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
  max: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),

  // dynamic
  dispatch: PropTypes.func,

  // ref
  inputRef: PropTypes.func
};

const MASK_PROPS_NAMES = Object.keys(MASK_PROPS);
const NON_MASK_OPTIONS_PROPS_NAMES = ['value', 'unmask', 'onAccept', 'onComplete', 'inputRef'];
const MASK_OPTIONS_PROPS_NAMES = MASK_PROPS_NAMES.filter(pName =>
  NON_MASK_OPTIONS_PROPS_NAMES.indexOf(pName) < 0
);

export default
function IMaskMixin(ComposedComponent) {
  const MaskedComponent = class extends React.Component {
    constructor (...args) {
      super(...args);
      this._inputRef = this._inputRef.bind(this);
    }

    componentDidMount () {
      if (!this.props.mask) return;

      this.initMask();
    }

    componentDidUpdate () {
      const props = this.props;
      const maskOptions = this._extractMaskOptionsFromProps(props);
      if (maskOptions.mask) {
        if (this.maskRef) {
          this.maskRef.updateOptions(maskOptions);
          if ('value' in props &&
            (props.value !== this.maskValue ||
              // handle cases like Number('') === 0,
              // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
              (typeof props.value !== 'string' && this.maskRef.value === '') &&
                !this.maskRef.el.isActive)
          ) {
            this.maskValue = props.value;
          }
        } else {
          this.initMask(maskOptions);
          if (props.value !== this.maskValue) this._onAccept();
        }
      } else {
        this.destroyMask();
        if ('value' in props) this.element.value = props.value;
      }
    }

    componentWillUnmount () {
      this.destroyMask();
    }

    _inputRef (el) {
      this.element = el;
      if (this.props.inputRef) this.props.inputRef(el);
    }

    render () {
      return React.createElement(ComposedComponent, {
        ...this._extractNonMaskProps(this.props),
        defaultValue: this.props.value,
        inputRef: this._inputRef,
      });
    }

    initMask (maskOptions=this._extractMaskOptionsFromProps({...this.props})) {
      this.maskRef = IMask(this.element, maskOptions)
        .on('accept', this._onAccept.bind(this))
        .on('complete', this._onComplete.bind(this));

      this.maskValue = this.props.value;
    }

    destroyMask () {
      if (this.maskRef) {
        this.maskRef.destroy();
        delete this.maskRef;
      }
    }

    _extractMaskOptionsFromProps (props) {
      props = {...props};

      // keep only mask options props
      Object.keys(props)
        .filter(prop => MASK_OPTIONS_PROPS_NAMES.indexOf(prop) < 0)
        .forEach(nonMaskProp => {
          delete props[nonMaskProp];
        });

      return props;
    }

    _extractNonMaskProps (props) {
      props = {...props};

      MASK_PROPS_NAMES.forEach(maskProp => {
        delete props[maskProp];
      });

      return props;
    }

    get maskValue () {
      if (this.props.unmask === 'typed') return this.maskRef.typedValue;
      if (this.props.unmask) return this.maskRef.unmaskedValue;
      return this.maskRef.value;
    }

    set maskValue (value) {
      value = value == null ? '' : value;
      if (this.props.unmask === 'typed') this.maskRef.typedValue = value;
      else if (this.props.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
    }

    _onAccept () {
      if (this.props.onAccept) this.props.onAccept(this.maskValue, this.maskRef);
    }

    _onComplete () {
      if (this.props.onComplete) this.props.onComplete(this.maskValue, this.maskRef);
    }
  };

  MaskedComponent.propTypes = MASK_PROPS;

  const nestedComponentName = ComposedComponent.displayName || ComposedComponent.name || 'Component';
  MaskedComponent.displayName = `IMask(${nestedComponentName})`;

  return MaskedComponent;
}
