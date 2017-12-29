import IMaskDirective from 'src/directive'
import { createVM } from '../helpers/utils'

function input (context, directive) {
  return createVM(
    context,
    `<input type="text" ${directive}></input>`,
    {
      directives: { imask: IMaskDirective }
    })
}

describe('v-imask', function () {
  it('works without error', function () {
    const vm = input(this, `v-imask="{mask: '+{7}(000)000-00-00'}"`)
    vm.should.be.ok
  })
})

describe('v-imask:pattern', function () {
  const patternExp = '\'+{7}(000)000-00-00\''
  it('works with the pattern set directly', function () {
    const vm = input(this, `v-imask:pattern="${patternExp}"`)
    vm.should.be.ok
  })
  it('works with the pattern in mask', function () {
    const vm = input(this, `v-imask:pattern="{ mask: ${patternExp} }"`)
    vm.should.be.ok
  })
  it('works without the argument', function () {
    const vm = input(this, `v-imask="{ mask: ${patternExp} }"`)
    vm.should.be.ok
  })
})

describe('v-imask:function', function () {
  const functionExp = `function (value) {
      return /^\d*$/.test(value) &&
        value.split('').every(function(ch, i) {
          var prevCh = value[i-1];
          return !prevCh || prevCh < ch;
        });
    }`
  const arrowFunctionExp = `(value) =>
      /^\d*$/.test(value) &&
        value.split('').every((ch, i) => !value[i-1] || value[i-1] < ch)
    `
  it('works with the function set directly', function () {
    const vm = input(this, `v-imask:function="${functionExp}"`)
    vm.should.be.ok
  })
  it('works with an arrow function set directly', function () {
    const vm = input(this, `v-imask:function="${arrowFunctionExp}"`)
    vm.should.be.ok
  })
  it('works with the function in mask', function () {
    const vm = input(this, `v-imask:function="{ mask: ${functionExp} }"`)
    vm.should.be.ok
  })
  it('works without the argument', function () {
    const vm = input(this, `v-imask="{ mask: ${functionExp} }"`)
    vm.should.be.ok
  })
})

describe('v-imask:regexp', function () {
  const regexpExp = '/^123/'
  it('works with the regexp set directly', function () {
    const vm = input(this, `v-imask:regexp="${regexpExp}"`)
    vm.should.be.ok
  })
  it('works with the regexp in mask', function () {
    const vm = input(this, `v-imask:regexp="{ mask: ${regexpExp} }"`)
    vm.should.be.ok
  })
  it('works without the argument', function () {
    const vm = input(this, `v-imask="{ mask: ${regexpExp} }"`)
    vm.should.be.ok
  })
})

describe('v-imask:dynamic', function () {
  const arrayExp = `
  [
    {
      mask: 'RGB,RGB,RGB',
      groups: {
        RGB: new IMask.MaskedPattern.Group.Range([0, 255])
      }
    },
    {
      mask: /^#[0-9a-f]{0,6}$/i
    }
  ]
  `
  it('works with the array set directly', function () {
    const vm = input(this, `v-imask:dynamic="${arrayExp}"`)
    vm.should.be.ok
  })
  it('works with the array in mask', function () {
    const vm = input(this, `v-imask:dynamic="{ mask: ${arrayExp} }"`)
    vm.should.be.ok
  })
  it('works without the argument', function () {
    const vm = input(this, `v-imask="{ mask: ${arrayExp} }"`)
    vm.should.be.ok
  })
})

describe('v-imask:number', function () {
  it('works without options', function () {
    const vm = input(this, `v-imask:number`)
    vm.should.be.ok
  })
  it('works with options', function () {
    const optionsExp = `{ signed: true }`
    const vm = input(this, `v-imask:number="${optionsExp}"`)
    vm.should.be.ok
  })
  it('works without the argument', function () {
    const vm = input(this, `v-imask="{ mask: Number }"`)
    vm.should.be.ok
  })
})

describe('v-imask:date', function () {
  it('works without options', function () {
    const vm = input(this, `v-imask:date`)
    vm.should.be.ok
  })
  it('works with options', function () {
    const optionsExp = `{ min: new Date(2000, 0, 1) }`
    const vm = input(this, `v-imask:date="${optionsExp}"`)
    vm.should.be.ok
  })
  it('works without the argument', function () {
    const vm = input(this, `v-imask="{ mask: Date }"`)
    vm.should.be.ok
  })
})
