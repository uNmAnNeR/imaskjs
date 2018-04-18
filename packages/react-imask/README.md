# React IMask Plugin
react-imask

[![npm version](https://badge.fury.io/js/react-imask.svg)](https://badge.fury.io/js/react-imask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Install
`npm install react-imask`

## Mask Input Example
```javascript
import {IMaskInput} from 'react-imask';

<IMaskInput
  mask=Number
  radix="."
  value="123"
  unmask="true"
  onAccept={
    // first argument will be `value` or `unmaskedValue` depending on prop above
    (value, mask) => console.log(value)
  }
  // ...and more mask props in a guide

  // input props also available
  placeholder='Enter number here'
/>
```

## Extend Existing Components
```javascript
import {IMaskMixin} from 'react-imask';

// extend style component
const StyledInput = styled.input`
  color: paleviolet;
`;

const MaskedStyledInput = IMaskMixin(({inputRef, ...props}) => (
  <StyledInput
    ...props
    innerRef={inputRef}  // bind internal input
  />
));

<MaskedStyledInput
  mask=Number
  radix="."
  onAccept={(value, mask) => console.log(value)}
  // ...and more mask props in a guide

  // ...other styled props
/>
```
More options see in a [guide](https://unmanner.github.io/imaskjs/guide.html).

## Many Thanks to
[@Yordis Prieto](https://github.com/yordis)

[@Alexander Kiselev](https://github.com/MaaKut)

## Support development
[https://www.paypal.me/alexeykryazhev](https://www.paypal.me/alexeykryazhev)
