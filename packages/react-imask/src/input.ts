import React from 'react';
import IMask, { type InputMask } from 'imask';
import IMaskMixin, { IMaskInputProps, Falsy, ReactElementProps } from './mixin';


const IMaskInputClass = IMaskMixin(({ inputRef, ...props }) =>
  React.createElement('input', {
    ...props,
    ref: inputRef,
  })
);

const IMaskInputFn = <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? InputMask<Opts>['value'] :
    InputMask<Opts>['unmaskedValue'],
>(
  props: IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, ReactElementProps<HTMLInputElement>>,
  ref: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, ReactElementProps<HTMLInputElement>>>>
) =>
  // TODO type
  React.createElement(IMaskInputClass as unknown as React.ComponentType<IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, ReactElementProps<HTMLInputElement>>>, { ...props, ref })
;

const IMaskInput = React.forwardRef(IMaskInputFn as <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? InputMask<Opts>['value'] :
    InputMask<Opts>['unmaskedValue'],
>(
  props: IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, ReactElementProps<HTMLInputElement>> & { ref?: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, ReactElementProps<HTMLInputElement>>>> }
) => React.ReactElement<IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, ReactElementProps<HTMLInputElement>>>);


export default IMaskInput;
