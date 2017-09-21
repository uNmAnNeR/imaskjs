# imaskjs
vanilla javascript input mask

## Features
* get and set raw and unmasked values easily
* no external dependencies
* show placeholder always and only when necessary
* unmasked value can contain fixed parts
* optional input parts (greedy)
* RegExp mask
* Functional mask
* Number mask (integer and decimal)
* Date mask (various format support)

May coming soon:

* jQuery/Angular/React/Vue plugin
* more unit tests
* ?RTL

## Install
`npm install imaskjs` or download and include from `dist` folder

## Build & test
`npm run build`

`npm run test`

## Compatibility
Supports all major browsers and IE11+ [need support older?](https://unmanner.github.io/imaskjs/guide.html#support-older)

## Docs, Examples, Demo
[https://unmanner.github.io/imaskjs/](https://unmanner.github.io/imaskjs/)

## Changes

### 1.1.0
* new _prepare_ and _commit_ options

### 1.0.0
* **major API changes and improvements**
* new _Masked_ model abstraction
* new _InputMask_ view abstraction
* new Number mask
* new Date mask
* Pipe mask was removed (use function composition and/or inherite from _Masked_ instead)
* Common: rename _rawValue_ prop to _value_
* Common: use _updateOptions_ now to update any masked properties and sync with view
* Pattern: change _quote_ (') definition to _back quote_ (`)
* Pattern: _lazy_ property is now of _Boolean_ type
* fix some bugs

### 0.4.0
* **breaking change**: add _quote_ (') to definitions to prevent symbols shift back. Should be escaped from now.
* fix some bugs with cursor
* write some tests
* use _rollup_ for build and test

### 0.3.0
* add mobile support
* fix some bugs with cursor

### 0.2.0
* add _pipe_ mask type
* fix some bugs with cursor

### 0.1.1
* fix bugs with setting cursor position

### 0.1.0
* add mask types: _function_, _regexp_, _BaseMask_ and
* _pattern_
  * _lazy_ and _always_ modes
  * fixed and optional input parts
  * get and set raw and unmasked values
  * custom symbol definitions
  * _accept_ and _complete_ events
