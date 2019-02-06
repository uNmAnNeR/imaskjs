import React from 'react';
import PropTypes from 'prop-types';
import IMask from 'imask';

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

  // number
  radix: PropTypes.string,
  thousandsSeparator: PropTypes.string,
  mapToRadix: PropTypes.arrayOf(PropTypes.string),
  scale: PropTypes.number,
  signed: PropTypes.bool,
  normalizeZeros: PropTypes.bool,
  padFractionalZeros: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,

  // dynamic
  dispatch: PropTypes.func
};

const MASK_PROPS_NAMES = Object.keys(MASK_PROPS);


export
function IMaskMixin(ComposedComponent) {
  const MaskedComponent = class extends React.Component {
    componentDidMount () {
      if (!this.props.mask) return;

      this.initMask();
    }

    componentDidUpdate () {
      const props = this.props;
      const maskOptions = this._extractOptionsFromProps(props);
      if (maskOptions.mask) {
        if (this.maskRef) {
          this.maskRef.updateOptions(maskOptions);
          if ('value' in props) this.maskValue = props.value;
        } else {
          this.initMask(maskOptions);
        }
      } else {
        this.destroyMask();
        if ('value' in props) this.element.value = props.value;
      }
    }

    componentWillUnmount () {
      this.destroyMask();
    }

    render () {
      return React.createElement(ComposedComponent, {
        ...this._extractNonMaskProps(this.props),
        defaultValue: this.props.value,
        inputRef: (el) => this.element = el,
      });
    }

    initMask (maskOptions=this._extractOptionsFromProps({...this.props})) {
      this.maskRef = new IMask(this.element, maskOptions)
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

    _extractOptionsFromProps (oldProps) {
      const newProps = {...oldProps};

      // keep only mask props
      Object
          .keys(newProps)
          .filter(prop => MASK_PROPS_NAMES.indexOf(prop) < 0)
          .forEach(nonMaskProp => {
            delete newProps[nonMaskProp];
          });

      delete newProps.value;
      delete newProps.unmask;

      return newProps;
    }

    _extractNonMaskProps (oldProps) {
      const newProps = {...oldProps};

      MASK_PROPS_NAMES.forEach(maskProp => {
        delete newProps[maskProp];
      });

      return newProps;
    }

    get maskValue () {
      if (this.props.unmask === 'typed') return this.maskRef.typedValue;
      if (this.props.unmask) return this.maskRef.unmaskedValue;
      return this.maskRef.value;
    }

    set maskValue (value) {
      value = value || '';
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
