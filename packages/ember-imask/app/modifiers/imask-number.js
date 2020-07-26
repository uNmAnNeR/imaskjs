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
