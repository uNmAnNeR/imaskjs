# React Native IMask Plugin
react-native-imask

[![npm version](https://badge.fury.io/js/react-imask.svg)](https://badge.fury.io/js/react-native-imask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://opencollective.com/imask/donate" target="_blank">
  <img src="https://opencollective.com/imask/donate/button.png?color=blue" width=300 />
</a>

## Install
`npm install react-native-imask`

## Masked TextInput Example
```javascript
import {IMaskTextInput} from 'react-native-imask';

<IMaskTextInput
  mask={Number}
  radix="."
  value="123"
  unmask={true} // true|false|'typed'
  onAccept={
    // depending on prop above first argument is
    // `value` if `unmask=false`,
    // `unmaskedValue` if `unmask=true`,
    // `typedValue` if `unmask='typed'`
    (value, mask) => console.log(value)  // probably should update state
  }
  // ...and more mask props in a guide

  // other TextInput props
  editable={true}
  style={{
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1
  }}
/>
```

## Extend Existing Components
```javascript
import {IMaskNativeMixin} from 'react-native-imask';

// use `inputRef` to get reference for our custom text input component
const InputComponent = ({inputRef, ...props}) => (
  <TextInput
    ...props
    ref: inputRef
  />
);

// wrap component with IMaskNativeMixin
const IMaskTextInput = IMaskNativeMixin(InputComponent);

// use MaskedComponent
<IMaskTextInput
  mask="0000"
  // ...other props
/>
```

More options see in a [guide](https://imask.js.org/guide.html).

## Many Thanks to
[@Yordis Prieto](https://github.com/yordis)

## Support Development
[Paypal](https://www.paypal.me/alexeykryazhev/3)
