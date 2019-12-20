# Svelte IMask Plugin
svelte-imask

[![npm version](https://badge.fury.io/js/svelte-imask.svg)](https://badge.fury.io/js/svelte-imask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://opencollective.com/imask/donate" target="_blank">
  <img src="https://opencollective.com/imask/donate/button.png?color=blue" width=300 />
</a>

## Install
`npm install svelte-imask`

## Mask Action Example
```html
<input
  {value}
  use:imask={options}
  on:accept={accept}
  on:complete={complete}
>

<script>
  import { imask } from '@imask/svelte';

  const options = {
    mask: '{8}000000',
    lazy: false
  };

  let value = '';

  function accept({ detail: maskRef }) {
    console.log('accept', maskRef.value);
    value = maskRef.value;
  }

  function complete({ detail: maskRef }) {
    console.log('complete', maskRef.unmaskedValue);
  }
</script>
```
More options see in a [guide](https://imask.js.org/guide.html).
Plugin does not have component for input with 2-way binding support because it is not possible to pass all event listeners to child ([issue](https://github.com/sveltejs/svelte/issues/2837)).


## Support Development
[Paypal](https://www.paypal.me/alexeykryazhev/5)
