(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.imask = factory());
}(this, (function () { 'use strict';

function isString(str) {
  return typeof str === 'string' || str instanceof String;
}

function conform(res, str) {
  var fallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  return isString(res) ? res : res ? str : fallback;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

// TODO
// - empty placeholder
// - !progressive
// - validateOnly
// - add comments


var BaseMask = function () {
  function BaseMask(el, opts) {
    classCallCheck(this, BaseMask);

    this.el = el;
    this.mask = opts.mask;

    this._listeners = {};
  }

  createClass(BaseMask, [{
    key: 'bindEvents',
    value: function bindEvents() {
      this.el.addEventListener('keydown', this.saveCursor.bind(this));
      this.el.addEventListener('input', this.processInput.bind(this));
      this.el.addEventListener('drop', this._onDrop.bind(this));
    }
  }, {
    key: 'saveCursor',
    value: function saveCursor(ev) {
      this._oldValue = this.el.value;
      this._oldSelection = {
        start: this.el.selectionStart,
        end: this.el.selectionEnd
      };
    }
  }, {
    key: 'processInput',
    value: function processInput(ev) {
      var inputValue = this.el.value;
      // use selectionEnd for handle Undo
      var cursorPos = this.el.selectionEnd;

      // var res = inputValue
      //   .split('')
      //   .map((ch, ...args) => {
      //     var res = this.charResolver.resolve(ch, ...args);
      //     return conform(res, ch);
      //   })
      //   .join('');

      var details = {
        oldSelection: this._oldSelection,
        cursorPos: cursorPos,
        oldValue: this._oldValue
      };

      var res = inputValue;
      res = conform(this.resolve(res, details), res, this._oldValue);
      if (res !== inputValue) {
        this.el.value = res;
        cursorPos = res === this._oldValue ?
        // if value not changed - use old cursor pos
        this._oldSelection.end :
        // else set new
        details.cursorPos;
      }
      this.el.selectionStart = this.el.selectionEnd = cursorPos;

      if (res !== this._oldValue) {
        var listeners = this._listeners.accept || [];
        listeners.forEach(function (l) {
          return l();
        });
      }
      return res;
    }
  }, {
    key: 'on',
    value: function on(ev, handler) {
      if (!this._listeners[ev]) this._listeners[ev] = [];
      this._listeners[ev].push(handler);
    }
  }, {
    key: 'off',
    value: function off(ev, handler) {
      if (!this._listeners[ev]) return;
      if (!handler) {
        delete this._listeners[ev];
        return;
      }
      var hIndex = this._listeners[ev].indexOf(handler);
      if (hIndex >= 0) this._listeners.splice(hIndex, 1);
    }

    // override this

  }, {
    key: 'resolve',
    value: function resolve(str, details) {
      return str;
    }
  }, {
    key: '_onDrop',
    value: function _onDrop(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }, {
    key: 'rawValue',
    get: function get() {
      return this.el.value;
    },
    set: function set(str) {
      var details = {
        startChangePos: 0,
        oldSelection: {
          start: 0,
          end: this.el.value.length
        },
        removedCount: this.el.value.length,
        insertedCount: str.length,
        oldValue: this.el.value
      };
      this.el.value = conform(this.resolve(str, details), this.el.value);
    }
  }, {
    key: 'unmaskedValue',
    get: function get() {
      return this.el.value;
    },
    set: function set(value) {
      this.el.value = value;
    }
  }]);
  return BaseMask;
}();

var RegExpMask = function (_BaseMask) {
  inherits(RegExpMask, _BaseMask);

  function RegExpMask() {
    classCallCheck(this, RegExpMask);
    return possibleConstructorReturn(this, (RegExpMask.__proto__ || Object.getPrototypeOf(RegExpMask)).apply(this, arguments));
  }

  createClass(RegExpMask, [{
    key: 'resolve',
    value: function resolve(str) {
      return this.mask.test(str);
    }
  }]);
  return RegExpMask;
}(BaseMask);

var FuncMask = function (_BaseMask) {
  inherits(FuncMask, _BaseMask);

  function FuncMask() {
    classCallCheck(this, FuncMask);
    return possibleConstructorReturn(this, (FuncMask.__proto__ || Object.getPrototypeOf(FuncMask)).apply(this, arguments));
  }

  createClass(FuncMask, [{
    key: 'resolve',
    value: function resolve() {
      return this.mask.apply(this, arguments);
    }
  }]);
  return FuncMask;
}(BaseMask);

var PatternMask = function (_BaseMask) {
  inherits(PatternMask, _BaseMask);

  function PatternMask(el, opts) {
    classCallCheck(this, PatternMask);

    var _this = possibleConstructorReturn(this, (PatternMask.__proto__ || Object.getPrototypeOf(PatternMask)).call(this, el, opts));

    var pattern = _this.mask;
    _this._charPlaceholder = opts.charPlaceholder || PatternMask.DEFAULT_CHAR_PLACEHOLDER;
    _this._definitions = PatternMask.DEFINITIONS;
    _this._charDefs = [];
    _this._hollows = [];

    if (opts.definitions) {
      for (var def in opts.definitions) {
        _this._definitions[def] = opts.definitions[def];
      }
    }

    var unmaskingBlock = false;
    var optionalBlock = false;
    for (var i = 0; i < pattern.length; ++i) {
      var ch = pattern[i];
      var type = !unmaskingBlock && ch in _this._definitions ? PatternMask.DEF_TYPES.INPUT : PatternMask.DEF_TYPES.FIXED;
      var unmasking = type === PatternMask.DEF_TYPES.INPUT || unmaskingBlock;
      var optional = type === PatternMask.DEF_TYPES.INPUT && optionalBlock;

      if (ch === '{' || ch === '}') {
        unmaskingBlock = !unmaskingBlock;
        continue;
      }

      if (ch === '[' || ch === ']') {
        optionalBlock = !optionalBlock;
        continue;
      }

      if (ch === '\\') {
        ++i;
        ch = pattern[i];
        // TODO validation
        if (!ch) break;
        type = PatternMask.DEF_TYPES.FIXED;
      }

      _this._charDefs.push({
        char: ch,
        type: type,
        optional: optional,
        unmasking: unmasking
      });
    }

    _this._resolvers = {};
    for (var defKey in _this._definitions) {
      _this._resolvers[defKey] = IMask.MaskFactory(_this.el, {
        mask: _this._definitions[defKey]
      });
    }
    return _this;
  }

  createClass(PatternMask, [{
    key: '_tryAppendTail',
    value: function _tryAppendTail(str, tail) {
      var placeholderBuffer = '';
      var hollows = this._hollows.slice();
      for (var ci = 0, di = str.length; ci < tail.length; ++di) {
        var ch = tail[ci];
        var def = this._charDefs[di];

        // failed
        if (!def) return;

        if (def.type === PatternMask.DEF_TYPES.INPUT) {
          var resolver = this._resolvers[def.char];
          var chres = resolver.resolve(ch, di, str) || '';
          if (chres) {
            chres = conform(chres, ch);
            ++ci;
          } else {
            chres = this.charPlaceholder;
            hollows.push(di);
          }
          str += placeholderBuffer + chres;
          placeholderBuffer = '';
        } else {
          placeholderBuffer += def.char;
        }
      }

      return [str, hollows];
    }
  }, {
    key: '_extractInput',
    value: function _extractInput(str) {
      var startDefIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var input = '';
      for (var di = startDefIndex, ci = 0; ci < str.length && di < this._charDefs.length; ++ci, ++di) {
        var ch = str[ci];
        var def = this._charDefs[di];

        if (def.type === PatternMask.DEF_TYPES.INPUT && this._hollows.indexOf(di) < 0) input += ch;
      }
      return input;
    }
  }, {
    key: '_generateInsertSteps',
    value: function _generateInsertSteps(head, inserted) {
      var res = head;

      var placeholderBuffer = '';
      var insertSteps = [res];
      for (var ci = 0, di = head.length; ci < inserted.length;) {
        var def = this._charDefs[di];
        if (!def) break;

        var ch = inserted[ci];
        var chres = '';
        if (def.type === PatternMask.DEF_TYPES.INPUT) {
          var resolver = this._resolvers[def.char];
          chres = resolver.resolve(ch, ci) || '';
          // if ok - next di
          if (chres) {
            ++di;
            res += placeholderBuffer;placeholderBuffer = '';
            chres = conform(chres, ch);
          }
          ++ci;
        } else {
          placeholderBuffer += def.char;

          if (ch === def.char) ++ci;
          ++di;
        }

        res += chres;
        insertSteps[ci] = res;
      }

      return insertSteps;
    }
  }, {
    key: 'resolve',
    value: function resolve(str, details) {
      // TODO
      if (!details) return '';
      // console.log(details);


      var cursorPos = details.cursorPos;
      var oldSelection = details.oldSelection;
      var oldValue = details.oldValue;
      var startChangePos = Math.min(cursorPos, oldSelection.start);
      // Math.max for opposite operation
      var removedCount = Math.max(oldSelection.end - startChangePos ||
      // for Delete
      oldValue.length - str.length, 0);
      var insertedCount = cursorPos - startChangePos;

      var head = str.substring(0, startChangePos);
      var tail = str.substring(startChangePos + insertedCount);
      var inserted = str.substr(startChangePos, insertedCount);

      var tailInput = this._extractInput(tail, startChangePos + removedCount);

      // remove hollows after cursor
      this._hollows = this._hollows.filter(function (h) {
        return h < startChangePos;
      });

      var insertSteps = this._generateInsertSteps(head, inserted);

      var res = head;
      for (var istep = insertSteps.length - 1; istep >= 0; --istep) {
        var step = insertSteps[istep];
        var result = this._tryAppendTail(step, tailInput);
        if (result) {
          var _result = slicedToArray(result, 2);

          res = _result[0];
          this._hollows = _result[1];

          cursorPos = step.length;
          break;
        }
      }

      var def;
      // append fixed at end if inserted
      if (inserted) {
        var appended = this._appendFixedEnd(res);
        cursorPos += appended.length - res.length;
        res = appended;
      }

      // remove head fixed and hollows if removed at end
      if (!inserted && cursorPos === res.length) {
        var di = cursorPos - 1;
        var hasHollows = false;
        for (; di > 0; --di) {
          def = this._charDefs[di];
          if (def.type === PatternMask.DEF_TYPES.INPUT) {
            if (this._hollows.indexOf(di) >= 0) hasHollows = true;else break;
          }
        }
        if (hasHollows) res = res.slice(0, di);
      }
      details.cursorPos = cursorPos;

      return res;
    }
  }, {
    key: 'processInput',
    value: function processInput(ev) {
      var res = get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), 'processInput', this).call(this, ev);
      if (res !== this._oldValue && this._isComplete(res)) {
        var listeners = this._listeners.complete || [];
        listeners.forEach(function (l) {
          return l();
        });
      }
    }
  }, {
    key: '_isComplete',
    value: function _isComplete(str) {
      var defInputs = this._charDefs.filter(function (def) {
        return def.type === PatternMask.DEF_TYPES.INPUT;
      });
      return this._extractInput(str).length === defInputs.length;
    }
  }, {
    key: '_appendFixedEnd',
    value: function _appendFixedEnd(res) {
      var pos = res.length;
      for (;; ++pos) {
        var def = this._charDefs[pos];
        if (!def || def.type === PatternMask.DEF_TYPES.INPUT) break;
        if (pos >= res.length) res += def.char;
      }
      return res;
    }
  }, {
    key: 'unmaskedValue',
    get: function get() {
      var str = this.el.value;
      var unmasked = '';
      for (var ci = 0; ci < str.length && ci < this._charDefs.length; ++ci) {
        var ch = str[ci];
        var def = this._charDefs[ci];

        if (def.unmasking && !this._hollows.indexOf(ci) >= 0 && (def.type === PatternMask.DEF_TYPES.INPUT && this._resolvers[def.char].resolve(ch, ci) || def.char === ch)) {
          unmasked += ch;
        }
      }
      return unmasked;
    },
    set: function set(str) {
      var res = '';

      for (var ci = 0, di = 0; ci < str.length && di < this._charDefs.length;) {
        var def = this._charDefs[di];
        var ch = str[ci];

        var chres = '';
        if (def.type === PatternMask.DEF_TYPES.INPUT) {
          if (this._resolvers[def.char].resolve(ch, ci)) {
            chres = ch;
            ++di;
          }
          ++ci;
        } else {
          chres = def.char;
          if (def.unmasking && def.char === ch) ++ci;
          ++di;
        }
        res += chres;
      }
      res = this._appendFixedEnd(res);
      this._hollows.length = 0;

      this.el.value = res;
    }
  }, {
    key: 'charPlaceholder',
    get: function get() {
      return this._charPlaceholder;
    },
    set: function set(ph) {
      // TODO
    }
  }]);
  return PatternMask;
}(BaseMask);

PatternMask.DEFINITIONS = {
  '0': /\d/,
  'a': /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/, // http://stackoverflow.com/a/22075070
  '*': /./
};
PatternMask.DEF_TYPES = {
  INPUT: 'input',
  FIXED: 'fixed'
};
PatternMask.DEFAULT_CHAR_PLACEHOLDER = '_';

function IMask$1(el) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var mask = IMask$1.MaskFactory(el, opts);
  mask.bindEvents();
  // refresh
  mask.rawValue = el.value;
  return mask;
}

IMask$1.MaskFactory = function (el, opts) {
  var mask = opts.mask;
  if (mask instanceof BaseMask) return mask;
  if (mask instanceof RegExp) return new RegExpMask(el, opts);
  if (mask instanceof Function) return new FuncMask(el, opts);
  if (isString(mask)) return new PatternMask(el, opts);
  return new BaseMask(el, opts);
};
IMask$1.BaseMask = BaseMask;
IMask$1.FuncMask = FuncMask;
IMask$1.RegExpMask = RegExpMask;
IMask$1.PatternMask = PatternMask;
window.IMask = IMask$1;

return IMask$1;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvaW1hc2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0XHJcbmZ1bmN0aW9uIGlzU3RyaW5nIChzdHIpIHtcclxuICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gY29uZm9ybSAocmVzLCBzdHIsIGZhbGxiYWNrPScnKSB7XHJcbiAgcmV0dXJuIGlzU3RyaW5nKHJlcykgP1xyXG4gICAgcmVzIDpcclxuICAgIHJlcyA/XHJcbiAgICAgIHN0ciA6XHJcbiAgICAgIGZhbGxiYWNrO1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuLy8gVE9ET1xyXG4vLyAtIGVtcHR5IHBsYWNlaG9sZGVyXHJcbi8vIC0gIXByb2dyZXNzaXZlXHJcbi8vIC0gdmFsaWRhdGVPbmx5XHJcbi8vIC0gYWRkIGNvbW1lbnRzXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gIH1cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnNhdmVDdXJzb3IuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5wcm9jZXNzSW5wdXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBzYXZlQ3Vyc29yIChldikge1xyXG4gICAgdGhpcy5fb2xkVmFsdWUgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgdGhpcy5fb2xkU2VsZWN0aW9uID0ge1xyXG4gICAgICBzdGFydDogdGhpcy5lbC5zZWxlY3Rpb25TdGFydCxcclxuICAgICAgZW5kOiB0aGlzLmVsLnNlbGVjdGlvbkVuZFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChldikge1xyXG4gICAgIHZhciBpbnB1dFZhbHVlID0gdGhpcy5lbC52YWx1ZTtcclxuICAgIC8vIHVzZSBzZWxlY3Rpb25FbmQgZm9yIGhhbmRsZSBVbmRvXHJcbiAgICB2YXIgY3Vyc29yUG9zID0gdGhpcy5lbC5zZWxlY3Rpb25FbmQ7XHJcblxyXG4gICAgLy8gdmFyIHJlcyA9IGlucHV0VmFsdWVcclxuICAgIC8vICAgLnNwbGl0KCcnKVxyXG4gICAgLy8gICAubWFwKChjaCwgLi4uYXJncykgPT4ge1xyXG4gICAgLy8gICAgIHZhciByZXMgPSB0aGlzLmNoYXJSZXNvbHZlci5yZXNvbHZlKGNoLCAuLi5hcmdzKTtcclxuICAgIC8vICAgICByZXR1cm4gY29uZm9ybShyZXMsIGNoKTtcclxuICAgIC8vICAgfSlcclxuICAgIC8vICAgLmpvaW4oJycpO1xyXG5cclxuICAgIHZhciBkZXRhaWxzID0ge1xyXG4gICAgICBvbGRTZWxlY3Rpb246IHRoaXMuX29sZFNlbGVjdGlvbixcclxuICAgICAgY3Vyc29yUG9zOiBjdXJzb3JQb3MsXHJcbiAgICAgIG9sZFZhbHVlOiB0aGlzLl9vbGRWYWx1ZVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmVzID0gaW5wdXRWYWx1ZTtcclxuICAgIHJlcyA9IGNvbmZvcm0odGhpcy5yZXNvbHZlKHJlcywgZGV0YWlscyksXHJcbiAgICAgIHJlcyxcclxuICAgICAgdGhpcy5fb2xkVmFsdWUpO1xyXG4gICAgaWYgKHJlcyAhPT0gaW5wdXRWYWx1ZSkge1xyXG4gICAgICB0aGlzLmVsLnZhbHVlID0gcmVzO1xyXG4gICAgICBjdXJzb3JQb3MgPSByZXMgPT09IHRoaXMuX29sZFZhbHVlID9cclxuICAgICAgICAvLyBpZiB2YWx1ZSBub3QgY2hhbmdlZCAtIHVzZSBvbGQgY3Vyc29yIHBvc1xyXG4gICAgICAgIHRoaXMuX29sZFNlbGVjdGlvbi5lbmQgOlxyXG4gICAgICAgIC8vIGVsc2Ugc2V0IG5ld1xyXG4gICAgICAgIGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgfVxyXG4gICAgdGhpcy5lbC5zZWxlY3Rpb25TdGFydCA9IHRoaXMuZWwuc2VsZWN0aW9uRW5kID0gY3Vyc29yUG9zO1xyXG5cclxuICAgIGlmIChyZXMgIT09IHRoaXMuX29sZFZhbHVlKSB7XHJcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuYWNjZXB0IHx8IFtdO1xyXG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChsID0+IGwoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgb24gKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHRoaXMuX2xpc3RlbmVyc1tldl0gPSBbXTtcclxuICAgIHRoaXMuX2xpc3RlbmVyc1tldl0ucHVzaChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIG9mZiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgcmV0dXJuO1xyXG4gICAgaWYgKCFoYW5kbGVyKSB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbZXZdO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgaEluZGV4ID0gdGhpcy5fbGlzdGVuZXJzW2V2XS5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgaWYgKGhJbmRleCA+PSAwKSB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGhJbmRleCwgMSk7XHJcbiAgfVxyXG5cclxuICAvLyBvdmVycmlkZSB0aGlzXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7IHJldHVybiBzdHI7IH1cclxuXHJcbiAgZ2V0IHJhd1ZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLmVsLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHJhd1ZhbHVlIChzdHIpIHtcclxuICAgIHZhciBkZXRhaWxzID0ge1xyXG4gICAgICBzdGFydENoYW5nZVBvczogMCxcclxuICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiB0aGlzLmVsLnZhbHVlLmxlbmd0aFxyXG4gICAgICB9LFxyXG4gICAgICByZW1vdmVkQ291bnQ6IHRoaXMuZWwudmFsdWUubGVuZ3RoLFxyXG4gICAgICBpbnNlcnRlZENvdW50OiBzdHIubGVuZ3RoLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5lbC52YWx1ZVxyXG4gICAgfTtcclxuICAgIHRoaXMuZWwudmFsdWUgPSBjb25mb3JtKHRoaXMucmVzb2x2ZShzdHIsIGRldGFpbHMpLCB0aGlzLmVsLnZhbHVlKTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLmVsLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHZhbHVlKSB7XHJcbiAgICB0aGlzLmVsLnZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBfb25Ecm9wIChldikge1xyXG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFJlZ0V4cE1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoc3RyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrLnRlc3Qoc3RyKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBGdW5jTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlICguLi5hcmdzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrKC4uLmFyZ3MpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge2NvbmZvcm19IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGF0dGVybk1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICBzdXBlcihlbCwgb3B0cyk7XHJcbiAgICB2YXIgcGF0dGVybiA9IHRoaXMubWFzaztcclxuICAgIHRoaXMuX2NoYXJQbGFjZWhvbGRlciA9IG9wdHMuY2hhclBsYWNlaG9sZGVyIHx8IFBhdHRlcm5NYXNrLkRFRkFVTFRfQ0hBUl9QTEFDRUhPTERFUjtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gUGF0dGVybk1hc2suREVGSU5JVElPTlM7XHJcbiAgICB0aGlzLl9jaGFyRGVmcyA9IFtdO1xyXG4gICAgdGhpcy5faG9sbG93cyA9IFtdO1xyXG5cclxuICAgIGlmIChvcHRzLmRlZmluaXRpb25zKSB7XHJcbiAgICAgIGZvciAodmFyIGRlZiBpbiBvcHRzLmRlZmluaXRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5fZGVmaW5pdGlvbnNbZGVmXSA9IG9wdHMuZGVmaW5pdGlvbnNbZGVmXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB1bm1hc2tpbmdCbG9jayA9IGZhbHNlO1xyXG4gICAgdmFyIG9wdGlvbmFsQmxvY2sgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgIHZhciB0eXBlID0gIXVubWFza2luZ0Jsb2NrICYmIGNoIGluIHRoaXMuX2RlZmluaXRpb25zID9cclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgOlxyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgdmFyIHVubWFza2luZyA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCB8fCB1bm1hc2tpbmdCbG9jaztcclxuICAgICAgdmFyIG9wdGlvbmFsID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIG9wdGlvbmFsQmxvY2s7XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICd7JyB8fCBjaCA9PT0gJ30nKSB7XHJcbiAgICAgICAgdW5tYXNraW5nQmxvY2sgPSAhdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1snIHx8IGNoID09PSAnXScpIHtcclxuICAgICAgICBvcHRpb25hbEJsb2NrID0gIW9wdGlvbmFsQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1xcXFwnKSB7XHJcbiAgICAgICAgKytpO1xyXG4gICAgICAgIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgICAvLyBUT0RPIHZhbGlkYXRpb25cclxuICAgICAgICBpZiAoIWNoKSBicmVhaztcclxuICAgICAgICB0eXBlID0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jaGFyRGVmcy5wdXNoKHtcclxuICAgICAgICBjaGFyOiBjaCxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcclxuICAgICAgICB1bm1hc2tpbmc6IHVubWFza2luZ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9yZXNvbHZlcnMgPSB7fTtcclxuICAgIGZvciAodmFyIGRlZktleSBpbiB0aGlzLl9kZWZpbml0aW9ucykge1xyXG4gICAgICB0aGlzLl9yZXNvbHZlcnNbZGVmS2V5XSA9IElNYXNrLk1hc2tGYWN0b3J5KHRoaXMuZWwsIHtcclxuICAgICAgICBtYXNrOiB0aGlzLl9kZWZpbml0aW9uc1tkZWZLZXldXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX3RyeUFwcGVuZFRhaWwgKHN0ciwgdGFpbCkge1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXN0ci5sZW5ndGg7IGNpIDwgdGFpbC5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gdGFpbFtjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICAvLyBmYWlsZWRcclxuICAgICAgaWYgKCFkZWYpIHJldHVybjtcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgdmFyIHJlc29sdmVyID0gdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXTtcclxuICAgICAgICB2YXIgY2hyZXMgPSByZXNvbHZlci5yZXNvbHZlKGNoLCBkaSwgc3RyKSB8fCAnJztcclxuICAgICAgICBpZiAoY2hyZXMpIHtcclxuICAgICAgICAgIGNocmVzID0gY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgICAgKytjaTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY2hyZXMgPSB0aGlzLmNoYXJQbGFjZWhvbGRlcjtcclxuICAgICAgICAgIGhvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0ciArPSBwbGFjZWhvbGRlckJ1ZmZlciArIGNocmVzO1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3N0ciwgaG9sbG93c107XHJcbiAgfVxyXG5cclxuICBfZXh0cmFjdElucHV0IChzdHIsIHN0YXJ0RGVmSW5kZXg9MCkge1xyXG4gICAgdmFyIGlucHV0ID0gJyc7XHJcbiAgICBmb3IgKHZhciBkaT1zdGFydERlZkluZGV4LCBjaT0wOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytjaSwgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiZcclxuICAgICAgICB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGkpIDwgMCkgaW5wdXQgKz0gY2g7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBfZ2VuZXJhdGVJbnNlcnRTdGVwcyAoaGVhZCwgaW5zZXJ0ZWQpIHtcclxuICAgIHZhciByZXMgPSBoZWFkO1xyXG5cclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW3Jlc107XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT1oZWFkLmxlbmd0aDsgY2k8aW5zZXJ0ZWQubGVuZ3RoOykge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcblxyXG4gICAgICB2YXIgY2ggPSBpbnNlcnRlZFtjaV07XHJcbiAgICAgIHZhciBjaHJlcyA9ICcnO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgY2hyZXMgPSByZXNvbHZlci5yZXNvbHZlKGNoLCBjaSkgfHwgJyc7XHJcbiAgICAgICAgLy8gaWYgb2sgLSBuZXh0IGRpXHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICArK2RpO1xyXG4gICAgICAgICAgcmVzICs9IHBsYWNlaG9sZGVyQnVmZmVyOyBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgY2hyZXMgPSBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcblxyXG4gICAgICAgIGlmIChjaCA9PT0gZGVmLmNoYXIpICsrY2k7XHJcbiAgICAgICAgKytkaTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmVzICs9IGNocmVzO1xyXG4gICAgICBpbnNlcnRTdGVwc1tjaV0gPSByZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGluc2VydFN0ZXBzO1xyXG4gIH1cclxuXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICAvLyBUT0RPXHJcbiAgICBpZiAoIWRldGFpbHMpIHJldHVybiAnJztcclxuICAgIC8vIGNvbnNvbGUubG9nKGRldGFpbHMpO1xyXG5cclxuXHJcbiAgICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgICB2YXIgb2xkU2VsZWN0aW9uID0gZGV0YWlscy5vbGRTZWxlY3Rpb247XHJcbiAgICB2YXIgb2xkVmFsdWUgPSBkZXRhaWxzLm9sZFZhbHVlO1xyXG4gICAgdmFyIHN0YXJ0Q2hhbmdlUG9zID0gTWF0aC5taW4oY3Vyc29yUG9zLCBvbGRTZWxlY3Rpb24uc3RhcnQpO1xyXG4gICAgLy8gTWF0aC5tYXggZm9yIG9wcG9zaXRlIG9wZXJhdGlvblxyXG4gICAgdmFyIHJlbW92ZWRDb3VudCA9IE1hdGgubWF4KChvbGRTZWxlY3Rpb24uZW5kIC0gc3RhcnRDaGFuZ2VQb3MpIHx8XHJcbiAgICAgIC8vIGZvciBEZWxldGVcclxuICAgICAgb2xkVmFsdWUubGVuZ3RoIC0gc3RyLmxlbmd0aCwgMCk7XHJcbiAgICB2YXIgaW5zZXJ0ZWRDb3VudCA9IGN1cnNvclBvcyAtIHN0YXJ0Q2hhbmdlUG9zO1xyXG5cclxuXHJcbiAgICB2YXIgaGVhZCA9IHN0ci5zdWJzdHJpbmcoMCwgc3RhcnRDaGFuZ2VQb3MpO1xyXG4gICAgdmFyIHRhaWwgPSBzdHIuc3Vic3RyaW5nKHN0YXJ0Q2hhbmdlUG9zICsgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgICB2YXIgaW5zZXJ0ZWQgPSBzdHIuc3Vic3RyKHN0YXJ0Q2hhbmdlUG9zLCBpbnNlcnRlZENvdW50KTtcclxuXHJcbiAgICB2YXIgdGFpbElucHV0ID0gdGhpcy5fZXh0cmFjdElucHV0KHRhaWwsIHN0YXJ0Q2hhbmdlUG9zICsgcmVtb3ZlZENvdW50KTtcclxuXHJcbiAgICAvLyByZW1vdmUgaG9sbG93cyBhZnRlciBjdXJzb3JcclxuICAgIHRoaXMuX2hvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLmZpbHRlcihoID0+IGggPCBzdGFydENoYW5nZVBvcyk7XHJcblxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gdGhpcy5fZ2VuZXJhdGVJbnNlcnRTdGVwcyhoZWFkLCBpbnNlcnRlZCk7XHJcblxyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcCA9IGluc2VydFN0ZXBzW2lzdGVwXTtcclxuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX3RyeUFwcGVuZFRhaWwoc3RlcCwgdGFpbElucHV0KTtcclxuICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgIFtyZXMsIHRoaXMuX2hvbGxvd3NdID0gcmVzdWx0O1xyXG4gICAgICAgIGN1cnNvclBvcyA9IHN0ZXAubGVuZ3RoO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRlZjtcclxuICAgIC8vIGFwcGVuZCBmaXhlZCBhdCBlbmQgaWYgaW5zZXJ0ZWRcclxuICAgIGlmIChpbnNlcnRlZCkge1xyXG4gICAgICB2YXIgYXBwZW5kZWQgPSB0aGlzLl9hcHBlbmRGaXhlZEVuZChyZXMpO1xyXG4gICAgICBjdXJzb3JQb3MgKz0gYXBwZW5kZWQubGVuZ3RoIC0gcmVzLmxlbmd0aDtcclxuICAgICAgcmVzID0gYXBwZW5kZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhlYWQgZml4ZWQgYW5kIGhvbGxvd3MgaWYgcmVtb3ZlZCBhdCBlbmRcclxuICAgIGlmICghaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIHZhciBkaSA9IGN1cnNvclBvcyAtIDE7XHJcbiAgICAgIHZhciBoYXNIb2xsb3dzID0gZmFsc2U7XHJcbiAgICAgIGZvciAoOyBkaSA+IDA7IC0tZGkpIHtcclxuICAgICAgICBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGkpID49IDApIGhhc0hvbGxvd3MgPSB0cnVlO1xyXG4gICAgICAgICAgZWxzZSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGhhc0hvbGxvd3MpIHJlcyA9IHJlcy5zbGljZSgwLCBkaSk7XHJcbiAgICB9XHJcbiAgICBkZXRhaWxzLmN1cnNvclBvcyA9IGN1cnNvclBvcztcclxuXHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChldikge1xyXG4gICAgdmFyIHJlcyA9IHN1cGVyLnByb2Nlc3NJbnB1dChldik7XHJcbiAgICBpZiAocmVzICE9PSB0aGlzLl9vbGRWYWx1ZSAmJiB0aGlzLl9pc0NvbXBsZXRlKHJlcykpIHtcclxuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5jb21wbGV0ZSB8fCBbXTtcclxuICAgICAgbGlzdGVuZXJzLmZvckVhY2gobCA9PiBsKCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2lzQ29tcGxldGUgKHN0cikge1xyXG4gICAgdmFyIGRlZklucHV0cyA9IHRoaXMuX2NoYXJEZWZzLmZpbHRlcihkZWYgPT4gZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCk7XHJcbiAgICByZXR1cm4gdGhpcy5fZXh0cmFjdElucHV0KHN0cikubGVuZ3RoID09PSBkZWZJbnB1dHMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZEZpeGVkRW5kIChyZXMpIHtcclxuICAgIHZhciBwb3MgPSByZXMubGVuZ3RoO1xyXG4gICAgZm9yICg7OyArK3Bvcykge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbcG9zXTtcclxuICAgICAgaWYgKCFkZWYgfHwgZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIGlmIChwb3MgPj0gcmVzLmxlbmd0aCkgcmVzICs9IGRlZi5jaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHZhciBzdHIgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgdmFyIHVubWFza2VkID0gJyc7XHJcbiAgICBmb3IgKHZhciBjaT0wOyBjaTxzdHIubGVuZ3RoICYmIGNpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytjaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbY2ldO1xyXG5cclxuICAgICAgaWYgKGRlZi51bm1hc2tpbmcgJiYgIXRoaXMuX2hvbGxvd3MuaW5kZXhPZihjaSkgPj0gMCAmJlxyXG4gICAgICAgIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl0ucmVzb2x2ZShjaCwgY2kpIHx8XHJcbiAgICAgICAgICBkZWYuY2hhciA9PT0gY2gpKSB7XHJcbiAgICAgICAgdW5tYXNrZWQgKz0gY2g7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB1bm1hc2tlZDtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlIChzdHIpIHtcclxuICAgIHZhciByZXMgPSAnJztcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT0wOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDspIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuXHJcbiAgICAgIHZhciBjaHJlcyA9ICcnO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdLnJlc29sdmUoY2gsIGNpKSkge1xyXG4gICAgICAgICAgY2hyZXMgPSBjaDtcclxuICAgICAgICAgICsrZGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hyZXMgPSBkZWYuY2hhcjtcclxuICAgICAgICBpZiAoZGVmLnVubWFza2luZyAmJiBkZWYuY2hhciA9PT0gY2gpICsrY2k7XHJcbiAgICAgICAgKytkaTtcclxuICAgICAgfVxyXG4gICAgICByZXMgKz0gY2hyZXM7XHJcbiAgICB9XHJcbiAgICByZXMgPSB0aGlzLl9hcHBlbmRGaXhlZEVuZChyZXMpO1xyXG4gICAgdGhpcy5faG9sbG93cy5sZW5ndGggPSAwO1xyXG5cclxuICAgIHRoaXMuZWwudmFsdWUgPSByZXM7XHJcbiAgfVxyXG5cclxuICBnZXQgY2hhclBsYWNlaG9sZGVyICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGFyUGxhY2Vob2xkZXI7XHJcbiAgfVxyXG5cclxuICBzZXQgY2hhclBsYWNlaG9sZGVyIChwaCkge1xyXG4gICAgLy8gVE9ET1xyXG4gIH1cclxufVxyXG5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyA9IHtcclxuICAnMCc6IC9cXGQvLFxyXG4gICdhJzogL1tcXHUwMDQxLVxcdTAwNUFcXHUwMDYxLVxcdTAwN0FcXHUwMEFBXFx1MDBCNVxcdTAwQkFcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZcXHUwMEY4LVxcdTAyQzFcXHUwMkM2LVxcdTAyRDFcXHUwMkUwLVxcdTAyRTRcXHUwMkVDXFx1MDJFRVxcdTAzNzAtXFx1MDM3NFxcdTAzNzZcXHUwMzc3XFx1MDM3QS1cXHUwMzdEXFx1MDM4NlxcdTAzODgtXFx1MDM4QVxcdTAzOENcXHUwMzhFLVxcdTAzQTFcXHUwM0EzLVxcdTAzRjVcXHUwM0Y3LVxcdTA0ODFcXHUwNDhBLVxcdTA1MjdcXHUwNTMxLVxcdTA1NTZcXHUwNTU5XFx1MDU2MS1cXHUwNTg3XFx1MDVEMC1cXHUwNUVBXFx1MDVGMC1cXHUwNUYyXFx1MDYyMC1cXHUwNjRBXFx1MDY2RVxcdTA2NkZcXHUwNjcxLVxcdTA2RDNcXHUwNkQ1XFx1MDZFNVxcdTA2RTZcXHUwNkVFXFx1MDZFRlxcdTA2RkEtXFx1MDZGQ1xcdTA2RkZcXHUwNzEwXFx1MDcxMi1cXHUwNzJGXFx1MDc0RC1cXHUwN0E1XFx1MDdCMVxcdTA3Q0EtXFx1MDdFQVxcdTA3RjRcXHUwN0Y1XFx1MDdGQVxcdTA4MDAtXFx1MDgxNVxcdTA4MUFcXHUwODI0XFx1MDgyOFxcdTA4NDAtXFx1MDg1OFxcdTA4QTBcXHUwOEEyLVxcdTA4QUNcXHUwOTA0LVxcdTA5MzlcXHUwOTNEXFx1MDk1MFxcdTA5NTgtXFx1MDk2MVxcdTA5NzEtXFx1MDk3N1xcdTA5NzktXFx1MDk3RlxcdTA5ODUtXFx1MDk4Q1xcdTA5OEZcXHUwOTkwXFx1MDk5My1cXHUwOUE4XFx1MDlBQS1cXHUwOUIwXFx1MDlCMlxcdTA5QjYtXFx1MDlCOVxcdTA5QkRcXHUwOUNFXFx1MDlEQ1xcdTA5RERcXHUwOURGLVxcdTA5RTFcXHUwOUYwXFx1MDlGMVxcdTBBMDUtXFx1MEEwQVxcdTBBMEZcXHUwQTEwXFx1MEExMy1cXHUwQTI4XFx1MEEyQS1cXHUwQTMwXFx1MEEzMlxcdTBBMzNcXHUwQTM1XFx1MEEzNlxcdTBBMzhcXHUwQTM5XFx1MEE1OS1cXHUwQTVDXFx1MEE1RVxcdTBBNzItXFx1MEE3NFxcdTBBODUtXFx1MEE4RFxcdTBBOEYtXFx1MEE5MVxcdTBBOTMtXFx1MEFBOFxcdTBBQUEtXFx1MEFCMFxcdTBBQjJcXHUwQUIzXFx1MEFCNS1cXHUwQUI5XFx1MEFCRFxcdTBBRDBcXHUwQUUwXFx1MEFFMVxcdTBCMDUtXFx1MEIwQ1xcdTBCMEZcXHUwQjEwXFx1MEIxMy1cXHUwQjI4XFx1MEIyQS1cXHUwQjMwXFx1MEIzMlxcdTBCMzNcXHUwQjM1LVxcdTBCMzlcXHUwQjNEXFx1MEI1Q1xcdTBCNURcXHUwQjVGLVxcdTBCNjFcXHUwQjcxXFx1MEI4M1xcdTBCODUtXFx1MEI4QVxcdTBCOEUtXFx1MEI5MFxcdTBCOTItXFx1MEI5NVxcdTBCOTlcXHUwQjlBXFx1MEI5Q1xcdTBCOUVcXHUwQjlGXFx1MEJBM1xcdTBCQTRcXHUwQkE4LVxcdTBCQUFcXHUwQkFFLVxcdTBCQjlcXHUwQkQwXFx1MEMwNS1cXHUwQzBDXFx1MEMwRS1cXHUwQzEwXFx1MEMxMi1cXHUwQzI4XFx1MEMyQS1cXHUwQzMzXFx1MEMzNS1cXHUwQzM5XFx1MEMzRFxcdTBDNThcXHUwQzU5XFx1MEM2MFxcdTBDNjFcXHUwQzg1LVxcdTBDOENcXHUwQzhFLVxcdTBDOTBcXHUwQzkyLVxcdTBDQThcXHUwQ0FBLVxcdTBDQjNcXHUwQ0I1LVxcdTBDQjlcXHUwQ0JEXFx1MENERVxcdTBDRTBcXHUwQ0UxXFx1MENGMVxcdTBDRjJcXHUwRDA1LVxcdTBEMENcXHUwRDBFLVxcdTBEMTBcXHUwRDEyLVxcdTBEM0FcXHUwRDNEXFx1MEQ0RVxcdTBENjBcXHUwRDYxXFx1MEQ3QS1cXHUwRDdGXFx1MEQ4NS1cXHUwRDk2XFx1MEQ5QS1cXHUwREIxXFx1MERCMy1cXHUwREJCXFx1MERCRFxcdTBEQzAtXFx1MERDNlxcdTBFMDEtXFx1MEUzMFxcdTBFMzJcXHUwRTMzXFx1MEU0MC1cXHUwRTQ2XFx1MEU4MVxcdTBFODJcXHUwRTg0XFx1MEU4N1xcdTBFODhcXHUwRThBXFx1MEU4RFxcdTBFOTQtXFx1MEU5N1xcdTBFOTktXFx1MEU5RlxcdTBFQTEtXFx1MEVBM1xcdTBFQTVcXHUwRUE3XFx1MEVBQVxcdTBFQUJcXHUwRUFELVxcdTBFQjBcXHUwRUIyXFx1MEVCM1xcdTBFQkRcXHUwRUMwLVxcdTBFQzRcXHUwRUM2XFx1MEVEQy1cXHUwRURGXFx1MEYwMFxcdTBGNDAtXFx1MEY0N1xcdTBGNDktXFx1MEY2Q1xcdTBGODgtXFx1MEY4Q1xcdTEwMDAtXFx1MTAyQVxcdTEwM0ZcXHUxMDUwLVxcdTEwNTVcXHUxMDVBLVxcdTEwNURcXHUxMDYxXFx1MTA2NVxcdTEwNjZcXHUxMDZFLVxcdTEwNzBcXHUxMDc1LVxcdTEwODFcXHUxMDhFXFx1MTBBMC1cXHUxMEM1XFx1MTBDN1xcdTEwQ0RcXHUxMEQwLVxcdTEwRkFcXHUxMEZDLVxcdTEyNDhcXHUxMjRBLVxcdTEyNERcXHUxMjUwLVxcdTEyNTZcXHUxMjU4XFx1MTI1QS1cXHUxMjVEXFx1MTI2MC1cXHUxMjg4XFx1MTI4QS1cXHUxMjhEXFx1MTI5MC1cXHUxMkIwXFx1MTJCMi1cXHUxMkI1XFx1MTJCOC1cXHUxMkJFXFx1MTJDMFxcdTEyQzItXFx1MTJDNVxcdTEyQzgtXFx1MTJENlxcdTEyRDgtXFx1MTMxMFxcdTEzMTItXFx1MTMxNVxcdTEzMTgtXFx1MTM1QVxcdTEzODAtXFx1MTM4RlxcdTEzQTAtXFx1MTNGNFxcdTE0MDEtXFx1MTY2Q1xcdTE2NkYtXFx1MTY3RlxcdTE2ODEtXFx1MTY5QVxcdTE2QTAtXFx1MTZFQVxcdTE3MDAtXFx1MTcwQ1xcdTE3MEUtXFx1MTcxMVxcdTE3MjAtXFx1MTczMVxcdTE3NDAtXFx1MTc1MVxcdTE3NjAtXFx1MTc2Q1xcdTE3NkUtXFx1MTc3MFxcdTE3ODAtXFx1MTdCM1xcdTE3RDdcXHUxN0RDXFx1MTgyMC1cXHUxODc3XFx1MTg4MC1cXHUxOEE4XFx1MThBQVxcdTE4QjAtXFx1MThGNVxcdTE5MDAtXFx1MTkxQ1xcdTE5NTAtXFx1MTk2RFxcdTE5NzAtXFx1MTk3NFxcdTE5ODAtXFx1MTlBQlxcdTE5QzEtXFx1MTlDN1xcdTFBMDAtXFx1MUExNlxcdTFBMjAtXFx1MUE1NFxcdTFBQTdcXHUxQjA1LVxcdTFCMzNcXHUxQjQ1LVxcdTFCNEJcXHUxQjgzLVxcdTFCQTBcXHUxQkFFXFx1MUJBRlxcdTFCQkEtXFx1MUJFNVxcdTFDMDAtXFx1MUMyM1xcdTFDNEQtXFx1MUM0RlxcdTFDNUEtXFx1MUM3RFxcdTFDRTktXFx1MUNFQ1xcdTFDRUUtXFx1MUNGMVxcdTFDRjVcXHUxQ0Y2XFx1MUQwMC1cXHUxREJGXFx1MUUwMC1cXHUxRjE1XFx1MUYxOC1cXHUxRjFEXFx1MUYyMC1cXHUxRjQ1XFx1MUY0OC1cXHUxRjREXFx1MUY1MC1cXHUxRjU3XFx1MUY1OVxcdTFGNUJcXHUxRjVEXFx1MUY1Ri1cXHUxRjdEXFx1MUY4MC1cXHUxRkI0XFx1MUZCNi1cXHUxRkJDXFx1MUZCRVxcdTFGQzItXFx1MUZDNFxcdTFGQzYtXFx1MUZDQ1xcdTFGRDAtXFx1MUZEM1xcdTFGRDYtXFx1MUZEQlxcdTFGRTAtXFx1MUZFQ1xcdTFGRjItXFx1MUZGNFxcdTFGRjYtXFx1MUZGQ1xcdTIwNzFcXHUyMDdGXFx1MjA5MC1cXHUyMDlDXFx1MjEwMlxcdTIxMDdcXHUyMTBBLVxcdTIxMTNcXHUyMTE1XFx1MjExOS1cXHUyMTFEXFx1MjEyNFxcdTIxMjZcXHUyMTI4XFx1MjEyQS1cXHUyMTJEXFx1MjEyRi1cXHUyMTM5XFx1MjEzQy1cXHUyMTNGXFx1MjE0NS1cXHUyMTQ5XFx1MjE0RVxcdTIxODNcXHUyMTg0XFx1MkMwMC1cXHUyQzJFXFx1MkMzMC1cXHUyQzVFXFx1MkM2MC1cXHUyQ0U0XFx1MkNFQi1cXHUyQ0VFXFx1MkNGMlxcdTJDRjNcXHUyRDAwLVxcdTJEMjVcXHUyRDI3XFx1MkQyRFxcdTJEMzAtXFx1MkQ2N1xcdTJENkZcXHUyRDgwLVxcdTJEOTZcXHUyREEwLVxcdTJEQTZcXHUyREE4LVxcdTJEQUVcXHUyREIwLVxcdTJEQjZcXHUyREI4LVxcdTJEQkVcXHUyREMwLVxcdTJEQzZcXHUyREM4LVxcdTJEQ0VcXHUyREQwLVxcdTJERDZcXHUyREQ4LVxcdTJEREVcXHUyRTJGXFx1MzAwNVxcdTMwMDZcXHUzMDMxLVxcdTMwMzVcXHUzMDNCXFx1MzAzQ1xcdTMwNDEtXFx1MzA5NlxcdTMwOUQtXFx1MzA5RlxcdTMwQTEtXFx1MzBGQVxcdTMwRkMtXFx1MzBGRlxcdTMxMDUtXFx1MzEyRFxcdTMxMzEtXFx1MzE4RVxcdTMxQTAtXFx1MzFCQVxcdTMxRjAtXFx1MzFGRlxcdTM0MDAtXFx1NERCNVxcdTRFMDAtXFx1OUZDQ1xcdUEwMDAtXFx1QTQ4Q1xcdUE0RDAtXFx1QTRGRFxcdUE1MDAtXFx1QTYwQ1xcdUE2MTAtXFx1QTYxRlxcdUE2MkFcXHVBNjJCXFx1QTY0MC1cXHVBNjZFXFx1QTY3Ri1cXHVBNjk3XFx1QTZBMC1cXHVBNkU1XFx1QTcxNy1cXHVBNzFGXFx1QTcyMi1cXHVBNzg4XFx1QTc4Qi1cXHVBNzhFXFx1QTc5MC1cXHVBNzkzXFx1QTdBMC1cXHVBN0FBXFx1QTdGOC1cXHVBODAxXFx1QTgwMy1cXHVBODA1XFx1QTgwNy1cXHVBODBBXFx1QTgwQy1cXHVBODIyXFx1QTg0MC1cXHVBODczXFx1QTg4Mi1cXHVBOEIzXFx1QThGMi1cXHVBOEY3XFx1QThGQlxcdUE5MEEtXFx1QTkyNVxcdUE5MzAtXFx1QTk0NlxcdUE5NjAtXFx1QTk3Q1xcdUE5ODQtXFx1QTlCMlxcdUE5Q0ZcXHVBQTAwLVxcdUFBMjhcXHVBQTQwLVxcdUFBNDJcXHVBQTQ0LVxcdUFBNEJcXHVBQTYwLVxcdUFBNzZcXHVBQTdBXFx1QUE4MC1cXHVBQUFGXFx1QUFCMVxcdUFBQjVcXHVBQUI2XFx1QUFCOS1cXHVBQUJEXFx1QUFDMFxcdUFBQzJcXHVBQURCLVxcdUFBRERcXHVBQUUwLVxcdUFBRUFcXHVBQUYyLVxcdUFBRjRcXHVBQjAxLVxcdUFCMDZcXHVBQjA5LVxcdUFCMEVcXHVBQjExLVxcdUFCMTZcXHVBQjIwLVxcdUFCMjZcXHVBQjI4LVxcdUFCMkVcXHVBQkMwLVxcdUFCRTJcXHVBQzAwLVxcdUQ3QTNcXHVEN0IwLVxcdUQ3QzZcXHVEN0NCLVxcdUQ3RkJcXHVGOTAwLVxcdUZBNkRcXHVGQTcwLVxcdUZBRDlcXHVGQjAwLVxcdUZCMDZcXHVGQjEzLVxcdUZCMTdcXHVGQjFEXFx1RkIxRi1cXHVGQjI4XFx1RkIyQS1cXHVGQjM2XFx1RkIzOC1cXHVGQjNDXFx1RkIzRVxcdUZCNDBcXHVGQjQxXFx1RkI0M1xcdUZCNDRcXHVGQjQ2LVxcdUZCQjFcXHVGQkQzLVxcdUZEM0RcXHVGRDUwLVxcdUZEOEZcXHVGRDkyLVxcdUZEQzdcXHVGREYwLVxcdUZERkJcXHVGRTcwLVxcdUZFNzRcXHVGRTc2LVxcdUZFRkNcXHVGRjIxLVxcdUZGM0FcXHVGRjQxLVxcdUZGNUFcXHVGRjY2LVxcdUZGQkVcXHVGRkMyLVxcdUZGQzdcXHVGRkNBLVxcdUZGQ0ZcXHVGRkQyLVxcdUZGRDdcXHVGRkRBLVxcdUZGRENdLywgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyMDc1MDcwXHJcbiAgJyonOiAvLi9cclxufTtcclxuUGF0dGVybk1hc2suREVGX1RZUEVTID0ge1xyXG4gIElOUFVUOiAnaW5wdXQnLFxyXG4gIEZJWEVEOiAnZml4ZWQnXHJcbn1cclxuUGF0dGVybk1hc2suREVGQVVMVF9DSEFSX1BMQUNFSE9MREVSID0gJ18nO1xyXG4iLCJpbXBvcnQge2lzU3RyaW5nfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmltcG9ydCBCYXNlTWFzayBmcm9tICcuL21hc2tzL2Jhc2UnO1xyXG5pbXBvcnQgUmVnRXhwTWFzayBmcm9tICcuL21hc2tzL3JlZ2V4cCc7XHJcbmltcG9ydCBGdW5jTWFzayBmcm9tICcuL21hc2tzL2Z1bmMnO1xyXG5pbXBvcnQgUGF0dGVybk1hc2sgZnJvbSAnLi9tYXNrcy9wYXR0ZXJuJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5mdW5jdGlvbiBJTWFzayAoZWwsIG9wdHM9e30pIHtcclxuICB2YXIgbWFzayA9IElNYXNrLk1hc2tGYWN0b3J5KGVsLCBvcHRzKTtcclxuICBtYXNrLmJpbmRFdmVudHMoKTtcclxuICAvLyByZWZyZXNoXHJcbiAgbWFzay5yYXdWYWx1ZSA9IGVsLnZhbHVlO1xyXG4gIHJldHVybiBtYXNrO1xyXG59XHJcblxyXG5JTWFzay5NYXNrRmFjdG9yeSA9IGZ1bmN0aW9uIChlbCwgb3B0cykge1xyXG4gIHZhciBtYXNrID0gb3B0cy5tYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgQmFzZU1hc2spIHJldHVybiBtYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gbmV3IFJlZ0V4cE1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHJldHVybiBuZXcgRnVuY01hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChpc1N0cmluZyhtYXNrKSkgcmV0dXJuIG5ldyBQYXR0ZXJuTWFzayhlbCwgb3B0cyk7XHJcbiAgcmV0dXJuIG5ldyBCYXNlTWFzayhlbCwgb3B0cyk7XHJcbn1cclxuSU1hc2suQmFzZU1hc2sgPSBCYXNlTWFzaztcclxuSU1hc2suRnVuY01hc2sgPSBGdW5jTWFzaztcclxuSU1hc2suUmVnRXhwTWFzayA9IFJlZ0V4cE1hc2s7XHJcbklNYXNrLlBhdHRlcm5NYXNrID0gUGF0dGVybk1hc2s7XHJcbndpbmRvdy5JTWFzayA9IElNYXNrO1xyXG4iXSwibmFtZXMiOlsiaXNTdHJpbmciLCJzdHIiLCJTdHJpbmciLCJjb25mb3JtIiwicmVzIiwiZmFsbGJhY2siLCJCYXNlTWFzayIsImVsIiwib3B0cyIsIm1hc2siLCJfbGlzdGVuZXJzIiwiYWRkRXZlbnRMaXN0ZW5lciIsInNhdmVDdXJzb3IiLCJiaW5kIiwicHJvY2Vzc0lucHV0IiwiX29uRHJvcCIsImV2IiwiX29sZFZhbHVlIiwidmFsdWUiLCJfb2xkU2VsZWN0aW9uIiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJpbnB1dFZhbHVlIiwiY3Vyc29yUG9zIiwiZGV0YWlscyIsInJlc29sdmUiLCJlbmQiLCJsaXN0ZW5lcnMiLCJhY2NlcHQiLCJmb3JFYWNoIiwibCIsImhhbmRsZXIiLCJwdXNoIiwiaEluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwibGVuZ3RoIiwiUmVnRXhwTWFzayIsInRlc3QiLCJGdW5jTWFzayIsIlBhdHRlcm5NYXNrIiwicGF0dGVybiIsIl9jaGFyUGxhY2Vob2xkZXIiLCJjaGFyUGxhY2Vob2xkZXIiLCJERUZBVUxUX0NIQVJfUExBQ0VIT0xERVIiLCJfZGVmaW5pdGlvbnMiLCJERUZJTklUSU9OUyIsIl9jaGFyRGVmcyIsIl9ob2xsb3dzIiwiZGVmaW5pdGlvbnMiLCJkZWYiLCJ1bm1hc2tpbmdCbG9jayIsIm9wdGlvbmFsQmxvY2siLCJpIiwiY2giLCJ0eXBlIiwiREVGX1RZUEVTIiwiSU5QVVQiLCJGSVhFRCIsInVubWFza2luZyIsIm9wdGlvbmFsIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiTWFza0ZhY3RvcnkiLCJ0YWlsIiwicGxhY2Vob2xkZXJCdWZmZXIiLCJob2xsb3dzIiwic2xpY2UiLCJjaSIsImRpIiwicmVzb2x2ZXIiLCJjaGFyIiwiY2hyZXMiLCJzdGFydERlZkluZGV4IiwiaW5wdXQiLCJoZWFkIiwiaW5zZXJ0ZWQiLCJpbnNlcnRTdGVwcyIsIm9sZFNlbGVjdGlvbiIsIm9sZFZhbHVlIiwic3RhcnRDaGFuZ2VQb3MiLCJNYXRoIiwibWluIiwic3RhcnQiLCJyZW1vdmVkQ291bnQiLCJtYXgiLCJpbnNlcnRlZENvdW50Iiwic3Vic3RyaW5nIiwic3Vic3RyIiwidGFpbElucHV0IiwiX2V4dHJhY3RJbnB1dCIsImZpbHRlciIsImgiLCJfZ2VuZXJhdGVJbnNlcnRTdGVwcyIsImlzdGVwIiwic3RlcCIsInJlc3VsdCIsIl90cnlBcHBlbmRUYWlsIiwiYXBwZW5kZWQiLCJfYXBwZW5kRml4ZWRFbmQiLCJoYXNIb2xsb3dzIiwiX2lzQ29tcGxldGUiLCJjb21wbGV0ZSIsImRlZklucHV0cyIsInBvcyIsInVubWFza2VkIiwicGgiLCJiaW5kRXZlbnRzIiwicmF3VmFsdWUiLCJSZWdFeHAiLCJGdW5jdGlvbiIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsU0FBU0EsUUFBVCxDQUFtQkMsR0FBbkIsRUFBd0I7U0FDZixPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsZUFBZUMsTUFBakQ7OztBQUdGLEFBQ0EsU0FBU0MsT0FBVCxDQUFrQkMsR0FBbEIsRUFBdUJILEdBQXZCLEVBQXlDO01BQWJJLFFBQWEsdUVBQUosRUFBSTs7U0FDaENMLFNBQVNJLEdBQVQsSUFDTEEsR0FESyxHQUVMQSxNQUNFSCxHQURGLEdBRUVJLFFBSko7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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