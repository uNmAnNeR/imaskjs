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







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

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
// - validateOnly
// - add comments


var BaseMask = function () {
  function BaseMask(el, opts) {
    classCallCheck(this, BaseMask);

    this.el = el;
    this.mask = opts.mask;

    this._listeners = {};
    this._refreshingCount = 0;
  }

  createClass(BaseMask, [{
    key: 'bindEvents',
    value: function bindEvents() {
      this.el.addEventListener('keydown', this.saveState.bind(this));
      this.el.addEventListener('input', this.processInput.bind(this));
      this.el.addEventListener('drop', this._onDrop.bind(this));
    }
  }, {
    key: 'saveState',
    value: function saveState(ev) {
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
        cursorPos = details.cursorPos;
      }
      this.el.selectionStart = this.el.selectionEnd = cursorPos;

      if (res !== this._oldValue) this.fireEvent("accept");
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
  }, {
    key: 'fireEvent',
    value: function fireEvent(ev) {
      var listeners = this._listeners[ev] || [];
      listeners.forEach(function (l) {
        return l();
      });
    }

    // override this

  }, {
    key: 'resolve',
    value: function resolve(str, details) {
      return str;
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      if (this._refreshingCount) return;
      var str = this.el.value;
      var details = {
        cursorPos: this.el.value.length,
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
    key: 'startRefresh',
    value: function startRefresh() {
      ++this._refreshingCount;
    }
  }, {
    key: 'endRefresh',
    value: function endRefresh() {
      --this._refreshingCount;
      if (!this._refreshingCount) this.refresh();
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
      this.startRefresh();
      this.el.value = str;
      this.endRefresh();
    }
  }, {
    key: 'unmaskedValue',
    get: function get() {
      return this.el.value;
    },
    set: function set(value) {
      this.startRefresh();
      this.el.value = value;
      this.endRefresh();
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

    _this.startRefresh();

    _this.placeholder = opts.placeholder;
    _this.definitions = _extends({}, PatternMask.DEFINITIONS, opts.definitions);

    _this._hollows = [];
    _this._buildResolvers();

    _this.endRefresh();
    return _this;
  }

  createClass(PatternMask, [{
    key: 'bindEvents',
    value: function bindEvents() {
      var _this2 = this;

      get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), 'bindEvents', this).call(this);
      ['click', 'focus'].forEach(function (ev) {
        return _this2.el.addEventListener(ev, _this2._alignCursor.bind(_this2));
      });
    }
  }, {
    key: '_buildResolvers',
    value: function _buildResolvers() {
      this._charDefs = [];
      var pattern = this.mask;

      if (!pattern || !this.definitions) return;

      var unmaskingBlock = false;
      var optionalBlock = false;
      for (var i = 0; i < pattern.length; ++i) {
        var ch = pattern[i];
        var type = !unmaskingBlock && ch in this.definitions ? PatternMask.DEF_TYPES.INPUT : PatternMask.DEF_TYPES.FIXED;
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

        this._charDefs.push({
          char: ch,
          type: type,
          optional: optional,
          unmasking: unmasking
        });
      }

      this._resolvers = {};
      for (var defKey in this.definitions) {
        this._resolvers[defKey] = IMask.MaskFactory(this.el, {
          mask: this.definitions[defKey]
        });
      }
    }
  }, {
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
            chres = this._placeholder.char;
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

      // append placeholder
      if (this._placeholder.show === PatternMask.SHOW_PH_TYPES.ALWAYS) {
        res = this._appendPlaceholderEnd(res);
      }
      details.cursorPos = cursorPos;

      return res;
    }
  }, {
    key: 'processInput',
    value: function processInput(ev) {
      var res = get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), 'processInput', this).call(this, ev);
      if (res !== this._oldValue && this._isComplete(res)) this.fireEvent("complete");
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
    key: '_appendPlaceholderEnd',
    value: function _appendPlaceholderEnd(res) {
      var phLabel = this.placeholderLabel;
      for (var hi = res.length; hi < phLabel.length; ++hi) {
        if (this._charDefs[hi].type === PatternMask.DEF_TYPES.INPUT) this._hollows.push(hi);
      }
      return res + phLabel.substr(res.length);
    }
  }, {
    key: '_alignCursor',
    value: function _alignCursor() {
      var cursorPos = this.el.selectionEnd;
      for (var rPos = cursorPos; rPos >= 0; --rPos) {
        var rDef = this._charDefs[rPos];
        var lPos = rPos - 1;
        var lDef = this._charDefs[lPos];
        if ((!rDef || rDef.type === PatternMask.DEF_TYPES.INPUT && this._hollows.indexOf(rPos) > -1) && this._hollows.indexOf(lPos) < 0) {
          cursorPos = rPos;
          if (!lDef || lDef.type === PatternMask.DEF_TYPES.INPUT) break;
        }
      }
      this.el.selectionStart = this.el.selectionEnd = cursorPos;
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
      this.startRefresh();

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
      this._hollows.length = 0;
      this.el.value = res;

      this.endRefresh();
    }
  }, {
    key: 'placeholder',
    get: function get() {
      return this._placeholder;
    },
    set: function set(ph) {
      this.startRefresh();
      this._placeholder = _extends({}, PatternMask.DEFAULT_PLACEHOLDER, ph);
      this.endRefresh();
    }
  }, {
    key: 'placeholderLabel',
    get: function get() {
      var _this3 = this;

      return this._charDefs.map(function (def) {
        return def.type === PatternMask.DEF_TYPES.FIXED ? def.char : !def.optional ? _this3._placeholder.char : '';
      }).join('');
    }
  }, {
    key: 'definitions',
    get: function get() {
      return this._definitions;
    },
    set: function set(defs) {
      this.startRefresh();
      this._definitions = defs;
      this._buildResolvers();
      this.endRefresh();
    }
  }, {
    key: 'mask',
    get: function get() {
      return this._mask;
    },
    set: function set(mask) {
      var initialized = this._mask;
      if (initialized) this.startRefresh();
      this._mask = mask;
      if (initialized) {
        this._buildResolvers();
        this.endRefresh();
      }
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
PatternMask.DEFAULT_PLACEHOLDER = {
  show: 'inside',
  char: '_'
};
PatternMask.SHOW_PH_TYPES = {
  ALWAYS: 'always',
  INSIDE: 'inside'
};

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvaW1hc2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0XHJcbmZ1bmN0aW9uIGlzU3RyaW5nIChzdHIpIHtcclxuICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gY29uZm9ybSAocmVzLCBzdHIsIGZhbGxiYWNrPScnKSB7XHJcbiAgcmV0dXJuIGlzU3RyaW5nKHJlcykgP1xyXG4gICAgcmVzIDpcclxuICAgIHJlcyA/XHJcbiAgICAgIHN0ciA6XHJcbiAgICAgIGZhbGxiYWNrO1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuLy8gVE9ET1xyXG4vLyAtIGVtcHR5IHBsYWNlaG9sZGVyXHJcbi8vIC0gdmFsaWRhdGVPbmx5XHJcbi8vIC0gYWRkIGNvbW1lbnRzXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgdGhpcy5fcmVmcmVzaGluZ0NvdW50ID0gMDtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zYXZlU3RhdGUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5wcm9jZXNzSW5wdXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBzYXZlU3RhdGUgKGV2KSB7XHJcbiAgICB0aGlzLl9vbGRWYWx1ZSA9IHRoaXMuZWwudmFsdWU7XHJcbiAgICB0aGlzLl9vbGRTZWxlY3Rpb24gPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLmVsLnNlbGVjdGlvblN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuZWwuc2VsZWN0aW9uRW5kXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzSW5wdXQgKGV2KSB7XHJcbiAgICAgdmFyIGlucHV0VmFsdWUgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgLy8gdXNlIHNlbGVjdGlvbkVuZCBmb3IgaGFuZGxlIFVuZG9cclxuICAgIHZhciBjdXJzb3JQb3MgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuXHJcbiAgICAvLyB2YXIgcmVzID0gaW5wdXRWYWx1ZVxyXG4gICAgLy8gICAuc3BsaXQoJycpXHJcbiAgICAvLyAgIC5tYXAoKGNoLCAuLi5hcmdzKSA9PiB7XHJcbiAgICAvLyAgICAgdmFyIHJlcyA9IHRoaXMuY2hhclJlc29sdmVyLnJlc29sdmUoY2gsIC4uLmFyZ3MpO1xyXG4gICAgLy8gICAgIHJldHVybiBjb25mb3JtKHJlcywgY2gpO1xyXG4gICAgLy8gICB9KVxyXG4gICAgLy8gICAuam9pbignJyk7XHJcblxyXG4gICAgdmFyIGRldGFpbHMgPSB7XHJcbiAgICAgIG9sZFNlbGVjdGlvbjogdGhpcy5fb2xkU2VsZWN0aW9uLFxyXG4gICAgICBjdXJzb3JQb3M6IGN1cnNvclBvcyxcclxuICAgICAgb2xkVmFsdWU6IHRoaXMuX29sZFZhbHVlXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZXMgPSBpbnB1dFZhbHVlO1xyXG4gICAgcmVzID0gY29uZm9ybSh0aGlzLnJlc29sdmUocmVzLCBkZXRhaWxzKSxcclxuICAgICAgcmVzLFxyXG4gICAgICB0aGlzLl9vbGRWYWx1ZSk7XHJcblxyXG4gICAgaWYgKHJlcyAhPT0gaW5wdXRWYWx1ZSkge1xyXG4gICAgICB0aGlzLmVsLnZhbHVlID0gcmVzO1xyXG4gICAgICBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICAgIH1cclxuICAgIHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZCA9IGN1cnNvclBvcztcclxuXHJcbiAgICBpZiAocmVzICE9PSB0aGlzLl9vbGRWYWx1ZSkgdGhpcy5maXJlRXZlbnQoXCJhY2NlcHRcIik7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgb24gKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHRoaXMuX2xpc3RlbmVyc1tldl0gPSBbXTtcclxuICAgIHRoaXMuX2xpc3RlbmVyc1tldl0ucHVzaChoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIG9mZiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgcmV0dXJuO1xyXG4gICAgaWYgKCFoYW5kbGVyKSB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbZXZdO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgaEluZGV4ID0gdGhpcy5fbGlzdGVuZXJzW2V2XS5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgaWYgKGhJbmRleCA+PSAwKSB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGhJbmRleCwgMSk7XHJcbiAgfVxyXG5cclxuICBmaXJlRXZlbnQgKGV2KSB7XHJcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzW2V2XSB8fCBbXTtcclxuICAgIGxpc3RlbmVycy5mb3JFYWNoKGwgPT4gbCgpKTtcclxuICB9XHJcblxyXG4gIC8vIG92ZXJyaWRlIHRoaXNcclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHsgcmV0dXJuIHN0cjsgfVxyXG5cclxuICBnZXQgcmF3VmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWwudmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgcmF3VmFsdWUgKHN0cikge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuZWwudmFsdWUgPSBzdHI7XHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLmVsLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHZhbHVlKSB7XHJcbiAgICB0aGlzLnN0YXJ0UmVmcmVzaCgpO1xyXG4gICAgdGhpcy5lbC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgdGhpcy5lbmRSZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICByZWZyZXNoICgpIHtcclxuICAgIGlmICh0aGlzLl9yZWZyZXNoaW5nQ291bnQpIHJldHVybjtcclxuICAgIHZhciBzdHIgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgdmFyIGRldGFpbHMgPSB7XHJcbiAgICAgIGN1cnNvclBvczogdGhpcy5lbC52YWx1ZS5sZW5ndGgsXHJcbiAgICAgIHN0YXJ0Q2hhbmdlUG9zOiAwLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHtcclxuICAgICAgICBzdGFydDogMCxcclxuICAgICAgICBlbmQ6IHRoaXMuZWwudmFsdWUubGVuZ3RoXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlbW92ZWRDb3VudDogdGhpcy5lbC52YWx1ZS5sZW5ndGgsXHJcbiAgICAgIGluc2VydGVkQ291bnQ6IHN0ci5sZW5ndGgsXHJcbiAgICAgIG9sZFZhbHVlOiB0aGlzLmVsLnZhbHVlXHJcbiAgICB9O1xyXG4gICAgdGhpcy5lbC52YWx1ZSA9IGNvbmZvcm0odGhpcy5yZXNvbHZlKHN0ciwgZGV0YWlscyksIHRoaXMuZWwudmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgc3RhcnRSZWZyZXNoICgpIHtcclxuICAgICsrdGhpcy5fcmVmcmVzaGluZ0NvdW50O1xyXG4gIH1cclxuXHJcbiAgZW5kUmVmcmVzaCAoKSB7XHJcbiAgICAtLXRoaXMuX3JlZnJlc2hpbmdDb3VudDtcclxuICAgIGlmICghdGhpcy5fcmVmcmVzaGluZ0NvdW50KSB0aGlzLnJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIF9vbkRyb3AgKGV2KSB7XHJcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUmVnRXhwTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlIChzdHIpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2sudGVzdChzdHIpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIEZ1bmNNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIHJlc29sdmUgKC4uLmFyZ3MpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2soLi4uYXJncyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBQYXR0ZXJuTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICBjb25zdHJ1Y3RvciAoZWwsIG9wdHMpIHtcclxuICAgIHN1cGVyKGVsLCBvcHRzKTtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcblxyXG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IG9wdHMucGxhY2Vob2xkZXI7XHJcbiAgICB0aGlzLmRlZmluaXRpb25zID0ge1xyXG4gICAgICAuLi5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyxcclxuICAgICAgLi4ub3B0cy5kZWZpbml0aW9uc1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9ob2xsb3dzID0gW107XHJcbiAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG5cclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci5iaW5kRXZlbnRzKCk7XHJcbiAgICBbJ2NsaWNrJywgJ2ZvY3VzJ10uZm9yRWFjaChldiA9PlxyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoZXYsIHRoaXMuX2FsaWduQ3Vyc29yLmJpbmQodGhpcykpKTtcclxuICB9XHJcblxyXG4gIF9idWlsZFJlc29sdmVycyAoKSB7XHJcbiAgICB0aGlzLl9jaGFyRGVmcyA9IFtdO1xyXG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLm1hc2s7XHJcblxyXG4gICAgaWYgKCFwYXR0ZXJuIHx8ICF0aGlzLmRlZmluaXRpb25zKSByZXR1cm47XHJcblxyXG4gICAgdmFyIHVubWFza2luZ0Jsb2NrID0gZmFsc2U7XHJcbiAgICB2YXIgb3B0aW9uYWxCbG9jayA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaT0wOyBpPHBhdHRlcm4ubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdmFyIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgdmFyIHR5cGUgPSAhdW5tYXNraW5nQmxvY2sgJiYgY2ggaW4gdGhpcy5kZWZpbml0aW9ucyA/XHJcbiAgICAgICAgUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUIDpcclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQ7XHJcbiAgICAgIHZhciB1bm1hc2tpbmcgPSB0eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgfHwgdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgIHZhciBvcHRpb25hbCA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiBvcHRpb25hbEJsb2NrO1xyXG5cclxuICAgICAgaWYgKGNoID09PSAneycgfHwgY2ggPT09ICd9Jykge1xyXG4gICAgICAgIHVubWFza2luZ0Jsb2NrID0gIXVubWFza2luZ0Jsb2NrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICdbJyB8fCBjaCA9PT0gJ10nKSB7XHJcbiAgICAgICAgb3B0aW9uYWxCbG9jayA9ICFvcHRpb25hbEJsb2NrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICdcXFxcJykge1xyXG4gICAgICAgICsraTtcclxuICAgICAgICBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgICAgLy8gVE9ETyB2YWxpZGF0aW9uXHJcbiAgICAgICAgaWYgKCFjaCkgYnJlYWs7XHJcbiAgICAgICAgdHlwZSA9IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fY2hhckRlZnMucHVzaCh7XHJcbiAgICAgICAgY2hhcjogY2gsXHJcbiAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICBvcHRpb25hbDogb3B0aW9uYWwsXHJcbiAgICAgICAgdW5tYXNraW5nOiB1bm1hc2tpbmdcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fcmVzb2x2ZXJzID0ge307XHJcbiAgICBmb3IgKHZhciBkZWZLZXkgaW4gdGhpcy5kZWZpbml0aW9ucykge1xyXG4gICAgICB0aGlzLl9yZXNvbHZlcnNbZGVmS2V5XSA9IElNYXNrLk1hc2tGYWN0b3J5KHRoaXMuZWwsIHtcclxuICAgICAgICBtYXNrOiB0aGlzLmRlZmluaXRpb25zW2RlZktleV1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBfdHJ5QXBwZW5kVGFpbCAoc3RyLCB0YWlsKSB7XHJcbiAgICB2YXIgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgIHZhciBob2xsb3dzID0gdGhpcy5faG9sbG93cy5zbGljZSgpO1xyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9c3RyLmxlbmd0aDsgY2kgPCB0YWlsLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSB0YWlsW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuXHJcbiAgICAgIC8vIGZhaWxlZFxyXG4gICAgICBpZiAoIWRlZikgcmV0dXJuO1xyXG5cclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIHZhciBjaHJlcyA9IHJlc29sdmVyLnJlc29sdmUoY2gsIGRpLCBzdHIpIHx8ICcnO1xyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgY2hyZXMgPSBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgICArK2NpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjaHJlcyA9IHRoaXMuX3BsYWNlaG9sZGVyLmNoYXI7XHJcbiAgICAgICAgICBob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdHIgKz0gcGxhY2Vob2xkZXJCdWZmZXIgKyBjaHJlcztcclxuICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtzdHIsIGhvbGxvd3NdO1xyXG4gIH1cclxuXHJcbiAgX2V4dHJhY3RJbnB1dCAoc3RyLCBzdGFydERlZkluZGV4PTApIHtcclxuICAgIHZhciBpbnB1dCA9ICcnO1xyXG4gICAgZm9yICh2YXIgZGk9c3RhcnREZWZJbmRleCwgY2k9MDsgY2k8c3RyLmxlbmd0aCAmJiBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrY2ksICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmXHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5pbmRleE9mKGRpKSA8IDApIGlucHV0ICs9IGNoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgX2dlbmVyYXRlSW5zZXJ0U3RlcHMgKGhlYWQsIGluc2VydGVkKSB7XHJcbiAgICB2YXIgcmVzID0gaGVhZDtcclxuXHJcbiAgICB2YXIgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IFtyZXNdO1xyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9aGVhZC5sZW5ndGg7IGNpPGluc2VydGVkLmxlbmd0aDspIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgaWYgKCFkZWYpIGJyZWFrO1xyXG5cclxuICAgICAgdmFyIGNoID0gaW5zZXJ0ZWRbY2ldO1xyXG4gICAgICB2YXIgY2hyZXMgPSAnJztcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgY2kpIHx8ICcnO1xyXG4gICAgICAgIC8vIGlmIG9rIC0gbmV4dCBkaVxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgKytkaTtcclxuICAgICAgICAgIHJlcyArPSBwbGFjZWhvbGRlckJ1ZmZlcjsgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgICAgIGNocmVzID0gY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgIH1cclxuICAgICAgICArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG5cclxuICAgICAgICBpZiAoY2ggPT09IGRlZi5jaGFyKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcyArPSBjaHJlcztcclxuICAgICAgaW5zZXJ0U3RlcHNbY2ldID0gcmVzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnNlcnRTdGVwcztcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgdmFyIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgdmFyIG9sZFNlbGVjdGlvbiA9IGRldGFpbHMub2xkU2VsZWN0aW9uO1xyXG4gICAgdmFyIG9sZFZhbHVlID0gZGV0YWlscy5vbGRWYWx1ZTtcclxuICAgIHZhciBzdGFydENoYW5nZVBvcyA9IE1hdGgubWluKGN1cnNvclBvcywgb2xkU2VsZWN0aW9uLnN0YXJ0KTtcclxuICAgIC8vIE1hdGgubWF4IGZvciBvcHBvc2l0ZSBvcGVyYXRpb25cclxuICAgIHZhciByZW1vdmVkQ291bnQgPSBNYXRoLm1heCgob2xkU2VsZWN0aW9uLmVuZCAtIHN0YXJ0Q2hhbmdlUG9zKSB8fFxyXG4gICAgICAvLyBmb3IgRGVsZXRlXHJcbiAgICAgIG9sZFZhbHVlLmxlbmd0aCAtIHN0ci5sZW5ndGgsIDApO1xyXG4gICAgdmFyIGluc2VydGVkQ291bnQgPSBjdXJzb3JQb3MgLSBzdGFydENoYW5nZVBvcztcclxuXHJcblxyXG4gICAgdmFyIGhlYWQgPSBzdHIuc3Vic3RyaW5nKDAsIHN0YXJ0Q2hhbmdlUG9zKTtcclxuICAgIHZhciB0YWlsID0gc3RyLnN1YnN0cmluZyhzdGFydENoYW5nZVBvcyArIGluc2VydGVkQ291bnQpO1xyXG4gICAgdmFyIGluc2VydGVkID0gc3RyLnN1YnN0cihzdGFydENoYW5nZVBvcywgaW5zZXJ0ZWRDb3VudCk7XHJcblxyXG4gICAgdmFyIHRhaWxJbnB1dCA9IHRoaXMuX2V4dHJhY3RJbnB1dCh0YWlsLCBzdGFydENoYW5nZVBvcyArIHJlbW92ZWRDb3VudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhvbGxvd3MgYWZ0ZXIgY3Vyc29yXHJcbiAgICB0aGlzLl9ob2xsb3dzID0gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgc3RhcnRDaGFuZ2VQb3MpO1xyXG5cclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IHRoaXMuX2dlbmVyYXRlSW5zZXJ0U3RlcHMoaGVhZCwgaW5zZXJ0ZWQpO1xyXG5cclxuICAgIHZhciByZXMgPSBoZWFkO1xyXG4gICAgZm9yICh2YXIgaXN0ZXA9aW5zZXJ0U3RlcHMubGVuZ3RoLTE7IGlzdGVwID49IDA7IC0taXN0ZXApIHtcclxuICAgICAgdmFyIHN0ZXAgPSBpbnNlcnRTdGVwc1tpc3RlcF07XHJcbiAgICAgIHZhciByZXN1bHQgPSB0aGlzLl90cnlBcHBlbmRUYWlsKHN0ZXAsIHRhaWxJbnB1dCk7XHJcbiAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IHJlc3VsdDtcclxuICAgICAgICBjdXJzb3JQb3MgPSBzdGVwLmxlbmd0aDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBkZWY7XHJcbiAgICAvLyBhcHBlbmQgZml4ZWQgYXQgZW5kIGlmIGluc2VydGVkXHJcbiAgICBpZiAoaW5zZXJ0ZWQpIHtcclxuICAgICAgdmFyIGFwcGVuZGVkID0gdGhpcy5fYXBwZW5kRml4ZWRFbmQocmVzKTtcclxuICAgICAgY3Vyc29yUG9zICs9IGFwcGVuZGVkLmxlbmd0aCAtIHJlcy5sZW5ndGg7XHJcbiAgICAgIHJlcyA9IGFwcGVuZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSBoZWFkIGZpeGVkIGFuZCBob2xsb3dzIGlmIHJlbW92ZWQgYXQgZW5kXHJcbiAgICBpZiAoIWluc2VydGVkICYmIGN1cnNvclBvcyA9PT0gcmVzLmxlbmd0aCkge1xyXG4gICAgICB2YXIgZGkgPSBjdXJzb3JQb3MgLSAxO1xyXG4gICAgICB2YXIgaGFzSG9sbG93cyA9IGZhbHNlO1xyXG4gICAgICBmb3IgKDsgZGkgPiAwOyAtLWRpKSB7XHJcbiAgICAgICAgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5faG9sbG93cy5pbmRleE9mKGRpKSA+PSAwKSBoYXNIb2xsb3dzID0gdHJ1ZTtcclxuICAgICAgICAgIGVsc2UgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChoYXNIb2xsb3dzKSByZXMgPSByZXMuc2xpY2UoMCwgZGkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFwcGVuZCBwbGFjZWhvbGRlclxyXG4gICAgaWYgKHRoaXMuX3BsYWNlaG9sZGVyLnNob3cgPT09IFBhdHRlcm5NYXNrLlNIT1dfUEhfVFlQRVMuQUxXQVlTKSB7XHJcbiAgICAgIHJlcyA9IHRoaXMuX2FwcGVuZFBsYWNlaG9sZGVyRW5kKHJlcyk7XHJcbiAgICB9XHJcbiAgICBkZXRhaWxzLmN1cnNvclBvcyA9IGN1cnNvclBvcztcclxuXHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChldikge1xyXG4gICAgdmFyIHJlcyA9IHN1cGVyLnByb2Nlc3NJbnB1dChldik7XHJcbiAgICBpZiAocmVzICE9PSB0aGlzLl9vbGRWYWx1ZSAmJiB0aGlzLl9pc0NvbXBsZXRlKHJlcykpIHRoaXMuZmlyZUV2ZW50KFwiY29tcGxldGVcIik7XHJcbiAgfVxyXG5cclxuICBfaXNDb21wbGV0ZSAoc3RyKSB7XHJcbiAgICB2YXIgZGVmSW5wdXRzID0gdGhpcy5fY2hhckRlZnMuZmlsdGVyKGRlZiA9PiBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKTtcclxuICAgIHJldHVybiB0aGlzLl9leHRyYWN0SW5wdXQoc3RyKS5sZW5ndGggPT09IGRlZklucHV0cy5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBfYXBwZW5kRml4ZWRFbmQgKHJlcykge1xyXG4gICAgdmFyIHBvcyA9IHJlcy5sZW5ndGg7XHJcbiAgICBmb3IgKDs7ICsrcG9zKSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1twb3NdO1xyXG4gICAgICBpZiAoIWRlZiB8fCBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSBicmVhaztcclxuICAgICAgaWYgKHBvcyA+PSByZXMubGVuZ3RoKSByZXMgKz0gZGVmLmNoYXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFBsYWNlaG9sZGVyRW5kIChyZXMpIHtcclxuICAgIHZhciBwaExhYmVsID0gdGhpcy5wbGFjZWhvbGRlckxhYmVsO1xyXG4gICAgZm9yICh2YXIgaGk9cmVzLmxlbmd0aDsgaGk8cGhMYWJlbC5sZW5ndGg7ICsraGkpIHtcclxuICAgICAgaWYgKHRoaXMuX2NoYXJEZWZzW2hpXS50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpXHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5wdXNoKGhpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXMgKyBwaExhYmVsLnN1YnN0cihyZXMubGVuZ3RoKTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHZhciBzdHIgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgdmFyIHVubWFza2VkID0gJyc7XHJcbiAgICBmb3IgKHZhciBjaT0wOyBjaTxzdHIubGVuZ3RoICYmIGNpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytjaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbY2ldO1xyXG5cclxuICAgICAgaWYgKGRlZi51bm1hc2tpbmcgJiYgIXRoaXMuX2hvbGxvd3MuaW5kZXhPZihjaSkgPj0gMCAmJlxyXG4gICAgICAgIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl0ucmVzb2x2ZShjaCwgY2kpIHx8XHJcbiAgICAgICAgICBkZWYuY2hhciA9PT0gY2gpKSB7XHJcbiAgICAgICAgdW5tYXNrZWQgKz0gY2g7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB1bm1hc2tlZDtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcblxyXG4gICAgdmFyIHJlcyA9ICcnO1xyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9MDsgY2k8c3RyLmxlbmd0aCAmJiBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcblxyXG4gICAgICB2YXIgY2hyZXMgPSAnJztcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICBpZiAodGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXS5yZXNvbHZlKGNoLCBjaSkpIHtcclxuICAgICAgICAgIGNocmVzID0gY2g7XHJcbiAgICAgICAgICArK2RpO1xyXG4gICAgICAgIH1cclxuICAgICAgICArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNocmVzID0gZGVmLmNoYXI7XHJcbiAgICAgICAgaWYgKGRlZi51bm1hc2tpbmcgJiYgZGVmLmNoYXIgPT09IGNoKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuICAgICAgcmVzICs9IGNocmVzO1xyXG4gICAgfVxyXG4gICAgdGhpcy5faG9sbG93cy5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5lbC52YWx1ZSA9IHJlcztcclxuXHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlciAoKSB7IHJldHVybiB0aGlzLl9wbGFjZWhvbGRlcjsgfVxyXG5cclxuICBzZXQgcGxhY2Vob2xkZXIgKHBoKSB7XHJcbiAgICB0aGlzLnN0YXJ0UmVmcmVzaCgpO1xyXG4gICAgdGhpcy5fcGxhY2Vob2xkZXIgPSB7XHJcbiAgICAgIC4uLlBhdHRlcm5NYXNrLkRFRkFVTFRfUExBQ0VIT0xERVIsXHJcbiAgICAgIC4uLnBoXHJcbiAgICB9O1xyXG4gICAgdGhpcy5lbmRSZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgcGxhY2Vob2xkZXJMYWJlbCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY2hhckRlZnMubWFwKGRlZiA9PlxyXG4gICAgICBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEID9cclxuICAgICAgICBkZWYuY2hhciA6XHJcbiAgICAgICAgIWRlZi5vcHRpb25hbCA/XHJcbiAgICAgICAgICB0aGlzLl9wbGFjZWhvbGRlci5jaGFyIDpcclxuICAgICAgICAgICcnKS5qb2luKCcnKTtcclxuICB9XHJcblxyXG4gIGdldCBkZWZpbml0aW9ucyAoKSB7IHJldHVybiB0aGlzLl9kZWZpbml0aW9uczsgfVxyXG5cclxuICBzZXQgZGVmaW5pdGlvbnMgKGRlZnMpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLl9kZWZpbml0aW9ucyA9IGRlZnM7XHJcbiAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG4gICAgdGhpcy5lbmRSZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgbWFzayAoKSB7IHJldHVybiB0aGlzLl9tYXNrOyB9XHJcblxyXG4gIHNldCBtYXNrIChtYXNrKSB7XHJcbiAgICB2YXIgaW5pdGlhbGl6ZWQgPSB0aGlzLl9tYXNrO1xyXG4gICAgaWYgKGluaXRpYWxpemVkKSB0aGlzLnN0YXJ0UmVmcmVzaCgpO1xyXG4gICAgdGhpcy5fbWFzayA9IG1hc2s7XHJcbiAgICBpZiAoaW5pdGlhbGl6ZWQpIHtcclxuICAgICAgdGhpcy5fYnVpbGRSZXNvbHZlcnMoKTtcclxuICAgICAgdGhpcy5lbmRSZWZyZXNoKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBfYWxpZ25DdXJzb3IgKCkge1xyXG4gICAgdmFyIGN1cnNvclBvcyA9IHRoaXMuZWwuc2VsZWN0aW9uRW5kO1xyXG4gICAgZm9yICh2YXIgclBvcyA9IGN1cnNvclBvczsgclBvcyA+PSAwOyAtLXJQb3MpIHtcclxuICAgICAgdmFyIHJEZWYgPSB0aGlzLl9jaGFyRGVmc1tyUG9zXTtcclxuICAgICAgdmFyIGxQb3MgPSByUG9zLTE7XHJcbiAgICAgIHZhciBsRGVmID0gdGhpcy5fY2hhckRlZnNbbFBvc107XHJcbiAgICAgIGlmICgoIXJEZWYgfHwgckRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgdGhpcy5faG9sbG93cy5pbmRleE9mKHJQb3MpID4gLTEpICYmXHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5pbmRleE9mKGxQb3MpIDwgMCkge1xyXG4gICAgICAgIGN1cnNvclBvcyA9IHJQb3M7XHJcbiAgICAgICAgaWYgKCFsRGVmIHx8IGxEZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5lbC5zZWxlY3Rpb25TdGFydCA9IHRoaXMuZWwuc2VsZWN0aW9uRW5kID0gY3Vyc29yUG9zO1xyXG4gIH1cclxufVxyXG5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyA9IHtcclxuICAnMCc6IC9cXGQvLFxyXG4gICdhJzogL1tcXHUwMDQxLVxcdTAwNUFcXHUwMDYxLVxcdTAwN0FcXHUwMEFBXFx1MDBCNVxcdTAwQkFcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZcXHUwMEY4LVxcdTAyQzFcXHUwMkM2LVxcdTAyRDFcXHUwMkUwLVxcdTAyRTRcXHUwMkVDXFx1MDJFRVxcdTAzNzAtXFx1MDM3NFxcdTAzNzZcXHUwMzc3XFx1MDM3QS1cXHUwMzdEXFx1MDM4NlxcdTAzODgtXFx1MDM4QVxcdTAzOENcXHUwMzhFLVxcdTAzQTFcXHUwM0EzLVxcdTAzRjVcXHUwM0Y3LVxcdTA0ODFcXHUwNDhBLVxcdTA1MjdcXHUwNTMxLVxcdTA1NTZcXHUwNTU5XFx1MDU2MS1cXHUwNTg3XFx1MDVEMC1cXHUwNUVBXFx1MDVGMC1cXHUwNUYyXFx1MDYyMC1cXHUwNjRBXFx1MDY2RVxcdTA2NkZcXHUwNjcxLVxcdTA2RDNcXHUwNkQ1XFx1MDZFNVxcdTA2RTZcXHUwNkVFXFx1MDZFRlxcdTA2RkEtXFx1MDZGQ1xcdTA2RkZcXHUwNzEwXFx1MDcxMi1cXHUwNzJGXFx1MDc0RC1cXHUwN0E1XFx1MDdCMVxcdTA3Q0EtXFx1MDdFQVxcdTA3RjRcXHUwN0Y1XFx1MDdGQVxcdTA4MDAtXFx1MDgxNVxcdTA4MUFcXHUwODI0XFx1MDgyOFxcdTA4NDAtXFx1MDg1OFxcdTA4QTBcXHUwOEEyLVxcdTA4QUNcXHUwOTA0LVxcdTA5MzlcXHUwOTNEXFx1MDk1MFxcdTA5NTgtXFx1MDk2MVxcdTA5NzEtXFx1MDk3N1xcdTA5NzktXFx1MDk3RlxcdTA5ODUtXFx1MDk4Q1xcdTA5OEZcXHUwOTkwXFx1MDk5My1cXHUwOUE4XFx1MDlBQS1cXHUwOUIwXFx1MDlCMlxcdTA5QjYtXFx1MDlCOVxcdTA5QkRcXHUwOUNFXFx1MDlEQ1xcdTA5RERcXHUwOURGLVxcdTA5RTFcXHUwOUYwXFx1MDlGMVxcdTBBMDUtXFx1MEEwQVxcdTBBMEZcXHUwQTEwXFx1MEExMy1cXHUwQTI4XFx1MEEyQS1cXHUwQTMwXFx1MEEzMlxcdTBBMzNcXHUwQTM1XFx1MEEzNlxcdTBBMzhcXHUwQTM5XFx1MEE1OS1cXHUwQTVDXFx1MEE1RVxcdTBBNzItXFx1MEE3NFxcdTBBODUtXFx1MEE4RFxcdTBBOEYtXFx1MEE5MVxcdTBBOTMtXFx1MEFBOFxcdTBBQUEtXFx1MEFCMFxcdTBBQjJcXHUwQUIzXFx1MEFCNS1cXHUwQUI5XFx1MEFCRFxcdTBBRDBcXHUwQUUwXFx1MEFFMVxcdTBCMDUtXFx1MEIwQ1xcdTBCMEZcXHUwQjEwXFx1MEIxMy1cXHUwQjI4XFx1MEIyQS1cXHUwQjMwXFx1MEIzMlxcdTBCMzNcXHUwQjM1LVxcdTBCMzlcXHUwQjNEXFx1MEI1Q1xcdTBCNURcXHUwQjVGLVxcdTBCNjFcXHUwQjcxXFx1MEI4M1xcdTBCODUtXFx1MEI4QVxcdTBCOEUtXFx1MEI5MFxcdTBCOTItXFx1MEI5NVxcdTBCOTlcXHUwQjlBXFx1MEI5Q1xcdTBCOUVcXHUwQjlGXFx1MEJBM1xcdTBCQTRcXHUwQkE4LVxcdTBCQUFcXHUwQkFFLVxcdTBCQjlcXHUwQkQwXFx1MEMwNS1cXHUwQzBDXFx1MEMwRS1cXHUwQzEwXFx1MEMxMi1cXHUwQzI4XFx1MEMyQS1cXHUwQzMzXFx1MEMzNS1cXHUwQzM5XFx1MEMzRFxcdTBDNThcXHUwQzU5XFx1MEM2MFxcdTBDNjFcXHUwQzg1LVxcdTBDOENcXHUwQzhFLVxcdTBDOTBcXHUwQzkyLVxcdTBDQThcXHUwQ0FBLVxcdTBDQjNcXHUwQ0I1LVxcdTBDQjlcXHUwQ0JEXFx1MENERVxcdTBDRTBcXHUwQ0UxXFx1MENGMVxcdTBDRjJcXHUwRDA1LVxcdTBEMENcXHUwRDBFLVxcdTBEMTBcXHUwRDEyLVxcdTBEM0FcXHUwRDNEXFx1MEQ0RVxcdTBENjBcXHUwRDYxXFx1MEQ3QS1cXHUwRDdGXFx1MEQ4NS1cXHUwRDk2XFx1MEQ5QS1cXHUwREIxXFx1MERCMy1cXHUwREJCXFx1MERCRFxcdTBEQzAtXFx1MERDNlxcdTBFMDEtXFx1MEUzMFxcdTBFMzJcXHUwRTMzXFx1MEU0MC1cXHUwRTQ2XFx1MEU4MVxcdTBFODJcXHUwRTg0XFx1MEU4N1xcdTBFODhcXHUwRThBXFx1MEU4RFxcdTBFOTQtXFx1MEU5N1xcdTBFOTktXFx1MEU5RlxcdTBFQTEtXFx1MEVBM1xcdTBFQTVcXHUwRUE3XFx1MEVBQVxcdTBFQUJcXHUwRUFELVxcdTBFQjBcXHUwRUIyXFx1MEVCM1xcdTBFQkRcXHUwRUMwLVxcdTBFQzRcXHUwRUM2XFx1MEVEQy1cXHUwRURGXFx1MEYwMFxcdTBGNDAtXFx1MEY0N1xcdTBGNDktXFx1MEY2Q1xcdTBGODgtXFx1MEY4Q1xcdTEwMDAtXFx1MTAyQVxcdTEwM0ZcXHUxMDUwLVxcdTEwNTVcXHUxMDVBLVxcdTEwNURcXHUxMDYxXFx1MTA2NVxcdTEwNjZcXHUxMDZFLVxcdTEwNzBcXHUxMDc1LVxcdTEwODFcXHUxMDhFXFx1MTBBMC1cXHUxMEM1XFx1MTBDN1xcdTEwQ0RcXHUxMEQwLVxcdTEwRkFcXHUxMEZDLVxcdTEyNDhcXHUxMjRBLVxcdTEyNERcXHUxMjUwLVxcdTEyNTZcXHUxMjU4XFx1MTI1QS1cXHUxMjVEXFx1MTI2MC1cXHUxMjg4XFx1MTI4QS1cXHUxMjhEXFx1MTI5MC1cXHUxMkIwXFx1MTJCMi1cXHUxMkI1XFx1MTJCOC1cXHUxMkJFXFx1MTJDMFxcdTEyQzItXFx1MTJDNVxcdTEyQzgtXFx1MTJENlxcdTEyRDgtXFx1MTMxMFxcdTEzMTItXFx1MTMxNVxcdTEzMTgtXFx1MTM1QVxcdTEzODAtXFx1MTM4RlxcdTEzQTAtXFx1MTNGNFxcdTE0MDEtXFx1MTY2Q1xcdTE2NkYtXFx1MTY3RlxcdTE2ODEtXFx1MTY5QVxcdTE2QTAtXFx1MTZFQVxcdTE3MDAtXFx1MTcwQ1xcdTE3MEUtXFx1MTcxMVxcdTE3MjAtXFx1MTczMVxcdTE3NDAtXFx1MTc1MVxcdTE3NjAtXFx1MTc2Q1xcdTE3NkUtXFx1MTc3MFxcdTE3ODAtXFx1MTdCM1xcdTE3RDdcXHUxN0RDXFx1MTgyMC1cXHUxODc3XFx1MTg4MC1cXHUxOEE4XFx1MThBQVxcdTE4QjAtXFx1MThGNVxcdTE5MDAtXFx1MTkxQ1xcdTE5NTAtXFx1MTk2RFxcdTE5NzAtXFx1MTk3NFxcdTE5ODAtXFx1MTlBQlxcdTE5QzEtXFx1MTlDN1xcdTFBMDAtXFx1MUExNlxcdTFBMjAtXFx1MUE1NFxcdTFBQTdcXHUxQjA1LVxcdTFCMzNcXHUxQjQ1LVxcdTFCNEJcXHUxQjgzLVxcdTFCQTBcXHUxQkFFXFx1MUJBRlxcdTFCQkEtXFx1MUJFNVxcdTFDMDAtXFx1MUMyM1xcdTFDNEQtXFx1MUM0RlxcdTFDNUEtXFx1MUM3RFxcdTFDRTktXFx1MUNFQ1xcdTFDRUUtXFx1MUNGMVxcdTFDRjVcXHUxQ0Y2XFx1MUQwMC1cXHUxREJGXFx1MUUwMC1cXHUxRjE1XFx1MUYxOC1cXHUxRjFEXFx1MUYyMC1cXHUxRjQ1XFx1MUY0OC1cXHUxRjREXFx1MUY1MC1cXHUxRjU3XFx1MUY1OVxcdTFGNUJcXHUxRjVEXFx1MUY1Ri1cXHUxRjdEXFx1MUY4MC1cXHUxRkI0XFx1MUZCNi1cXHUxRkJDXFx1MUZCRVxcdTFGQzItXFx1MUZDNFxcdTFGQzYtXFx1MUZDQ1xcdTFGRDAtXFx1MUZEM1xcdTFGRDYtXFx1MUZEQlxcdTFGRTAtXFx1MUZFQ1xcdTFGRjItXFx1MUZGNFxcdTFGRjYtXFx1MUZGQ1xcdTIwNzFcXHUyMDdGXFx1MjA5MC1cXHUyMDlDXFx1MjEwMlxcdTIxMDdcXHUyMTBBLVxcdTIxMTNcXHUyMTE1XFx1MjExOS1cXHUyMTFEXFx1MjEyNFxcdTIxMjZcXHUyMTI4XFx1MjEyQS1cXHUyMTJEXFx1MjEyRi1cXHUyMTM5XFx1MjEzQy1cXHUyMTNGXFx1MjE0NS1cXHUyMTQ5XFx1MjE0RVxcdTIxODNcXHUyMTg0XFx1MkMwMC1cXHUyQzJFXFx1MkMzMC1cXHUyQzVFXFx1MkM2MC1cXHUyQ0U0XFx1MkNFQi1cXHUyQ0VFXFx1MkNGMlxcdTJDRjNcXHUyRDAwLVxcdTJEMjVcXHUyRDI3XFx1MkQyRFxcdTJEMzAtXFx1MkQ2N1xcdTJENkZcXHUyRDgwLVxcdTJEOTZcXHUyREEwLVxcdTJEQTZcXHUyREE4LVxcdTJEQUVcXHUyREIwLVxcdTJEQjZcXHUyREI4LVxcdTJEQkVcXHUyREMwLVxcdTJEQzZcXHUyREM4LVxcdTJEQ0VcXHUyREQwLVxcdTJERDZcXHUyREQ4LVxcdTJEREVcXHUyRTJGXFx1MzAwNVxcdTMwMDZcXHUzMDMxLVxcdTMwMzVcXHUzMDNCXFx1MzAzQ1xcdTMwNDEtXFx1MzA5NlxcdTMwOUQtXFx1MzA5RlxcdTMwQTEtXFx1MzBGQVxcdTMwRkMtXFx1MzBGRlxcdTMxMDUtXFx1MzEyRFxcdTMxMzEtXFx1MzE4RVxcdTMxQTAtXFx1MzFCQVxcdTMxRjAtXFx1MzFGRlxcdTM0MDAtXFx1NERCNVxcdTRFMDAtXFx1OUZDQ1xcdUEwMDAtXFx1QTQ4Q1xcdUE0RDAtXFx1QTRGRFxcdUE1MDAtXFx1QTYwQ1xcdUE2MTAtXFx1QTYxRlxcdUE2MkFcXHVBNjJCXFx1QTY0MC1cXHVBNjZFXFx1QTY3Ri1cXHVBNjk3XFx1QTZBMC1cXHVBNkU1XFx1QTcxNy1cXHVBNzFGXFx1QTcyMi1cXHVBNzg4XFx1QTc4Qi1cXHVBNzhFXFx1QTc5MC1cXHVBNzkzXFx1QTdBMC1cXHVBN0FBXFx1QTdGOC1cXHVBODAxXFx1QTgwMy1cXHVBODA1XFx1QTgwNy1cXHVBODBBXFx1QTgwQy1cXHVBODIyXFx1QTg0MC1cXHVBODczXFx1QTg4Mi1cXHVBOEIzXFx1QThGMi1cXHVBOEY3XFx1QThGQlxcdUE5MEEtXFx1QTkyNVxcdUE5MzAtXFx1QTk0NlxcdUE5NjAtXFx1QTk3Q1xcdUE5ODQtXFx1QTlCMlxcdUE5Q0ZcXHVBQTAwLVxcdUFBMjhcXHVBQTQwLVxcdUFBNDJcXHVBQTQ0LVxcdUFBNEJcXHVBQTYwLVxcdUFBNzZcXHVBQTdBXFx1QUE4MC1cXHVBQUFGXFx1QUFCMVxcdUFBQjVcXHVBQUI2XFx1QUFCOS1cXHVBQUJEXFx1QUFDMFxcdUFBQzJcXHVBQURCLVxcdUFBRERcXHVBQUUwLVxcdUFBRUFcXHVBQUYyLVxcdUFBRjRcXHVBQjAxLVxcdUFCMDZcXHVBQjA5LVxcdUFCMEVcXHVBQjExLVxcdUFCMTZcXHVBQjIwLVxcdUFCMjZcXHVBQjI4LVxcdUFCMkVcXHVBQkMwLVxcdUFCRTJcXHVBQzAwLVxcdUQ3QTNcXHVEN0IwLVxcdUQ3QzZcXHVEN0NCLVxcdUQ3RkJcXHVGOTAwLVxcdUZBNkRcXHVGQTcwLVxcdUZBRDlcXHVGQjAwLVxcdUZCMDZcXHVGQjEzLVxcdUZCMTdcXHVGQjFEXFx1RkIxRi1cXHVGQjI4XFx1RkIyQS1cXHVGQjM2XFx1RkIzOC1cXHVGQjNDXFx1RkIzRVxcdUZCNDBcXHVGQjQxXFx1RkI0M1xcdUZCNDRcXHVGQjQ2LVxcdUZCQjFcXHVGQkQzLVxcdUZEM0RcXHVGRDUwLVxcdUZEOEZcXHVGRDkyLVxcdUZEQzdcXHVGREYwLVxcdUZERkJcXHVGRTcwLVxcdUZFNzRcXHVGRTc2LVxcdUZFRkNcXHVGRjIxLVxcdUZGM0FcXHVGRjQxLVxcdUZGNUFcXHVGRjY2LVxcdUZGQkVcXHVGRkMyLVxcdUZGQzdcXHVGRkNBLVxcdUZGQ0ZcXHVGRkQyLVxcdUZGRDdcXHVGRkRBLVxcdUZGRENdLywgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyMDc1MDcwXHJcbiAgJyonOiAvLi9cclxufTtcclxuUGF0dGVybk1hc2suREVGX1RZUEVTID0ge1xyXG4gIElOUFVUOiAnaW5wdXQnLFxyXG4gIEZJWEVEOiAnZml4ZWQnXHJcbn1cclxuUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUiA9IHtcclxuICBzaG93OiAnaW5zaWRlJyxcclxuICBjaGFyOiAnXydcclxufTtcclxuUGF0dGVybk1hc2suU0hPV19QSF9UWVBFUyA9IHtcclxuICBBTFdBWVM6ICdhbHdheXMnLFxyXG4gIElOU0lERTogJ2luc2lkZSdcclxufVxyXG4iLCJpbXBvcnQge2lzU3RyaW5nfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmltcG9ydCBCYXNlTWFzayBmcm9tICcuL21hc2tzL2Jhc2UnO1xyXG5pbXBvcnQgUmVnRXhwTWFzayBmcm9tICcuL21hc2tzL3JlZ2V4cCc7XHJcbmltcG9ydCBGdW5jTWFzayBmcm9tICcuL21hc2tzL2Z1bmMnO1xyXG5pbXBvcnQgUGF0dGVybk1hc2sgZnJvbSAnLi9tYXNrcy9wYXR0ZXJuJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5mdW5jdGlvbiBJTWFzayAoZWwsIG9wdHM9e30pIHtcclxuICB2YXIgbWFzayA9IElNYXNrLk1hc2tGYWN0b3J5KGVsLCBvcHRzKTtcclxuICBtYXNrLmJpbmRFdmVudHMoKTtcclxuICAvLyByZWZyZXNoXHJcbiAgbWFzay5yYXdWYWx1ZSA9IGVsLnZhbHVlO1xyXG4gIHJldHVybiBtYXNrO1xyXG59XHJcblxyXG5JTWFzay5NYXNrRmFjdG9yeSA9IGZ1bmN0aW9uIChlbCwgb3B0cykge1xyXG4gIHZhciBtYXNrID0gb3B0cy5tYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgQmFzZU1hc2spIHJldHVybiBtYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gbmV3IFJlZ0V4cE1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHJldHVybiBuZXcgRnVuY01hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChpc1N0cmluZyhtYXNrKSkgcmV0dXJuIG5ldyBQYXR0ZXJuTWFzayhlbCwgb3B0cyk7XHJcbiAgcmV0dXJuIG5ldyBCYXNlTWFzayhlbCwgb3B0cyk7XHJcbn1cclxuSU1hc2suQmFzZU1hc2sgPSBCYXNlTWFzaztcclxuSU1hc2suRnVuY01hc2sgPSBGdW5jTWFzaztcclxuSU1hc2suUmVnRXhwTWFzayA9IFJlZ0V4cE1hc2s7XHJcbklNYXNrLlBhdHRlcm5NYXNrID0gUGF0dGVybk1hc2s7XHJcbndpbmRvdy5JTWFzayA9IElNYXNrO1xyXG4iXSwibmFtZXMiOlsiaXNTdHJpbmciLCJzdHIiLCJTdHJpbmciLCJjb25mb3JtIiwicmVzIiwiZmFsbGJhY2siLCJCYXNlTWFzayIsImVsIiwib3B0cyIsIm1hc2siLCJfbGlzdGVuZXJzIiwiX3JlZnJlc2hpbmdDb3VudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJzYXZlU3RhdGUiLCJiaW5kIiwicHJvY2Vzc0lucHV0IiwiX29uRHJvcCIsImV2IiwiX29sZFZhbHVlIiwidmFsdWUiLCJfb2xkU2VsZWN0aW9uIiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJpbnB1dFZhbHVlIiwiY3Vyc29yUG9zIiwiZGV0YWlscyIsInJlc29sdmUiLCJmaXJlRXZlbnQiLCJoYW5kbGVyIiwicHVzaCIsImhJbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJsaXN0ZW5lcnMiLCJmb3JFYWNoIiwibCIsImxlbmd0aCIsInJlZnJlc2giLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInN0YXJ0UmVmcmVzaCIsImVuZFJlZnJlc2giLCJSZWdFeHBNYXNrIiwidGVzdCIsIkZ1bmNNYXNrIiwiUGF0dGVybk1hc2siLCJwbGFjZWhvbGRlciIsImRlZmluaXRpb25zIiwiREVGSU5JVElPTlMiLCJfaG9sbG93cyIsIl9idWlsZFJlc29sdmVycyIsIl9hbGlnbkN1cnNvciIsIl9jaGFyRGVmcyIsInBhdHRlcm4iLCJ1bm1hc2tpbmdCbG9jayIsIm9wdGlvbmFsQmxvY2siLCJpIiwiY2giLCJ0eXBlIiwiREVGX1RZUEVTIiwiSU5QVVQiLCJGSVhFRCIsInVubWFza2luZyIsIm9wdGlvbmFsIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiTWFza0ZhY3RvcnkiLCJ0YWlsIiwicGxhY2Vob2xkZXJCdWZmZXIiLCJob2xsb3dzIiwic2xpY2UiLCJjaSIsImRpIiwiZGVmIiwicmVzb2x2ZXIiLCJjaGFyIiwiY2hyZXMiLCJfcGxhY2Vob2xkZXIiLCJzdGFydERlZkluZGV4IiwiaW5wdXQiLCJoZWFkIiwiaW5zZXJ0ZWQiLCJpbnNlcnRTdGVwcyIsIm9sZFNlbGVjdGlvbiIsIm9sZFZhbHVlIiwic3RhcnRDaGFuZ2VQb3MiLCJNYXRoIiwibWluIiwic3RhcnQiLCJyZW1vdmVkQ291bnQiLCJtYXgiLCJlbmQiLCJpbnNlcnRlZENvdW50Iiwic3Vic3RyaW5nIiwic3Vic3RyIiwidGFpbElucHV0IiwiX2V4dHJhY3RJbnB1dCIsImZpbHRlciIsImgiLCJfZ2VuZXJhdGVJbnNlcnRTdGVwcyIsImlzdGVwIiwic3RlcCIsInJlc3VsdCIsIl90cnlBcHBlbmRUYWlsIiwiYXBwZW5kZWQiLCJfYXBwZW5kRml4ZWRFbmQiLCJoYXNIb2xsb3dzIiwic2hvdyIsIlNIT1dfUEhfVFlQRVMiLCJBTFdBWVMiLCJfYXBwZW5kUGxhY2Vob2xkZXJFbmQiLCJfaXNDb21wbGV0ZSIsImRlZklucHV0cyIsInBvcyIsInBoTGFiZWwiLCJwbGFjZWhvbGRlckxhYmVsIiwiaGkiLCJyUG9zIiwickRlZiIsImxQb3MiLCJsRGVmIiwidW5tYXNrZWQiLCJwaCIsIkRFRkFVTFRfUExBQ0VIT0xERVIiLCJtYXAiLCJqb2luIiwiX2RlZmluaXRpb25zIiwiZGVmcyIsIl9tYXNrIiwiaW5pdGlhbGl6ZWQiLCJiaW5kRXZlbnRzIiwicmF3VmFsdWUiLCJSZWdFeHAiLCJGdW5jdGlvbiIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsU0FBU0EsUUFBVCxDQUFtQkMsR0FBbkIsRUFBd0I7U0FDZixPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsZUFBZUMsTUFBakQ7OztBQUdGLEFBQ0EsU0FBU0MsT0FBVCxDQUFrQkMsR0FBbEIsRUFBdUJILEdBQXZCLEVBQXlDO01BQWJJLFFBQWEsdUVBQUosRUFBSTs7U0FDaENMLFNBQVNJLEdBQVQsSUFDTEEsR0FESyxHQUVMQSxNQUNFSCxHQURGLEdBRUVJLFFBSko7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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