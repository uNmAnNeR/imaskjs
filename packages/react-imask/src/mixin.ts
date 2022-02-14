import React from 'react';
import PropTypes from 'prop-types';
import IMask from 'imask';


export
type Falsy = false | 0 | "" | null | undefined;

// TODO should be imported from core
export
type ReactElement = IMask.MaskElement | HTMLTextAreaElement | HTMLInputElement;

export
type ReactElementProps<MaskElement extends ReactElement=ReactElement> = React.HTMLProps<MaskElement>;

export
type ReactMaskProps<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement
> = {
  onAccept?: (value: Value, maskRef: IMask.InputMask<Opts>, e?: InputEvent) => void;
  onComplete?: (value: Value, maskRef: IMask.InputMask<Opts>, e?: InputEvent) => void;
  unmask?: Unmask;
  value?: Value;
  inputRef?: React.RefCallback<MaskElement>;
  ref?: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement>>>;
}

export
type ReactMixinComponent<MaskElement extends ReactElement=ReactElement> = React.ComponentType<ReactElementProps<MaskElement> & { inputRef: React.RefCallback<MaskElement>; }>;

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
  overwrite: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['shift']),
  ]),
  eager: PropTypes.bool,

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
  autofix: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['pad']),
  ]),

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
  inputRef: PropTypes.func,
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
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement
> = Opts & ReactMaskProps<Opts, Unmask, Value, MaskElement>;

export type IMaskInputProps<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement
> = ReactElementProps<MaskElement> & IMaskMixinProps<Opts, Unmask, Value, MaskElement>;

export default function IMaskMixin<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement
>(ComposedComponent: ReactMixinComponent<MaskElement>) {
  const MaskedComponent = class extends React.Component<IMaskInputProps<Opts, Unmask, Value, MaskElement>> {
    static displayName: string;
    static propTypes: typeof MASK_PROPS;

    element: MaskElement;
    maskRef: IMask.InputMask<Opts>;

    constructor (props: IMaskInputProps<Opts, Unmask, Value, MaskElement>) {
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
          if ('value' in props) this.maskValue = props.value;
        } else {
          this.initMask(maskOptions as Opts); // TODO
        }
      } else {
        this.destroyMask();
        if ('value' in props) this.element.value = props.value as string;
      }
    }

    componentWillUnmount () {
      this.destroyMask();
    }

    _inputRef (el: MaskElement){
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

    _extractMaskOptionsFromProps (props: IMaskInputProps<Opts, Unmask, Value, MaskElement>): Opts {
      const { ...cloneProps } = props;

      // keep only mask options props
      (Object.keys(cloneProps) as Array<keyof IMaskInputProps<Opts, Unmask, Value, MaskElement>>)
        // TODO why need cast to string?
        .filter(prop => MASK_OPTIONS_PROPS_NAMES.indexOf(prop as string) < 0)
        .forEach(nonMaskProp => {
          delete cloneProps[nonMaskProp];
        });

      return cloneProps as unknown as Opts;
    }

    _extractNonMaskProps (props: IMaskInputProps<Opts, Unmask, Value, MaskElement>): ReactElementProps<MaskElement> {
      const { ...cloneProps } = props;

      (MASK_PROPS_NAMES as Array<keyof IMaskInputProps<Opts, Unmask, Value, MaskElement>>).forEach(maskProp => {
        delete cloneProps[maskProp];
      });

      return cloneProps;
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
      if (this.props.onAccept && this.maskRef) this.props.onAccept(this.maskValue, this.maskRef, e);
    }

    _onComplete (e?: InputEvent) {
      if (this.props.onComplete && this.maskRef) this.props.onComplete(this.maskValue, this.maskRef, e);
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

  return MaskedComponent as React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement>>;
}
