import React from 'react';
import IMask, { type InputMask } from 'imask';
import IMaskMixin, { IMaskInputProps, Falsy } from './mixin';


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
  props: IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, React.HTMLProps<HTMLInputElement>>,
  ref: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, React.HTMLProps<HTMLInputElement>>>>
) =>
  // TODO type
  React.createElement(IMaskInputClass as unknown as React.ComponentType<IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, React.HTMLProps<HTMLInputElement>>>, { ...props, ref })
;

const IMaskInput = React.forwardRef(IMaskInputFn as <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? InputMask<Opts>['value'] :
    InputMask<Opts>['unmaskedValue'],
>(
  props: IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, React.HTMLProps<HTMLInputElement>> & { ref?: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, React.HTMLProps<HTMLInputElement>>>> }
) => React.ReactElement<IMaskInputProps<Opts, Unmask, Value, HTMLInputElement, React.HTMLProps<HTMLInputElement>>>);


export default IMaskInput;
