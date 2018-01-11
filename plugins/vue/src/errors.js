export class ArgWithMaskOption extends Error {
  constructor (maskType, ...args) {
    super(...args)
    this.message = `vue-imask: Do not set the mask option with v-imask:${maskType}`
  }
}

export class OptionsTypeError extends TypeError {
  constructor (maskType, optionsType, ...args) {
    super(...args)
    this.message = `vue-imask: Value of type ${optionsType} not supported for v-imask:${maskType}`
  }
}

export class MissingOptions extends Error {
  constructor (maskType, ...args) {
    super(...args)
    this.message = `vue-imask: Expecting a value for v-imask:${maskType}`
  }
}

export class UnknownMaskType extends Error {
  constructor (maskType, ...args) {
    super(...args)
    this.message = `vue:imask: Argument ${maskType} is invalid`
  }
}
