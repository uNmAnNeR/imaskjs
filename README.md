# imaskjs
vanilla javascript input mask

[![Build Status](https://travis-ci.org/uNmAnNeR/imaskjs.svg?branch=master)](https://travis-ci.org/uNmAnNeR/imaskjs)
[![Coverage Status](https://coveralls.io/repos/github/uNmAnNeR/imaskjs/badge.svg?branch=master)](https://coveralls.io/github/uNmAnNeR/imaskjs?branch=master)
[![npm version](https://badge.fury.io/js/imask.svg)](https://badge.fury.io/jas/imask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## Features
* get and set *raw* and *unmasked* values easily
* no external dependencies
* **RegExp** mask
* **Function** mask
* **Number** mask (integer and decimal)
* **Date** mask (various format support)
* **Dynamic/on-the-fly** mask
* **Pattern** mask
  - show placeholder always and only when necessary
  - unmasked value can contain fixed parts
  - optional input parts (greedy)
  - custom definitions
  - reusable blocks
  - **Enum** and **Range** masks

## Plugins
* [Vue plugin](https://github.com/uNmAnNeR/imaskjs/tree/master/packages/vue-imask)
* [Angular plugin](https://github.com/uNmAnNeR/imaskjs/tree/master/packages/angular-imask)
* [React plugin](https://github.com/uNmAnNeR/imaskjs/tree/master/packages/react-imask)
* [React Native plugin<sup>beta</sup>](https://github.com/uNmAnNeR/imaskjs/tree/master/packages/react-native-imask)

## Install
`npm install imask` and `import IMask from 'imask';`

or use CDN:

`<script src="https://unpkg.com/imask"></script>`

## Build & Test
`npm run make`

## Compatibility
Supports all major browsers and IE11+ [need to support older?](https://unmanner.github.io/imaskjs/guide.html#support-older)

## Docs, Examples, Demo
[https://unmanner.github.io/imaskjs/](https://unmanner.github.io/imaskjs/)

## Further Plans
* [DefinitelyTyped typings](https://github.com/uNmAnNeR/imaskjs/issues/17)
* [Improved API docs](https://github.com/uNmAnNeR/imaskjs/issues/9)
* [More unit tests](https://github.com/uNmAnNeR/imaskjs/issues/51)
* [React Native plugin (development frozen)](https://github.com/uNmAnNeR/imaskjs/issues/12)

## Many Thanks to
[@Viktor Yakovlev](https://github.com/vcrazyV)

[@Alexander Kiselev](https://github.com/MaaKut)

## Support Development
If you enjoyed working with it, you can buy me a cup of coffee :)

<a href='https://ko-fi.com/unmanner' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://az743702.vo.msecnd.net/cdn/kofi1.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
