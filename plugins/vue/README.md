# vue-imask

[![npm](https://img.shields.io/npm/v/vue.svg)](https://www.npmjs.com/package/vue) [![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

> A Vue.js Plugin

## Installation

```bash
npm install --save vue-imask
```

## Import

### Bundler (Webpack/Rollup)

```js
import VueIMask from 'vue-imask'

Vue.use(VueIMask)
```

### Browser

```html
<!-- Include after Vue -->
<!-- Local files -->
<link rel="stylesheet" href="vue/dist/vue.css"></link>
<script src="vue/dist/vue.js"></script>

<!-- From CDN -->
<link rel="stylesheet" href="https://unpkg.com/vue/dist/vue.css"></link>
<script src="https://unpkg.com/vue"></script>
```

## Usage

In a template:

```
pattern: <input type="text" v-mask:pattern="'+{7}(000)000-00-00'">
function: <input type="text" v-mask:function="value => value.startsWith('+')">
regexp: <input type="text" v-mask:regexp="/^[1-6]\d{0,5}$/">
dynamic: <input type="text" v-mask:dynamic="['+{7}(000)000-00-00', /^\S*@?\S*$/]">
number: <input type="text" v-mask:number="{min: -1000, max: 1000}">
date: <input type="text" v-mask:date="{min: new Date(2000, 0, 1), max: new Date(2020, 12, 31)}">
any: <input type="text" v-mask="{ mask: /^[1-6]\d{0,5}$/ }">
```

## Development

### Launch visual tests

```bash
npm run dev
```

### Launch Karma with coverage

```bash
npm run dev:coverage
```

### Build

Bundle the js and css of to the `dist` folder:

```bash
npm run build
```


## Publishing

The `prepublish` hook will ensure dist files are created before publishing. This
way you don't need to commit them in your repository.

```bash
# Bump the version first
# It'll also commit it and create a tag
npm version
# Push the bumped package and tags
git push --follow-tags
# Ship it 🚀
npm publish
```

## License

[MIT](http://opensource.org/licenses/MIT)
