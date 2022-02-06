import React from 'react';
import IMask from 'imask';
import IMaskMixin, { IMaskInputProps, Falsy, ReactElement } from './mixin';


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
  MaskElement extends ReactElement=ReactElement
>(
  props: IMaskInputProps<Opts, Unmask, Value, MaskElement>,
  ref: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement>>>
) =>
  React.createElement(IMaskInputClass as React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement>>, { ...props, ref })
;

const IMaskInput = React.forwardRef(IMaskInputFn as <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Unmask extends ('typed' | boolean) = false,
  Value = Unmask extends 'typed' ? IMask.InputMask<Opts>['typedValue'] :
    Unmask extends Falsy ? IMask.InputMask<Opts>['value'] :
    IMask.InputMask<Opts>['unmaskedValue'],
  MaskElement extends ReactElement=ReactElement
>(
  props: IMaskInputProps<Opts, Unmask, Value, MaskElement> & { ref?: React.Ref<React.ComponentType<IMaskInputProps<Opts, Unmask, Value, MaskElement>>> }
) => React.ReactElement<IMaskInputProps<Opts, Unmask, Value, MaskElement>>);


export default IMaskInput;
