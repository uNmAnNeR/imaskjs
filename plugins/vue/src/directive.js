import IMask from 'imask'
import makeOptions from './options'

// We need to save the IMask instances so we can update the options
// The Map is indexed by the DOM element whose IMask is bound to
// It is a WeakMap to avoid memory leaks
const masks = new WeakMap()

const directive = {
  bind (el, binding) {
    if (masks.get(el)) {
      console.warn('vue-imask: An element that already has a mask is getting a new one')
    }
    const options = makeOptions(binding)
    const mask = new IMask(el, options)
    masks.set(el, mask)
  },
  update (el, binding) {
    const mask = masks.get(el)
    const options = makeOptions(binding)
    if (!mask) {
      const mask = new IMask(el, options)
      masks.set(el, mask)
    } else {
      mask.updateOptions(options)
    }
  },
  unbound (el) {
    masks.delete(el)
  }
}

export default directive
