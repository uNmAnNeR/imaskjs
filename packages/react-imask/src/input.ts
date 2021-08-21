import React from 'react';
import IMaskMixin from './mixin';


const InputComponent = ({inputRef, ...props}) =>
  React.createElement('input', {
    ...props,
    ref: inputRef
  });


const IMaskInput = IMaskMixin(InputComponent);
export default IMaskInput;
