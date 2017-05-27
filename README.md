# imaskjs
vanilla JS input mask

## Features
* get and set raw and unmasked values easily
* no external dependencies
* show placeholders in always and lazy modes
* unmasked value can contain fixed parts
* optional input parts

May coming soon:

* jQuery integration
* composite mask (for date, datetime etc.)
* unit tests
* ?RTL

## Compatibility
IE11+ [need support older?](https://unmanner.github.io/imaskjs/#under-the-hood)

## Docs, Examples, Demo
[https://unmanner.github.io/imaskjs/](https://unmanner.github.io/imaskjs/)

## Changes

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
