# Vue IMask Plugin
vue-imask

[![npm version](https://badge.fury.io/js/vue-imask.svg)](https://badge.fury.io/js/vue-imask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://opencollective.com/imask/donate" target="_blank">
  <img src="https://opencollective.com/imask/donate/button.png?color=blue" width=300 />
</a>

## Install
`npm i vue-imask`

for Vue 2 also do:

`npm i -D @vue/composition-api`

If you are using NuxtJS with Vue 2 you also need to install:

`npm i -D @nuxtjs/composition-api`

And then add `@nuxtjs/composition-api/module` in the buildModules option in your `nuxt.config.js`.

## Mask Component Example (Vue 2)
```html
<template>
  <imask-input
    v-model="numberModel"
    :mask="Number"
    radix="."
    :unmask="true"
    <!-- depending on prop above first argument of 'accept' callback is
    `value` if `unmask=false`,
    `unmaskedValue` if `unmask=true`,
    `typedValue` if `unmask='typed'` -->
    @accept="onAccept"

    <!-- ...see more mask props in a guide -->

    <!-- other input props -->
    placeholder='Enter number here'
  />
</template>

<script>
  import { IMaskComponent } from 'vue-imask';

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


## Mask Component Example (Vue 3)
```html
<template>
  <imask-input
    <!-- possible to use 'v-model' = 'v-model:value' = 'v-model:masked' and 'v-model:unmasked' -->
    v-model:typed="numberModel"
    :mask="Number"
    radix="."
    @accept:masked="onAccept" <!-- accept value (same as '@accept:value' or just '@accept') -->
    @accept:unmasked="onAcceptUnmasked"
    <!--
      @accept:typed="onAccepttyped"
      @complete:typed="onCompleteTyped"
    -->

    <!-- ...see more mask props in a guide -->

    <!-- other input props -->
    placeholder='Enter number here'
  />
</template>

<script>
  import { IMaskComponent } from 'vue-imask';

  export default {
    data () {
      return {
        numberModel: '',
        onAccept (value) {
          console.log({ value });
        },
        onAcceptUnmasked (unmaskedValue) {
          console.log({ unmaskedValue });
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
In some cases value bindings (`v-model`) might not work for directive, you can use `@accept` or `@complete` events to update the value.
```html
<template>
  <input
    :value="value"
    v-imask="mask"
    @accept="onAccept"
    @complete="onComplete">
</template>

<script>
  import { IMaskDirective } from 'vue-imask';

  export default {
    data () {
      return {
        value: '',
        mask: {
          mask: '{8}000000',
          lazy: false
        },
      },
    },
    methods: {
      onAccept (e) {
        const maskRef = e.detail;
        this.value = maskRef.value;
        console.log('accept', maskRef.value);
      },
      onComplete (e) {
        const maskRef = e.detail;
        console.log('complete', maskRef.unmaskedValue);
      },
    },
    directives: {
      imask: IMaskDirective
    }
  }
</script>
```
More options see in a [guide](https://imask.js.org/guide.html).

## Mask Composable (Vue 3)
```html
<template>
  <input ref="el">
</template>

<script>
  import { useIMask } from 'vue-imask';

  export default {
    setup (props) {
      const { el, masked } = useIMask({
        mask: Number,
        radix: '.',
      }, /* optional {
        emit,
        onAccept,
        onComplete,
        defaultValue,
        defaultUnmaskedValue,
        defaultTypedValue,
      } */);
  
      return { el };
    }
  }
</script>
```
