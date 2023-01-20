import React from 'react';
import IMaskMixin from './mixin';


const IMaskInput = IMaskMixin(({ inputRef, ...props }) =>
  React.createElement('input', {
    ...props,
    ref: inputRef,
  })
);


export default IMaskInput;
