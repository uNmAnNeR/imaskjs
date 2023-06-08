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
  MaskElement extends ReactElement=ReactElement,
> = {
  onAccept?: (value: Value, maskRef: IMask.InputMask<Opts>, e?: InputEvent) => void;
  onComplete?: (value: Value, maskRef: IMask.InputMask<Opts>, e?: InputEvent) => void;
  unmask?: Unmask;
  value?: Value;
  inputRef?: React.Ref<MaskElement>;
  ref?: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement>>>;
}

export
type ReactMixinComponent<
  MaskElement extends ReactElement=ReactElement,
  MaskElementProps=ReactElementProps<MaskElement>
> = React.ComponentType<MaskElementProps & { inputRef: React.Ref<MaskElement>; }>;

const MASK_PROPS: { [key in keyof (IMask.AllMaskedOptions & ReactMaskProps)]: any } = {
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
  eager: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['append', 'remove']),
  ]),
  skipInvalid: PropTypes.bool,

  // events
  onAccept: PropTypes.func,
  onComplete: PropTypes.func,

  // pattern
  placeholderChar: PropTypes.string,
  displayChar: PropTypes.string,
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
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
};

const MASK_PROPS_NAMES = Object.keys(MASK_PROPS).filter(p => p !== 'value');
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
> = IMask.DeduceMaskedOptions<Opts> & ReactMaskProps<Opts, Unmask, Value, MaskElement>;

export type IMaskInputProps<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement,
  MaskElementProps=ReactElementProps<MaskElement>,
> = MaskElementProps & IMaskMixinProps<Opts, Unmask, Value, MaskElement>;


// TODO
// 1. seems like it's wrong to have Opts as only mask options. Other component/input props should also be there. Where is "unmask" prop for instance?
// 2. Unmask should be infered from Opts (see https://github.com/uNmAnNeR/imaskjs/issues/554#issuecomment-1114014010)
export default function IMaskMixin<
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement,
  MaskElementProps=ReactElementProps<MaskElement>,
>(ComposedComponent: ReactMixinComponent<MaskElement, MaskElementProps>) {
  const MaskedComponent = class extends React.Component<IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>> {
    static displayName: string;
    static propTypes: typeof MASK_PROPS;

    element: MaskElement;
    maskRef: IMask.InputMask<Opts>;

    constructor (props: IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>) {
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
          this.maskRef.updateOptions(maskOptions);
          if ('value' in props) this.maskValue = props.value;
        } else {
          this.initMask(maskOptions);
        }
      } else {
        this.destroyMask();
        if ('value' in props) this.element.value = props.value as unknown as IMask.InputMask<Opts>['value'];
      }
    }

    componentWillUnmount () {
      this.destroyMask();
    }

    _inputRef (el: MaskElement) {
      this.element = el;
      if (this.props.inputRef) {
        if (Object.prototype.hasOwnProperty.call(this.props.inputRef, 'current'))
          (this.props.inputRef as React.MutableRefObject<MaskElement>).current = el;
        else
          (this.props.inputRef as React.RefCallback<MaskElement>)(el);
      }
    }

    initMask (maskOptions: Opts = this._extractMaskOptionsFromProps(this.props)) {
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

    _extractMaskOptionsFromProps (props: Readonly<IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>>): Opts {
      const { ...cloneProps } = props;

      // keep only mask options props
      (Object.keys(cloneProps) as Array<keyof IMaskMixinProps<Opts, Unmask, Value, MaskElement>>)
        // TODO why need cast to string?
        .filter(prop => MASK_OPTIONS_PROPS_NAMES.indexOf(prop as string) < 0)
        .forEach(nonMaskProp => {
          delete cloneProps[nonMaskProp];
        });

      // TODO type actually should be IMask.DeduceMasked<Opts>
      return cloneProps as unknown as Opts;
    }

    _extractNonMaskProps (props: Readonly<IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>>): MaskElementProps {
      const { ...cloneProps } = props as any;

      (MASK_PROPS_NAMES as Array<keyof IMaskMixinProps<Opts, Unmask, Value, MaskElement>>).forEach(maskProp => {
        delete cloneProps[maskProp];
      });
      if (!('defaultValue' in cloneProps)) cloneProps.defaultValue = props.mask ? '' : cloneProps.value;
      delete cloneProps.value;

      return cloneProps as MaskElementProps;
    }

    get maskValue (): Value {
      if (this.props.unmask === 'typed') return this.maskRef.typedValue as unknown as Value;
      if (this.props.unmask) return this.maskRef.unmaskedValue as unknown as Value;
      return this.maskRef.value as unknown as Value;
    }

    set maskValue (value: Value) {
      value = (value == null && this.props.unmask !== 'typed' ? '' : value) as Value;
      if (this.props.unmask === 'typed') this.maskRef.typedValue = value as unknown as IMask.MaskedTypedValue<Opts['mask']>;
      else if (this.props.unmask) this.maskRef.unmaskedValue = value as unknown as IMask.InputMask<Opts>['unmaskedValue'];
      else this.maskRef.value = value as unknown as IMask.InputMask<Opts>['value'];
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

  return React.forwardRef<
    React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>>,
    IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>
  >((props, ref) => React.createElement(MaskedComponent, { ...props, ref }));
}
