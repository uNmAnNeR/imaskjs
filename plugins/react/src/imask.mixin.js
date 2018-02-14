import React from 'react';
import PropTypes from 'prop-types';
import IMask from 'imask';


export
function IMaskMixin(ComposedComponent) {
  const MaskedComponent = class extends React.Component {
    componentDidMount () {
      if (!this.props.mask) return;

      this.initMask();
    }

    componentWillReceiveProps (nextProps) {
      const props = {...this.props, ...nextProps};
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

    _extractOptionsFromProps (props) {
      props = {...props};

      // keep only mask props
      Object.keys(props)
        .filter(prop => !MaskedComponent.propTypes.hasOwnProperty(prop))
        .forEach(nonMaskProp => {
          delete props[nonMaskProp];
        });

      delete props.value;
      delete props.unmask;

      return props;
    }

    _extractNonMaskProps (props) {
      props = {...props};

      Object.keys(MaskedComponent.propTypes).forEach(maskProp => {
        delete props[maskProp];
      });

      return props;
    }

    get maskValue () {
      return this.props.unmask ?
        this.maskRef.unmaskedValue :
        this.maskRef.value
    }

    set maskValue (value) {
      value = value || '';
      if (this.props.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
    }

    _onAccept () {
      if (this.props.onAccept) this.props.onAccept(this.maskValue, this.maskRef);
    }

    _onComplete () {
      if (this.props.onComplete) this.props.onComplete(this.maskValue, this.maskRef);
    }
  };

  MaskedComponent.propTypes = {
    // common
    mask: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.func,
      PropTypes.string,
      PropTypes.instanceOf(RegExp),
      PropTypes.oneOf([Date, Number, IMask.Masked]),
      PropTypes.instanceOf(IMask.Masked),
    ]),
    value: PropTypes.string,
    unmask: PropTypes.bool,
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
    groups: PropTypes.object,

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

    // dynamic
    dispatch: PropTypes.func
  };

  const nestedComponentName = ComposedComponent.displayName || ComposedComponent.name || 'Component';
  MaskedComponent.displayName = `IMask(${nestedComponentName})`;

  return MaskedComponent;
}
