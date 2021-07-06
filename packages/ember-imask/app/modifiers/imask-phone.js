import Modifier from "ember-modifier";
import IMask from "imask";

export default class ImaskPhone extends Modifier {
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
      this.args.named.onChange(this.mask.unmaskedValue);
    }
  };

  didUpdateArguments() {
    if (this.mask) {
      this.mask.unmaskedValue = this.args.positional[0].toString();
    }
  }

  didInstall() {
    this.mask = IMask(this.element, {
      mask: "+{0}(000)000-00-00",
    });

    if (this.args.named.onChange) {
      this.mask.on("accept", this.onChangeHandler);
    }
  }

  willRemove() {
    if (this.mask) {
      this.mask.off("accept", this.onChangeHandler);
      this.mask.destroy();
    }
  }
}
