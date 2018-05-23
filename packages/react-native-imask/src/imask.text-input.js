import React from 'react';
import {TextInput} from 'react-native';

import {IMaskNativeMixin} from './imask.native.mixin.js';


const InputComponent = ({inputRef, ...props}) =>
  React.createElement(TextInput, {
    ...props,
    ref: inputRef
  });

export
const IMaskTextInput = IMaskNativeMixin(InputComponent);
