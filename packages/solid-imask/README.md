# Solid IMask Plugin

solid-imask

[![npm version](https://badge.fury.io/js/react-imask.svg)](https://badge.fury.io/js/react-imask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://opencollective.com/imask/donate" target="_blank">
  <img src="https://opencollective.com/imask/donate/button.png?color=blue" width=300 />
</a>

## Install

`npm install solid-imask`

## Mask Input Example

```javascript
import { createMaskedInput } from "solid-imask";

const NumberInput = createMaskedInput({
  mask: "+{7}(000)000-00-00",
  lazy: false, // make placeholder always visible
  placeholderChar: "#", // defaults to '_'
});

const App = () => {
  return (
    <div>
      <NumberInput
        onAccept={({ value, unmaskedValue, typedValue }, maskRef, e) => {
          console.log({ value, unmaskedValue, typedValue });
          console.log(maskRef);
          console.log(e);
        }}
        onComplete={() => console.log("complete")}
      ></NumberInput>
    </div>
  );
};
```

## Mask Directive Example

```javascript
import { masked } from "solid-imask";

const mask = {
  mask: "+{7}(000)000-00-00",
  lazy: false, // make placeholder always visible
  placeholderChar: "#", // defaults to '_'
};

const App = () => {
  return (
    <div>
      <input
        use:masked={{
          mask,
          onAccept: ({ value, unmaskedValue, typedValue }, maskRef, e) => {
            console.log({ value, unmaskedValue, typedValue });
            console.log(maskRef);
            console.log(e);
          },
          onComplete: () => console.log("complete"),
        }}
      ></input>
      <p
        contenteditable="true"
        use:masked={{
          mask,
          onAccept: ({ value, unmaskedValue, typedValue }, maskRef, e) => {
            console.log({ value, unmaskedValue, typedValue });
            console.log(maskRef);
            console.log(e);
          },
          onComplete: () => console.log("complete"),
        }}
      ></p>
    </div>
  );
};
```
