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

var MaskResolver = function () {
  function MaskResolver(mask) {
    classCallCheck(this, MaskResolver);

    this.mask = mask;
  }

  createClass(MaskResolver, [{
    key: "resolve",
    value: function resolve(str) {
      return str;
    }
  }, {
    key: "unmaskedValue",
    get: function get() {},
    set: function set(value) {}
  }]);
  return MaskResolver;
}();

var FuncResolver = function (_MaskResolver) {
  inherits(FuncResolver, _MaskResolver);

  function FuncResolver() {
    classCallCheck(this, FuncResolver);
    return possibleConstructorReturn(this, (FuncResolver.__proto__ || Object.getPrototypeOf(FuncResolver)).apply(this, arguments));
  }

  createClass(FuncResolver, [{
    key: 'resolve',
    value: function resolve() {
      return this.mask.apply(this, arguments);
    }
  }]);
  return FuncResolver;
}(MaskResolver);

var RegExpResolver = function (_MaskResolver) {
  inherits(RegExpResolver, _MaskResolver);

  function RegExpResolver() {
    classCallCheck(this, RegExpResolver);
    return possibleConstructorReturn(this, (RegExpResolver.__proto__ || Object.getPrototypeOf(RegExpResolver)).apply(this, arguments));
  }

  createClass(RegExpResolver, [{
    key: 'resolve',
    value: function resolve(str) {
      return this.mask.test(str);
    }
  }]);
  return RegExpResolver;
}(MaskResolver);

