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
        defaultValue: this.props.value,
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

      // keep only non mask props
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

    _updateValues (values) {
      for (const prop in values) {
        if (values[prop] != null) this.maskRef[prop] = values[prop];
      }
    }

    _onAccept (...args) {
      if (this.props.onAccept) this.props.onAccept(...args);
    }

    _onComplete (...args) {
      if (this.props.onComplete) this.props.onComplete(...args);
    }
  };

  MaskedComponent.propTypes = {
    // common
    mask: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.func,
      PropTypes.string,
      PropTypes.instanceOf(RegExp),
      PropTypes.oneOf([Date, Number]),
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
    placeholderLazy: PropTypes.bool,
    definitions: PropTypes.object,
    groups: PropTypes.object,

    // date
    pattern: PropTypes.string,
    format: PropTypes.func,
    parse: PropTypes.func,

    // number
    radix: PropTypes.string,
    thousandsSeparator: PropTypes.PropTypes.string,
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
