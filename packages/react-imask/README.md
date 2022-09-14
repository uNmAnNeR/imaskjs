# React IMask Plugin
react-imask

[![npm version](https://badge.fury.io/js/react-imask.svg)](https://badge.fury.io/js/react-imask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://opencollective.com/imask/donate" target="_blank">
  <img src="https://opencollective.com/imask/donate/button.png?color=blue" width=300 />
</a>

## Install
`npm install react-imask`

## Mask Input Example
```javascript
import { useRef } from 'react';
import { IMaskInput } from 'react-imask';

// use ref to get access to internal "masked = ref.current.maskRef"
const ref = useRef(null);
const inputRef = useRef(null);
<IMaskInput
  mask={Number}
  radix="."
  value="123"
  unmask={true} // true|false|'typed'
  ref={ref}
  inputRef={inputRef}  // access to nested input
  // DO NOT USE onChange TO HANDLE CHANGES!
  // USE onAccept INSTEAD
  onAccept={
    // depending on prop above first argument is
    // `value` if `unmask=false`,
    // `unmaskedValue` if `unmask=true`,
    // `typedValue` if `unmask='typed'`
    (value, mask) => console.log(value)
  }
  // ...and more mask props in a guide

  // input props also available
  placeholder='Enter number here'
/>
```

## Extend Existing Components
```javascript
import { IMaskMixin } from 'react-imask';

// extend style component
const StyledInput = styled.input`
  color: green;
`;

const MaskedStyledInput = IMaskMixin(({inputRef, ...props}) => (
  <StyledInput
    {...props}
    innerRef={inputRef}  // bind internal input (if you use styled-components V4, use "ref" instead "innerRef")
  />
));

<MaskedStyledInput
  mask={Number}
  radix="."
  onAccept={(value, mask) => console.log(value)}
  // ...and more mask props in a guide

  // ...other styled props
/>
```
More options see in a [guide](https://imask.js.org/guide.html).

## Using hook
```javascript
import { useState } from 'react';
import { useIMask } from 'react-imask';

function IMaskWithHook () {
  const [ opts, setOpts ] = useState({ mask: Number });
  const {
    ref,
    maskRef,
    value,
    setValue,
    unmaskedValue,
    setUnmaskedValue,
    typedValue,
    setTypedValue,
  } = useIMask(opts, /* { onAccept, onComplete } */);
  
  return (
    <input ref={ref} />
  );
}
```
