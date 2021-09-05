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

// const MASK_PROPS_NAMES: Array<keyof typeof MASK_PROPS> = Object.keys(MASK_PROPS) as Array<keyof typeof MASK_PROPS>;
// const NON_MASK_OPTIONS_PROPS_NAMES = ['value', 'unmask', 'onAccept', 'onComplete', 'inputRef'];
// const MASK_OPTIONS_PROPS_NAMES = MASK_PROPS_NAMES.filter(pName =>
//   NON_MASK_OPTIONS_PROPS_NAMES.indexOf(pName) < 0
// );

export interface IMaskProps {
  mask: IMask.AnyMaskedOptions['mask'];
  value?: string;
  unmask?: 'typed' | boolean;
  prepare?: <T>(value: string, masked: IMask.Masked<T>, flags: IMask.AppendFlags) => string;
  validate?: <T>(value: string, masked: IMask.Masked<T>, flags: IMask.AppendFlags) => boolean;
  commit?: <T>(value: string, masked: IMask.Masked<T>) => void;
  overwrite?: boolean;

  onAccept: (value: IMask.InputMask<IMask.AnyMaskedOptions>['value' | 'typedValue' | 'unmaskedValue'], maskRef: IMask.InputMask<IMask.AnyMaskedOptions>, e?: InputEvent) => any;
  onComplete: (value: IMask.InputMask<IMask.AnyMaskedOptions>['value' | 'typedValue' | 'unmaskedValue'], maskRef: IMask.InputMask<IMask.AnyMaskedOptions>, e?: InputEvent) => any;

  placeholderChar?: string;
  lazy?: boolean;
  definitions?: { [key: string]: IMask.AnyMaskedOptions['mask'] };
  blocks?: { [key: string]: IMask.AnyMaskedOptions };

  pattern?: string;
  format?: (value: Date) => string;
  parse?: (value: string) => Date;
  autofix?: boolean;

  radix?: string;
  thousandsSeparator?: string;
  mapToRadix?: string[];
  scale?: number;
  signed?: boolean;
  normalizeZeros?: boolean;
  padFractionalZeros?: boolean
  min?: number | Date;
  max?: number | Date;

  dispatch?: (value: string, masked: IMask.Masked<IMask.AnyMaskedOptions['mask']>, flags: IMask.AppendFlags) => IMask.Masked<IMask.AnyMaskedOptions['mask']>;

  inputRef?: React.RefCallback<HTMLInputElement>;
}

export type IMaskInputProps = HTMLInputElement & IMaskProps & { inputRef: (el: HTMLInputElement) => void };

export default function IMaskMixin(ComposedComponent: React.ComponentType<IMaskProps & { inputRef: (el: HTMLInputElement) => void }>): React.ComponentType {
  const MaskedComponent = class extends React.Component<IMaskInputProps> {
    static displayName: string;
    
    element: HTMLInputElement;
    maskRef: IMask.InputMask<IMask.AnyMaskedOptions>;
    
    constructor (props: IMaskInputProps) {
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
          this.maskRef.updateOptions(maskOptions as Partial<IMask.AnyMaskedOptions>); // TODO
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
          this.initMask(maskOptions as IMask.AnyMaskedOptions); // TODO
        }
      } else {
        this.destroyMask();
        if ('value' in props) this.element.value = props.value;
      }
    }

    componentWillUnmount () {
      this.destroyMask();
    }

    _inputRef (el: HTMLInputElement){
      this.element = el;
      if (this.props.inputRef) this.props.inputRef(el);
    }

    initMask (maskOptions: IMask.AnyMaskedOptions = this._extractMaskOptionsFromProps(this.props) as IMask.AnyMaskedOptions) { // ???
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

    _extractMaskOptionsFromProps (props: IMaskInputProps): IMaskProps {
      const { ...cloneProps } = props;

      // keep only mask options props
      (Object.keys(cloneProps) as Array<keyof IMaskInputProps>)
        .filter(prop => MASK_OPTIONS_PROPS_NAMES.indexOf(prop) < 0)
        .forEach(nonMaskProp => {
          delete cloneProps[nonMaskProp];
        });

      return cloneProps;
    }

    _extractNonMaskProps (props: IMaskInputProps) {
      const { ...cloneProps } = props;

      (MASK_PROPS_NAMES as Array<keyof IMaskInputProps>).forEach(maskProp => {
        delete cloneProps[maskProp];
      });

      return props;
    }

    get maskValue () {
      if (this.props.unmask === 'typed') return this.maskRef.typedValue;
      if (this.props.unmask) return this.maskRef.unmaskedValue;
      return this.maskRef.value;
    }

    set maskValue (value) {
      value = value == null ? '' : value;
      if (this.props.unmask === 'typed') this.maskRef.typedValue = value;
      else if (this.props.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
    }

    _onAccept (e?: InputEvent) {
      if (this.props.onAccept) this.props.onAccept(this.maskValue, this.maskRef, e);
    }

    _onComplete (e?: InputEvent) {
      if (this.props.onComplete) this.props.onComplete(this.maskValue, this.maskRef, e);
    }

    render () {
      return React.createElement<{ inputRef: (el: HTMLInputElement) => void }>(ComposedComponent, {
        ...this._extractNonMaskProps(this.props),
        inputRef: this._inputRef,
      });
    }
  };

  const nestedComponentName = ComposedComponent.displayName || ComposedComponent.name || 'Component';
  MaskedComponent.displayName = `IMask(${nestedComponentName})`;

  return MaskedComponent;
}
