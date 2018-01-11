import * as Errors from './errors'

function adapterWithMask (maskType, checkType) {
  return function (vueOptions) {
    if (vueOptions == null) {
      throw new Errors.MissingOptions(maskType)
    }
    if (checkType(vueOptions)) {
      return { mask: vueOptions }
    }
    const type = typeof vueOptions
    if (type === 'object') {
      return vueOptions
    }
    throw new Errors.OptionsTypeError(maskType, type)
  }
}

function adapterWithoutMask (maskType, maskValue) {
  return function (vueOptions) {
    if (vueOptions == null) {
      return { mask: maskValue }
    }
    const type = typeof vueOptions
    if (type === 'object') {
      if ('mask' in vueOptions) {
        throw new Errors.ArgWithMaskOption(maskType)
      }
      return Object.assign({}, vueOptions, { mask: maskValue })
    }
  }
}

const maskOptionsAdapters = {
  pattern: adapterWithMask('pattern', (value) => typeof value === 'string'),
  function: adapterWithMask('function', (value) => typeof value === 'function'),
  regexp: adapterWithMask('regexp', (value) => value instanceof RegExp),
  dynamic: adapterWithMask('dynamic', (value) => Array.isArray(value)),
  number: adapterWithoutMask('number', Number),
  date: adapterWithoutMask('date', Date)
}

function fromBindingToMaskOptions (binding) {
  const { value, arg } = binding
  if (!arg) return value
  const adapter = maskOptionsAdapters[arg]
  if (!adapter) throw new Errors.UnknownMaskType(arg)
  return adapter(value)
}

export default fromBindingToMaskOptions
