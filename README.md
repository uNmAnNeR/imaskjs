# imaskjs
vanilla javascript input mask

[![Build Status](https://travis-ci.org/uNmAnNeR/imaskjs.svg?branch=gh-pages)](https://travis-ci.org/uNmAnNeR/imaskjs)
[![Coverage Status](https://coveralls.io/repos/github/uNmAnNeR/imaskjs/badge.svg?branch=gh-pages)](https://coveralls.io/github/uNmAnNeR/imaskjs?branch=gh-pages)
[![npm version](https://badge.fury.io/js/imask.svg)](https://badge.fury.io/jas/imask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
* [React](https://github.com/uNmAnNeR/imaskjs/tree/gh-pages/plugins/react)/[Angular](https://github.com/uNmAnNeR/imaskjs/tree/gh-pages/plugins/angular)/[Vue](https://github.com/uNmAnNeR/imaskjs/tree/gh-pages/plugins/vue) plugins

## Further plans
* more unit tests

## Install
`npm install imask` and `import IMask from 'imask';`

or use CDN:

`<script src="https://unpkg.com/imask"></script>`

## Build & test
`npm run build`

`npm run test`

## Compatibility
Supports all major browsers and IE11+ [need to support older?](https://unmanner.github.io/imaskjs/guide.html#support-older)

## Docs, Examples, Demo
[https://unmanner.github.io/imaskjs/](https://unmanner.github.io/imaskjs/)

## Many thanks to
[@Viktor Yakovlev](https://github.com/vcrazyV)

[@Alexander Kiselev](https://github.com/MaaKut)
