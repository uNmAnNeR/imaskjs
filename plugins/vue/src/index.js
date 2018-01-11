import IMaskDirective from './directive'

function plugin (Vue) {
  Vue.directive('imask', IMaskDirective)
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

const version = '__VERSION__'

export {
  plugin as default,
  IMaskDirective,
  version
}
