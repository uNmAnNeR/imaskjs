import React from 'react';
import PropTypes from 'prop-types';
import IMask from 'imask';


export
type Falsy = false | 0 | "" | null | undefined;

export
type MaskedElement = HTMLInputElement | HTMLTextAreaElement;

export
type ReactMaskProps<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue']
> = {
  onAccept?: (value: Value, maskRef: IMask.InputMask<Opts>, e?: InputEvent) => void;
  onComplete?: (value: Value, maskRef: IMask.InputMask<Opts>, e?: InputEvent) => void;
  unmask?: Unmask;
  value?: Value;
  inputRef: (el: MaskedElement) => void;
}

const MASK_PROPS: { [key in keyof (IMask.AllMaskedOptions & ReactMaskProps)]: unknown } = {
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

export type IMaskMixinProps<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue']
> = IMask.AllMaskedOptions & ReactMaskProps<Opts, Unmask, Value>;
export type IMaskInputProps<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue']
> = MaskedElement & IMaskMixinProps<Opts, Unmask, Value>;

export default function IMaskMixin<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue']
>(ComposedComponent: React.ComponentType<IMaskMixinProps<Opts, Unmask, Value>>): React.ComponentType {
  const MaskedComponent = class extends React.Component<IMaskInputProps<Opts, Unmask, Value>> {
    static displayName: string;
    static propTypes: typeof MASK_PROPS;
    
    element: MaskedElement;
    maskRef: IMask.InputMask<Opts>;
    
    constructor (props: IMaskInputProps<Opts, Unmask, Value>) {
      super(props);
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
          this.maskRef.updateOptions(maskOptions as Partial<Opts>); // TODO
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
          this.initMask(maskOptions as Opts); // TODO
        }
      } else {
        this.destroyMask();
        if ('value' in props) this.element.value = props.value;
      }
    }

    componentWillUnmount () {
      this.destroyMask();
    }

    _inputRef (el: MaskedElement){
      this.element = el;
      if (this.props.inputRef) this.props.inputRef(el);
    }

    initMask (maskOptions: Opts = this._extractMaskOptionsFromProps(this.props) as Opts) {
      this.maskRef = IMask(this.element, maskOptions)
        .on('accept', this._onAccept.bind(this))
        .on('complete', this._onComplete.bind(this));

      if ('value' in this.props) this.maskValue = this.props.value;
    }

    destroyMask () {
      if (this.maskRef) {
        this.maskRef.destroy();
        delete this.maskRef;
      }
    }

    _extractMaskOptionsFromProps (props: IMaskInputProps<Opts, Unmask, Value>): Opts {
      const { ...cloneProps } = props;

      // keep only mask options props
      (Object.keys(cloneProps) as Array<keyof IMaskInputProps<Opts, Unmask, Value>>)
        .filter(prop => MASK_OPTIONS_PROPS_NAMES.indexOf(prop) < 0)
        .forEach(nonMaskProp => {
          delete cloneProps[nonMaskProp];
        });

      return cloneProps as unknown as Opts;
    }

    _extractNonMaskProps (props: IMaskInputProps<Opts, Unmask, Value>) {
      const { ...cloneProps } = props;

      (MASK_PROPS_NAMES as Array<keyof IMaskInputProps<Opts, Unmask, Value>>).forEach(maskProp => {
        delete cloneProps[maskProp];
      });

      return props;
    }

    get maskValue (): Value {
      if (this.props.unmask === 'typed') return this.maskRef.typedValue as unknown as Value;
      if (this.props.unmask) return this.maskRef.unmaskedValue as unknown as Value;
      return this.maskRef.value as unknown as Value;
    }

    set maskValue (value: Value) {
      value = (value == null ? '' : value) as Value;
      if (this.props.unmask === 'typed') this.maskRef.typedValue = value as unknown as IMask.MaskedTypedValue<Opts['mask']>;
      else if (this.props.unmask) this.maskRef.unmaskedValue = value as unknown as string;
      else this.maskRef.value = value as unknown as string;
    }

    _onAccept (e?: InputEvent) {
      if (this.props.onAccept) this.props.onAccept(this.maskValue, this.maskRef, e);
    }

    _onComplete (e?: InputEvent) {
      if (this.props.onComplete) this.props.onComplete(this.maskValue, this.maskRef, e);
    }

    render () {
      return React.createElement(ComposedComponent, {
        ...this._extractNonMaskProps(this.props),
        inputRef: this._inputRef,
      });
    }
  };

  const nestedComponentName = ComposedComponent.displayName || ComposedComponent.name || 'Component';
  MaskedComponent.displayName = `IMask(${nestedComponentName})`;
  MaskedComponent.propTypes = MASK_PROPS;

  return MaskedComponent;
}
