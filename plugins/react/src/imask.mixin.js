import React from 'react';
import PropTypes from 'prop-types';
import IMask from 'imask';


export
function IMaskMixin(ComposedComponent) {
  const MaskedComponent = class extends React.Component {
    componentDidMount () {
      this.initMask();
    }

    componentWillReceiveProps (props) {
      const {options, values} = this._extractFromProps({...props});

      this.maskRef.updateOptions(options);

      this._updateValues(values);
    }

    componentWillUnmount () {
      this.maskRef.destroy();
    }

    render () {
      return React.createElement(ComposedComponent, {
        ...this._extractNonMaskProps(this.props),
        defaultValue: this.props.unmaskedValue || this.props.value,
        inputRef: (el) => this.element = el,
      });
    }

    initMask () {
      const {options, values} = this._extractFromProps({...this.props});

      this.maskRef = new IMask(this.element, options)
        .on('accept', this._onAccept.bind(this))
        .on('complete', this._onComplete.bind(this));

      this._updateValues(values);
    }

    _extractMaskProps (props) {
      props = {...props};

      // keep only mask props
      Object.keys(props)
        .filter(prop => !MaskedComponent.propTypes.hasOwnProperty(prop))
        .forEach(nonMaskProp => {
          delete props[nonMaskProp];
        });

      return props;
    }

    _extractNonMaskProps (props) {
      props = {...props};

      Object.keys(MaskedComponent.propTypes).forEach(maskProp => {
        delete props[maskProp];
      });

      return props;
    }

    _extractFromProps (props) {
      const value = props.value;
      const unmaskedValue = props.unmaskedValue;

      const maskProps = this._extractMaskProps(props);

      delete maskProps.value;
      delete maskProps.unmaskedValue;

      return {options: maskProps, values: {value, unmaskedValue}};
    }

    get maskValue () {
      return 'unmaskedValue' in this.props ?
        this.maskRef.unmaskedValue :
        this.maskRef.value
    }

    _updateValues (values) {
      for (const prop in values) {
        if (values[prop] != null) this.maskRef[prop] = values[prop];
      }
    }

    _onAccept () {
      if (this.props.onAccept) this.props.onAccept(this.maskValue);
    }

    _onComplete () {
      if (this.props.onComplete) this.props.onComplete(this.maskValue);
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
    ]).isRequired,
    value: PropTypes.string,
    unmaskedValue: PropTypes.string,
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
