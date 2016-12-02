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
    key: "resolveUnmasked",
    value: function resolveUnmasked(str) {
      return str;
    }
  }, {
    key: "extractUnmasked",
    value: function extractUnmasked(str) {
      return str;
    }
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

  function PatternResolver(pattern, opts) {
    classCallCheck(this, PatternResolver);

    var _this = possibleConstructorReturn(this, (PatternResolver.__proto__ || Object.getPrototypeOf(PatternResolver)).call(this, pattern));

    _this._charPlaceholder = opts.charPlaceholder || PatternResolver.DEFAULT_CHAR_PLACEHOLDER;
    _this._definitions = PatternResolver.DEFINITIONS;
    _this._charDefs = [];
    _this._hollows = [];

    var unmaskingBlock = false;
    var optionalBlock = false;
    for (var i = 0; i < pattern.length; ++i) {
      var ch = pattern[i];
      var type = !unmaskingBlock && ch in _this._definitions ? PatternResolver.DEF_TYPES.INPUT : PatternResolver.DEF_TYPES.FIXED;
      var unmasking = type === PatternResolver.DEF_TYPES.INPUT || unmaskingBlock;
      var optional = type === PatternResolver.DEF_TYPES.INPUT && optionalBlock;

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
        type = PatternResolver.DEF_TYPES.FIXED;
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
            chres = this.charPlaceholder;
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
      for (var di = startDefIndex, ci = 0; ci < str.length && di < this._charDefs.length; ++ci, ++di) {
        var ch = str[ci];
        var def = this._charDefs[di];

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

            cursorPos = step.length;
            break;
          }
        }
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

      var def;
      // append fixed at end
      if (oldSelection.end <= cursorPos) {
        // if not backspace
        for (;; ++cursorPos) {
          def = this._charDefs[cursorPos];
          if (!def || def.type === PatternResolver.DEF_TYPES.INPUT) break;
          if (cursorPos >= res.length) res += def.char;
        }
      }

      // remove head fixed and hollows
      if (!inserted && cursorPos === res.length) {
        // if removed at end
        var di = cursorPos - 1;
        var hasHollows = false;
        for (; di > 0; --di) {
          def = this._charDefs[di];
          if (def.type === PatternResolver.DEF_TYPES.INPUT) {
            if (this._hollows.includes(di)) hasHollows = true;else break;
          }
        }
        if (hasHollows) res = res.slice(0, di);
      }

      details.cursorPos = cursorPos;

      return res;
    }
  }, {
    key: 'resolveUnmasked',
    value: function resolveUnmasked(str) {
      var res = '';
      for (var ci = 0, di = 0; ci < str.length && di < this._charDefs.length;) {
        var def = this._charDefs[di];
        var ch = str[ci];

        var chres = '';
        if (def.type === PatternResolver.DEF_TYPES.INPUT) {
          if (!this._hollows.includes(di) && this._resolvers[def.char].resolve(ch, ci)) {
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
      return res;
    }
  }, {
    key: 'extractUnmasked',
    value: function extractUnmasked(str) {
      var unmasked = '';
      for (var ci = 0; ci < str.length && ci < this._charDefs.length; ++ci) {
        var ch = str[ci];
        var def = this._charDefs[ci];

        if (def.unmasking && !this._hollows.includes(ci) && (def.type === PatternResolver.DEF_TYPES.INPUT && this._resolvers[def.char].resolve(ch, ci) || def.char === ch)) {
          unmasked += ch;
        }
      }
      return unmasked;
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
PatternResolver.DEFAULT_CHAR_PLACEHOLDER = '_';

// TODO
// - empty placeholder
// - !progressive
// - validateOnly
// - add comments


var IMask$1 = function () {
  function IMask(el) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, IMask);

    this.el = el;
    this.resolver = IMask.ResolverFactory(opts.mask, opts);
    this.charResolver = IMask.ResolverFactory(opts.charMask, opts);

    this._listeners = {};

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

      // var maxCursorPos = Math.max(cursorPos, this._oldSelection.end);
      var details = {
        oldSelection: this._oldSelection,
        cursorPos: cursorPos,
        oldValue: this._oldValue
      };

      res = conform(this.resolver.resolve(res, details), res, this._oldValue);
      if (res !== inputValue) {
        // var cursorPos = this.el.selectionStart;
        // var afterCursorCount = inputValue.length - cursorPos;
        // var cursorPos = res.length - afterCursorCount;
        this.el.value = res;
        this.el.selectionStart = this.el.selectionEnd = details.cursorPos;
      }

      if (res !== this._oldValue) {
        var listeners = this._listeners.accept || [];
        listeners.forEach(function (l) {
          return l();
        });
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
      return this.resolver.extractUnmasked(this.el.value);
    },
    set: function set(value) {
      this.el.value = this.resolver.resolveUnmasked(value);
    }
  }], [{
    key: 'ResolverFactory',
    value: function ResolverFactory(mask, opts) {
      if (mask instanceof MaskResolver) return mask;
      if (mask instanceof RegExp) return new RegExpResolver(mask, opts);
      if (mask instanceof Function) return new FuncResolver(mask, opts);
      if (isString(mask)) return new PatternResolver(mask, opts);
      return new MaskResolver(mask, opts);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvcmVzb2x2ZXJzL21hc2stcmVzb2x2ZXIuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9yZXNvbHZlcnMvZnVuYy1yZXNvbHZlci5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3Jlc29sdmVycy9yZWdleHAtcmVzb2x2ZXIuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9yZXNvbHZlcnMvcGF0dGVybi1yZXNvbHZlci5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL2ltYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydFxyXG5mdW5jdGlvbiBpc1N0cmluZyAoc3RyKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnIHx8IHN0ciBpbnN0YW5jZW9mIFN0cmluZztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGNvbmZvcm0gKHJlcywgc3RyLCBmYWxsYmFjaz0nJykge1xyXG4gIHJldHVybiBpc1N0cmluZyhyZXMpID9cclxuICAgIHJlcyA6XHJcbiAgICByZXMgP1xyXG4gICAgICBzdHIgOlxyXG4gICAgICBmYWxsYmFjaztcclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBNYXNrUmVzb2x2ZXIge1xyXG4gIGNvbnN0cnVjdG9yIChtYXNrKSB7IHRoaXMubWFzayA9IG1hc2s7IH1cclxuXHJcbiAgcmVzb2x2ZSAoc3RyKSB7IHJldHVybiBzdHI7IH1cclxuICByZXNvbHZlVW5tYXNrZWQgKHN0cikgeyByZXR1cm4gc3RyOyB9XHJcblxyXG4gIGV4dHJhY3RVbm1hc2tlZCAoc3RyKSB7IHJldHVybiBzdHI7IH1cclxufVxyXG4iLCJpbXBvcnQgTWFza1Jlc29sdmVyIGZyb20gJy4vbWFzay1yZXNvbHZlcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBGdW5jUmVzb2x2ZXIgZXh0ZW5kcyBNYXNrUmVzb2x2ZXIge1xyXG4gIHJlc29sdmUgKC4uLmFyZ3MpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2soLi4uYXJncyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBNYXNrUmVzb2x2ZXIgZnJvbSAnLi9tYXNrLXJlc29sdmVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFJlZ0V4cFJlc29sdmVyIGV4dGVuZHMgTWFza1Jlc29sdmVyIHtcclxuICByZXNvbHZlIChzdHIpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2sudGVzdChzdHIpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgTWFza1Jlc29sdmVyIGZyb20gJy4vbWFzay1yZXNvbHZlcic7XHJcbmltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFBhdHRlcm5SZXNvbHZlciBleHRlbmRzIE1hc2tSZXNvbHZlciB7XHJcbiAgY29uc3RydWN0b3IgKHBhdHRlcm4sIG9wdHMpIHtcclxuICAgIHN1cGVyKHBhdHRlcm4pO1xyXG4gICAgdGhpcy5fY2hhclBsYWNlaG9sZGVyID0gb3B0cy5jaGFyUGxhY2Vob2xkZXIgfHwgUGF0dGVyblJlc29sdmVyLkRFRkFVTFRfQ0hBUl9QTEFDRUhPTERFUjtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gUGF0dGVyblJlc29sdmVyLkRFRklOSVRJT05TO1xyXG4gICAgdGhpcy5fY2hhckRlZnMgPSBbXTtcclxuICAgIHRoaXMuX2hvbGxvd3MgPSBbXTtcclxuXHJcbiAgICB2YXIgdW5tYXNraW5nQmxvY2sgPSBmYWxzZTtcclxuICAgIHZhciBvcHRpb25hbEJsb2NrID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8cGF0dGVybi5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICB2YXIgdHlwZSA9ICF1bm1hc2tpbmdCbG9jayAmJiBjaCBpbiB0aGlzLl9kZWZpbml0aW9ucyA/XHJcbiAgICAgICAgUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5JTlBVVCA6XHJcbiAgICAgICAgUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgdmFyIHVubWFza2luZyA9IHR5cGUgPT09IFBhdHRlcm5SZXNvbHZlci5ERUZfVFlQRVMuSU5QVVQgfHwgdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgIHZhciBvcHRpb25hbCA9IHR5cGUgPT09IFBhdHRlcm5SZXNvbHZlci5ERUZfVFlQRVMuSU5QVVQgJiYgb3B0aW9uYWxCbG9jaztcclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ3snIHx8IGNoID09PSAnfScpIHtcclxuICAgICAgICB1bm1hc2tpbmdCbG9jayA9ICF1bm1hc2tpbmdCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSAnWycgfHwgY2ggPT09ICddJykge1xyXG4gICAgICAgIG9wdGlvbmFsQmxvY2sgPSAhb3B0aW9uYWxCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSAnXFxcXCcpIHtcclxuICAgICAgICArK2k7XHJcbiAgICAgICAgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICAgIC8vIFRPRE8gdmFsaWRhdGlvblxyXG4gICAgICAgIGlmICghY2gpIGJyZWFrO1xyXG4gICAgICAgIHR5cGUgPSBQYXR0ZXJuUmVzb2x2ZXIuREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jaGFyRGVmcy5wdXNoKHtcclxuICAgICAgICBjaGFyOiBjaCxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcclxuICAgICAgICB1bm1hc2tpbmc6IHVubWFza2luZ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9yZXNvbHZlcnMgPSB7fTtcclxuICAgIGZvciAodmFyIGRlZktleSBpbiB0aGlzLl9kZWZpbml0aW9ucykge1xyXG4gICAgICB0aGlzLl9yZXNvbHZlcnNbZGVmS2V5XSA9IElNYXNrLlJlc29sdmVyRmFjdG9yeSh0aGlzLl9kZWZpbml0aW9uc1tkZWZLZXldKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF90cnlBcHBlbmRUYWlsIChzdHIsIHRhaWwpIHtcclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGhvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLnNsaWNlKCk7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkZWZJbmRleD1zdHIubGVuZ3RoOyBjaTx0YWlsLmxlbmd0aDsgKytkZWZJbmRleCkge1xyXG4gICAgICB2YXIgY2ggPSB0YWlsW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RlZkluZGV4XTtcclxuXHJcbiAgICAgIGlmICghZGVmKSByZXR1cm47XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5SZXNvbHZlci5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIHZhciBjaHJlcyA9IHJlc29sdmVyLnJlc29sdmUoY2gsIGRlZkluZGV4LCBzdHIpIHx8ICcnO1xyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgY2hyZXMgPSBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgICArK2NpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjaHJlcyA9IHRoaXMuY2hhclBsYWNlaG9sZGVyO1xyXG4gICAgICAgICAgaG9sbG93cy5wdXNoKGRlZkluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RyICs9IHBsYWNlaG9sZGVyQnVmZmVyICsgY2hyZXM7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciArPSBkZWYuY2hhcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbc3RyLCBob2xsb3dzXTtcclxuICB9XHJcblxyXG4gIF9leHRyYWN0SW5wdXQgKHN0ciwgc3RhcnREZWZJbmRleD0wKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAnJztcclxuICAgIGZvciAodmFyIGRpPXN0YXJ0RGVmSW5kZXgsIGNpPTA7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2NpLCArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5SZXNvbHZlci5ERUZfVFlQRVMuSU5QVVQgJiZcclxuICAgICAgICB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGkpIDwgMCkgaW5wdXQgKz0gY2g7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBfZ2VuZXJhdGVJbnNlcnRTdGVwcyAoaGVhZCwgaW5zZXJ0ZWQpIHtcclxuICAgIHZhciByZXMgPSBoZWFkO1xyXG5cclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW3Jlc107XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT1oZWFkLmxlbmd0aDsgY2k8aW5zZXJ0ZWQubGVuZ3RoOykge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcblxyXG4gICAgICB2YXIgY2ggPSBpbnNlcnRlZFtjaV07XHJcbiAgICAgIHZhciBjaHJlcyA9ICcnO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5SZXNvbHZlci5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgY2kpIHx8ICcnO1xyXG4gICAgICAgIC8vIGlmIG9rIC0gbmV4dCBkaVxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgKytkaTtcclxuICAgICAgICAgIHJlcyArPSBwbGFjZWhvbGRlckJ1ZmZlcjsgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgICAgIGNocmVzID0gY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgIH1cclxuICAgICAgICArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG5cclxuICAgICAgICBpZiAoY2ggPT09IGRlZi5jaGFyKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcyArPSBjaHJlcztcclxuICAgICAgaW5zZXJ0U3RlcHNbY2ldID0gcmVzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnNlcnRTdGVwcztcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgLy8gVE9ET1xyXG4gICAgaWYgKCFkZXRhaWxzKSByZXR1cm4gJyc7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhkZXRhaWxzKTtcclxuXHJcblxyXG4gICAgdmFyIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgdmFyIG9sZFNlbGVjdGlvbiA9IGRldGFpbHMub2xkU2VsZWN0aW9uO1xyXG4gICAgdmFyIG9sZFZhbHVlID0gZGV0YWlscy5vbGRWYWx1ZTtcclxuICAgIHZhciBzdGFydENoYW5nZVBvcyA9IE1hdGgubWluKGN1cnNvclBvcywgb2xkU2VsZWN0aW9uLnN0YXJ0KTtcclxuICAgIC8vIE1hdGgubWF4IGZvciBvcHBvc2l0ZSBvcGVyYXRpb25cclxuICAgIHZhciByZW1vdmVkQ291bnQgPSBNYXRoLm1heCgob2xkU2VsZWN0aW9uLmVuZCAtIHN0YXJ0Q2hhbmdlUG9zKSB8fFxyXG4gICAgICAvLyBmb3IgRGVsZXRlXHJcbiAgICAgIG9sZFZhbHVlLmxlbmd0aCAtIHN0ci5sZW5ndGgsIDApO1xyXG4gICAgdmFyIGluc2VydGVkQ291bnQgPSBjdXJzb3JQb3MgLSBzdGFydENoYW5nZVBvcztcclxuXHJcblxyXG4gICAgdmFyIGhlYWQgPSBzdHIuc3Vic3RyaW5nKDAsIHN0YXJ0Q2hhbmdlUG9zKTtcclxuICAgIHZhciB0YWlsID0gc3RyLnN1YnN0cmluZyhzdGFydENoYW5nZVBvcyArIGluc2VydGVkQ291bnQpO1xyXG4gICAgdmFyIGluc2VydGVkID0gc3RyLnN1YnN0cihzdGFydENoYW5nZVBvcywgaW5zZXJ0ZWRDb3VudCk7XHJcblxyXG4gICAgdmFyIHRhaWxJbnB1dCA9IHRoaXMuX2V4dHJhY3RJbnB1dCh0YWlsLCBzdGFydENoYW5nZVBvcyArIHJlbW92ZWRDb3VudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhvbGxvd3MgYWZ0ZXIgY3Vyc29yXHJcbiAgICB0aGlzLl9ob2xsb3dzID0gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgc3RhcnRDaGFuZ2VQb3MpO1xyXG5cclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IHRoaXMuX2dlbmVyYXRlSW5zZXJ0U3RlcHMoaGVhZCwgaW5zZXJ0ZWQpO1xyXG5cclxuICAgIHZhciByZXMgPSBoZWFkO1xyXG4gICAgZm9yICh2YXIgc3RlcCBvZiBpbnNlcnRTdGVwcy5yZXZlcnNlKCkpIHtcclxuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX3RyeUFwcGVuZFRhaWwoc3RlcCwgdGFpbElucHV0KTtcclxuICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgIFtyZXMsIHRoaXMuX2hvbGxvd3NdID0gcmVzdWx0O1xyXG4gICAgICAgIGN1cnNvclBvcyA9IHN0ZXAubGVuZ3RoO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRlZjtcclxuICAgIC8vIGFwcGVuZCBmaXhlZCBhdCBlbmRcclxuICAgIGlmIChvbGRTZWxlY3Rpb24uZW5kIDw9IGN1cnNvclBvcykgeyAvLyBpZiBub3QgYmFja3NwYWNlXHJcbiAgICAgIGZvciAoOzsgKytjdXJzb3JQb3MpIHtcclxuICAgICAgICBkZWYgPSB0aGlzLl9jaGFyRGVmc1tjdXJzb3JQb3NdO1xyXG4gICAgICAgIGlmICghZGVmIHx8IGRlZi50eXBlID09PSBQYXR0ZXJuUmVzb2x2ZXIuREVGX1RZUEVTLklOUFVUKSBicmVhaztcclxuICAgICAgICBpZiAoY3Vyc29yUG9zID49IHJlcy5sZW5ndGgpIHJlcyArPSBkZWYuY2hhcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSBoZWFkIGZpeGVkIGFuZCBob2xsb3dzXHJcbiAgICBpZiAoIWluc2VydGVkICYmIGN1cnNvclBvcyA9PT0gcmVzLmxlbmd0aCkgeyAvLyBpZiByZW1vdmVkIGF0IGVuZFxyXG4gICAgICB2YXIgZGkgPSBjdXJzb3JQb3MgLSAxO1xyXG4gICAgICB2YXIgaGFzSG9sbG93cyA9IGZhbHNlO1xyXG4gICAgICBmb3IgKDsgZGkgPiAwOyAtLWRpKSB7XHJcbiAgICAgICAgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuX2hvbGxvd3MuaW5jbHVkZXMoZGkpKSBoYXNIb2xsb3dzID0gdHJ1ZTtcclxuICAgICAgICAgIGVsc2UgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChoYXNIb2xsb3dzKSByZXMgPSByZXMuc2xpY2UoMCwgZGkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRldGFpbHMuY3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG5cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICByZXNvbHZlVW5tYXNrZWQgKHN0cikge1xyXG4gICAgdmFyIHJlcyA9ICcnO1xyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9MDsgY2k8c3RyLmxlbmd0aCAmJiBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcblxyXG4gICAgICB2YXIgY2hyZXMgPSAnJztcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuUmVzb2x2ZXIuREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9ob2xsb3dzLmluY2x1ZGVzKGRpKSAmJiB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdLnJlc29sdmUoY2gsIGNpKSkge1xyXG4gICAgICAgICAgY2hyZXMgPSBjaDtcclxuICAgICAgICAgICsrZGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hyZXMgPSBkZWYuY2hhcjtcclxuICAgICAgICBpZiAoZGVmLnVubWFza2luZyAmJiBkZWYuY2hhciA9PT0gY2gpICsrY2k7XHJcbiAgICAgICAgKytkaTtcclxuICAgICAgfVxyXG4gICAgICByZXMgKz0gY2hyZXM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgZXh0cmFjdFVubWFza2VkIChzdHIpIHtcclxuICAgIHZhciB1bm1hc2tlZCA9ICcnO1xyXG4gICAgZm9yICh2YXIgY2k9MDsgY2k8c3RyLmxlbmd0aCAmJiBjaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrY2kpIHtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2NpXTtcclxuXHJcbiAgICAgIGlmIChkZWYudW5tYXNraW5nICYmICF0aGlzLl9ob2xsb3dzLmluY2x1ZGVzKGNpKSAmJlxyXG4gICAgICAgIChkZWYudHlwZSA9PT0gUGF0dGVyblJlc29sdmVyLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdLnJlc29sdmUoY2gsIGNpKSB8fFxyXG4gICAgICAgICAgZGVmLmNoYXIgPT09IGNoKSkge1xyXG4gICAgICAgIHVubWFza2VkICs9IGNoO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5tYXNrZWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgY2hhclBsYWNlaG9sZGVyICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGFyUGxhY2Vob2xkZXI7XHJcbiAgfVxyXG5cclxuICBzZXQgY2hhclBsYWNlaG9sZGVyIChwaCkge1xyXG4gICAgLy8gVE9ET1xyXG4gIH1cclxufVxyXG5QYXR0ZXJuUmVzb2x2ZXIuREVGSU5JVElPTlMgPSB7XHJcbiAgJzAnOiAvXFxkLyxcclxuICAnYSc6IC9bXFx1MDA0MS1cXHUwMDVBXFx1MDA2MS1cXHUwMDdBXFx1MDBBQVxcdTAwQjVcXHUwMEJBXFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XFx1MDBGOC1cXHUwMkMxXFx1MDJDNi1cXHUwMkQxXFx1MDJFMC1cXHUwMkU0XFx1MDJFQ1xcdTAyRUVcXHUwMzcwLVxcdTAzNzRcXHUwMzc2XFx1MDM3N1xcdTAzN0EtXFx1MDM3RFxcdTAzODZcXHUwMzg4LVxcdTAzOEFcXHUwMzhDXFx1MDM4RS1cXHUwM0ExXFx1MDNBMy1cXHUwM0Y1XFx1MDNGNy1cXHUwNDgxXFx1MDQ4QS1cXHUwNTI3XFx1MDUzMS1cXHUwNTU2XFx1MDU1OVxcdTA1NjEtXFx1MDU4N1xcdTA1RDAtXFx1MDVFQVxcdTA1RjAtXFx1MDVGMlxcdTA2MjAtXFx1MDY0QVxcdTA2NkVcXHUwNjZGXFx1MDY3MS1cXHUwNkQzXFx1MDZENVxcdTA2RTVcXHUwNkU2XFx1MDZFRVxcdTA2RUZcXHUwNkZBLVxcdTA2RkNcXHUwNkZGXFx1MDcxMFxcdTA3MTItXFx1MDcyRlxcdTA3NEQtXFx1MDdBNVxcdTA3QjFcXHUwN0NBLVxcdTA3RUFcXHUwN0Y0XFx1MDdGNVxcdTA3RkFcXHUwODAwLVxcdTA4MTVcXHUwODFBXFx1MDgyNFxcdTA4MjhcXHUwODQwLVxcdTA4NThcXHUwOEEwXFx1MDhBMi1cXHUwOEFDXFx1MDkwNC1cXHUwOTM5XFx1MDkzRFxcdTA5NTBcXHUwOTU4LVxcdTA5NjFcXHUwOTcxLVxcdTA5NzdcXHUwOTc5LVxcdTA5N0ZcXHUwOTg1LVxcdTA5OENcXHUwOThGXFx1MDk5MFxcdTA5OTMtXFx1MDlBOFxcdTA5QUEtXFx1MDlCMFxcdTA5QjJcXHUwOUI2LVxcdTA5QjlcXHUwOUJEXFx1MDlDRVxcdTA5RENcXHUwOUREXFx1MDlERi1cXHUwOUUxXFx1MDlGMFxcdTA5RjFcXHUwQTA1LVxcdTBBMEFcXHUwQTBGXFx1MEExMFxcdTBBMTMtXFx1MEEyOFxcdTBBMkEtXFx1MEEzMFxcdTBBMzJcXHUwQTMzXFx1MEEzNVxcdTBBMzZcXHUwQTM4XFx1MEEzOVxcdTBBNTktXFx1MEE1Q1xcdTBBNUVcXHUwQTcyLVxcdTBBNzRcXHUwQTg1LVxcdTBBOERcXHUwQThGLVxcdTBBOTFcXHUwQTkzLVxcdTBBQThcXHUwQUFBLVxcdTBBQjBcXHUwQUIyXFx1MEFCM1xcdTBBQjUtXFx1MEFCOVxcdTBBQkRcXHUwQUQwXFx1MEFFMFxcdTBBRTFcXHUwQjA1LVxcdTBCMENcXHUwQjBGXFx1MEIxMFxcdTBCMTMtXFx1MEIyOFxcdTBCMkEtXFx1MEIzMFxcdTBCMzJcXHUwQjMzXFx1MEIzNS1cXHUwQjM5XFx1MEIzRFxcdTBCNUNcXHUwQjVEXFx1MEI1Ri1cXHUwQjYxXFx1MEI3MVxcdTBCODNcXHUwQjg1LVxcdTBCOEFcXHUwQjhFLVxcdTBCOTBcXHUwQjkyLVxcdTBCOTVcXHUwQjk5XFx1MEI5QVxcdTBCOUNcXHUwQjlFXFx1MEI5RlxcdTBCQTNcXHUwQkE0XFx1MEJBOC1cXHUwQkFBXFx1MEJBRS1cXHUwQkI5XFx1MEJEMFxcdTBDMDUtXFx1MEMwQ1xcdTBDMEUtXFx1MEMxMFxcdTBDMTItXFx1MEMyOFxcdTBDMkEtXFx1MEMzM1xcdTBDMzUtXFx1MEMzOVxcdTBDM0RcXHUwQzU4XFx1MEM1OVxcdTBDNjBcXHUwQzYxXFx1MEM4NS1cXHUwQzhDXFx1MEM4RS1cXHUwQzkwXFx1MEM5Mi1cXHUwQ0E4XFx1MENBQS1cXHUwQ0IzXFx1MENCNS1cXHUwQ0I5XFx1MENCRFxcdTBDREVcXHUwQ0UwXFx1MENFMVxcdTBDRjFcXHUwQ0YyXFx1MEQwNS1cXHUwRDBDXFx1MEQwRS1cXHUwRDEwXFx1MEQxMi1cXHUwRDNBXFx1MEQzRFxcdTBENEVcXHUwRDYwXFx1MEQ2MVxcdTBEN0EtXFx1MEQ3RlxcdTBEODUtXFx1MEQ5NlxcdTBEOUEtXFx1MERCMVxcdTBEQjMtXFx1MERCQlxcdTBEQkRcXHUwREMwLVxcdTBEQzZcXHUwRTAxLVxcdTBFMzBcXHUwRTMyXFx1MEUzM1xcdTBFNDAtXFx1MEU0NlxcdTBFODFcXHUwRTgyXFx1MEU4NFxcdTBFODdcXHUwRTg4XFx1MEU4QVxcdTBFOERcXHUwRTk0LVxcdTBFOTdcXHUwRTk5LVxcdTBFOUZcXHUwRUExLVxcdTBFQTNcXHUwRUE1XFx1MEVBN1xcdTBFQUFcXHUwRUFCXFx1MEVBRC1cXHUwRUIwXFx1MEVCMlxcdTBFQjNcXHUwRUJEXFx1MEVDMC1cXHUwRUM0XFx1MEVDNlxcdTBFREMtXFx1MEVERlxcdTBGMDBcXHUwRjQwLVxcdTBGNDdcXHUwRjQ5LVxcdTBGNkNcXHUwRjg4LVxcdTBGOENcXHUxMDAwLVxcdTEwMkFcXHUxMDNGXFx1MTA1MC1cXHUxMDU1XFx1MTA1QS1cXHUxMDVEXFx1MTA2MVxcdTEwNjVcXHUxMDY2XFx1MTA2RS1cXHUxMDcwXFx1MTA3NS1cXHUxMDgxXFx1MTA4RVxcdTEwQTAtXFx1MTBDNVxcdTEwQzdcXHUxMENEXFx1MTBEMC1cXHUxMEZBXFx1MTBGQy1cXHUxMjQ4XFx1MTI0QS1cXHUxMjREXFx1MTI1MC1cXHUxMjU2XFx1MTI1OFxcdTEyNUEtXFx1MTI1RFxcdTEyNjAtXFx1MTI4OFxcdTEyOEEtXFx1MTI4RFxcdTEyOTAtXFx1MTJCMFxcdTEyQjItXFx1MTJCNVxcdTEyQjgtXFx1MTJCRVxcdTEyQzBcXHUxMkMyLVxcdTEyQzVcXHUxMkM4LVxcdTEyRDZcXHUxMkQ4LVxcdTEzMTBcXHUxMzEyLVxcdTEzMTVcXHUxMzE4LVxcdTEzNUFcXHUxMzgwLVxcdTEzOEZcXHUxM0EwLVxcdTEzRjRcXHUxNDAxLVxcdTE2NkNcXHUxNjZGLVxcdTE2N0ZcXHUxNjgxLVxcdTE2OUFcXHUxNkEwLVxcdTE2RUFcXHUxNzAwLVxcdTE3MENcXHUxNzBFLVxcdTE3MTFcXHUxNzIwLVxcdTE3MzFcXHUxNzQwLVxcdTE3NTFcXHUxNzYwLVxcdTE3NkNcXHUxNzZFLVxcdTE3NzBcXHUxNzgwLVxcdTE3QjNcXHUxN0Q3XFx1MTdEQ1xcdTE4MjAtXFx1MTg3N1xcdTE4ODAtXFx1MThBOFxcdTE4QUFcXHUxOEIwLVxcdTE4RjVcXHUxOTAwLVxcdTE5MUNcXHUxOTUwLVxcdTE5NkRcXHUxOTcwLVxcdTE5NzRcXHUxOTgwLVxcdTE5QUJcXHUxOUMxLVxcdTE5QzdcXHUxQTAwLVxcdTFBMTZcXHUxQTIwLVxcdTFBNTRcXHUxQUE3XFx1MUIwNS1cXHUxQjMzXFx1MUI0NS1cXHUxQjRCXFx1MUI4My1cXHUxQkEwXFx1MUJBRVxcdTFCQUZcXHUxQkJBLVxcdTFCRTVcXHUxQzAwLVxcdTFDMjNcXHUxQzRELVxcdTFDNEZcXHUxQzVBLVxcdTFDN0RcXHUxQ0U5LVxcdTFDRUNcXHUxQ0VFLVxcdTFDRjFcXHUxQ0Y1XFx1MUNGNlxcdTFEMDAtXFx1MURCRlxcdTFFMDAtXFx1MUYxNVxcdTFGMTgtXFx1MUYxRFxcdTFGMjAtXFx1MUY0NVxcdTFGNDgtXFx1MUY0RFxcdTFGNTAtXFx1MUY1N1xcdTFGNTlcXHUxRjVCXFx1MUY1RFxcdTFGNUYtXFx1MUY3RFxcdTFGODAtXFx1MUZCNFxcdTFGQjYtXFx1MUZCQ1xcdTFGQkVcXHUxRkMyLVxcdTFGQzRcXHUxRkM2LVxcdTFGQ0NcXHUxRkQwLVxcdTFGRDNcXHUxRkQ2LVxcdTFGREJcXHUxRkUwLVxcdTFGRUNcXHUxRkYyLVxcdTFGRjRcXHUxRkY2LVxcdTFGRkNcXHUyMDcxXFx1MjA3RlxcdTIwOTAtXFx1MjA5Q1xcdTIxMDJcXHUyMTA3XFx1MjEwQS1cXHUyMTEzXFx1MjExNVxcdTIxMTktXFx1MjExRFxcdTIxMjRcXHUyMTI2XFx1MjEyOFxcdTIxMkEtXFx1MjEyRFxcdTIxMkYtXFx1MjEzOVxcdTIxM0MtXFx1MjEzRlxcdTIxNDUtXFx1MjE0OVxcdTIxNEVcXHUyMTgzXFx1MjE4NFxcdTJDMDAtXFx1MkMyRVxcdTJDMzAtXFx1MkM1RVxcdTJDNjAtXFx1MkNFNFxcdTJDRUItXFx1MkNFRVxcdTJDRjJcXHUyQ0YzXFx1MkQwMC1cXHUyRDI1XFx1MkQyN1xcdTJEMkRcXHUyRDMwLVxcdTJENjdcXHUyRDZGXFx1MkQ4MC1cXHUyRDk2XFx1MkRBMC1cXHUyREE2XFx1MkRBOC1cXHUyREFFXFx1MkRCMC1cXHUyREI2XFx1MkRCOC1cXHUyREJFXFx1MkRDMC1cXHUyREM2XFx1MkRDOC1cXHUyRENFXFx1MkREMC1cXHUyREQ2XFx1MkREOC1cXHUyRERFXFx1MkUyRlxcdTMwMDVcXHUzMDA2XFx1MzAzMS1cXHUzMDM1XFx1MzAzQlxcdTMwM0NcXHUzMDQxLVxcdTMwOTZcXHUzMDlELVxcdTMwOUZcXHUzMEExLVxcdTMwRkFcXHUzMEZDLVxcdTMwRkZcXHUzMTA1LVxcdTMxMkRcXHUzMTMxLVxcdTMxOEVcXHUzMUEwLVxcdTMxQkFcXHUzMUYwLVxcdTMxRkZcXHUzNDAwLVxcdTREQjVcXHU0RTAwLVxcdTlGQ0NcXHVBMDAwLVxcdUE0OENcXHVBNEQwLVxcdUE0RkRcXHVBNTAwLVxcdUE2MENcXHVBNjEwLVxcdUE2MUZcXHVBNjJBXFx1QTYyQlxcdUE2NDAtXFx1QTY2RVxcdUE2N0YtXFx1QTY5N1xcdUE2QTAtXFx1QTZFNVxcdUE3MTctXFx1QTcxRlxcdUE3MjItXFx1QTc4OFxcdUE3OEItXFx1QTc4RVxcdUE3OTAtXFx1QTc5M1xcdUE3QTAtXFx1QTdBQVxcdUE3RjgtXFx1QTgwMVxcdUE4MDMtXFx1QTgwNVxcdUE4MDctXFx1QTgwQVxcdUE4MEMtXFx1QTgyMlxcdUE4NDAtXFx1QTg3M1xcdUE4ODItXFx1QThCM1xcdUE4RjItXFx1QThGN1xcdUE4RkJcXHVBOTBBLVxcdUE5MjVcXHVBOTMwLVxcdUE5NDZcXHVBOTYwLVxcdUE5N0NcXHVBOTg0LVxcdUE5QjJcXHVBOUNGXFx1QUEwMC1cXHVBQTI4XFx1QUE0MC1cXHVBQTQyXFx1QUE0NC1cXHVBQTRCXFx1QUE2MC1cXHVBQTc2XFx1QUE3QVxcdUFBODAtXFx1QUFBRlxcdUFBQjFcXHVBQUI1XFx1QUFCNlxcdUFBQjktXFx1QUFCRFxcdUFBQzBcXHVBQUMyXFx1QUFEQi1cXHVBQUREXFx1QUFFMC1cXHVBQUVBXFx1QUFGMi1cXHVBQUY0XFx1QUIwMS1cXHVBQjA2XFx1QUIwOS1cXHVBQjBFXFx1QUIxMS1cXHVBQjE2XFx1QUIyMC1cXHVBQjI2XFx1QUIyOC1cXHVBQjJFXFx1QUJDMC1cXHVBQkUyXFx1QUMwMC1cXHVEN0EzXFx1RDdCMC1cXHVEN0M2XFx1RDdDQi1cXHVEN0ZCXFx1RjkwMC1cXHVGQTZEXFx1RkE3MC1cXHVGQUQ5XFx1RkIwMC1cXHVGQjA2XFx1RkIxMy1cXHVGQjE3XFx1RkIxRFxcdUZCMUYtXFx1RkIyOFxcdUZCMkEtXFx1RkIzNlxcdUZCMzgtXFx1RkIzQ1xcdUZCM0VcXHVGQjQwXFx1RkI0MVxcdUZCNDNcXHVGQjQ0XFx1RkI0Ni1cXHVGQkIxXFx1RkJEMy1cXHVGRDNEXFx1RkQ1MC1cXHVGRDhGXFx1RkQ5Mi1cXHVGREM3XFx1RkRGMC1cXHVGREZCXFx1RkU3MC1cXHVGRTc0XFx1RkU3Ni1cXHVGRUZDXFx1RkYyMS1cXHVGRjNBXFx1RkY0MS1cXHVGRjVBXFx1RkY2Ni1cXHVGRkJFXFx1RkZDMi1cXHVGRkM3XFx1RkZDQS1cXHVGRkNGXFx1RkZEMi1cXHVGRkQ3XFx1RkZEQS1cXHVGRkRDXS8sICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjA3NTA3MFxyXG4gICcqJzogLy4vXHJcbn07XHJcblBhdHRlcm5SZXNvbHZlci5ERUZfVFlQRVMgPSB7XHJcbiAgSU5QVVQ6ICdpbnB1dCcsXHJcbiAgRklYRUQ6ICdmaXhlZCdcclxufVxyXG5QYXR0ZXJuUmVzb2x2ZXIuREVGQVVMVF9DSEFSX1BMQUNFSE9MREVSID0gJ18nO1xyXG4iLCJpbXBvcnQge2NvbmZvcm0sIGlzU3RyaW5nfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmltcG9ydCBNYXNrUmVzb2x2ZXIgZnJvbSAnLi9yZXNvbHZlcnMvbWFzay1yZXNvbHZlcic7XHJcbmltcG9ydCBGdW5jUmVzb2x2ZXIgZnJvbSAnLi9yZXNvbHZlcnMvZnVuYy1yZXNvbHZlcic7XHJcbmltcG9ydCBSZWdFeHBSZXNvbHZlciBmcm9tICcuL3Jlc29sdmVycy9yZWdleHAtcmVzb2x2ZXInO1xyXG5pbXBvcnQgUGF0dGVyblJlc29sdmVyIGZyb20gJy4vcmVzb2x2ZXJzL3BhdHRlcm4tcmVzb2x2ZXInO1xyXG5cclxuLy8gVE9ET1xyXG4vLyAtIGVtcHR5IHBsYWNlaG9sZGVyXHJcbi8vIC0gIXByb2dyZXNzaXZlXHJcbi8vIC0gdmFsaWRhdGVPbmx5XHJcbi8vIC0gYWRkIGNvbW1lbnRzXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgSU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cz17fSkge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5yZXNvbHZlciA9IElNYXNrLlJlc29sdmVyRmFjdG9yeShvcHRzLm1hc2ssIG9wdHMpO1xyXG4gICAgdGhpcy5jaGFyUmVzb2x2ZXIgPSBJTWFzay5SZXNvbHZlckZhY3Rvcnkob3B0cy5jaGFyTWFzaywgb3B0cyk7XHJcblxyXG4gICAgdGhpcy5fbGlzdGVuZXJzID0ge307XHJcblxyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX3NhdmVDdXJzb3IuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX3Byb2Nlc3NJbnB1dC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLl9zYXZlQ3Vyc29yKCk7XHJcbiAgICB0aGlzLl9wcm9jZXNzSW5wdXQoKTtcclxuXHJcbiAgICAvLyByZWZyZXNoXHJcbiAgICB0aGlzLnJhd1ZhbHVlID0gdGhpcy5lbC52YWx1ZTtcclxuICB9XHJcblxyXG4gIF9vbkRyb3AgKGV2KSB7XHJcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfVxyXG5cclxuICBfc2F2ZUN1cnNvciAoZXYpIHtcclxuICAgIHRoaXMuX29sZFZhbHVlID0gdGhpcy5lbC52YWx1ZTtcclxuICAgIHRoaXMuX29sZFNlbGVjdGlvbiA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5lbC5zZWxlY3Rpb25FbmRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9wcm9jZXNzSW5wdXQgKGV2KSB7XHJcbiAgICB0aGlzLl9jb25mb3JtKCk7XHJcbiAgfVxyXG5cclxuICBvbiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgdGhpcy5fbGlzdGVuZXJzW2V2XSA9IFtdO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzW2V2XS5wdXNoKGhhbmRsZXIpO1xyXG4gIH1cclxuXHJcbiAgb2ZmIChldiwgaGFuZGxlcikge1xyXG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbZXZdKSByZXR1cm47XHJcbiAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tldl07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBoSW5kZXggPSB0aGlzLl9saXN0ZW5lcnNbZXZdLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICBpZiAoaEluZGV4ID49IDApIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaEluZGV4LCAxKTtcclxuICB9XHJcblxyXG4gIF9jb25mb3JtICgpIHtcclxuICAgIHZhciBpbnB1dFZhbHVlID0gdGhpcy5lbC52YWx1ZTtcclxuICAgIC8vIHVzZSBzZWxlY3Rpb25FbmQgZm9yIGhhbmRsZSBVbmRvXHJcbiAgICB2YXIgY3Vyc29yUG9zID0gdGhpcy5lbC5zZWxlY3Rpb25FbmQ7XHJcblxyXG4gICAgbGV0IHJlcyA9IGlucHV0VmFsdWVcclxuICAgICAgLnNwbGl0KCcnKVxyXG4gICAgICAubWFwKChjaCwgLi4uYXJncykgPT4ge1xyXG4gICAgICAgIHZhciByZXMgPSB0aGlzLmNoYXJSZXNvbHZlci5yZXNvbHZlKGNoLCAuLi5hcmdzKTtcclxuICAgICAgICByZXR1cm4gY29uZm9ybShyZXMsIGNoKTtcclxuICAgICAgfSlcclxuICAgICAgLmpvaW4oJycpO1xyXG5cclxuICAgIC8vIHZhciBtYXhDdXJzb3JQb3MgPSBNYXRoLm1heChjdXJzb3JQb3MsIHRoaXMuX29sZFNlbGVjdGlvbi5lbmQpO1xyXG4gICAgdmFyIGRldGFpbHMgPSB7XHJcbiAgICAgIG9sZFNlbGVjdGlvbjogdGhpcy5fb2xkU2VsZWN0aW9uLFxyXG4gICAgICBjdXJzb3JQb3M6IGN1cnNvclBvcyxcclxuICAgICAgb2xkVmFsdWU6IHRoaXMuX29sZFZhbHVlXHJcbiAgICB9O1xyXG5cclxuICAgIHJlcyA9IGNvbmZvcm0odGhpcy5yZXNvbHZlci5yZXNvbHZlKHJlcywgZGV0YWlscyksXHJcbiAgICAgIHJlcyxcclxuICAgICAgdGhpcy5fb2xkVmFsdWUpO1xyXG4gICAgaWYgKHJlcyAhPT0gaW5wdXRWYWx1ZSkge1xyXG4gICAgICAvLyB2YXIgY3Vyc29yUG9zID0gdGhpcy5lbC5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgLy8gdmFyIGFmdGVyQ3Vyc29yQ291bnQgPSBpbnB1dFZhbHVlLmxlbmd0aCAtIGN1cnNvclBvcztcclxuICAgICAgLy8gdmFyIGN1cnNvclBvcyA9IHJlcy5sZW5ndGggLSBhZnRlckN1cnNvckNvdW50O1xyXG4gICAgICB0aGlzLmVsLnZhbHVlID0gcmVzO1xyXG4gICAgICB0aGlzLmVsLnNlbGVjdGlvblN0YXJ0ID0gdGhpcy5lbC5zZWxlY3Rpb25FbmQgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVzICE9PSB0aGlzLl9vbGRWYWx1ZSkge1xyXG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmFjY2VwdCB8fCBbXTtcclxuICAgICAgbGlzdGVuZXJzLmZvckVhY2gobCA9PiBsKCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0IHJhd1ZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLmVsLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHJhd1ZhbHVlIChzdHIpIHtcclxuICAgIHZhciBkZXRhaWxzID0ge1xyXG4gICAgICBzdGFydENoYW5nZVBvczogMCxcclxuICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiB0aGlzLmVsLnZhbHVlLmxlbmd0aFxyXG4gICAgICB9LFxyXG4gICAgICByZW1vdmVkQ291bnQ6IHRoaXMuZWwudmFsdWUubGVuZ3RoLFxyXG4gICAgICBpbnNlcnRlZENvdW50OiBzdHIubGVuZ3RoLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5lbC52YWx1ZVxyXG4gICAgfTtcclxuICAgIHRoaXMuZWwudmFsdWUgPSBjb25mb3JtKHRoaXMucmVzb2x2ZXIucmVzb2x2ZShzdHIsIGRldGFpbHMpLCB0aGlzLmVsLnZhbHVlKTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLnJlc29sdmVyLmV4dHJhY3RVbm1hc2tlZCh0aGlzLmVsLnZhbHVlKTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlICh2YWx1ZSkge1xyXG4gICAgdGhpcy5lbC52YWx1ZSA9IHRoaXMucmVzb2x2ZXIucmVzb2x2ZVVubWFza2VkKHZhbHVlKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBSZXNvbHZlckZhY3RvcnkgKG1hc2ssIG9wdHMpIHtcclxuICAgIGlmIChtYXNrIGluc3RhbmNlb2YgTWFza1Jlc29sdmVyKSByZXR1cm4gbWFzaztcclxuICAgIGlmIChtYXNrIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gbmV3IFJlZ0V4cFJlc29sdmVyKG1hc2ssIG9wdHMpO1xyXG4gICAgaWYgKG1hc2sgaW5zdGFuY2VvZiBGdW5jdGlvbikgcmV0dXJuIG5ldyBGdW5jUmVzb2x2ZXIobWFzaywgb3B0cyk7XHJcbiAgICBpZiAoaXNTdHJpbmcobWFzaykpIHJldHVybiBuZXcgUGF0dGVyblJlc29sdmVyKG1hc2ssIG9wdHMpO1xyXG4gICAgcmV0dXJuIG5ldyBNYXNrUmVzb2x2ZXIobWFzaywgb3B0cyk7XHJcbiAgfVxyXG59XHJcbklNYXNrLk1hc2tSZXNvbHZlciA9IE1hc2tSZXNvbHZlcjtcclxuSU1hc2suRnVuY1Jlc29sdmVyID0gRnVuY1Jlc29sdmVyO1xyXG5JTWFzay5SZWdFeHBSZXNvbHZlciA9IFJlZ0V4cFJlc29sdmVyO1xyXG5JTWFzay5QYXR0ZXJuUmVzb2x2ZXIgPSBQYXR0ZXJuUmVzb2x2ZXI7XHJcbndpbmRvdy5JTWFzayA9IElNYXNrO1xyXG4iXSwibmFtZXMiOlsiaXNTdHJpbmciLCJzdHIiLCJTdHJpbmciLCJjb25mb3JtIiwicmVzIiwiZmFsbGJhY2siLCJNYXNrUmVzb2x2ZXIiLCJtYXNrIiwiRnVuY1Jlc29sdmVyIiwiUmVnRXhwUmVzb2x2ZXIiLCJ0ZXN0IiwiUGF0dGVyblJlc29sdmVyIiwicGF0dGVybiIsIm9wdHMiLCJfY2hhclBsYWNlaG9sZGVyIiwiY2hhclBsYWNlaG9sZGVyIiwiREVGQVVMVF9DSEFSX1BMQUNFSE9MREVSIiwiX2RlZmluaXRpb25zIiwiREVGSU5JVElPTlMiLCJfY2hhckRlZnMiLCJfaG9sbG93cyIsInVubWFza2luZ0Jsb2NrIiwib3B0aW9uYWxCbG9jayIsImkiLCJsZW5ndGgiLCJjaCIsInR5cGUiLCJERUZfVFlQRVMiLCJJTlBVVCIsIkZJWEVEIiwidW5tYXNraW5nIiwib3B0aW9uYWwiLCJwdXNoIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiUmVzb2x2ZXJGYWN0b3J5IiwidGFpbCIsInBsYWNlaG9sZGVyQnVmZmVyIiwiaG9sbG93cyIsInNsaWNlIiwiY2kiLCJkZWZJbmRleCIsImRlZiIsInJlc29sdmVyIiwiY2hhciIsImNocmVzIiwicmVzb2x2ZSIsInN0YXJ0RGVmSW5kZXgiLCJpbnB1dCIsImRpIiwiaW5kZXhPZiIsImhlYWQiLCJpbnNlcnRlZCIsImluc2VydFN0ZXBzIiwiZGV0YWlscyIsImN1cnNvclBvcyIsIm9sZFNlbGVjdGlvbiIsIm9sZFZhbHVlIiwic3RhcnRDaGFuZ2VQb3MiLCJNYXRoIiwibWluIiwic3RhcnQiLCJyZW1vdmVkQ291bnQiLCJtYXgiLCJlbmQiLCJpbnNlcnRlZENvdW50Iiwic3Vic3RyaW5nIiwic3Vic3RyIiwidGFpbElucHV0IiwiX2V4dHJhY3RJbnB1dCIsImZpbHRlciIsImgiLCJfZ2VuZXJhdGVJbnNlcnRTdGVwcyIsInJldmVyc2UiLCJzdGVwIiwicmVzdWx0IiwiX3RyeUFwcGVuZFRhaWwiLCJoYXNIb2xsb3dzIiwiaW5jbHVkZXMiLCJ1bm1hc2tlZCIsInBoIiwiZWwiLCJjaGFyUmVzb2x2ZXIiLCJjaGFyTWFzayIsIl9saXN0ZW5lcnMiLCJhZGRFdmVudExpc3RlbmVyIiwiX3NhdmVDdXJzb3IiLCJiaW5kIiwiX3Byb2Nlc3NJbnB1dCIsIl9vbkRyb3AiLCJyYXdWYWx1ZSIsInZhbHVlIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIl9vbGRWYWx1ZSIsIl9vbGRTZWxlY3Rpb24iLCJzZWxlY3Rpb25TdGFydCIsInNlbGVjdGlvbkVuZCIsIl9jb25mb3JtIiwiaGFuZGxlciIsImhJbmRleCIsInNwbGljZSIsImlucHV0VmFsdWUiLCJzcGxpdCIsIm1hcCIsImFyZ3MiLCJqb2luIiwibGlzdGVuZXJzIiwiYWNjZXB0IiwiZm9yRWFjaCIsImwiLCJleHRyYWN0VW5tYXNrZWQiLCJyZXNvbHZlVW5tYXNrZWQiLCJSZWdFeHAiLCJGdW5jdGlvbiIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsU0FBU0EsUUFBVCxDQUFtQkMsR0FBbkIsRUFBd0I7U0FDZixPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsZUFBZUMsTUFBakQ7OztBQUdGLEFBQ0EsU0FBU0MsT0FBVCxDQUFrQkMsR0FBbEIsRUFBdUJILEdBQXZCLEVBQXlDO01BQWJJLFFBQWEsdUVBQUosRUFBSTs7U0FDaENMLFNBQVNJLEdBQVQsSUFDTEEsR0FESyxHQUVMQSxNQUNFSCxHQURGLEdBRUVJLFFBSko7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNOSUM7d0JBQ1NDLElBQWIsRUFBbUI7O1NBQU9BLElBQUwsR0FBWUEsSUFBWjs7Ozs7NEJBRVpOLEtBQUs7YUFBU0EsR0FBUDs7OztvQ0FDQ0EsS0FBSzthQUFTQSxHQUFQOzs7O29DQUVQQSxLQUFLO2FBQVNBLEdBQVA7Ozs7OztJQ0pwQk87Ozs7Ozs7Ozs7OEJBQ2M7YUFDVCxLQUFLRCxJQUFMLHVCQUFQOzs7O0VBRnVCRDs7SUNBckJHOzs7Ozs7Ozs7OzRCQUNLUixLQUFLO2FBQ0wsS0FBS00sSUFBTCxDQUFVRyxJQUFWLENBQWVULEdBQWYsQ0FBUDs7OztFQUZ5Qks7O0lDRXZCSzs7OzJCQUNTQyxPQUFiLEVBQXNCQyxJQUF0QixFQUE0Qjs7O2lJQUNw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