# Svelte IMask Plugin
@imask/svelte

[![npm version](https://badge.fury.io/js/%40imask%2Fsvelte.svg)](https://badge.fury.io/js/%40imask%2Fsvelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://opencollective.com/imask/donate" target="_blank">
  <img src="https://opencollective.com/imask/donate/button.png?color=blue" width=300 />
</a>

## Install
`npm install @imask/svelte`

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

## Input Mask Component
Currently plugin does not have component for input with 2-way binding support because it is not possible to pass all event listeners to child ([issue](https://github.com/sveltejs/svelte/issues/2837)).

Workaround is here:
https://svelte.dev/repl/b590cddb69f4452b8f7704bd1e721e76?version=3.16.7


## Support Development
[Paypal](https://www.paypal.me/alexeykryazhev/5)
