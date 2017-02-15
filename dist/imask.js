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
      return this;
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
      return this;
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

        if (def.unmasking && this._hollows.indexOf(ci) < 0 && (def.type === PatternMask.DEF_TYPES.INPUT && this._resolvers[def.char].resolve(ch, ci) || def.char === ch)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvaW1hc2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0XHJcbmZ1bmN0aW9uIGlzU3RyaW5nIChzdHIpIHtcclxuICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gY29uZm9ybSAocmVzLCBzdHIsIGZhbGxiYWNrPScnKSB7XHJcbiAgcmV0dXJuIGlzU3RyaW5nKHJlcykgP1xyXG4gICAgcmVzIDpcclxuICAgIHJlcyA/XHJcbiAgICAgIHN0ciA6XHJcbiAgICAgIGZhbGxiYWNrO1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuLy8gVE9ET1xyXG4vLyAtIGVtcHR5IHBsYWNlaG9sZGVyXHJcbi8vIC0gdmFsaWRhdGVPbmx5XHJcbi8vIC0gYWRkIGNvbW1lbnRzXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgdGhpcy5fcmVmcmVzaGluZ0NvdW50ID0gMDtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zYXZlU3RhdGUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5wcm9jZXNzSW5wdXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBzYXZlU3RhdGUgKGV2KSB7XHJcbiAgICB0aGlzLl9vbGRWYWx1ZSA9IHRoaXMuZWwudmFsdWU7XHJcbiAgICB0aGlzLl9vbGRTZWxlY3Rpb24gPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLmVsLnNlbGVjdGlvblN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuZWwuc2VsZWN0aW9uRW5kXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzSW5wdXQgKGV2KSB7XHJcbiAgICAgdmFyIGlucHV0VmFsdWUgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgLy8gdXNlIHNlbGVjdGlvbkVuZCBmb3IgaGFuZGxlIFVuZG9cclxuICAgIHZhciBjdXJzb3JQb3MgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuXHJcbiAgICAvLyB2YXIgcmVzID0gaW5wdXRWYWx1ZVxyXG4gICAgLy8gICAuc3BsaXQoJycpXHJcbiAgICAvLyAgIC5tYXAoKGNoLCAuLi5hcmdzKSA9PiB7XHJcbiAgICAvLyAgICAgdmFyIHJlcyA9IHRoaXMuY2hhclJlc29sdmVyLnJlc29sdmUoY2gsIC4uLmFyZ3MpO1xyXG4gICAgLy8gICAgIHJldHVybiBjb25mb3JtKHJlcywgY2gpO1xyXG4gICAgLy8gICB9KVxyXG4gICAgLy8gICAuam9pbignJyk7XHJcblxyXG4gICAgdmFyIGRldGFpbHMgPSB7XHJcbiAgICAgIG9sZFNlbGVjdGlvbjogdGhpcy5fb2xkU2VsZWN0aW9uLFxyXG4gICAgICBjdXJzb3JQb3M6IGN1cnNvclBvcyxcclxuICAgICAgb2xkVmFsdWU6IHRoaXMuX29sZFZhbHVlXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZXMgPSBpbnB1dFZhbHVlO1xyXG4gICAgcmVzID0gY29uZm9ybSh0aGlzLnJlc29sdmUocmVzLCBkZXRhaWxzKSxcclxuICAgICAgcmVzLFxyXG4gICAgICB0aGlzLl9vbGRWYWx1ZSk7XHJcblxyXG4gICAgaWYgKHJlcyAhPT0gaW5wdXRWYWx1ZSkge1xyXG4gICAgICB0aGlzLmVsLnZhbHVlID0gcmVzO1xyXG4gICAgICBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICAgIH1cclxuICAgIHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZCA9IGN1cnNvclBvcztcclxuXHJcbiAgICBpZiAocmVzICE9PSB0aGlzLl9vbGRWYWx1ZSkgdGhpcy5maXJlRXZlbnQoXCJhY2NlcHRcIik7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgb24gKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHRoaXMuX2xpc3RlbmVyc1tldl0gPSBbXTtcclxuICAgIHRoaXMuX2xpc3RlbmVyc1tldl0ucHVzaChoYW5kbGVyKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgb2ZmIChldiwgaGFuZGxlcikge1xyXG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbZXZdKSByZXR1cm47XHJcbiAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tldl07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBoSW5kZXggPSB0aGlzLl9saXN0ZW5lcnNbZXZdLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICBpZiAoaEluZGV4ID49IDApIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaEluZGV4LCAxKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZmlyZUV2ZW50IChldikge1xyXG4gICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1tldl0gfHwgW107XHJcbiAgICBsaXN0ZW5lcnMuZm9yRWFjaChsID0+IGwoKSk7XHJcbiAgfVxyXG5cclxuICAvLyBvdmVycmlkZSB0aGlzXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7IHJldHVybiBzdHI7IH1cclxuXHJcbiAgZ2V0IHJhd1ZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLmVsLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHJhd1ZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLmVsLnZhbHVlID0gc3RyO1xyXG4gICAgdGhpcy5lbmRSZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbC52YWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlICh2YWx1ZSkge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuZWwudmFsdWUgPSB2YWx1ZTtcclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgcmVmcmVzaCAoKSB7XHJcbiAgICBpZiAodGhpcy5fcmVmcmVzaGluZ0NvdW50KSByZXR1cm47XHJcbiAgICB2YXIgc3RyID0gdGhpcy5lbC52YWx1ZTtcclxuICAgIHZhciBkZXRhaWxzID0ge1xyXG4gICAgICBjdXJzb3JQb3M6IHRoaXMuZWwudmFsdWUubGVuZ3RoLFxyXG4gICAgICBzdGFydENoYW5nZVBvczogMCxcclxuICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiB0aGlzLmVsLnZhbHVlLmxlbmd0aFxyXG4gICAgICB9LFxyXG4gICAgICByZW1vdmVkQ291bnQ6IHRoaXMuZWwudmFsdWUubGVuZ3RoLFxyXG4gICAgICBpbnNlcnRlZENvdW50OiBzdHIubGVuZ3RoLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5lbC52YWx1ZVxyXG4gICAgfTtcclxuICAgIHRoaXMuZWwudmFsdWUgPSBjb25mb3JtKHRoaXMucmVzb2x2ZShzdHIsIGRldGFpbHMpLCB0aGlzLmVsLnZhbHVlKTtcclxuICB9XHJcblxyXG4gIHN0YXJ0UmVmcmVzaCAoKSB7XHJcbiAgICArK3RoaXMuX3JlZnJlc2hpbmdDb3VudDtcclxuICB9XHJcblxyXG4gIGVuZFJlZnJlc2ggKCkge1xyXG4gICAgLS10aGlzLl9yZWZyZXNoaW5nQ291bnQ7XHJcbiAgICBpZiAoIXRoaXMuX3JlZnJlc2hpbmdDb3VudCkgdGhpcy5yZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBfb25Ecm9wIChldikge1xyXG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFJlZ0V4cE1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoc3RyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrLnRlc3Qoc3RyKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBGdW5jTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlICguLi5hcmdzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrKC4uLmFyZ3MpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge2NvbmZvcm19IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGF0dGVybk1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICBzdXBlcihlbCwgb3B0cyk7XHJcbiAgICB0aGlzLnN0YXJ0UmVmcmVzaCgpO1xyXG5cclxuICAgIHRoaXMucGxhY2Vob2xkZXIgPSBvcHRzLnBsYWNlaG9sZGVyO1xyXG4gICAgdGhpcy5kZWZpbml0aW9ucyA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGSU5JVElPTlMsXHJcbiAgICAgIC4uLm9wdHMuZGVmaW5pdGlvbnNcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5faG9sbG93cyA9IFtdO1xyXG4gICAgdGhpcy5fYnVpbGRSZXNvbHZlcnMoKTtcclxuXHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIuYmluZEV2ZW50cygpO1xyXG4gICAgWydjbGljaycsICdmb2N1cyddLmZvckVhY2goZXYgPT5cclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKGV2LCB0aGlzLl9hbGlnbkN1cnNvci5iaW5kKHRoaXMpKSk7XHJcbiAgfVxyXG5cclxuICBfYnVpbGRSZXNvbHZlcnMgKCkge1xyXG4gICAgdGhpcy5fY2hhckRlZnMgPSBbXTtcclxuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5tYXNrO1xyXG5cclxuICAgIGlmICghcGF0dGVybiB8fCAhdGhpcy5kZWZpbml0aW9ucykgcmV0dXJuO1xyXG5cclxuICAgIHZhciB1bm1hc2tpbmdCbG9jayA9IGZhbHNlO1xyXG4gICAgdmFyIG9wdGlvbmFsQmxvY2sgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgIHZhciB0eXBlID0gIXVubWFza2luZ0Jsb2NrICYmIGNoIGluIHRoaXMuZGVmaW5pdGlvbnMgP1xyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCA6XHJcbiAgICAgICAgUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB2YXIgdW5tYXNraW5nID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUIHx8IHVubWFza2luZ0Jsb2NrO1xyXG4gICAgICB2YXIgb3B0aW9uYWwgPSB0eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgb3B0aW9uYWxCbG9jaztcclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ3snIHx8IGNoID09PSAnfScpIHtcclxuICAgICAgICB1bm1hc2tpbmdCbG9jayA9ICF1bm1hc2tpbmdCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSAnWycgfHwgY2ggPT09ICddJykge1xyXG4gICAgICAgIG9wdGlvbmFsQmxvY2sgPSAhb3B0aW9uYWxCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSAnXFxcXCcpIHtcclxuICAgICAgICArK2k7XHJcbiAgICAgICAgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICAgIC8vIFRPRE8gdmFsaWRhdGlvblxyXG4gICAgICAgIGlmICghY2gpIGJyZWFrO1xyXG4gICAgICAgIHR5cGUgPSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2NoYXJEZWZzLnB1c2goe1xyXG4gICAgICAgIGNoYXI6IGNoLFxyXG4gICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgb3B0aW9uYWw6IG9wdGlvbmFsLFxyXG4gICAgICAgIHVubWFza2luZzogdW5tYXNraW5nXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3Jlc29sdmVycyA9IHt9O1xyXG4gICAgZm9yICh2YXIgZGVmS2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgdGhpcy5fcmVzb2x2ZXJzW2RlZktleV0gPSBJTWFzay5NYXNrRmFjdG9yeSh0aGlzLmVsLCB7XHJcbiAgICAgICAgbWFzazogdGhpcy5kZWZpbml0aW9uc1tkZWZLZXldXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX3RyeUFwcGVuZFRhaWwgKHN0ciwgdGFpbCkge1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXN0ci5sZW5ndGg7IGNpIDwgdGFpbC5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gdGFpbFtjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICAvLyBmYWlsZWRcclxuICAgICAgaWYgKCFkZWYpIHJldHVybjtcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgdmFyIHJlc29sdmVyID0gdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXTtcclxuICAgICAgICB2YXIgY2hyZXMgPSByZXNvbHZlci5yZXNvbHZlKGNoLCBkaSwgc3RyKSB8fCAnJztcclxuICAgICAgICBpZiAoY2hyZXMpIHtcclxuICAgICAgICAgIGNocmVzID0gY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgICAgKytjaTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY2hyZXMgPSB0aGlzLl9wbGFjZWhvbGRlci5jaGFyO1xyXG4gICAgICAgICAgaG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RyICs9IHBsYWNlaG9sZGVyQnVmZmVyICsgY2hyZXM7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciArPSBkZWYuY2hhcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbc3RyLCBob2xsb3dzXTtcclxuICB9XHJcblxyXG4gIF9leHRyYWN0SW5wdXQgKHN0ciwgc3RhcnREZWZJbmRleD0wKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAnJztcclxuICAgIGZvciAodmFyIGRpPXN0YXJ0RGVmSW5kZXgsIGNpPTA7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2NpLCArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJlxyXG4gICAgICAgIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkaSkgPCAwKSBpbnB1dCArPSBjaDtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIF9nZW5lcmF0ZUluc2VydFN0ZXBzIChoZWFkLCBpbnNlcnRlZCkge1xyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcblxyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaW5zZXJ0U3RlcHMgPSBbcmVzXTtcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPWhlYWQubGVuZ3RoOyBjaTxpbnNlcnRlZC5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIHZhciBjaCA9IGluc2VydGVkW2NpXTtcclxuICAgICAgdmFyIGNocmVzID0gJyc7XHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgdmFyIHJlc29sdmVyID0gdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXTtcclxuICAgICAgICBjaHJlcyA9IHJlc29sdmVyLnJlc29sdmUoY2gsIGNpKSB8fCAnJztcclxuICAgICAgICAvLyBpZiBvayAtIG5leHQgZGlcclxuICAgICAgICBpZiAoY2hyZXMpIHtcclxuICAgICAgICAgICsrZGk7XHJcbiAgICAgICAgICByZXMgKz0gcGxhY2Vob2xkZXJCdWZmZXI7IHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICAgICAgICBjaHJlcyA9IGNvbmZvcm0oY2hyZXMsIGNoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKytjaTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciArPSBkZWYuY2hhcjtcclxuXHJcbiAgICAgICAgaWYgKGNoID09PSBkZWYuY2hhcikgKytjaTtcclxuICAgICAgICArK2RpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXMgKz0gY2hyZXM7XHJcbiAgICAgIGluc2VydFN0ZXBzW2NpXSA9IHJlcztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaW5zZXJ0U3RlcHM7XHJcbiAgfVxyXG5cclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHtcclxuICAgIHZhciBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICAgIHZhciBvbGRTZWxlY3Rpb24gPSBkZXRhaWxzLm9sZFNlbGVjdGlvbjtcclxuICAgIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcbiAgICB2YXIgc3RhcnRDaGFuZ2VQb3MgPSBNYXRoLm1pbihjdXJzb3JQb3MsIG9sZFNlbGVjdGlvbi5zdGFydCk7XHJcbiAgICAvLyBNYXRoLm1heCBmb3Igb3Bwb3NpdGUgb3BlcmF0aW9uXHJcbiAgICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgICAgLy8gZm9yIERlbGV0ZVxyXG4gICAgICBvbGRWYWx1ZS5sZW5ndGggLSBzdHIubGVuZ3RoLCAwKTtcclxuICAgIHZhciBpbnNlcnRlZENvdW50ID0gY3Vyc29yUG9zIC0gc3RhcnRDaGFuZ2VQb3M7XHJcblxyXG5cclxuICAgIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyk7XHJcbiAgICB2YXIgdGFpbCA9IHN0ci5zdWJzdHJpbmcoc3RhcnRDaGFuZ2VQb3MgKyBpbnNlcnRlZENvdW50KTtcclxuICAgIHZhciBpbnNlcnRlZCA9IHN0ci5zdWJzdHIoc3RhcnRDaGFuZ2VQb3MsIGluc2VydGVkQ291bnQpO1xyXG5cclxuICAgIHZhciB0YWlsSW5wdXQgPSB0aGlzLl9leHRyYWN0SW5wdXQodGFpbCwgc3RhcnRDaGFuZ2VQb3MgKyByZW1vdmVkQ291bnQpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBob2xsb3dzIGFmdGVyIGN1cnNvclxyXG4gICAgdGhpcy5faG9sbG93cyA9IHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IHN0YXJ0Q2hhbmdlUG9zKTtcclxuXHJcbiAgICB2YXIgaW5zZXJ0U3RlcHMgPSB0aGlzLl9nZW5lcmF0ZUluc2VydFN0ZXBzKGhlYWQsIGluc2VydGVkKTtcclxuXHJcbiAgICB2YXIgcmVzID0gaGVhZDtcclxuICAgIGZvciAodmFyIGlzdGVwPWluc2VydFN0ZXBzLmxlbmd0aC0xOyBpc3RlcCA+PSAwOyAtLWlzdGVwKSB7XHJcbiAgICAgIHZhciBzdGVwID0gaW5zZXJ0U3RlcHNbaXN0ZXBdO1xyXG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fdHJ5QXBwZW5kVGFpbChzdGVwLCB0YWlsSW5wdXQpO1xyXG4gICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgW3JlcywgdGhpcy5faG9sbG93c10gPSByZXN1bHQ7XHJcbiAgICAgICAgY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGVmO1xyXG4gICAgLy8gYXBwZW5kIGZpeGVkIGF0IGVuZCBpZiBpbnNlcnRlZFxyXG4gICAgaWYgKGluc2VydGVkKSB7XHJcbiAgICAgIHZhciBhcHBlbmRlZCA9IHRoaXMuX2FwcGVuZEZpeGVkRW5kKHJlcyk7XHJcbiAgICAgIGN1cnNvclBvcyArPSBhcHBlbmRlZC5sZW5ndGggLSByZXMubGVuZ3RoO1xyXG4gICAgICByZXMgPSBhcHBlbmRlZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgaGVhZCBmaXhlZCBhbmQgaG9sbG93cyBpZiByZW1vdmVkIGF0IGVuZFxyXG4gICAgaWYgKCFpbnNlcnRlZCAmJiBjdXJzb3JQb3MgPT09IHJlcy5sZW5ndGgpIHtcclxuICAgICAgdmFyIGRpID0gY3Vyc29yUG9zIC0gMTtcclxuICAgICAgdmFyIGhhc0hvbGxvd3MgPSBmYWxzZTtcclxuICAgICAgZm9yICg7IGRpID4gMDsgLS1kaSkge1xyXG4gICAgICAgIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkaSkgPj0gMCkgaGFzSG9sbG93cyA9IHRydWU7XHJcbiAgICAgICAgICBlbHNlIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoaGFzSG9sbG93cykgcmVzID0gcmVzLnNsaWNlKDAsIGRpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhcHBlbmQgcGxhY2Vob2xkZXJcclxuICAgIGlmICh0aGlzLl9wbGFjZWhvbGRlci5zaG93ID09PSBQYXR0ZXJuTWFzay5TSE9XX1BIX1RZUEVTLkFMV0FZUykge1xyXG4gICAgICByZXMgPSB0aGlzLl9hcHBlbmRQbGFjZWhvbGRlckVuZChyZXMpO1xyXG4gICAgfVxyXG4gICAgZGV0YWlscy5jdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcblxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIHByb2Nlc3NJbnB1dCAoZXYpIHtcclxuICAgIHZhciByZXMgPSBzdXBlci5wcm9jZXNzSW5wdXQoZXYpO1xyXG4gICAgaWYgKHJlcyAhPT0gdGhpcy5fb2xkVmFsdWUgJiYgdGhpcy5faXNDb21wbGV0ZShyZXMpKSB0aGlzLmZpcmVFdmVudChcImNvbXBsZXRlXCIpO1xyXG4gIH1cclxuXHJcbiAgX2lzQ29tcGxldGUgKHN0cikge1xyXG4gICAgdmFyIGRlZklucHV0cyA9IHRoaXMuX2NoYXJEZWZzLmZpbHRlcihkZWYgPT4gZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCk7XHJcbiAgICByZXR1cm4gdGhpcy5fZXh0cmFjdElucHV0KHN0cikubGVuZ3RoID09PSBkZWZJbnB1dHMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZEZpeGVkRW5kIChyZXMpIHtcclxuICAgIHZhciBwb3MgPSByZXMubGVuZ3RoO1xyXG4gICAgZm9yICg7OyArK3Bvcykge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbcG9zXTtcclxuICAgICAgaWYgKCFkZWYgfHwgZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIGlmIChwb3MgPj0gcmVzLmxlbmd0aCkgcmVzICs9IGRlZi5jaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9hcHBlbmRQbGFjZWhvbGRlckVuZCAocmVzKSB7XHJcbiAgICB2YXIgcGhMYWJlbCA9IHRoaXMucGxhY2Vob2xkZXJMYWJlbDtcclxuICAgIGZvciAodmFyIGhpPXJlcy5sZW5ndGg7IGhpPHBoTGFiZWwubGVuZ3RoOyArK2hpKSB7XHJcbiAgICAgIGlmICh0aGlzLl9jaGFyRGVmc1toaV0udHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKVxyXG4gICAgICAgIHRoaXMuX2hvbGxvd3MucHVzaChoaSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzICsgcGhMYWJlbC5zdWJzdHIocmVzLmxlbmd0aCk7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICB2YXIgc3RyID0gdGhpcy5lbC52YWx1ZTtcclxuICAgIHZhciB1bm1hc2tlZCA9ICcnO1xyXG4gICAgZm9yICh2YXIgY2k9MDsgY2k8c3RyLmxlbmd0aCAmJiBjaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrY2kpIHtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2NpXTtcclxuXHJcbiAgICAgIGlmIChkZWYudW5tYXNraW5nICYmIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihjaSkgPCAwICYmXHJcbiAgICAgICAgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXS5yZXNvbHZlKGNoLCBjaSkgfHxcclxuICAgICAgICAgIGRlZi5jaGFyID09PSBjaCkpIHtcclxuICAgICAgICB1bm1hc2tlZCArPSBjaDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVubWFza2VkO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHN0cikge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuXHJcbiAgICB2YXIgcmVzID0gJyc7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT0wOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDspIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuXHJcbiAgICAgIHZhciBjaHJlcyA9ICcnO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdLnJlc29sdmUoY2gsIGNpKSkge1xyXG4gICAgICAgICAgY2hyZXMgPSBjaDtcclxuICAgICAgICAgICsrZGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hyZXMgPSBkZWYuY2hhcjtcclxuICAgICAgICBpZiAoZGVmLnVubWFza2luZyAmJiBkZWYuY2hhciA9PT0gY2gpICsrY2k7XHJcbiAgICAgICAgKytkaTtcclxuICAgICAgfVxyXG4gICAgICByZXMgKz0gY2hyZXM7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9ob2xsb3dzLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLmVsLnZhbHVlID0gcmVzO1xyXG5cclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHBsYWNlaG9sZGVyICgpIHsgcmV0dXJuIHRoaXMuX3BsYWNlaG9sZGVyOyB9XHJcblxyXG4gIHNldCBwbGFjZWhvbGRlciAocGgpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUixcclxuICAgICAgLi4ucGhcclxuICAgIH07XHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlckxhYmVsICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGFyRGVmcy5tYXAoZGVmID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgJycpLmpvaW4oJycpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRlZmluaXRpb25zICgpIHsgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zOyB9XHJcblxyXG4gIHNldCBkZWZpbml0aW9ucyAoZGVmcykge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmcztcclxuICAgIHRoaXMuX2J1aWxkUmVzb2x2ZXJzKCk7XHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGdldCBtYXNrICgpIHsgcmV0dXJuIHRoaXMuX21hc2s7IH1cclxuXHJcbiAgc2V0IG1hc2sgKG1hc2spIHtcclxuICAgIHZhciBpbml0aWFsaXplZCA9IHRoaXMuX21hc2s7XHJcbiAgICBpZiAoaW5pdGlhbGl6ZWQpIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLl9tYXNrID0gbWFzaztcclxuICAgIGlmIChpbml0aWFsaXplZCkge1xyXG4gICAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG4gICAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9hbGlnbkN1cnNvciAoKSB7XHJcbiAgICB2YXIgY3Vyc29yUG9zID0gdGhpcy5lbC5zZWxlY3Rpb25FbmQ7XHJcbiAgICBmb3IgKHZhciByUG9zID0gY3Vyc29yUG9zOyByUG9zID49IDA7IC0tclBvcykge1xyXG4gICAgICB2YXIgckRlZiA9IHRoaXMuX2NoYXJEZWZzW3JQb3NdO1xyXG4gICAgICB2YXIgbFBvcyA9IHJQb3MtMTtcclxuICAgICAgdmFyIGxEZWYgPSB0aGlzLl9jaGFyRGVmc1tsUG9zXTtcclxuICAgICAgaWYgKCghckRlZiB8fCByRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9ob2xsb3dzLmluZGV4T2YoclBvcykgPiAtMSkgJiZcclxuICAgICAgICB0aGlzLl9ob2xsb3dzLmluZGV4T2YobFBvcykgPCAwKSB7XHJcbiAgICAgICAgY3Vyc29yUG9zID0gclBvcztcclxuICAgICAgICBpZiAoIWxEZWYgfHwgbERlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmVsLnNlbGVjdGlvblN0YXJ0ID0gdGhpcy5lbC5zZWxlY3Rpb25FbmQgPSBjdXJzb3JQb3M7XHJcbiAgfVxyXG59XHJcblBhdHRlcm5NYXNrLkRFRklOSVRJT05TID0ge1xyXG4gICcwJzogL1xcZC8sXHJcbiAgJ2EnOiAvW1xcdTAwNDEtXFx1MDA1QVxcdTAwNjEtXFx1MDA3QVxcdTAwQUFcXHUwMEI1XFx1MDBCQVxcdTAwQzAtXFx1MDBENlxcdTAwRDgtXFx1MDBGNlxcdTAwRjgtXFx1MDJDMVxcdTAyQzYtXFx1MDJEMVxcdTAyRTAtXFx1MDJFNFxcdTAyRUNcXHUwMkVFXFx1MDM3MC1cXHUwMzc0XFx1MDM3NlxcdTAzNzdcXHUwMzdBLVxcdTAzN0RcXHUwMzg2XFx1MDM4OC1cXHUwMzhBXFx1MDM4Q1xcdTAzOEUtXFx1MDNBMVxcdTAzQTMtXFx1MDNGNVxcdTAzRjctXFx1MDQ4MVxcdTA0OEEtXFx1MDUyN1xcdTA1MzEtXFx1MDU1NlxcdTA1NTlcXHUwNTYxLVxcdTA1ODdcXHUwNUQwLVxcdTA1RUFcXHUwNUYwLVxcdTA1RjJcXHUwNjIwLVxcdTA2NEFcXHUwNjZFXFx1MDY2RlxcdTA2NzEtXFx1MDZEM1xcdTA2RDVcXHUwNkU1XFx1MDZFNlxcdTA2RUVcXHUwNkVGXFx1MDZGQS1cXHUwNkZDXFx1MDZGRlxcdTA3MTBcXHUwNzEyLVxcdTA3MkZcXHUwNzRELVxcdTA3QTVcXHUwN0IxXFx1MDdDQS1cXHUwN0VBXFx1MDdGNFxcdTA3RjVcXHUwN0ZBXFx1MDgwMC1cXHUwODE1XFx1MDgxQVxcdTA4MjRcXHUwODI4XFx1MDg0MC1cXHUwODU4XFx1MDhBMFxcdTA4QTItXFx1MDhBQ1xcdTA5MDQtXFx1MDkzOVxcdTA5M0RcXHUwOTUwXFx1MDk1OC1cXHUwOTYxXFx1MDk3MS1cXHUwOTc3XFx1MDk3OS1cXHUwOTdGXFx1MDk4NS1cXHUwOThDXFx1MDk4RlxcdTA5OTBcXHUwOTkzLVxcdTA5QThcXHUwOUFBLVxcdTA5QjBcXHUwOUIyXFx1MDlCNi1cXHUwOUI5XFx1MDlCRFxcdTA5Q0VcXHUwOURDXFx1MDlERFxcdTA5REYtXFx1MDlFMVxcdTA5RjBcXHUwOUYxXFx1MEEwNS1cXHUwQTBBXFx1MEEwRlxcdTBBMTBcXHUwQTEzLVxcdTBBMjhcXHUwQTJBLVxcdTBBMzBcXHUwQTMyXFx1MEEzM1xcdTBBMzVcXHUwQTM2XFx1MEEzOFxcdTBBMzlcXHUwQTU5LVxcdTBBNUNcXHUwQTVFXFx1MEE3Mi1cXHUwQTc0XFx1MEE4NS1cXHUwQThEXFx1MEE4Ri1cXHUwQTkxXFx1MEE5My1cXHUwQUE4XFx1MEFBQS1cXHUwQUIwXFx1MEFCMlxcdTBBQjNcXHUwQUI1LVxcdTBBQjlcXHUwQUJEXFx1MEFEMFxcdTBBRTBcXHUwQUUxXFx1MEIwNS1cXHUwQjBDXFx1MEIwRlxcdTBCMTBcXHUwQjEzLVxcdTBCMjhcXHUwQjJBLVxcdTBCMzBcXHUwQjMyXFx1MEIzM1xcdTBCMzUtXFx1MEIzOVxcdTBCM0RcXHUwQjVDXFx1MEI1RFxcdTBCNUYtXFx1MEI2MVxcdTBCNzFcXHUwQjgzXFx1MEI4NS1cXHUwQjhBXFx1MEI4RS1cXHUwQjkwXFx1MEI5Mi1cXHUwQjk1XFx1MEI5OVxcdTBCOUFcXHUwQjlDXFx1MEI5RVxcdTBCOUZcXHUwQkEzXFx1MEJBNFxcdTBCQTgtXFx1MEJBQVxcdTBCQUUtXFx1MEJCOVxcdTBCRDBcXHUwQzA1LVxcdTBDMENcXHUwQzBFLVxcdTBDMTBcXHUwQzEyLVxcdTBDMjhcXHUwQzJBLVxcdTBDMzNcXHUwQzM1LVxcdTBDMzlcXHUwQzNEXFx1MEM1OFxcdTBDNTlcXHUwQzYwXFx1MEM2MVxcdTBDODUtXFx1MEM4Q1xcdTBDOEUtXFx1MEM5MFxcdTBDOTItXFx1MENBOFxcdTBDQUEtXFx1MENCM1xcdTBDQjUtXFx1MENCOVxcdTBDQkRcXHUwQ0RFXFx1MENFMFxcdTBDRTFcXHUwQ0YxXFx1MENGMlxcdTBEMDUtXFx1MEQwQ1xcdTBEMEUtXFx1MEQxMFxcdTBEMTItXFx1MEQzQVxcdTBEM0RcXHUwRDRFXFx1MEQ2MFxcdTBENjFcXHUwRDdBLVxcdTBEN0ZcXHUwRDg1LVxcdTBEOTZcXHUwRDlBLVxcdTBEQjFcXHUwREIzLVxcdTBEQkJcXHUwREJEXFx1MERDMC1cXHUwREM2XFx1MEUwMS1cXHUwRTMwXFx1MEUzMlxcdTBFMzNcXHUwRTQwLVxcdTBFNDZcXHUwRTgxXFx1MEU4MlxcdTBFODRcXHUwRTg3XFx1MEU4OFxcdTBFOEFcXHUwRThEXFx1MEU5NC1cXHUwRTk3XFx1MEU5OS1cXHUwRTlGXFx1MEVBMS1cXHUwRUEzXFx1MEVBNVxcdTBFQTdcXHUwRUFBXFx1MEVBQlxcdTBFQUQtXFx1MEVCMFxcdTBFQjJcXHUwRUIzXFx1MEVCRFxcdTBFQzAtXFx1MEVDNFxcdTBFQzZcXHUwRURDLVxcdTBFREZcXHUwRjAwXFx1MEY0MC1cXHUwRjQ3XFx1MEY0OS1cXHUwRjZDXFx1MEY4OC1cXHUwRjhDXFx1MTAwMC1cXHUxMDJBXFx1MTAzRlxcdTEwNTAtXFx1MTA1NVxcdTEwNUEtXFx1MTA1RFxcdTEwNjFcXHUxMDY1XFx1MTA2NlxcdTEwNkUtXFx1MTA3MFxcdTEwNzUtXFx1MTA4MVxcdTEwOEVcXHUxMEEwLVxcdTEwQzVcXHUxMEM3XFx1MTBDRFxcdTEwRDAtXFx1MTBGQVxcdTEwRkMtXFx1MTI0OFxcdTEyNEEtXFx1MTI0RFxcdTEyNTAtXFx1MTI1NlxcdTEyNThcXHUxMjVBLVxcdTEyNURcXHUxMjYwLVxcdTEyODhcXHUxMjhBLVxcdTEyOERcXHUxMjkwLVxcdTEyQjBcXHUxMkIyLVxcdTEyQjVcXHUxMkI4LVxcdTEyQkVcXHUxMkMwXFx1MTJDMi1cXHUxMkM1XFx1MTJDOC1cXHUxMkQ2XFx1MTJEOC1cXHUxMzEwXFx1MTMxMi1cXHUxMzE1XFx1MTMxOC1cXHUxMzVBXFx1MTM4MC1cXHUxMzhGXFx1MTNBMC1cXHUxM0Y0XFx1MTQwMS1cXHUxNjZDXFx1MTY2Ri1cXHUxNjdGXFx1MTY4MS1cXHUxNjlBXFx1MTZBMC1cXHUxNkVBXFx1MTcwMC1cXHUxNzBDXFx1MTcwRS1cXHUxNzExXFx1MTcyMC1cXHUxNzMxXFx1MTc0MC1cXHUxNzUxXFx1MTc2MC1cXHUxNzZDXFx1MTc2RS1cXHUxNzcwXFx1MTc4MC1cXHUxN0IzXFx1MTdEN1xcdTE3RENcXHUxODIwLVxcdTE4NzdcXHUxODgwLVxcdTE4QThcXHUxOEFBXFx1MThCMC1cXHUxOEY1XFx1MTkwMC1cXHUxOTFDXFx1MTk1MC1cXHUxOTZEXFx1MTk3MC1cXHUxOTc0XFx1MTk4MC1cXHUxOUFCXFx1MTlDMS1cXHUxOUM3XFx1MUEwMC1cXHUxQTE2XFx1MUEyMC1cXHUxQTU0XFx1MUFBN1xcdTFCMDUtXFx1MUIzM1xcdTFCNDUtXFx1MUI0QlxcdTFCODMtXFx1MUJBMFxcdTFCQUVcXHUxQkFGXFx1MUJCQS1cXHUxQkU1XFx1MUMwMC1cXHUxQzIzXFx1MUM0RC1cXHUxQzRGXFx1MUM1QS1cXHUxQzdEXFx1MUNFOS1cXHUxQ0VDXFx1MUNFRS1cXHUxQ0YxXFx1MUNGNVxcdTFDRjZcXHUxRDAwLVxcdTFEQkZcXHUxRTAwLVxcdTFGMTVcXHUxRjE4LVxcdTFGMURcXHUxRjIwLVxcdTFGNDVcXHUxRjQ4LVxcdTFGNERcXHUxRjUwLVxcdTFGNTdcXHUxRjU5XFx1MUY1QlxcdTFGNURcXHUxRjVGLVxcdTFGN0RcXHUxRjgwLVxcdTFGQjRcXHUxRkI2LVxcdTFGQkNcXHUxRkJFXFx1MUZDMi1cXHUxRkM0XFx1MUZDNi1cXHUxRkNDXFx1MUZEMC1cXHUxRkQzXFx1MUZENi1cXHUxRkRCXFx1MUZFMC1cXHUxRkVDXFx1MUZGMi1cXHUxRkY0XFx1MUZGNi1cXHUxRkZDXFx1MjA3MVxcdTIwN0ZcXHUyMDkwLVxcdTIwOUNcXHUyMTAyXFx1MjEwN1xcdTIxMEEtXFx1MjExM1xcdTIxMTVcXHUyMTE5LVxcdTIxMURcXHUyMTI0XFx1MjEyNlxcdTIxMjhcXHUyMTJBLVxcdTIxMkRcXHUyMTJGLVxcdTIxMzlcXHUyMTNDLVxcdTIxM0ZcXHUyMTQ1LVxcdTIxNDlcXHUyMTRFXFx1MjE4M1xcdTIxODRcXHUyQzAwLVxcdTJDMkVcXHUyQzMwLVxcdTJDNUVcXHUyQzYwLVxcdTJDRTRcXHUyQ0VCLVxcdTJDRUVcXHUyQ0YyXFx1MkNGM1xcdTJEMDAtXFx1MkQyNVxcdTJEMjdcXHUyRDJEXFx1MkQzMC1cXHUyRDY3XFx1MkQ2RlxcdTJEODAtXFx1MkQ5NlxcdTJEQTAtXFx1MkRBNlxcdTJEQTgtXFx1MkRBRVxcdTJEQjAtXFx1MkRCNlxcdTJEQjgtXFx1MkRCRVxcdTJEQzAtXFx1MkRDNlxcdTJEQzgtXFx1MkRDRVxcdTJERDAtXFx1MkRENlxcdTJERDgtXFx1MkRERVxcdTJFMkZcXHUzMDA1XFx1MzAwNlxcdTMwMzEtXFx1MzAzNVxcdTMwM0JcXHUzMDNDXFx1MzA0MS1cXHUzMDk2XFx1MzA5RC1cXHUzMDlGXFx1MzBBMS1cXHUzMEZBXFx1MzBGQy1cXHUzMEZGXFx1MzEwNS1cXHUzMTJEXFx1MzEzMS1cXHUzMThFXFx1MzFBMC1cXHUzMUJBXFx1MzFGMC1cXHUzMUZGXFx1MzQwMC1cXHU0REI1XFx1NEUwMC1cXHU5RkNDXFx1QTAwMC1cXHVBNDhDXFx1QTREMC1cXHVBNEZEXFx1QTUwMC1cXHVBNjBDXFx1QTYxMC1cXHVBNjFGXFx1QTYyQVxcdUE2MkJcXHVBNjQwLVxcdUE2NkVcXHVBNjdGLVxcdUE2OTdcXHVBNkEwLVxcdUE2RTVcXHVBNzE3LVxcdUE3MUZcXHVBNzIyLVxcdUE3ODhcXHVBNzhCLVxcdUE3OEVcXHVBNzkwLVxcdUE3OTNcXHVBN0EwLVxcdUE3QUFcXHVBN0Y4LVxcdUE4MDFcXHVBODAzLVxcdUE4MDVcXHVBODA3LVxcdUE4MEFcXHVBODBDLVxcdUE4MjJcXHVBODQwLVxcdUE4NzNcXHVBODgyLVxcdUE4QjNcXHVBOEYyLVxcdUE4RjdcXHVBOEZCXFx1QTkwQS1cXHVBOTI1XFx1QTkzMC1cXHVBOTQ2XFx1QTk2MC1cXHVBOTdDXFx1QTk4NC1cXHVBOUIyXFx1QTlDRlxcdUFBMDAtXFx1QUEyOFxcdUFBNDAtXFx1QUE0MlxcdUFBNDQtXFx1QUE0QlxcdUFBNjAtXFx1QUE3NlxcdUFBN0FcXHVBQTgwLVxcdUFBQUZcXHVBQUIxXFx1QUFCNVxcdUFBQjZcXHVBQUI5LVxcdUFBQkRcXHVBQUMwXFx1QUFDMlxcdUFBREItXFx1QUFERFxcdUFBRTAtXFx1QUFFQVxcdUFBRjItXFx1QUFGNFxcdUFCMDEtXFx1QUIwNlxcdUFCMDktXFx1QUIwRVxcdUFCMTEtXFx1QUIxNlxcdUFCMjAtXFx1QUIyNlxcdUFCMjgtXFx1QUIyRVxcdUFCQzAtXFx1QUJFMlxcdUFDMDAtXFx1RDdBM1xcdUQ3QjAtXFx1RDdDNlxcdUQ3Q0ItXFx1RDdGQlxcdUY5MDAtXFx1RkE2RFxcdUZBNzAtXFx1RkFEOVxcdUZCMDAtXFx1RkIwNlxcdUZCMTMtXFx1RkIxN1xcdUZCMURcXHVGQjFGLVxcdUZCMjhcXHVGQjJBLVxcdUZCMzZcXHVGQjM4LVxcdUZCM0NcXHVGQjNFXFx1RkI0MFxcdUZCNDFcXHVGQjQzXFx1RkI0NFxcdUZCNDYtXFx1RkJCMVxcdUZCRDMtXFx1RkQzRFxcdUZENTAtXFx1RkQ4RlxcdUZEOTItXFx1RkRDN1xcdUZERjAtXFx1RkRGQlxcdUZFNzAtXFx1RkU3NFxcdUZFNzYtXFx1RkVGQ1xcdUZGMjEtXFx1RkYzQVxcdUZGNDEtXFx1RkY1QVxcdUZGNjYtXFx1RkZCRVxcdUZGQzItXFx1RkZDN1xcdUZGQ0EtXFx1RkZDRlxcdUZGRDItXFx1RkZEN1xcdUZGREEtXFx1RkZEQ10vLCAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjIwNzUwNzBcclxuICAnKic6IC8uL1xyXG59O1xyXG5QYXR0ZXJuTWFzay5ERUZfVFlQRVMgPSB7XHJcbiAgSU5QVVQ6ICdpbnB1dCcsXHJcbiAgRklYRUQ6ICdmaXhlZCdcclxufVxyXG5QYXR0ZXJuTWFzay5ERUZBVUxUX1BMQUNFSE9MREVSID0ge1xyXG4gIHNob3c6ICdpbnNpZGUnLFxyXG4gIGNoYXI6ICdfJ1xyXG59O1xyXG5QYXR0ZXJuTWFzay5TSE9XX1BIX1RZUEVTID0ge1xyXG4gIEFMV0FZUzogJ2Fsd2F5cycsXHJcbiAgSU5TSURFOiAnaW5zaWRlJ1xyXG59XHJcbiIsImltcG9ydCB7aXNTdHJpbmd9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vbWFza3MvYmFzZSc7XHJcbmltcG9ydCBSZWdFeHBNYXNrIGZyb20gJy4vbWFza3MvcmVnZXhwJztcclxuaW1wb3J0IEZ1bmNNYXNrIGZyb20gJy4vbWFza3MvZnVuYyc7XHJcbmltcG9ydCBQYXR0ZXJuTWFzayBmcm9tICcuL21hc2tzL3BhdHRlcm4nO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmZ1bmN0aW9uIElNYXNrIChlbCwgb3B0cz17fSkge1xyXG4gIHZhciBtYXNrID0gSU1hc2suTWFza0ZhY3RvcnkoZWwsIG9wdHMpO1xyXG4gIG1hc2suYmluZEV2ZW50cygpO1xyXG4gIC8vIHJlZnJlc2hcclxuICBtYXNrLnJhd1ZhbHVlID0gZWwudmFsdWU7XHJcbiAgcmV0dXJuIG1hc2s7XHJcbn1cclxuXHJcbklNYXNrLk1hc2tGYWN0b3J5ID0gZnVuY3Rpb24gKGVsLCBvcHRzKSB7XHJcbiAgdmFyIG1hc2sgPSBvcHRzLm1hc2s7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBCYXNlTWFzaykgcmV0dXJuIG1hc2s7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBuZXcgUmVnRXhwTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBGdW5jdGlvbikgcmV0dXJuIG5ldyBGdW5jTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKGlzU3RyaW5nKG1hc2spKSByZXR1cm4gbmV3IFBhdHRlcm5NYXNrKGVsLCBvcHRzKTtcclxuICByZXR1cm4gbmV3IEJhc2VNYXNrKGVsLCBvcHRzKTtcclxufVxyXG5JTWFzay5CYXNlTWFzayA9IEJhc2VNYXNrO1xyXG5JTWFzay5GdW5jTWFzayA9IEZ1bmNNYXNrO1xyXG5JTWFzay5SZWdFeHBNYXNrID0gUmVnRXhwTWFzaztcclxuSU1hc2suUGF0dGVybk1hc2sgPSBQYXR0ZXJuTWFzaztcclxud2luZG93LklNYXNrID0gSU1hc2s7XHJcbiJdLCJuYW1lcyI6WyJpc1N0cmluZyIsInN0ciIsIlN0cmluZyIsImNvbmZvcm0iLCJyZXMiLCJmYWxsYmFjayIsIkJhc2VNYXNrIiwiZWwiLCJvcHRzIiwibWFzayIsIl9saXN0ZW5lcnMiLCJfcmVmcmVzaGluZ0NvdW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsInNhdmVTdGF0ZSIsImJpbmQiLCJwcm9jZXNzSW5wdXQiLCJfb25Ecm9wIiwiZXYiLCJfb2xkVmFsdWUiLCJ2YWx1ZSIsIl9vbGRTZWxlY3Rpb24iLCJzZWxlY3Rpb25TdGFydCIsInNlbGVjdGlvbkVuZCIsImlucHV0VmFsdWUiLCJjdXJzb3JQb3MiLCJkZXRhaWxzIiwicmVzb2x2ZSIsImZpcmVFdmVudCIsImhhbmRsZXIiLCJwdXNoIiwiaEluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImxpc3RlbmVycyIsImZvckVhY2giLCJsIiwibGVuZ3RoIiwicmVmcmVzaCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic3RhcnRSZWZyZXNoIiwiZW5kUmVmcmVzaCIsIlJlZ0V4cE1hc2siLCJ0ZXN0IiwiRnVuY01hc2siLCJQYXR0ZXJuTWFzayIsInBsYWNlaG9sZGVyIiwiZGVmaW5pdGlvbnMiLCJERUZJTklUSU9OUyIsIl9ob2xsb3dzIiwiX2J1aWxkUmVzb2x2ZXJzIiwiX2FsaWduQ3Vyc29yIiwiX2NoYXJEZWZzIiwicGF0dGVybiIsInVubWFza2luZ0Jsb2NrIiwib3B0aW9uYWxCbG9jayIsImkiLCJjaCIsInR5cGUiLCJERUZfVFlQRVMiLCJJTlBVVCIsIkZJWEVEIiwidW5tYXNraW5nIiwib3B0aW9uYWwiLCJfcmVzb2x2ZXJzIiwiZGVmS2V5IiwiSU1hc2siLCJNYXNrRmFjdG9yeSIsInRhaWwiLCJwbGFjZWhvbGRlckJ1ZmZlciIsImhvbGxvd3MiLCJzbGljZSIsImNpIiwiZGkiLCJkZWYiLCJyZXNvbHZlciIsImNoYXIiLCJjaHJlcyIsIl9wbGFjZWhvbGRlciIsInN0YXJ0RGVmSW5kZXgiLCJpbnB1dCIsImhlYWQiLCJpbnNlcnRlZCIsImluc2VydFN0ZXBzIiwib2xkU2VsZWN0aW9uIiwib2xkVmFsdWUiLCJzdGFydENoYW5nZVBvcyIsIk1hdGgiLCJtaW4iLCJzdGFydCIsInJlbW92ZWRDb3VudCIsIm1heCIsImVuZCIsImluc2VydGVkQ291bnQiLCJzdWJzdHJpbmciLCJzdWJzdHIiLCJ0YWlsSW5wdXQiLCJfZXh0cmFjdElucHV0IiwiZmlsdGVyIiwiaCIsIl9nZW5lcmF0ZUluc2VydFN0ZXBzIiwiaXN0ZXAiLCJzdGVwIiwicmVzdWx0IiwiX3RyeUFwcGVuZFRhaWwiLCJhcHBlbmRlZCIsIl9hcHBlbmRGaXhlZEVuZCIsImhhc0hvbGxvd3MiLCJzaG93IiwiU0hPV19QSF9UWVBFUyIsIkFMV0FZUyIsIl9hcHBlbmRQbGFjZWhvbGRlckVuZCIsIl9pc0NvbXBsZXRlIiwiZGVmSW5wdXRzIiwicG9zIiwicGhMYWJlbCIsInBsYWNlaG9sZGVyTGFiZWwiLCJoaSIsInJQb3MiLCJyRGVmIiwibFBvcyIsImxEZWYiLCJ1bm1hc2tlZCIsInBoIiwiREVGQVVMVF9QTEFDRUhPTERFUiIsIm1hcCIsImpvaW4iLCJfZGVmaW5pdGlvbnMiLCJkZWZzIiwiX21hc2siLCJpbml0aWFsaXplZCIsImJpbmRFdmVudHMiLCJyYXdWYWx1ZSIsIlJlZ0V4cCIsIkZ1bmN0aW9uIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxTQUFTQSxRQUFULENBQW1CQyxHQUFuQixFQUF3QjtTQUNmLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxlQUFlQyxNQUFqRDs7O0FBR0YsQUFDQSxTQUFTQyxPQUFULENBQWtCQyxHQUFsQixFQUF1QkgsR0FBdkIsRUFBeUM7TUFBYkksUUFBYSx1RUFBSixFQUFJOztTQUNoQ0wsU0FBU0ksR0FBVCxJQUNMQSxHQURLLEdBRUxBLE1BQ0VILEdBREYsR0FFRUksUUFKSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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