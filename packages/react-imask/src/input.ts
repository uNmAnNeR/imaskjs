import React from 'react';
import IMask from 'imask';
import IMaskMixin, { IMaskInputProps, Falsy } from './mixin';


const InputComponent = <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue']
>({ inputRef, ...props }: IMaskInputProps<Opts, Unmask, Value>) =>
  React.createElement('input', {
    ...props,
    ref: inputRef,
  });

const IMaskInputClass = IMaskMixin(InputComponent);

const IMaskInput = <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue']
>(props: IMaskInputProps<Opts, Unmask, Value>): React.ReactElement<IMaskInputProps<Opts, Unmask, Value>> =>
  React.createElement(IMaskInputClass as any, props);


export default IMaskInput;
