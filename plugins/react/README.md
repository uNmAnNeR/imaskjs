# React IMask Plugin
react-imask

## Install
`npm install react-imask`

## Simple usage example
```javascript
import {IMaskInput} from 'react-imask';

<IMaskInput
  mask=Number,
  radix=".",
  onAccept={(value, mask) => console.log(value)},
  // ...and more mask props in a guide

  // input props also available
  placeholder='Enter number here'
/>
```

## Use with existing components
```javascript
import {IMaskMixin} from 'react-imask';

// extend style component
const StyledInput = styled.input`
  color: paleviolet;
`;

const MaskedStyledInput = IMaskMixin(({inputRef, ...props}) => (
  <StyledInput
    ...props,
    innerRef={inputRef}  // binds internal input
  />
));

<MaskedStyledInput
  mask=Number,
  radix=".",
  onAccept={(value, mask) => console.log(value)},
  // ...and more mask props in a guide

  // ...other styled props
/>
```
