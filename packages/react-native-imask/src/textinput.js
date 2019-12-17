import React from 'react';
import {TextInput} from 'react-native';

import IMaskNativeMixin from './mixin';


const InputComponent = ({inputRef, ...props}) =>
  React.createElement(TextInput, {
    ...props,
    ref: inputRef
  });
const IMaskTextInput = IMaskNativeMixin(InputComponent);


export default IMaskTextInput;
