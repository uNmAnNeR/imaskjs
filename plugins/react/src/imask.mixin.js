import PropTypes from 'prop-types';
import IMask from 'imask';


export
function IMaskMixin(Component) {
  const MaskedComponent = class extends Component {
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
      const props = {...this.props};

      // keep only non mask props
      Object.keys(MaskedComponent.propTypes).forEach(maskProp => {
        delete props[maskProp];
      });

      return (
        <input
          {...props}
          defaultValue={this.props.value}
          ref={(element) => (this.element = element)}
        />
      );
    }

    initMask () {
      const {options, values} = this._extractFromProps({...this.props});

      this.maskRef = new IMask(this.element, options)
        .on('accept', this._onAccept.bind(this))
        .on('complete', this._onComplete.bind(this));

      this._updateValues(values);
    }

    _extractFromProps (props) {
      const value = props.value;
      const unmaskedValue = props.unmaskedValue;

      Object.keys(props)
        .filter(prop => !MaskedComponent.propTypes.hasOwnProperty(prop))
        .forEach(nonMaskProp => {
          delete props[nonMaskProp];
        });

      delete props.value;
      delete props.unmaskedValue;

      return {options: props, values: {value, unmaskedValue}};
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

  return MaskedComponent;
}
