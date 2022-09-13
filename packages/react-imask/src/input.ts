import React from 'react';
import IMask from 'imask';
import IMaskMixin, { IMaskInputProps, Falsy, ReactElement, ReactElementProps } from './mixin';


const IMaskInputClass = IMaskMixin(({ inputRef, ...props }) =>
  React.createElement('input', {
    ...props,
    ref: inputRef,
  })
);

const IMaskInputFn = <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement,
  MaskElementProps=ReactElementProps<MaskElement>,
>(
  props: IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>,
  ref: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>>>
) =>
  React.createElement(IMaskInputClass as React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>>, { ...props, ref })
;

const IMaskInput = React.forwardRef(IMaskInputFn as <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement,
  MaskElementProps=ReactElementProps<MaskElement>,
>(
  props: IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps> & { ref?: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>>> }
) => React.ReactElement<IMaskInputProps<Opts, Unmask, Value, MaskElement, MaskElementProps>>);


export default IMaskInput;
