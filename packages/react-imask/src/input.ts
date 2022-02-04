import React from 'react';
import IMask from 'imask';
import IMaskMixin, { IMaskInputProps, Falsy, ReactElement } from './mixin';


const IMaskInputClass = IMaskMixin(({ inputRef, ...props }) =>
  React.createElement('input', {
    ...props,
    ref: inputRef,
  })
);

const IMaskInput = <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement
>(props: IMaskInputProps<Opts, Unmask, Value, MaskElement>): React.ReactElement<IMaskInputProps<Opts, Unmask, Value, MaskElement>> =>
  React.createElement(IMaskInputClass as any, props);


export default IMaskInput;