var PatternResolver = function (_MaskResolver) {
  inherits(PatternResolver, _MaskResolver);

  function PatternResolver(pattern) {
    classCallCheck(this, PatternResolver);

    var _this = possibleConstructorReturn(this, (PatternResolver.__proto__ || Object.getPrototypeOf(PatternResolver)).call(this, pattern));

    _this._definitions = PatternResolver.DEFINITIONS;
    _this._charDefs = [];
    _this._hollows = [];

    for (var i = 0; i < pattern.length; ++i) {
      var ch = pattern[i];
      var type = ch in _this._definitions ? PatternResolver.DEF_TYPES.INPUT : PatternResolver.DEF_TYPES.FIXED;

      _this._charDefs.push({
        char: ch,
        type: type,
        optional: false, // TODO
        unmasking: type === PatternResolver.DEF_TYPES.INPUT
      });
    }

    _this._resolvers = {};
    for (var defKey in _this._definitions) {
      _this._resolvers[defKey] = IMask.ResolverFactory(_this._definitions[defKey]);
    }
    return _this;
  }

  createClass(PatternResolver, [{
    key: '_tryAppendTail',
    value: function _tryAppendTail(str, tail) {
      var placeholderBuffer = '';
      var hollows = this._hollows.slice();
      for (var ci = 0, defIndex = str.length; ci < tail.length; ++defIndex) {
        var ch = tail[ci];
        var def = this._charDefs[defIndex];

        if (!def) return;

        if (def.type === PatternResolver.DEF_TYPES.INPUT) {
          var resolver = this._resolvers[def.char];
          var chres = resolver.resolve(ch, defIndex, str) || '';
          if (chres) {
            chres = conform(chres, ch);
            ++ci;
          } else {
            chres = '_';
            hollows.push(defIndex);
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
      for (var di = startDefIndex, ci = 0; ci < str.length; ++ci, ++di) {
        var ch = str[ci];
        var def = this._charDefs[di];
        if (!def) break;

        if (def.type === PatternResolver.DEF_TYPES.INPUT && this._hollows.indexOf(di) < 0) input += ch;
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
        if (def.type === PatternResolver.DEF_TYPES.INPUT) {
          var resolver = this._resolvers[def.char];
          var chres = resolver.resolve(ch, ci) || '';
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

      var head = str.substring(0, details.startChangePos);
      var tail = str.substring(details.startChangePos + details.insertedCount);
      var inserted = str.substr(details.startChangePos, details.insertedCount);

      var tailInput = this._extractInput(tail, details.startChangePos + details.removedCount);

      // remove hollows after cursor
      this._hollows = this._hollows.filter(function (h) {
        return h < details.startChangePos;
      });

      var insertSteps = this._generateInsertSteps(head, inserted);

      var res = head;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = insertSteps.reverse()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var step = _step.value;

          var result = this._tryAppendTail(step, tailInput);
          if (result) {
            var _result = slicedToArray(result, 2);

            res = _result[0];
            this._hollows = _result[1];

            details.cursorPos = step.length;
            break;
          }
        }

        // append fixed at end
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (details.oldSelection.end <= details.cursorPos) {
        // if not backspace
        for (;; ++details.cursorPos) {
          var def = this._charDefs[details.cursorPos];
          if (!def || def.type === PatternResolver.DEF_TYPES.INPUT) break;
          if (details.cursorPos >= res.length) res += def.char;
        }
      }

      // remove head fixed and hollows
      if (!inserted && details.cursorPos === res.length) {
        // if removed at end
        var di = details.cursorPos - 1;
        var hasHollows = false;
        for (; di > 0; --di) {
          var def = this._charDefs[di];
          if (def.type === PatternResolver.DEF_TYPES.INPUT) {
            if (this._hollows.includes(di)) hasHollows = true;else break;
          }
        }
        if (hasHollows) res = res.slice(0, di);
      }

      return res;
    }
  }]);
  return PatternResolver;
}(MaskResolver);

PatternResolver.DEFINITIONS = {
  '0': /\d/,
  'a': /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/, // http://stackoverflow.com/a/22075070
  '*': /./
};
PatternResolver.DEF_TYPES = {
  INPUT: 'input',
  FIXED: 'fixed'
};

// TODO
// - empty placeholder (+ as option)
// - escape defs
// - !progressive
// - validateOnly
// - get/set unmasked
// - add comments


// TODO opts = {
//   placeholder: '_',
//   definitions: {},
//   progressive: true,
//   validateOnly: false
// }


var IMask$1 = function () {
  function IMask(el) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, IMask);

    var inputValue = el.value;

    this.el = el;
    this.resolver = IMask.ResolverFactory(opts.mask);
    this.charResolver = IMask.ResolverFactory(opts.charMask);

    el.addEventListener('keydown', this._saveCursor.bind(this));
    el.addEventListener('input', this._processInput.bind(this));
    el.addEventListener('drop', this._onDrop.bind(this));
    this._saveCursor();
    this._processInput();

    // refresh
    this.rawValue = this.el.value;
  }

  createClass(IMask, [{
    key: '_onDrop',
    value: function _onDrop(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }, {
    key: '_saveCursor',
    value: function _saveCursor(ev) {
      this._oldValue = this.el.value;
      this._oldSelection = {
        start: this.el.selectionStart,
        end: this.el.selectionEnd
      };
    }
  }, {
    key: '_processInput',
    value: function _processInput(ev) {
      this._conform();
    }
  }, {
    key: 'on',
    value: function on(ev, handler) {}
  }, {
    key: '_conform',
    value: function _conform() {
      var _this = this;

      var inputValue = this.el.value;
      // use selectionEnd for handle Undo
      var cursorPos = this.el.selectionEnd;

      var res = inputValue.split('').map(function (ch) {
        var _charResolver;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var res = (_charResolver = _this.charResolver).resolve.apply(_charResolver, [ch].concat(args));
        return conform(res, ch);
      }).join('');

      var startChangePos = Math.min(cursorPos, this._oldSelection.start);
      // var maxCursorPos = Math.max(cursorPos, this._oldSelection.end);
      var details = {
        startChangePos: startChangePos,
        oldSelection: this._oldSelection,
        cursorPos: cursorPos,
        // Math.max for opposite operation
        removedCount: Math.max(this._oldSelection.end - startChangePos ||
        // for Delete
        this._oldValue.length - inputValue.length, 0),
        insertedCount: cursorPos - startChangePos,
        oldValue: this._oldValue
      };

      res = conform(this.resolver.resolve(res, details), res, this._oldValue);
      if (res !== inputValue) {
        // var cursorPos = this.el.selectionStart;
        // var afterCursorCount = inputValue.length - cursorPos;
        // var cursorPos = res.length - afterCursorCount;
        this.el.value = res;
        if (details.cursorPos != null) cursorPos = details.cursorPos;
        this.el.selectionStart = this.el.selectionEnd = cursorPos;
      }
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
      this.el.value = conform(this.resolver.resolve(str, details), this.el.value);
    }
  }, {
    key: 'unmaskedValue',
    get: function get() {
      var resUnmasked = this.resolver.unmaskedValue;
      return resUnmasked != null ? resUnmasked : this.el.value;
    },
    set: function set(value) {
      this.resolver.unmaskedValue = value;
    }
  }], [{
    key: 'ResolverFactory',
    value: function ResolverFactory(mask) {
      if (mask instanceof RegExp) return new RegExpResolver(mask);
      if (mask instanceof Function) return new FuncResolver(mask);
      if (isString(mask)) return new PatternResolver(mask);
      return new MaskResolver(mask);
    }
  }]);
  return IMask;
}();

IMask$1.MaskResolver = MaskResolver;
IMask$1.FuncResolver = FuncResolver;
IMask$1.RegExpResolver = RegExpResolver;
IMask$1.PatternResolver = PatternResolver;
window.IMask = IMask$1;

return IMask$1;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvcmVzb2x2ZXJzL21hc2stcmVzb2x2ZXIuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9yZXNvbHZlcnMvZnVuYy1yZXNvbHZlci5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3Jlc29sdmVycy9yZWdleHAtcmVzb2x2ZXIuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9yZXNvbHZlcnMvcGF0dGVybi1yZXNvbHZlci5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL2ltYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydFxyXG5mdW5jdGlvbiBpc1N0cmluZyAoc3RyKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnIHx8IHN0ciBpbnN0YW5jZW9mIFN0cmluZztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGNvbmZvcm0gKHJlcywgc3RyLCBmYWxsYmFjaz0nJykge1xyXG4gIHJldHVybiBpc1N0cmluZyhyZXMpID9cclxuICAgIHJlcyA6XHJcbiAgICByZXMgP1xyXG4gICAgICBzdHIgOlxyXG4gICAgICBmYWxsYmFjaztcclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBNYXNrUmVzb2x2ZXIge1xyXG4gIGNvbnN0cnVjdG9yIChtYXNrKSB7XHJcbiAgICB0aGlzLm1hc2sgPSBtYXNrO1xyXG4gIH1cclxuXHJcbiAgcmVzb2x2ZSAoc3RyKSB7XHJcbiAgICByZXR1cm4gc3RyO1xyXG4gIH07XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHt9XHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHZhbHVlKSB7fVxyXG59XHJcbiIsImltcG9ydCBNYXNrUmVzb2x2ZXIgZnJvbSAnLi9tYXNrLXJlc29sdmVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIEZ1bmNSZXNvbHZlciBleHRlbmRzIE1hc2tSZXNvbHZlciB7XHJcbiAgcmVzb2x2ZSAoLi4uYXJncykge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzayguLi5hcmdzKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IE1hc2tSZXNvbHZlciBmcm9tICcuL21hc2stcmVzb2x2ZXInO1xyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUmVnRXhwUmVzb2x2ZXIgZXh0ZW5kcyBNYXNrUmVzb2x2ZXIge1xyXG4gIHJlc29sdmUgKHN0cikge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzay50ZXN0KHN0cik7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBNYXNrUmVzb2x2ZXIgZnJvbSAnLi9tYXNrLXJlc29sdmVyJztcclxuaW1wb3J0IHtjb25mb3JtfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGF0dGVyblJlc29sdmVyIGV4dGVuZHMgTWFza1Jlc29sdmVyIHtcclxuICBjb25zdHJ1Y3RvciAocGF0dGVybikge1xyXG4gICAgc3VwZXIocGF0dGVybik7XHJcbiAgICB0aGlzLl9kZWZpbml0aW9ucyA9IFBhdHRlcm5SZXNvbHZlci5ERUZJTklUSU9OUztcclxuICAgIHRoaXMuX2NoYXJEZWZzID0gW107XHJcbiAgICB0aGlzLl9ob2xsb3dzID0gW107XHJcblxyXG4gICAgZm9yICh2YXIgaT0wOyBpPHBhdHRlcm4ubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdmFyIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgdmFyIHR5cGUgPSBjaCBpbiB0aGlzLl9kZWZpbml0aW9ucyA/XHJcbiAgICAgICAgUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5JTlBVVCA6XHJcbiAgICAgICAgUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5GSVhFRDtcclxuXHJcbiAgICAgIHRoaXMuX2NoYXJEZWZzLnB1c2goe1xyXG4gICAgICAgIGNoYXI6IGNoLFxyXG4gICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgb3B0aW9uYWw6IGZhbHNlLCAgLy8gVE9ET1xyXG4gICAgICAgIHVubWFza2luZzogdHlwZSA9PT0gUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5JTlBVVFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9yZXNvbHZlcnMgPSB7fTtcclxuICAgIGZvciAodmFyIGRlZktleSBpbiB0aGlzLl9kZWZpbml0aW9ucykge1xyXG4gICAgICB0aGlzLl9yZXNvbHZlcnNbZGVmS2V5XSA9IElNYXNrLlJlc29sdmVyRmFjdG9yeSh0aGlzLl9kZWZpbml0aW9uc1tkZWZLZXldKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF90cnlBcHBlbmRUYWlsIChzdHIsIHRhaWwpIHtcclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGhvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLnNsaWNlKCk7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkZWZJbmRleD1zdHIubGVuZ3RoOyBjaTx0YWlsLmxlbmd0aDsgKytkZWZJbmRleCkge1xyXG4gICAgICB2YXIgY2ggPSB0YWlsW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RlZkluZGV4XTtcclxuXHJcbiAgICAgIGlmICghZGVmKSByZXR1cm47XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5SZXNvbHZlci5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIHZhciBjaHJlcyA9IHJlc29sdmVyLnJlc29sdmUoY2gsIGRlZkluZGV4LCBzdHIpIHx8ICcnO1xyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgY2hyZXMgPSBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgICArK2NpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjaHJlcyA9ICdfJztcclxuICAgICAgICAgIGhvbGxvd3MucHVzaChkZWZJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0ciArPSBwbGFjZWhvbGRlckJ1ZmZlciArIGNocmVzO1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3N0ciwgaG9sbG93c107XHJcbiAgfVxyXG5cclxuICBfZXh0cmFjdElucHV0IChzdHIsIHN0YXJ0RGVmSW5kZXg9MCkge1xyXG4gICAgdmFyIGlucHV0ID0gJyc7XHJcbiAgICBmb3IgKHZhciBkaT1zdGFydERlZkluZGV4LCBjaT0wOyBjaTxzdHIubGVuZ3RoOyArK2NpLCArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5JTlBVVCAmJlxyXG4gICAgICAgIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkaSkgPCAwKSBpbnB1dCArPSBjaDtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIF9nZW5lcmF0ZUluc2VydFN0ZXBzIChoZWFkLCBpbnNlcnRlZCkge1xyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcblxyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaW5zZXJ0U3RlcHMgPSBbcmVzXTtcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPWhlYWQubGVuZ3RoOyBjaTxpbnNlcnRlZC5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIHZhciBjaCA9IGluc2VydGVkW2NpXTtcclxuICAgICAgdmFyIGNocmVzID0gJyc7XHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgY2kpIHx8ICcnO1xyXG4gICAgICAgIC8vIGlmIG9rIC0gbmV4dCBkaVxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgKytkaTtcclxuICAgICAgICAgIHJlcyArPSBwbGFjZWhvbGRlckJ1ZmZlcjsgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgICAgIGNocmVzID0gY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgIH1cclxuICAgICAgICArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG5cclxuICAgICAgICBpZiAoY2ggPT09IGRlZi5jaGFyKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcyArPSBjaHJlcztcclxuICAgICAgaW5zZXJ0U3RlcHNbY2ldID0gcmVzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnNlcnRTdGVwcztcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgLy8gVE9ET1xyXG4gICAgaWYgKCFkZXRhaWxzKSByZXR1cm4gJyc7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhkZXRhaWxzKTtcclxuXHJcbiAgICB2YXIgaGVhZCA9IHN0ci5zdWJzdHJpbmcoMCwgZGV0YWlscy5zdGFydENoYW5nZVBvcyk7XHJcbiAgICB2YXIgdGFpbCA9IHN0ci5zdWJzdHJpbmcoZGV0YWlscy5zdGFydENoYW5nZVBvcyArIGRldGFpbHMuaW5zZXJ0ZWRDb3VudCk7XHJcbiAgICB2YXIgaW5zZXJ0ZWQgPSBzdHIuc3Vic3RyKGRldGFpbHMuc3RhcnRDaGFuZ2VQb3MsIGRldGFpbHMuaW5zZXJ0ZWRDb3VudCk7XHJcblxyXG4gICAgdmFyIHRhaWxJbnB1dCA9IHRoaXMuX2V4dHJhY3RJbnB1dCh0YWlsLCBkZXRhaWxzLnN0YXJ0Q2hhbmdlUG9zICsgZGV0YWlscy5yZW1vdmVkQ291bnQpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBob2xsb3dzIGFmdGVyIGN1cnNvclxyXG4gICAgdGhpcy5faG9sbG93cyA9IHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGRldGFpbHMuc3RhcnRDaGFuZ2VQb3MpO1xyXG5cclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IHRoaXMuX2dlbmVyYXRlSW5zZXJ0U3RlcHMoaGVhZCwgaW5zZXJ0ZWQpO1xyXG5cclxuICAgIHZhciByZXMgPSBoZWFkO1xyXG4gICAgZm9yICh2YXIgc3RlcCBvZiBpbnNlcnRTdGVwcy5yZXZlcnNlKCkpIHtcclxuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX3RyeUFwcGVuZFRhaWwoc3RlcCwgdGFpbElucHV0KTtcclxuICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgIFtyZXMsIHRoaXMuX2hvbGxvd3NdID0gcmVzdWx0O1xyXG4gICAgICAgIGRldGFpbHMuY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBhcHBlbmQgZml4ZWQgYXQgZW5kXHJcbiAgICBpZiAoZGV0YWlscy5vbGRTZWxlY3Rpb24uZW5kIDw9IGRldGFpbHMuY3Vyc29yUG9zKSB7IC8vIGlmIG5vdCBiYWNrc3BhY2VcclxuICAgICAgZm9yICg7OyArK2RldGFpbHMuY3Vyc29yUG9zKSB7XHJcbiAgICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RldGFpbHMuY3Vyc29yUG9zXTtcclxuICAgICAgICBpZiAoIWRlZiB8fCBkZWYudHlwZSA9PT0gUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgICAgaWYgKGRldGFpbHMuY3Vyc29yUG9zID49IHJlcy5sZW5ndGgpIHJlcyArPSBkZWYuY2hhcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSBoZWFkIGZpeGVkIGFuZCBob2xsb3dzXHJcbiAgICBpZiAoIWluc2VydGVkICYmIGRldGFpbHMuY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7IC8vIGlmIHJlbW92ZWQgYXQgZW5kXHJcbiAgICAgIHZhciBkaSA9IGRldGFpbHMuY3Vyc29yUG9zIC0gMTtcclxuICAgICAgdmFyIGhhc0hvbGxvd3MgPSBmYWxzZTtcclxuICAgICAgZm9yICg7IGRpID4gMDsgLS1kaSkge1xyXG4gICAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuUmVzb2x2ZXIuREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5faG9sbG93cy5pbmNsdWRlcyhkaSkpIGhhc0hvbGxvd3MgPSB0cnVlO1xyXG4gICAgICAgICAgZWxzZSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGhhc0hvbGxvd3MpIHJlcyA9IHJlcy5zbGljZSgwLCBkaSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcbn1cclxuUGF0dGVyblJlc29sdmVyLkRFRklOSVRJT05TID0ge1xyXG4gICcwJzogL1xcZC8sXHJcbiAgJ2EnOiAvW1xcdTAwNDEtXFx1MDA1QVxcdTAwNjEtXFx1MDA3QVxcdTAwQUFcXHUwMEI1XFx1MDBCQVxcdTAwQzAtXFx1MDBENlxcdTAwRDgtXFx1MDBGNlxcdTAwRjgtXFx1MDJDMVxcdTAyQzYtXFx1MDJEMVxcdTAyRTAtXFx1MDJFNFxcdTAyRUNcXHUwMkVFXFx1MDM3MC1cXHUwMzc0XFx1MDM3NlxcdTAzNzdcXHUwMzdBLVxcdTAzN0RcXHUwMzg2XFx1MDM4OC1cXHUwMzhBXFx1MDM4Q1xcdTAzOEUtXFx1MDNBMVxcdTAzQTMtXFx1MDNGNVxcdTAzRjctXFx1MDQ4MVxcdTA0OEEtXFx1MDUyN1xcdTA1MzEtXFx1MDU1NlxcdTA1NTlcXHUwNTYxLVxcdTA1ODdcXHUwNUQwLVxcdTA1RUFcXHUwNUYwLVxcdTA1RjJcXHUwNjIwLVxcdTA2NEFcXHUwNjZFXFx1MDY2RlxcdTA2NzEtXFx1MDZEM1xcdTA2RDVcXHUwNkU1XFx1MDZFNlxcdTA2RUVcXHUwNkVGXFx1MDZGQS1cXHUwNkZDXFx1MDZGRlxcdTA3MTBcXHUwNzEyLVxcdTA3MkZcXHUwNzRELVxcdTA3QTVcXHUwN0IxXFx1MDdDQS1cXHUwN0VBXFx1MDdGNFxcdTA3RjVcXHUwN0ZBXFx1MDgwMC1cXHUwODE1XFx1MDgxQVxcdTA4MjRcXHUwODI4XFx1MDg0MC1cXHUwODU4XFx1MDhBMFxcdTA4QTItXFx1MDhBQ1xcdTA5MDQtXFx1MDkzOVxcdTA5M0RcXHUwOTUwXFx1MDk1OC1cXHUwOTYxXFx1MDk3MS1cXHUwOTc3XFx1MDk3OS1cXHUwOTdGXFx1MDk4NS1cXHUwOThDXFx1MDk4RlxcdTA5OTBcXHUwOTkzLVxcdTA5QThcXHUwOUFBLVxcdTA5QjBcXHUwOUIyXFx1MDlCNi1cXHUwOUI5XFx1MDlCRFxcdTA5Q0VcXHUwOURDXFx1MDlERFxcdTA5REYtXFx1MDlFMVxcdTA5RjBcXHUwOUYxXFx1MEEwNS1cXHUwQTBBXFx1MEEwRlxcdTBBMTBcXHUwQTEzLVxcdTBBMjhcXHUwQTJBLVxcdTBBMzBcXHUwQTMyXFx1MEEzM1xcdTBBMzVcXHUwQTM2XFx1MEEzOFxcdTBBMzlcXHUwQTU5LVxcdTBBNUNcXHUwQTVFXFx1MEE3Mi1cXHUwQTc0XFx1MEE4NS1cXHUwQThEXFx1MEE4Ri1cXHUwQTkxXFx1MEE5My1cXHUwQUE4XFx1MEFBQS1cXHUwQUIwXFx1MEFCMlxcdTBBQjNcXHUwQUI1LVxcdTBBQjlcXHUwQUJEXFx1MEFEMFxcdTBBRTBcXHUwQUUxXFx1MEIwNS1cXHUwQjBDXFx1MEIwRlxcdTBCMTBcXHUwQjEzLVxcdTBCMjhcXHUwQjJBLVxcdTBCMzBcXHUwQjMyXFx1MEIzM1xcdTBCMzUtXFx1MEIzOVxcdTBCM0RcXHUwQjVDXFx1MEI1RFxcdTBCNUYtXFx1MEI2MVxcdTBCNzFcXHUwQjgzXFx1MEI4NS1cXHUwQjhBXFx1MEI4RS1cXHUwQjkwXFx1MEI5Mi1cXHUwQjk1XFx1MEI5OVxcdTBCOUFcXHUwQjlDXFx1MEI5RVxcdTBCOUZcXHUwQkEzXFx1MEJBNFxcdTBCQTgtXFx1MEJBQVxcdTBCQUUtXFx1MEJCOVxcdTBCRDBcXHUwQzA1LVxcdTBDMENcXHUwQzBFLVxcdTBDMTBcXHUwQzEyLVxcdTBDMjhcXHUwQzJBLVxcdTBDMzNcXHUwQzM1LVxcdTBDMzlcXHUwQzNEXFx1MEM1OFxcdTBDNTlcXHUwQzYwXFx1MEM2MVxcdTBDODUtXFx1MEM4Q1xcdTBDOEUtXFx1MEM5MFxcdTBDOTItXFx1MENBOFxcdTBDQUEtXFx1MENCM1xcdTBDQjUtXFx1MENCOVxcdTBDQkRcXHUwQ0RFXFx1MENFMFxcdTBDRTFcXHUwQ0YxXFx1MENGMlxcdTBEMDUtXFx1MEQwQ1xcdTBEMEUtXFx1MEQxMFxcdTBEMTItXFx1MEQzQVxcdTBEM0RcXHUwRDRFXFx1MEQ2MFxcdTBENjFcXHUwRDdBLVxcdTBEN0ZcXHUwRDg1LVxcdTBEOTZcXHUwRDlBLVxcdTBEQjFcXHUwREIzLVxcdTBEQkJcXHUwREJEXFx1MERDMC1cXHUwREM2XFx1MEUwMS1cXHUwRTMwXFx1MEUzMlxcdTBFMzNcXHUwRTQwLVxcdTBFNDZcXHUwRTgxXFx1MEU4MlxcdTBFODRcXHUwRTg3XFx1MEU4OFxcdTBFOEFcXHUwRThEXFx1MEU5NC1cXHUwRTk3XFx1MEU5OS1cXHUwRTlGXFx1MEVBMS1cXHUwRUEzXFx1MEVBNVxcdTBFQTdcXHUwRUFBXFx1MEVBQlxcdTBFQUQtXFx1MEVCMFxcdTBFQjJcXHUwRUIzXFx1MEVCRFxcdTBFQzAtXFx1MEVDNFxcdTBFQzZcXHUwRURDLVxcdTBFREZcXHUwRjAwXFx1MEY0MC1cXHUwRjQ3XFx1MEY0OS1cXHUwRjZDXFx1MEY4OC1cXHUwRjhDXFx1MTAwMC1cXHUxMDJBXFx1MTAzRlxcdTEwNTAtXFx1MTA1NVxcdTEwNUEtXFx1MTA1RFxcdTEwNjFcXHUxMDY1XFx1MTA2NlxcdTEwNkUtXFx1MTA3MFxcdTEwNzUtXFx1MTA4MVxcdTEwOEVcXHUxMEEwLVxcdTEwQzVcXHUxMEM3XFx1MTBDRFxcdTEwRDAtXFx1MTBGQVxcdTEwRkMtXFx1MTI0OFxcdTEyNEEtXFx1MTI0RFxcdTEyNTAtXFx1MTI1NlxcdTEyNThcXHUxMjVBLVxcdTEyNURcXHUxMjYwLVxcdTEyODhcXHUxMjhBLVxcdTEyOERcXHUxMjkwLVxcdTEyQjBcXHUxMkIyLVxcdTEyQjVcXHUxMkI4LVxcdTEyQkVcXHUxMkMwXFx1MTJDMi1cXHUxMkM1XFx1MTJDOC1cXHUxMkQ2XFx1MTJEOC1cXHUxMzEwXFx1MTMxMi1cXHUxMzE1XFx1MTMxOC1cXHUxMzVBXFx1MTM4MC1cXHUxMzhGXFx1MTNBMC1cXHUxM0Y0XFx1MTQwMS1cXHUxNjZDXFx1MTY2Ri1cXHUxNjdGXFx1MTY4MS1cXHUxNjlBXFx1MTZBMC1cXHUxNkVBXFx1MTcwMC1cXHUxNzBDXFx1MTcwRS1cXHUxNzExXFx1MTcyMC1cXHUxNzMxXFx1MTc0MC1cXHUxNzUxXFx1MTc2MC1cXHUxNzZDXFx1MTc2RS1cXHUxNzcwXFx1MTc4MC1cXHUxN0IzXFx1MTdEN1xcdTE3RENcXHUxODIwLVxcdTE4NzdcXHUxODgwLVxcdTE4QThcXHUxOEFBXFx1MThCMC1cXHUxOEY1XFx1MTkwMC1cXHUxOTFDXFx1MTk1MC1cXHUxOTZEXFx1MTk3MC1cXHUxOTc0XFx1MTk4MC1cXHUxOUFCXFx1MTlDMS1cXHUxOUM3XFx1MUEwMC1cXHUxQTE2XFx1MUEyMC1cXHUxQTU0XFx1MUFBN1xcdTFCMDUtXFx1MUIzM1xcdTFCNDUtXFx1MUI0QlxcdTFCODMtXFx1MUJBMFxcdTFCQUVcXHUxQkFGXFx1MUJCQS1cXHUxQkU1XFx1MUMwMC1cXHUxQzIzXFx1MUM0RC1cXHUxQzRGXFx1MUM1QS1cXHUxQzdEXFx1MUNFOS1cXHUxQ0VDXFx1MUNFRS1cXHUxQ0YxXFx1MUNGNVxcdTFDRjZcXHUxRDAwLVxcdTFEQkZcXHUxRTAwLVxcdTFGMTVcXHUxRjE4LVxcdTFGMURcXHUxRjIwLVxcdTFGNDVcXHUxRjQ4LVxcdTFGNERcXHUxRjUwLVxcdTFGNTdcXHUxRjU5XFx1MUY1QlxcdTFGNURcXHUxRjVGLVxcdTFGN0RcXHUxRjgwLVxcdTFGQjRcXHUxRkI2LVxcdTFGQkNcXHUxRkJFXFx1MUZDMi1cXHUxRkM0XFx1MUZDNi1cXHUxRkNDXFx1MUZEMC1cXHUxRkQzXFx1MUZENi1cXHUxRkRCXFx1MUZFMC1cXHUxRkVDXFx1MUZGMi1cXHUxRkY0XFx1MUZGNi1cXHUxRkZDXFx1MjA3MVxcdTIwN0ZcXHUyMDkwLVxcdTIwOUNcXHUyMTAyXFx1MjEwN1xcdTIxMEEtXFx1MjExM1xcdTIxMTVcXHUyMTE5LVxcdTIxMURcXHUyMTI0XFx1MjEyNlxcdTIxMjhcXHUyMTJBLVxcdTIxMkRcXHUyMTJGLVxcdTIxMzlcXHUyMTNDLVxcdTIxM0ZcXHUyMTQ1LVxcdTIxNDlcXHUyMTRFXFx1MjE4M1xcdTIxODRcXHUyQzAwLVxcdTJDMkVcXHUyQzMwLVxcdTJDNUVcXHUyQzYwLVxcdTJDRTRcXHUyQ0VCLVxcdTJDRUVcXHUyQ0YyXFx1MkNGM1xcdTJEMDAtXFx1MkQyNVxcdTJEMjdcXHUyRDJEXFx1MkQzMC1cXHUyRDY3XFx1MkQ2RlxcdTJEODAtXFx1MkQ5NlxcdTJEQTAtXFx1MkRBNlxcdTJEQTgtXFx1MkRBRVxcdTJEQjAtXFx1MkRCNlxcdTJEQjgtXFx1MkRCRVxcdTJEQzAtXFx1MkRDNlxcdTJEQzgtXFx1MkRDRVxcdTJERDAtXFx1MkRENlxcdTJERDgtXFx1MkRERVxcdTJFMkZcXHUzMDA1XFx1MzAwNlxcdTMwMzEtXFx1MzAzNVxcdTMwM0JcXHUzMDNDXFx1MzA0MS1cXHUzMDk2XFx1MzA5RC1cXHUzMDlGXFx1MzBBMS1cXHUzMEZBXFx1MzBGQy1cXHUzMEZGXFx1MzEwNS1cXHUzMTJEXFx1MzEzMS1cXHUzMThFXFx1MzFBMC1cXHUzMUJBXFx1MzFGMC1cXHUzMUZGXFx1MzQwMC1cXHU0REI1XFx1NEUwMC1cXHU5RkNDXFx1QTAwMC1cXHVBNDhDXFx1QTREMC1cXHVBNEZEXFx1QTUwMC1cXHVBNjBDXFx1QTYxMC1cXHVBNjFGXFx1QTYyQVxcdUE2MkJcXHVBNjQwLVxcdUE2NkVcXHVBNjdGLVxcdUE2OTdcXHVBNkEwLVxcdUE2RTVcXHVBNzE3LVxcdUE3MUZcXHVBNzIyLVxcdUE3ODhcXHVBNzhCLVxcdUE3OEVcXHVBNzkwLVxcdUE3OTNcXHVBN0EwLVxcdUE3QUFcXHVBN0Y4LVxcdUE4MDFcXHVBODAzLVxcdUE4MDVcXHVBODA3LVxcdUE4MEFcXHVBODBDLVxcdUE4MjJcXHVBODQwLVxcdUE4NzNcXHVBODgyLVxcdUE4QjNcXHVBOEYyLVxcdUE4RjdcXHVBOEZCXFx1QTkwQS1cXHVBOTI1XFx1QTkzMC1cXHVBOTQ2XFx1QTk2MC1cXHVBOTdDXFx1QTk4NC1cXHVBOUIyXFx1QTlDRlxcdUFBMDAtXFx1QUEyOFxcdUFBNDAtXFx1QUE0MlxcdUFBNDQtXFx1QUE0QlxcdUFBNjAtXFx1QUE3NlxcdUFBN0FcXHVBQTgwLVxcdUFBQUZcXHVBQUIxXFx1QUFCNVxcdUFBQjZcXHVBQUI5LVxcdUFBQkRcXHVBQUMwXFx1QUFDMlxcdUFBREItXFx1QUFERFxcdUFBRTAtXFx1QUFFQVxcdUFBRjItXFx1QUFGNFxcdUFCMDEtXFx1QUIwNlxcdUFCMDktXFx1QUIwRVxcdUFCMTEtXFx1QUIxNlxcdUFCMjAtXFx1QUIyNlxcdUFCMjgtXFx1QUIyRVxcdUFCQzAtXFx1QUJFMlxcdUFDMDAtXFx1RDdBM1xcdUQ3QjAtXFx1RDdDNlxcdUQ3Q0ItXFx1RDdGQlxcdUY5MDAtXFx1RkE2RFxcdUZBNzAtXFx1RkFEOVxcdUZCMDAtXFx1RkIwNlxcdUZCMTMtXFx1RkIxN1xcdUZCMURcXHVGQjFGLVxcdUZCMjhcXHVGQjJBLVxcdUZCMzZcXHVGQjM4LVxcdUZCM0NcXHVGQjNFXFx1RkI0MFxcdUZCNDFcXHVGQjQzXFx1RkI0NFxcdUZCNDYtXFx1RkJCMVxcdUZCRDMtXFx1RkQzRFxcdUZENTAtXFx1RkQ4RlxcdUZEOTItXFx1RkRDN1xcdUZERjAtXFx1RkRGQlxcdUZFNzAtXFx1RkU3NFxcdUZFNzYtXFx1RkVGQ1xcdUZGMjEtXFx1RkYzQVxcdUZGNDEtXFx1RkY1QVxcdUZGNjYtXFx1RkZCRVxcdUZGQzItXFx1RkZDN1xcdUZGQ0EtXFx1RkZDRlxcdUZGRDItXFx1RkZEN1xcdUZGREEtXFx1RkZEQ10vLCAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjIwNzUwNzBcclxuICAnKic6IC8uL1xyXG59O1xyXG5QYXR0ZXJuUmVzb2x2ZXIuREVGX1RZUEVTID0ge1xyXG4gIElOUFVUOiAnaW5wdXQnLFxyXG4gIEZJWEVEOiAnZml4ZWQnXHJcbn1cclxuIiwiaW1wb3J0IHtjb25mb3JtLCBpc1N0cmluZ30gZnJvbSAnLi91dGlscyc7XHJcblxyXG5pbXBvcnQgTWFza1Jlc29sdmVyIGZyb20gJy4vcmVzb2x2ZXJzL21hc2stcmVzb2x2ZXInO1xyXG5pbXBvcnQgRnVuY1Jlc29sdmVyIGZyb20gJy4vcmVzb2x2ZXJzL2Z1bmMtcmVzb2x2ZXInO1xyXG5pbXBvcnQgUmVnRXhwUmVzb2x2ZXIgZnJvbSAnLi9yZXNvbHZlcnMvcmVnZXhwLXJlc29sdmVyJztcclxuaW1wb3J0IFBhdHRlcm5SZXNvbHZlciBmcm9tICcuL3Jlc29sdmVycy9wYXR0ZXJuLXJlc29sdmVyJztcclxuXHJcbi8vIFRPRE9cclxuLy8gLSBlbXB0eSBwbGFjZWhvbGRlciAoKyBhcyBvcHRpb24pXHJcbi8vIC0gZXNjYXBlIGRlZnNcclxuLy8gLSAhcHJvZ3Jlc3NpdmVcclxuLy8gLSB2YWxpZGF0ZU9ubHlcclxuLy8gLSBnZXQvc2V0IHVubWFza2VkXHJcbi8vIC0gYWRkIGNvbW1lbnRzXHJcblxyXG5cclxuLy8gVE9ETyBvcHRzID0ge1xyXG4vLyAgIHBsYWNlaG9sZGVyOiAnXycsXHJcbi8vICAgZGVmaW5pdGlvbnM6IHt9LFxyXG4vLyAgIHByb2dyZXNzaXZlOiB0cnVlLFxyXG4vLyAgIHZhbGlkYXRlT25seTogZmFsc2VcclxuLy8gfVxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIElNYXNrIHtcclxuICBjb25zdHJ1Y3RvciAoZWwsIG9wdHM9e30pIHtcclxuICAgIHZhciBpbnB1dFZhbHVlID0gZWwudmFsdWU7XHJcblxyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5yZXNvbHZlciA9IElNYXNrLlJlc29sdmVyRmFjdG9yeShvcHRzLm1hc2spO1xyXG4gICAgdGhpcy5jaGFyUmVzb2x2ZXIgPSBJTWFzay5SZXNvbHZlckZhY3Rvcnkob3B0cy5jaGFyTWFzayk7XHJcblxyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX3NhdmVDdXJzb3IuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX3Byb2Nlc3NJbnB1dC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLl9zYXZlQ3Vyc29yKCk7XHJcbiAgICB0aGlzLl9wcm9jZXNzSW5wdXQoKTtcclxuXHJcbiAgICAvLyByZWZyZXNoXHJcbiAgICB0aGlzLnJhd1ZhbHVlID0gdGhpcy5lbC52YWx1ZTtcclxuICB9XHJcblxyXG4gIF9vbkRyb3AgKGV2KSB7XHJcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfVxyXG5cclxuICBfc2F2ZUN1cnNvciAoZXYpIHtcclxuICAgIHRoaXMuX29sZFZhbHVlID0gdGhpcy5lbC52YWx1ZTtcclxuICAgIHRoaXMuX29sZFNlbGVjdGlvbiA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5lbC5zZWxlY3Rpb25FbmRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9wcm9jZXNzSW5wdXQgKGV2KSB7XHJcbiAgICB0aGlzLl9jb25mb3JtKCk7XHJcbiAgfVxyXG5cclxuICBvbiAoZXYsIGhhbmRsZXIpIHtcclxuXHJcbiAgfVxyXG5cclxuICBfY29uZm9ybSAoKSB7XHJcbiAgICB2YXIgaW5wdXRWYWx1ZSA9IHRoaXMuZWwudmFsdWU7XHJcbiAgICAvLyB1c2Ugc2VsZWN0aW9uRW5kIGZvciBoYW5kbGUgVW5kb1xyXG4gICAgdmFyIGN1cnNvclBvcyA9IHRoaXMuZWwuc2VsZWN0aW9uRW5kO1xyXG5cclxuICAgIGxldCByZXMgPSBpbnB1dFZhbHVlXHJcbiAgICAgIC5zcGxpdCgnJylcclxuICAgICAgLm1hcCgoY2gsIC4uLmFyZ3MpID0+IHtcclxuICAgICAgICB2YXIgcmVzID0gdGhpcy5jaGFyUmVzb2x2ZXIucmVzb2x2ZShjaCwgLi4uYXJncyk7XHJcbiAgICAgICAgcmV0dXJuIGNvbmZvcm0ocmVzLCBjaCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5qb2luKCcnKTtcclxuXHJcbiAgICB2YXIgc3RhcnRDaGFuZ2VQb3MgPSBNYXRoLm1pbihjdXJzb3JQb3MsIHRoaXMuX29sZFNlbGVjdGlvbi5zdGFydCk7XHJcbiAgICAvLyB2YXIgbWF4Q3Vyc29yUG9zID0gTWF0aC5tYXgoY3Vyc29yUG9zLCB0aGlzLl9vbGRTZWxlY3Rpb24uZW5kKTtcclxuICAgIHZhciBkZXRhaWxzID0ge1xyXG4gICAgICBzdGFydENoYW5nZVBvczogc3RhcnRDaGFuZ2VQb3MsXHJcbiAgICAgIG9sZFNlbGVjdGlvbjogdGhpcy5fb2xkU2VsZWN0aW9uLFxyXG4gICAgICBjdXJzb3JQb3M6IGN1cnNvclBvcyxcclxuICAgICAgLy8gTWF0aC5tYXggZm9yIG9wcG9zaXRlIG9wZXJhdGlvblxyXG4gICAgICByZW1vdmVkQ291bnQ6IE1hdGgubWF4KCh0aGlzLl9vbGRTZWxlY3Rpb24uZW5kIC0gc3RhcnRDaGFuZ2VQb3MpIHx8XHJcbiAgICAgICAgLy8gZm9yIERlbGV0ZVxyXG4gICAgICAgIHRoaXMuX29sZFZhbHVlLmxlbmd0aCAtIGlucHV0VmFsdWUubGVuZ3RoLCAwKSxcclxuICAgICAgaW5zZXJ0ZWRDb3VudDogY3Vyc29yUG9zIC0gc3RhcnRDaGFuZ2VQb3MsXHJcbiAgICAgIG9sZFZhbHVlOiB0aGlzLl9vbGRWYWx1ZVxyXG4gICAgfTtcclxuXHJcbiAgICByZXMgPSBjb25mb3JtKHRoaXMucmVzb2x2ZXIucmVzb2x2ZShyZXMsIGRldGFpbHMpLFxyXG4gICAgICByZXMsXHJcbiAgICAgIHRoaXMuX29sZFZhbHVlKTtcclxuICAgIGlmIChyZXMgIT09IGlucHV0VmFsdWUpIHtcclxuICAgICAgLy8gdmFyIGN1cnNvclBvcyA9IHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgIC8vIHZhciBhZnRlckN1cnNvckNvdW50ID0gaW5wdXRWYWx1ZS5sZW5ndGggLSBjdXJzb3JQb3M7XHJcbiAgICAgIC8vIHZhciBjdXJzb3JQb3MgPSByZXMubGVuZ3RoIC0gYWZ0ZXJDdXJzb3JDb3VudDtcclxuICAgICAgdGhpcy5lbC52YWx1ZSA9IHJlcztcclxuICAgICAgaWYgKGRldGFpbHMuY3Vyc29yUG9zICE9IG51bGwpIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgICB0aGlzLmVsLnNlbGVjdGlvblN0YXJ0ID0gdGhpcy5lbC5zZWxlY3Rpb25FbmQgPSBjdXJzb3JQb3M7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXQgcmF3VmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWwudmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgcmF3VmFsdWUgKHN0cikge1xyXG4gICAgdmFyIGRldGFpbHMgPSB7XHJcbiAgICAgIHN0YXJ0Q2hhbmdlUG9zOiAwLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHtcclxuICAgICAgICBzdGFydDogMCxcclxuICAgICAgICBlbmQ6IHRoaXMuZWwudmFsdWUubGVuZ3RoXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlbW92ZWRDb3VudDogdGhpcy5lbC52YWx1ZS5sZW5ndGgsXHJcbiAgICAgIGluc2VydGVkQ291bnQ6IHN0ci5sZW5ndGgsXHJcbiAgICAgIG9sZFZhbHVlOiB0aGlzLmVsLnZhbHVlXHJcbiAgICB9O1xyXG4gICAgdGhpcy5lbC52YWx1ZSA9IGNvbmZvcm0odGhpcy5yZXNvbHZlci5yZXNvbHZlKHN0ciwgZGV0YWlscyksIHRoaXMuZWwudmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHVubWFza2VkVmFsdWUgKCkge1xyXG4gICAgY29uc3QgcmVzVW5tYXNrZWQgPSB0aGlzLnJlc29sdmVyLnVubWFza2VkVmFsdWU7XHJcbiAgICByZXR1cm4gcmVzVW5tYXNrZWQgIT0gbnVsbCA/IHJlc1VubWFza2VkIDogdGhpcy5lbC52YWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlICh2YWx1ZSkge1xyXG4gICAgdGhpcy5yZXNvbHZlci51bm1hc2tlZFZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgUmVzb2x2ZXJGYWN0b3J5IChtYXNrKSB7XHJcbiAgICBpZiAobWFzayBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIG5ldyBSZWdFeHBSZXNvbHZlcihtYXNrKTtcclxuICAgIGlmIChtYXNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHJldHVybiBuZXcgRnVuY1Jlc29sdmVyKG1hc2spO1xyXG4gICAgaWYgKGlzU3RyaW5nKG1hc2spKSByZXR1cm4gbmV3IFBhdHRlcm5SZXNvbHZlcihtYXNrKTtcclxuICAgIHJldHVybiBuZXcgTWFza1Jlc29sdmVyKG1hc2spO1xyXG4gIH1cclxufVxyXG5JTWFzay5NYXNrUmVzb2x2ZXIgPSBNYXNrUmVzb2x2ZXI7XHJcbklNYXNrLkZ1bmNSZXNvbHZlciA9IEZ1bmNSZXNvbHZlcjtcclxuSU1hc2suUmVnRXhwUmVzb2x2ZXIgPSBSZWdFeHBSZXNvbHZlcjtcclxuSU1hc2suUGF0dGVyblJlc29sdmVyID0gUGF0dGVyblJlc29sdmVyO1xyXG53aW5kb3cuSU1hc2sgPSBJTWFzaztcclxuIl0sIm5hbWVzIjpbImlzU3RyaW5nIiwic3RyIiwiU3RyaW5nIiwiY29uZm9ybSIsInJlcyIsImZhbGxiYWNrIiwiTWFza1Jlc29sdmVyIiwibWFzayIsInZhbHVlIiwiRnVuY1Jlc29sdmVyIiwiUmVnRXhwUmVzb2x2ZXIiLCJ0ZXN0IiwiUGF0dGVyblJlc29sdmVyIiwicGF0dGVybiIsIl9kZWZpbml0aW9ucyIsIkRFRklOSVRJT05TIiwiX2NoYXJEZWZzIiwiX2hvbGxvd3MiLCJpIiwibGVuZ3RoIiwiY2giLCJ0eXBlIiwiREVGX1RZUEVTIiwiSU5QVVQiLCJGSVhFRCIsInB1c2giLCJfcmVzb2x2ZXJzIiwiZGVmS2V5IiwiSU1hc2siLCJSZXNvbHZlckZhY3RvcnkiLCJ0YWlsIiwicGxhY2Vob2xkZXJCdWZmZXIiLCJob2xsb3dzIiwic2xpY2UiLCJjaSIsImRlZkluZGV4IiwiZGVmIiwicmVzb2x2ZXIiLCJjaGFyIiwiY2hyZXMiLCJyZXNvbHZlIiwic3RhcnREZWZJbmRleCIsImlucHV0IiwiZGkiLCJpbmRleE9mIiwiaGVhZCIsImluc2VydGVkIiwiaW5zZXJ0U3RlcHMiLCJkZXRhaWxzIiwic3Vic3RyaW5nIiwic3RhcnRDaGFuZ2VQb3MiLCJpbnNlcnRlZENvdW50Iiwic3Vic3RyIiwidGFpbElucHV0IiwiX2V4dHJhY3RJbnB1dCIsInJlbW92ZWRDb3VudCIsImZpbHRlciIsImgiLCJfZ2VuZXJhdGVJbnNlcnRTdGVwcyIsInJldmVyc2UiLCJzdGVwIiwicmVzdWx0IiwiX3RyeUFwcGVuZFRhaWwiLCJjdXJzb3JQb3MiLCJvbGRTZWxlY3Rpb24iLCJlbmQiLCJoYXNIb2xsb3dzIiwiaW5jbHVkZXMiLCJlbCIsIm9wdHMiLCJpbnB1dFZhbHVlIiwiY2hhclJlc29sdmVyIiwiY2hhck1hc2siLCJhZGRFdmVudExpc3RlbmVyIiwiX3NhdmVDdXJzb3IiLCJiaW5kIiwiX3Byb2Nlc3NJbnB1dCIsIl9vbkRyb3AiLCJyYXdWYWx1ZSIsImV2IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJfb2xkVmFsdWUiLCJfb2xkU2VsZWN0aW9uIiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJfY29uZm9ybSIsImhhbmRsZXIiLCJzcGxpdCIsIm1hcCIsImFyZ3MiLCJqb2luIiwiTWF0aCIsIm1pbiIsInN0YXJ0IiwibWF4IiwicmVzVW5tYXNrZWQiLCJ1bm1hc2tlZFZhbHVlIiwiUmVnRXhwIiwiRnVuY3Rpb24iLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLFNBQVNBLFFBQVQsQ0FBbUJDLEdBQW5CLEVBQXdCO1NBQ2YsT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLGVBQWVDLE1BQWpEOzs7QUFHRixBQUNBLFNBQVNDLE9BQVQsQ0FBa0JDLEdBQWxCLEVBQXVCSCxHQUF2QixFQUF5QztNQUFiSSxRQUFhLHVFQUFKLEVBQUk7O1NBQ2hDTCxTQUFTSSxHQUFULElBQ0xBLEdBREssR0FFTEEsTUFDRUgsR0FERixHQUVFSSxRQUpKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDTklDO3dCQUNTQyxJQUFiLEVBQW1COzs7U0FDWkEsSUFBTCxHQUFZQSxJQUFaOzs7Ozs0QkFHT04sS0FBSzthQUNMQSxHQUFQOzs7O3dCQUdtQjtzQkFDRk8sT0FBTzs7Ozs7SUNSdEJDOzs7Ozs7Ozs7OzhCQUNjO2FBQ1QsS0FBS0YsSUFBTCx1QkFBUDs7OztFQUZ1QkQ7O0lDQXJCSTs7Ozs7Ozs7Ozs0QkFDS1QsS0FBSzthQUNMLEtBQUtNLElBQUwsQ0FBVUksSUFBVixD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