import React from 'react';
import IMaskMixin, { IMaskInputProps } from './mixin';


const InputComponent = ({ inputRef, ...props }: IMaskInputProps) =>
  React.createElement('input', {
    ...props,
    ref: inputRef
  });


const IMaskInput = IMaskMixin(InputComponent);
export default IMaskInput;
