import camelcase from 'camelcase'
import { createVM, Vue } from './utils'
import { nextTick } from './wait-for-update'

export function dataPropagationTest (Component) {
  return function () {
    const spy = sinon.spy()
    const vm = createVM(this, function (h) {
      return (
          <Component staticClass='custom' onClick={spy}>Hello</Component>
      )
    })
    spy.should.have.not.been.called
    vm.$('.custom').should.exist
    vm.$('.custom').click()
    spy.should.have.been.calledOnce
  }
}

export function attrTest (it, base, Component, attr) {
  const attrs = Array.isArray(attr) ? attr : [attr]

  attrs.forEach(attr => {
    it(attr, function (done) {
      const vm = createVM(this, function (h) {
        const opts = {
          props: {
            [camelcase(attr)]: this.active
          }
        }
        return (
          <Component {...opts}>{attr}</Component>
        )
      }, {
        data: { active: true }
      })
      vm.$(`.${base}`).should.have.class(`${base}--${attr}`)
      vm.active = false
      nextTick().then(() => {
        vm.$(`.${base}`).should.not.have.class(`${base}--${attr}`)
        vm.active = true
      }).then(done)
    })
  })
}

export {
  createVM,
  Vue,
  nextTick
}
