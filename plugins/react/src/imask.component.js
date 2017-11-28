import React from 'react';
import {IMaskMixin} from './imask.mixin.js';


const InputComponent = ({inputRef, ...props}) =>
  React.createElement('input', {
    ...props,
    ref: inputRef
  });

export
const IMaskInput = IMaskMixin(InputComponent);
