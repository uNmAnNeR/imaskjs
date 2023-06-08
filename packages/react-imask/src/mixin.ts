import React from 'react';
import PropTypes from 'prop-types';
import IMask, { type InputMask, type InputMaskElement, type FactoryOpts, type AllFactoryStaticOpts } from 'imask';


export
type Falsy = false | 0 | "" | null | undefined;

type ReactMaskOpts = FactoryOpts & { unmask?: 'typed' | boolean };

export
type UnmaskValue<Opts extends ReactMaskOpts> =
  Opts['unmask'] extends 'typed' ? InputMask<Opts>['typedValue'] :
  Opts['unmask'] extends Falsy ? InputMask<Opts>['value'] :
  InputMask<Opts>['unmaskedValue']
;

export
type ReactMaskProps<
  MaskElement extends InputMaskElement,
  Opts extends ReactMaskOpts=ReactMaskOpts,
> = {
  onAccept?: (value: UnmaskValue<Opts>, maskRef: InputMask<Opts>, e?: InputEvent) => void;
  onComplete?: (value: UnmaskValue<Opts>, maskRef: InputMask<Opts>, e?: InputEvent) => void;
  unmask?: Opts['unmask'];
  value?: UnmaskValue<Opts>;
  inputRef?: React.Ref<MaskElement>;
  ref?: React.Ref<React.ComponentType<IMaskInputProps<MaskElement>>>;
}

const MASK_PROPS: { [key in keyof (AllFactoryStaticOpts & ReactMaskProps<InputMaskElement, AllFactoryStaticOpts>)]: any } = {
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
  prepareChar: PropTypes.func,
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

  // enum
  enum: PropTypes.arrayOf(PropTypes.string),

  // range
  maxLength: PropTypes.number,
  from: PropTypes.number,
  to: PropTypes.number,

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
} as const;

const MASK_PROPS_NAMES = (Object.keys(MASK_PROPS) as Array<keyof typeof MASK_PROPS>).filter(p => p !== 'value');
const NON_MASK_OPTIONS_PROPS_NAMES = ['value', 'unmask', 'onAccept', 'onComplete', 'inputRef'] as const;

type ReactElementProps<MaskElement extends InputMaskElement> = Omit<Omit<React.HTMLProps<MaskElement>, keyof typeof MASK_PROPS>, typeof NON_MASK_OPTIONS_PROPS_NAMES[number]>;
type NonMaskProps<
  MaskElement extends InputMaskElement,
  Props extends IMaskMixinProps<MaskElement>=IMaskMixinProps<MaskElement>
> = Omit<Props, keyof FactoryOpts>;

export
type ReactMixinComponent<
  MaskElement extends InputMaskElement,
> = React.ComponentType<ReactElementProps<MaskElement> & { inputRef: React.Ref<MaskElement>; }>;

type MaskPropsKeys = Exclude<keyof typeof MASK_PROPS, typeof NON_MASK_OPTIONS_PROPS_NAMES[number]>;
const MASK_OPTIONS_PROPS_NAMES = MASK_PROPS_NAMES.filter(pName =>
  NON_MASK_OPTIONS_PROPS_NAMES.indexOf(pName as typeof NON_MASK_OPTIONS_PROPS_NAMES[number]) < 0
) as Array<MaskPropsKeys>;

type MaskOpts<
  MaskElement extends InputMaskElement,
  Props extends IMaskInputProps<MaskElement>=IMaskInputProps<MaskElement>
> = Extract<Props, FactoryOpts>;

export type IMaskMixinProps<
  MaskElement extends InputMaskElement,
  Props extends ReactMaskOpts & ReactMaskProps<MaskElement>=ReactMaskOpts & ReactMaskProps<MaskElement>,
> = Props & ReactMaskProps<MaskElement, Props>;

export type IMaskInputProps<
  MaskElement extends InputMaskElement,
  Props extends IMaskMixinProps<MaskElement>=IMaskMixinProps<MaskElement>,
> = ReactElementProps<MaskElement> & IMaskMixinProps<MaskElement, Props>;


export default function IMaskMixin<
  MaskElement extends InputMaskElement,
  Props extends IMaskInputProps<MaskElement>,
>(ComposedComponent: ReactMixinComponent<MaskElement>) {
  const MaskedComponent = class extends React.Component<Props> {
    static displayName: string;
    static propTypes: typeof MASK_PROPS;

    element: MaskElement;
    maskRef: InputMask<MaskOpts<MaskElement, Props>>;

    constructor (props: Props) {
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
        if ('value' in props) {
          if ((this.element as HTMLElement)?.isContentEditable && (this.element as HTMLElement).tagName !== 'INPUT' && (this.element as HTMLElement).tagName !== 'TEXTAREA') (this.element as HTMLElement).textContent = props.value;
          else (this.element as HTMLInputElement).value = props.value;
        }
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

    initMask (maskOptions: MaskOpts<MaskElement, Props> = this._extractMaskOptionsFromProps(this.props)) {
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

    _extractMaskOptionsFromProps (props: Readonly<Props>): MaskOpts<MaskElement, Props> {
      const { ...cloneProps }: Readonly<Props> = props;

      // keep only mask options
      (Object.keys(cloneProps) as Array<keyof Props>)
        .filter(prop => MASK_OPTIONS_PROPS_NAMES.indexOf(prop as MaskPropsKeys) < 0)
        .forEach(nonMaskProp => {
          delete cloneProps[nonMaskProp];
        });

      return cloneProps as MaskOpts<MaskElement, Props>;
    }

    _extractNonMaskProps (props: Readonly<Props>): NonMaskProps<MaskElement, Props> {
      const { ...cloneProps }: Readonly<Props> = props;

      (MASK_PROPS_NAMES as Array<keyof Props>).forEach(maskProp => {
        delete cloneProps[maskProp];
      });
      if (!('defaultValue' in cloneProps)) cloneProps.defaultValue = props.mask ? '' : cloneProps.value;
      delete cloneProps.value;

      return cloneProps as NonMaskProps<MaskElement, Props>;
    }

    get maskValue (): UnmaskValue<Props> {
      if (this.props.unmask === 'typed') return this.maskRef.typedValue as unknown as UnmaskValue<Props>;
      if (this.props.unmask) return this.maskRef.unmaskedValue as unknown as UnmaskValue<Props>;
      return this.maskRef.value as unknown as UnmaskValue<Props>;
    }

    set maskValue (value: UnmaskValue<Props>) {
      value = (value == null && this.props.unmask !== 'typed' ? '' : value) as UnmaskValue<Props>;
      if (this.props.unmask === 'typed') this.maskRef.typedValue = value;
      else if (this.props.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
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
    React.ComponentType<Props>,
    Props
  >((props, ref) => React.createElement(MaskedComponent, { ...props, ref }));
}
