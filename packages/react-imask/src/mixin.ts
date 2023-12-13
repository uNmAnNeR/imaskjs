import React from 'react';
import PropTypes from 'prop-types';
import IMask, { type InputMask, type InputMaskElement, type FactoryOpts, type AllFactoryStaticOpts } from 'imask';


type AnyProps = Record<string, unknown>;

export
type Falsy = false | 0 | "" | null | undefined;

export
type ReactMaskOpts = FactoryOpts & { unmask?: 'typed' | boolean };

export
type UnmaskValue<Opts extends ReactMaskOpts> =
  Opts['unmask'] extends 'typed' ? InputMask<Opts>['typedValue'] :
  Opts['unmask'] extends Falsy ? InputMask<Opts>['value'] :
  InputMask<Opts>['unmaskedValue']
;

export
type ExtractReactMaskOpts<
  MaskElement extends InputMaskElement,
  Props extends IMaskInputProps<MaskElement>,
> = Extract<Props, ReactMaskOpts>;

export
type ReactMaskProps<
  MaskElement extends InputMaskElement,
  Props extends IMaskInputProps<MaskElement>=AnyProps,
> = {
  onAccept?: (value: UnmaskValue<ExtractReactMaskOpts<MaskElement, Props>>, maskRef: InputMask<ExtractMaskOpts<MaskElement, Props>>, e?: InputEvent) => void;
  onComplete?: (value: UnmaskValue<ExtractReactMaskOpts<MaskElement, Props>>, maskRef: InputMask<ExtractMaskOpts<MaskElement, Props>>, e?: InputEvent) => void;
  unmask?: ExtractReactMaskOpts<MaskElement, Props>['unmask'];
  value?: UnmaskValue<ExtractReactMaskOpts<MaskElement, Props>>;
  inputRef?: React.Ref<MaskElement>;
  ref?: React.Ref<React.ComponentType<Props>>;
}

const MASK_PROPS: { [key in keyof (AllFactoryStaticOpts & ReactMaskProps<InputMaskElement, AllFactoryStaticOpts>)]: any } = {
  // common
  mask: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.func,
    PropTypes.string,
    PropTypes.instanceOf(RegExp),
    PropTypes.oneOf([Date, Number, IMask.Masked]),
    PropTypes.instanceOf(IMask.Masked as any),
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
const NON_MASK_OPTIONS_NAMES = ['value', 'unmask', 'onAccept', 'onComplete', 'inputRef'] as const;

export
type ReactElementProps<MaskElement extends InputMaskElement> =
  Omit<Omit<React.HTMLProps<MaskElement>, keyof typeof MASK_PROPS>, typeof NON_MASK_OPTIONS_NAMES[number] | 'maxLength'>;

type NonMaskProps<
  MaskElement extends InputMaskElement,
  Props extends IMaskMixinProps<MaskElement>=AnyProps
> = Omit<Props, keyof FactoryOpts>;

export
type ReactMixinComponent<
  MaskElement extends InputMaskElement,
  Props extends IMaskMixinProps<MaskElement>=AnyProps,
> = React.ComponentType<
  & ReactElementProps<MaskElement>
  & { inputRef: React.Ref<MaskElement> }
  & NonMaskProps<MaskElement, Props>
>;

export
type MaskPropsKeys = Exclude<keyof typeof MASK_PROPS, typeof NON_MASK_OPTIONS_NAMES[number]>;
const MASK_OPTIONS_NAMES = MASK_PROPS_NAMES.filter(pName =>
  NON_MASK_OPTIONS_NAMES.indexOf(pName as typeof NON_MASK_OPTIONS_NAMES[number]) < 0
) as Array<MaskPropsKeys>;

export
type ExtractMaskOpts<
  MaskElement extends InputMaskElement,
  Props extends IMaskInputProps<MaskElement>,
> = Extract<Props, FactoryOpts>;

export
type IMaskMixinProps<MaskElement extends InputMaskElement> =
  Omit<ReactMaskProps<MaskElement>, 'ref'> & FactoryOpts;

export
type IMaskInputProps< MaskElement extends InputMaskElement> =
  ReactElementProps<MaskElement> & IMaskMixinProps<MaskElement>;


export default
function IMaskMixin<
  MaskElement extends InputMaskElement,
  Props extends IMaskInputProps<MaskElement>=AnyProps,
>(ComposedComponent: ReactMixinComponent<MaskElement, Props>) {
  const MaskedComponent = class extends React.Component<Props> {
    static displayName: string;
    static propTypes: typeof MASK_PROPS;

    declare element: MaskElement;
    declare maskRef?: InputMask<ExtractMaskOpts<MaskElement, Props>>;

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
          this.maskRef.updateOptions(maskOptions as any); // TODO fix
          if ('value' in props && props.value !== undefined) this.maskValue = props.value;
        } else {
          this.initMask(maskOptions);
        }
      } else {
        this.destroyMask();
        if ('value' in props && props.value !== undefined) {
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

    initMask (maskOptions: ExtractMaskOpts<MaskElement, Props> = this._extractMaskOptionsFromProps(this.props)) {
      this.maskRef = IMask(this.element, maskOptions)
        .on('accept', this._onAccept.bind(this))
        .on('complete', this._onComplete.bind(this));

      if ('value' in this.props && this.props.value !== undefined) this.maskValue = this.props.value;
    }

    destroyMask () {
      if (this.maskRef) {
        this.maskRef.destroy();
        delete this.maskRef;
      }
    }

    _extractMaskOptionsFromProps (props: Readonly<Props>): ExtractMaskOpts<MaskElement, Props> {
      const { ...cloneProps }: Readonly<Props> = props;

      // keep only mask options
      (Object.keys(cloneProps) as Array<keyof Props>)
        .filter(prop => MASK_OPTIONS_NAMES.indexOf(prop as MaskPropsKeys) < 0)
        .forEach(nonMaskProp => {
          delete cloneProps[nonMaskProp];
        });

      return cloneProps as ExtractMaskOpts<MaskElement, Props>;
    }

    _extractNonMaskProps (props: Readonly<Props>): NonMaskProps<MaskElement, Props> {
      const { ...cloneProps } = props as Props;

      (MASK_PROPS_NAMES as Array<keyof Props>).forEach(maskProp => {
        if (maskProp !== 'maxLength') delete cloneProps[maskProp];
      });
      if (!('defaultValue' in cloneProps)) cloneProps.defaultValue = props.mask ? '' : cloneProps.value;
      delete cloneProps.value;

      return cloneProps as NonMaskProps<MaskElement, Props>;
    }

    get maskValue (): UnmaskValue<ExtractReactMaskOpts<MaskElement, Props>> {
      if (!this.maskRef) return '' as UnmaskValue<ExtractReactMaskOpts<MaskElement, Props>>;

      if (this.props.unmask === 'typed') return this.maskRef.typedValue;
      if (this.props.unmask) return this.maskRef.unmaskedValue;
      return this.maskRef.value;
    }

    set maskValue (value: UnmaskValue<ExtractReactMaskOpts<MaskElement, Props>>) {
      if (!this.maskRef) return;

      value = (value == null && this.props.unmask !== 'typed' ? '' : value) as UnmaskValue<ExtractReactMaskOpts<MaskElement, Props>>;
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

  return React.forwardRef<React.ComponentType<Props>, Props>(
    (props, ref) => React.createElement(MaskedComponent, { ...props, ref })
  );
}
