# Vue IMask Plugin
vue-imask

[![npm version](https://badge.fury.io/js/vue-imask.svg)](https://badge.fury.io/js/vue-imask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://opencollective.com/imask/donate" target="_blank">
  <img src="https://opencollective.com/imask/donate/button.png?color=blue" width=300 />
</a>

## Install
`npm install vue-imask`

## Mask Component Example
```html
<template>
  <imask-input
    v-model="numberModel"
    :mask="Number"
    radix="."
    :unmask="true"
    // depending on prop above first argument is
    // `value` if `unmask=false`,
    // `unmaskedValue` if `unmask=true`,
    // `typedValue` if `unmask='typed'`
    @accept="onAccept"
    // ...and more mask props in a guide

    // other input props
    placeholder='Enter number here'
  />
</template>

<script>
  import {IMaskComponent} from 'vue-imask';

  export default {
    data () {
      return {
        numberModel: '',
        onAccept (value) {
          console.log(value);
        }
      }
    },
    components: {
      'imask-input': IMaskComponent
    }
  }
</script>
```

## Mask Directive Example
```html
<template>
  <input
    :value="value"
    v-imask="mask"
    @accept="onAccept"
    @complete="onComplete">
</template>

<script>
  import {IMaskDirective} from 'vue-imask';

  export default {
    data () {
      return {
        value: '',
        mask: {
          mask: '{8}000000',
          lazy: false
        },
        onAccept (e) {
          const maskRef = e.detail;
          console.log('accept', maskRef.value);
        },
        onComplete (e) {
          const maskRef = e.detail;
          console.log('complete', maskRef.unmaskedValue);
        }
      }
    },
    directives: {
      imask: IMaskDirective
    }
  }
</script>
```
More options see in a [guide](https://imask.js.org/guide.html).

## Many Thanks to
[@Yegor Loginov](https://github.com/naprimer)

[@Stanislav Eremenko](https://github.com/c01nd01r)

[@Yacine Hmito](https://github.com/yacinehmito)

[@unofficial](https://github.com/cangku)

## Support Development
[Paypal](https://www.paypal.me/alexeykryazhev/3)
