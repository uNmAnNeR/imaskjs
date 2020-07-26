# How to use imask on emberjs

<a href="https://opencollective.com/imask/donate" target="_blank">
  <img src="https://opencollective.com/imask/donate/button.png?color=blue" width=300 />
</a>

## Install

`yarn add --dev imask`

## Dependencies

- [ember-auto-import](https://github.com/ef4/ember-auto-import)
- [ember-modifier](https://github.com/ember-modifier/ember-modifier)

## Mask Input Example

`ember g modifier imask-number`

//app/modifiers/imask-number.js

```javascript
import Modifier from "ember-modifier";
import IMask from "imask";

export default class ImaskNumber extends Modifier {
  mask;

  constructor(owner, args) {
    super(owner, args);

    if (
      this.args.named.onChange &&
      typeof this.args.named.onChange !== "function"
    ) {
      throw new Error("onChange must be a function");
    }
  }

  onChangeHandler = () => {
    if (
      this.mask &&
      this.args.named.onChange &&
      this.mask.unmaskedValue &&
      this.mask.unmaskedValue !== this.args.positional[0]
    ) {
      this.args.named.onChange(this.mask.typedValue);
    }
  };

  didUpdateArguments() {
    if (this.mask) {
      this.mask.unmaskedValue = this.args.positional[0].toString();
    }
  }

  didInstall() {
    this.mask = IMask(this.element, {
      mask: Number,
      min: -10000,
      max: 10000,
      thousandsSeparator: " ",
    });

    if (this.args.named.onChange) {
      this.mask.on("complete", this.onChangeHandler);
    }
  }

  willRemove() {
    if (this.mask) {
      this.mask.off("complete", this.onChangeHandler);
      this.mask.destroy();
    }
  }
}
```

```handlebars
<Input {{imask-number this.number onChange=(fn (mut this.number))}} />
```

## This folder is an ember example with imask setup

### Installation

- `yarn install`

### Running / Development

- `ember serve`
- Visit your app at [http://localhost:4200](http://localhost:4200).

### Routes

- [number-mask](http://localhost:4200/number-mask)
- [phone-mask](http://localhost:4200/phone-mask)
