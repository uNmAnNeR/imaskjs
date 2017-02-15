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
      // use unmasked value if value was not changed to update with options correctly
      if (this._oldRawValue === this.el.value) this.el.value = this._oldUnmaskedValue;
      delete this._oldRawValue;
      delete this._oldUnmaskedValue;

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
      // store unmasked value to apply after changes
      if (!this._refreshingCount) {
        this._oldUnmaskedValue = this.unmaskedValue;
        this._oldRawValue = this.rawValue;
      }
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
        if (hasHollows) res = res.slice(0, di + 1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvaW1hc2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0XHJcbmZ1bmN0aW9uIGlzU3RyaW5nIChzdHIpIHtcclxuICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gY29uZm9ybSAocmVzLCBzdHIsIGZhbGxiYWNrPScnKSB7XHJcbiAgcmV0dXJuIGlzU3RyaW5nKHJlcykgP1xyXG4gICAgcmVzIDpcclxuICAgIHJlcyA/XHJcbiAgICAgIHN0ciA6XHJcbiAgICAgIGZhbGxiYWNrO1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuLy8gVE9ET1xyXG4vLyAtIGVtcHR5IHBsYWNlaG9sZGVyXHJcbi8vIC0gdmFsaWRhdGVPbmx5XHJcbi8vIC0gYWRkIGNvbW1lbnRzXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgdGhpcy5fcmVmcmVzaGluZ0NvdW50ID0gMDtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zYXZlU3RhdGUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5wcm9jZXNzSW5wdXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBzYXZlU3RhdGUgKGV2KSB7XHJcbiAgICB0aGlzLl9vbGRWYWx1ZSA9IHRoaXMuZWwudmFsdWU7XHJcbiAgICB0aGlzLl9vbGRTZWxlY3Rpb24gPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLmVsLnNlbGVjdGlvblN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuZWwuc2VsZWN0aW9uRW5kXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzSW5wdXQgKGV2KSB7XHJcbiAgICAgdmFyIGlucHV0VmFsdWUgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgLy8gdXNlIHNlbGVjdGlvbkVuZCBmb3IgaGFuZGxlIFVuZG9cclxuICAgIHZhciBjdXJzb3JQb3MgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuXHJcbiAgICAvLyB2YXIgcmVzID0gaW5wdXRWYWx1ZVxyXG4gICAgLy8gICAuc3BsaXQoJycpXHJcbiAgICAvLyAgIC5tYXAoKGNoLCAuLi5hcmdzKSA9PiB7XHJcbiAgICAvLyAgICAgdmFyIHJlcyA9IHRoaXMuY2hhclJlc29sdmVyLnJlc29sdmUoY2gsIC4uLmFyZ3MpO1xyXG4gICAgLy8gICAgIHJldHVybiBjb25mb3JtKHJlcywgY2gpO1xyXG4gICAgLy8gICB9KVxyXG4gICAgLy8gICAuam9pbignJyk7XHJcblxyXG4gICAgdmFyIGRldGFpbHMgPSB7XHJcbiAgICAgIG9sZFNlbGVjdGlvbjogdGhpcy5fb2xkU2VsZWN0aW9uLFxyXG4gICAgICBjdXJzb3JQb3M6IGN1cnNvclBvcyxcclxuICAgICAgb2xkVmFsdWU6IHRoaXMuX29sZFZhbHVlXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZXMgPSBpbnB1dFZhbHVlO1xyXG4gICAgcmVzID0gY29uZm9ybSh0aGlzLnJlc29sdmUocmVzLCBkZXRhaWxzKSxcclxuICAgICAgcmVzLFxyXG4gICAgICB0aGlzLl9vbGRWYWx1ZSk7XHJcblxyXG4gICAgaWYgKHJlcyAhPT0gaW5wdXRWYWx1ZSkge1xyXG4gICAgICB0aGlzLmVsLnZhbHVlID0gcmVzO1xyXG4gICAgICBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICAgIH1cclxuICAgIHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZCA9IGN1cnNvclBvcztcclxuXHJcbiAgICBpZiAocmVzICE9PSB0aGlzLl9vbGRWYWx1ZSkgdGhpcy5maXJlRXZlbnQoXCJhY2NlcHRcIik7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgb24gKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHRoaXMuX2xpc3RlbmVyc1tldl0gPSBbXTtcclxuICAgIHRoaXMuX2xpc3RlbmVyc1tldl0ucHVzaChoYW5kbGVyKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgb2ZmIChldiwgaGFuZGxlcikge1xyXG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbZXZdKSByZXR1cm47XHJcbiAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tldl07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBoSW5kZXggPSB0aGlzLl9saXN0ZW5lcnNbZXZdLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICBpZiAoaEluZGV4ID49IDApIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaEluZGV4LCAxKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZmlyZUV2ZW50IChldikge1xyXG4gICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1tldl0gfHwgW107XHJcbiAgICBsaXN0ZW5lcnMuZm9yRWFjaChsID0+IGwoKSk7XHJcbiAgfVxyXG5cclxuICAvLyBvdmVycmlkZSB0aGlzXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7IHJldHVybiBzdHI7IH1cclxuXHJcbiAgZ2V0IHJhd1ZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLmVsLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHJhd1ZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLmVsLnZhbHVlID0gc3RyO1xyXG4gICAgdGhpcy5lbmRSZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbC52YWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlICh2YWx1ZSkge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuZWwudmFsdWUgPSB2YWx1ZTtcclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgcmVmcmVzaCAoKSB7XHJcbiAgICAvLyB1c2UgdW5tYXNrZWQgdmFsdWUgaWYgdmFsdWUgd2FzIG5vdCBjaGFuZ2VkIHRvIHVwZGF0ZSB3aXRoIG9wdGlvbnMgY29ycmVjdGx5XHJcbiAgICBpZiAodGhpcy5fb2xkUmF3VmFsdWUgPT09IHRoaXMuZWwudmFsdWUpIHRoaXMuZWwudmFsdWUgPSB0aGlzLl9vbGRVbm1hc2tlZFZhbHVlO1xyXG4gICAgZGVsZXRlIHRoaXMuX29sZFJhd1ZhbHVlO1xyXG4gICAgZGVsZXRlIHRoaXMuX29sZFVubWFza2VkVmFsdWU7XHJcblxyXG4gICAgdmFyIHN0ciA9IHRoaXMuZWwudmFsdWU7XHJcbiAgICB2YXIgZGV0YWlscyA9IHtcclxuICAgICAgY3Vyc29yUG9zOiB0aGlzLmVsLnZhbHVlLmxlbmd0aCxcclxuICAgICAgc3RhcnRDaGFuZ2VQb3M6IDAsXHJcbiAgICAgIG9sZFNlbGVjdGlvbjoge1xyXG4gICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgIGVuZDogdGhpcy5lbC52YWx1ZS5sZW5ndGhcclxuICAgICAgfSxcclxuICAgICAgcmVtb3ZlZENvdW50OiB0aGlzLmVsLnZhbHVlLmxlbmd0aCxcclxuICAgICAgaW5zZXJ0ZWRDb3VudDogc3RyLmxlbmd0aCxcclxuICAgICAgb2xkVmFsdWU6IHRoaXMuZWwudmFsdWVcclxuICAgIH07XHJcbiAgICB0aGlzLmVsLnZhbHVlID0gY29uZm9ybSh0aGlzLnJlc29sdmUoc3RyLCBkZXRhaWxzKSwgdGhpcy5lbC52YWx1ZSk7XHJcbiAgfVxyXG5cclxuICBzdGFydFJlZnJlc2ggKCkge1xyXG4gICAgLy8gc3RvcmUgdW5tYXNrZWQgdmFsdWUgdG8gYXBwbHkgYWZ0ZXIgY2hhbmdlc1xyXG4gICAgaWYgKCF0aGlzLl9yZWZyZXNoaW5nQ291bnQpIHtcclxuICAgICAgdGhpcy5fb2xkVW5tYXNrZWRWYWx1ZSA9IHRoaXMudW5tYXNrZWRWYWx1ZTtcclxuICAgICAgdGhpcy5fb2xkUmF3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlO1xyXG4gICAgfVxyXG4gICAgKyt0aGlzLl9yZWZyZXNoaW5nQ291bnQ7XHJcbiAgfVxyXG5cclxuICBlbmRSZWZyZXNoICgpIHtcclxuICAgIC0tdGhpcy5fcmVmcmVzaGluZ0NvdW50O1xyXG4gICAgaWYgKCF0aGlzLl9yZWZyZXNoaW5nQ291bnQpIHRoaXMucmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgX29uRHJvcCAoZXYpIHtcclxuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBSZWdFeHBNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIHJlc29sdmUgKHN0cikge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzay50ZXN0KHN0cik7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgRnVuY01hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoLi4uYXJncykge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzayguLi5hcmdzKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtjb25mb3JtfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFBhdHRlcm5NYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgc3VwZXIoZWwsIG9wdHMpO1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuXHJcbiAgICB0aGlzLnBsYWNlaG9sZGVyID0gb3B0cy5wbGFjZWhvbGRlcjtcclxuICAgIHRoaXMuZGVmaW5pdGlvbnMgPSB7XHJcbiAgICAgIC4uLlBhdHRlcm5NYXNrLkRFRklOSVRJT05TLFxyXG4gICAgICAuLi5vcHRzLmRlZmluaXRpb25zXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2hvbGxvd3MgPSBbXTtcclxuICAgIHRoaXMuX2J1aWxkUmVzb2x2ZXJzKCk7XHJcblxyXG4gICAgdGhpcy5lbmRSZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLmJpbmRFdmVudHMoKTtcclxuICAgIFsnY2xpY2snLCAnZm9jdXMnXS5mb3JFYWNoKGV2ID0+XHJcbiAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihldiwgdGhpcy5fYWxpZ25DdXJzb3IuYmluZCh0aGlzKSkpO1xyXG4gIH1cclxuXHJcbiAgX2J1aWxkUmVzb2x2ZXJzICgpIHtcclxuICAgIHRoaXMuX2NoYXJEZWZzID0gW107XHJcbiAgICB2YXIgcGF0dGVybiA9IHRoaXMubWFzaztcclxuXHJcbiAgICBpZiAoIXBhdHRlcm4gfHwgIXRoaXMuZGVmaW5pdGlvbnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgdW5tYXNraW5nQmxvY2sgPSBmYWxzZTtcclxuICAgIHZhciBvcHRpb25hbEJsb2NrID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8cGF0dGVybi5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICB2YXIgdHlwZSA9ICF1bm1hc2tpbmdCbG9jayAmJiBjaCBpbiB0aGlzLmRlZmluaXRpb25zID9cclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgOlxyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgdmFyIHVubWFza2luZyA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCB8fCB1bm1hc2tpbmdCbG9jaztcclxuICAgICAgdmFyIG9wdGlvbmFsID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIG9wdGlvbmFsQmxvY2s7XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICd7JyB8fCBjaCA9PT0gJ30nKSB7XHJcbiAgICAgICAgdW5tYXNraW5nQmxvY2sgPSAhdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1snIHx8IGNoID09PSAnXScpIHtcclxuICAgICAgICBvcHRpb25hbEJsb2NrID0gIW9wdGlvbmFsQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1xcXFwnKSB7XHJcbiAgICAgICAgKytpO1xyXG4gICAgICAgIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgICAvLyBUT0RPIHZhbGlkYXRpb25cclxuICAgICAgICBpZiAoIWNoKSBicmVhaztcclxuICAgICAgICB0eXBlID0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jaGFyRGVmcy5wdXNoKHtcclxuICAgICAgICBjaGFyOiBjaCxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcclxuICAgICAgICB1bm1hc2tpbmc6IHVubWFza2luZ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9yZXNvbHZlcnMgPSB7fTtcclxuICAgIGZvciAodmFyIGRlZktleSBpbiB0aGlzLmRlZmluaXRpb25zKSB7XHJcbiAgICAgIHRoaXMuX3Jlc29sdmVyc1tkZWZLZXldID0gSU1hc2suTWFza0ZhY3RvcnkodGhpcy5lbCwge1xyXG4gICAgICAgIG1hc2s6IHRoaXMuZGVmaW5pdGlvbnNbZGVmS2V5XVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF90cnlBcHBlbmRUYWlsIChzdHIsIHRhaWwpIHtcclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGhvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLnNsaWNlKCk7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT1zdHIubGVuZ3RoOyBjaSA8IHRhaWwubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHRhaWxbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgLy8gZmFpbGVkXHJcbiAgICAgIGlmICghZGVmKSByZXR1cm47XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgZGksIHN0cikgfHwgJyc7XHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICBjaHJlcyA9IGNvbmZvcm0oY2hyZXMsIGNoKTtcclxuICAgICAgICAgICsrY2k7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNocmVzID0gdGhpcy5fcGxhY2Vob2xkZXIuY2hhcjtcclxuICAgICAgICAgIGhvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0ciArPSBwbGFjZWhvbGRlckJ1ZmZlciArIGNocmVzO1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3N0ciwgaG9sbG93c107XHJcbiAgfVxyXG5cclxuICBfZXh0cmFjdElucHV0IChzdHIsIHN0YXJ0RGVmSW5kZXg9MCkge1xyXG4gICAgdmFyIGlucHV0ID0gJyc7XHJcbiAgICBmb3IgKHZhciBkaT1zdGFydERlZkluZGV4LCBjaT0wOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytjaSwgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiZcclxuICAgICAgICB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGkpIDwgMCkgaW5wdXQgKz0gY2g7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBfZ2VuZXJhdGVJbnNlcnRTdGVwcyAoaGVhZCwgaW5zZXJ0ZWQpIHtcclxuICAgIHZhciByZXMgPSBoZWFkO1xyXG5cclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW3Jlc107XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT1oZWFkLmxlbmd0aDsgY2k8aW5zZXJ0ZWQubGVuZ3RoOykge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcblxyXG4gICAgICB2YXIgY2ggPSBpbnNlcnRlZFtjaV07XHJcbiAgICAgIHZhciBjaHJlcyA9ICcnO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgY2hyZXMgPSByZXNvbHZlci5yZXNvbHZlKGNoLCBjaSkgfHwgJyc7XHJcbiAgICAgICAgLy8gaWYgb2sgLSBuZXh0IGRpXHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICArK2RpO1xyXG4gICAgICAgICAgcmVzICs9IHBsYWNlaG9sZGVyQnVmZmVyOyBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgY2hyZXMgPSBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcblxyXG4gICAgICAgIGlmIChjaCA9PT0gZGVmLmNoYXIpICsrY2k7XHJcbiAgICAgICAgKytkaTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmVzICs9IGNocmVzO1xyXG4gICAgICBpbnNlcnRTdGVwc1tjaV0gPSByZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGluc2VydFN0ZXBzO1xyXG4gIH1cclxuXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgICB2YXIgb2xkU2VsZWN0aW9uID0gZGV0YWlscy5vbGRTZWxlY3Rpb247XHJcbiAgICB2YXIgb2xkVmFsdWUgPSBkZXRhaWxzLm9sZFZhbHVlO1xyXG4gICAgdmFyIHN0YXJ0Q2hhbmdlUG9zID0gTWF0aC5taW4oY3Vyc29yUG9zLCBvbGRTZWxlY3Rpb24uc3RhcnQpO1xyXG4gICAgLy8gTWF0aC5tYXggZm9yIG9wcG9zaXRlIG9wZXJhdGlvblxyXG4gICAgdmFyIHJlbW92ZWRDb3VudCA9IE1hdGgubWF4KChvbGRTZWxlY3Rpb24uZW5kIC0gc3RhcnRDaGFuZ2VQb3MpIHx8XHJcbiAgICAgIC8vIGZvciBEZWxldGVcclxuICAgICAgb2xkVmFsdWUubGVuZ3RoIC0gc3RyLmxlbmd0aCwgMCk7XHJcbiAgICB2YXIgaW5zZXJ0ZWRDb3VudCA9IGN1cnNvclBvcyAtIHN0YXJ0Q2hhbmdlUG9zO1xyXG5cclxuXHJcbiAgICB2YXIgaGVhZCA9IHN0ci5zdWJzdHJpbmcoMCwgc3RhcnRDaGFuZ2VQb3MpO1xyXG4gICAgdmFyIHRhaWwgPSBzdHIuc3Vic3RyaW5nKHN0YXJ0Q2hhbmdlUG9zICsgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgICB2YXIgaW5zZXJ0ZWQgPSBzdHIuc3Vic3RyKHN0YXJ0Q2hhbmdlUG9zLCBpbnNlcnRlZENvdW50KTtcclxuXHJcbiAgICB2YXIgdGFpbElucHV0ID0gdGhpcy5fZXh0cmFjdElucHV0KHRhaWwsIHN0YXJ0Q2hhbmdlUG9zICsgcmVtb3ZlZENvdW50KTtcclxuXHJcbiAgICAvLyByZW1vdmUgaG9sbG93cyBhZnRlciBjdXJzb3JcclxuICAgIHRoaXMuX2hvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLmZpbHRlcihoID0+IGggPCBzdGFydENoYW5nZVBvcyk7XHJcblxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gdGhpcy5fZ2VuZXJhdGVJbnNlcnRTdGVwcyhoZWFkLCBpbnNlcnRlZCk7XHJcblxyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcCA9IGluc2VydFN0ZXBzW2lzdGVwXTtcclxuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX3RyeUFwcGVuZFRhaWwoc3RlcCwgdGFpbElucHV0KTtcclxuICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgIFtyZXMsIHRoaXMuX2hvbGxvd3NdID0gcmVzdWx0O1xyXG4gICAgICAgIGN1cnNvclBvcyA9IHN0ZXAubGVuZ3RoO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRlZjtcclxuICAgIC8vIGFwcGVuZCBmaXhlZCBhdCBlbmQgaWYgaW5zZXJ0ZWRcclxuICAgIGlmIChpbnNlcnRlZCkge1xyXG4gICAgICB2YXIgYXBwZW5kZWQgPSB0aGlzLl9hcHBlbmRGaXhlZEVuZChyZXMpO1xyXG4gICAgICBjdXJzb3JQb3MgKz0gYXBwZW5kZWQubGVuZ3RoIC0gcmVzLmxlbmd0aDtcclxuICAgICAgcmVzID0gYXBwZW5kZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhlYWQgZml4ZWQgYW5kIGhvbGxvd3MgaWYgcmVtb3ZlZCBhdCBlbmRcclxuICAgIGlmICghaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIHZhciBkaSA9IGN1cnNvclBvcyAtIDE7XHJcbiAgICAgIHZhciBoYXNIb2xsb3dzID0gZmFsc2U7XHJcbiAgICAgIGZvciAoOyBkaSA+IDA7IC0tZGkpIHtcclxuICAgICAgICBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGkpID49IDApIGhhc0hvbGxvd3MgPSB0cnVlO1xyXG4gICAgICAgICAgZWxzZSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGhhc0hvbGxvd3MpIHJlcyA9IHJlcy5zbGljZSgwLCBkaSArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFwcGVuZCBwbGFjZWhvbGRlclxyXG4gICAgaWYgKHRoaXMuX3BsYWNlaG9sZGVyLnNob3cgPT09IFBhdHRlcm5NYXNrLlNIT1dfUEhfVFlQRVMuQUxXQVlTKSB7XHJcbiAgICAgIHJlcyA9IHRoaXMuX2FwcGVuZFBsYWNlaG9sZGVyRW5kKHJlcyk7XHJcbiAgICB9XHJcbiAgICBkZXRhaWxzLmN1cnNvclBvcyA9IGN1cnNvclBvcztcclxuXHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChldikge1xyXG4gICAgdmFyIHJlcyA9IHN1cGVyLnByb2Nlc3NJbnB1dChldik7XHJcbiAgICBpZiAocmVzICE9PSB0aGlzLl9vbGRWYWx1ZSAmJiB0aGlzLl9pc0NvbXBsZXRlKHJlcykpIHRoaXMuZmlyZUV2ZW50KFwiY29tcGxldGVcIik7XHJcbiAgfVxyXG5cclxuICBfaXNDb21wbGV0ZSAoc3RyKSB7XHJcbiAgICB2YXIgZGVmSW5wdXRzID0gdGhpcy5fY2hhckRlZnMuZmlsdGVyKGRlZiA9PiBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKTtcclxuICAgIHJldHVybiB0aGlzLl9leHRyYWN0SW5wdXQoc3RyKS5sZW5ndGggPT09IGRlZklucHV0cy5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBfYXBwZW5kRml4ZWRFbmQgKHJlcykge1xyXG4gICAgdmFyIHBvcyA9IHJlcy5sZW5ndGg7XHJcbiAgICBmb3IgKDs7ICsrcG9zKSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1twb3NdO1xyXG4gICAgICBpZiAoIWRlZiB8fCBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSBicmVhaztcclxuICAgICAgaWYgKHBvcyA+PSByZXMubGVuZ3RoKSByZXMgKz0gZGVmLmNoYXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFBsYWNlaG9sZGVyRW5kIChyZXMpIHtcclxuICAgIHZhciBwaExhYmVsID0gdGhpcy5wbGFjZWhvbGRlckxhYmVsO1xyXG4gICAgZm9yICh2YXIgaGk9cmVzLmxlbmd0aDsgaGk8cGhMYWJlbC5sZW5ndGg7ICsraGkpIHtcclxuICAgICAgaWYgKHRoaXMuX2NoYXJEZWZzW2hpXS50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpXHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5wdXNoKGhpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXMgKyBwaExhYmVsLnN1YnN0cihyZXMubGVuZ3RoKTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHZhciBzdHIgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgdmFyIHVubWFza2VkID0gJyc7XHJcbiAgICBmb3IgKHZhciBjaT0wOyBjaTxzdHIubGVuZ3RoICYmIGNpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytjaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbY2ldO1xyXG5cclxuICAgICAgaWYgKGRlZi51bm1hc2tpbmcgJiYgdGhpcy5faG9sbG93cy5pbmRleE9mKGNpKSA8IDAgJiZcclxuICAgICAgICAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdLnJlc29sdmUoY2gsIGNpKSB8fFxyXG4gICAgICAgICAgZGVmLmNoYXIgPT09IGNoKSkge1xyXG4gICAgICAgIHVubWFza2VkICs9IGNoO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5tYXNrZWQ7XHJcbiAgfVxyXG5cclxuICBzZXQgdW5tYXNrZWRWYWx1ZSAoc3RyKSB7XHJcbiAgICB0aGlzLnN0YXJ0UmVmcmVzaCgpO1xyXG5cclxuICAgIHZhciByZXMgPSAnJztcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPTA7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOykge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG5cclxuICAgICAgdmFyIGNocmVzID0gJyc7XHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl0ucmVzb2x2ZShjaCwgY2kpKSB7XHJcbiAgICAgICAgICBjaHJlcyA9IGNoO1xyXG4gICAgICAgICAgKytkaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKytjaTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjaHJlcyA9IGRlZi5jaGFyO1xyXG4gICAgICAgIGlmIChkZWYudW5tYXNraW5nICYmIGRlZi5jaGFyID09PSBjaCkgKytjaTtcclxuICAgICAgICArK2RpO1xyXG4gICAgICB9XHJcbiAgICAgIHJlcyArPSBjaHJlcztcclxuICAgIH1cclxuICAgIHRoaXMuX2hvbGxvd3MubGVuZ3RoID0gMDtcclxuICAgIHRoaXMuZWwudmFsdWUgPSByZXM7XHJcblxyXG4gICAgdGhpcy5lbmRSZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgcGxhY2Vob2xkZXIgKCkgeyByZXR1cm4gdGhpcy5fcGxhY2Vob2xkZXI7IH1cclxuXHJcbiAgc2V0IHBsYWNlaG9sZGVyIChwaCkge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuX3BsYWNlaG9sZGVyID0ge1xyXG4gICAgICAuLi5QYXR0ZXJuTWFzay5ERUZBVUxUX1BMQUNFSE9MREVSLFxyXG4gICAgICAuLi5waFxyXG4gICAgfTtcclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHBsYWNlaG9sZGVyTGFiZWwgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NoYXJEZWZzLm1hcChkZWYgPT5cclxuICAgICAgZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCA/XHJcbiAgICAgICAgZGVmLmNoYXIgOlxyXG4gICAgICAgICFkZWYub3B0aW9uYWwgP1xyXG4gICAgICAgICAgdGhpcy5fcGxhY2Vob2xkZXIuY2hhciA6XHJcbiAgICAgICAgICAnJykuam9pbignJyk7XHJcbiAgfVxyXG5cclxuICBnZXQgZGVmaW5pdGlvbnMgKCkgeyByZXR1cm4gdGhpcy5fZGVmaW5pdGlvbnM7IH1cclxuXHJcbiAgc2V0IGRlZmluaXRpb25zIChkZWZzKSB7XHJcbiAgICB0aGlzLnN0YXJ0UmVmcmVzaCgpO1xyXG4gICAgdGhpcy5fZGVmaW5pdGlvbnMgPSBkZWZzO1xyXG4gICAgdGhpcy5fYnVpbGRSZXNvbHZlcnMoKTtcclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IG1hc2sgKCkgeyByZXR1cm4gdGhpcy5fbWFzazsgfVxyXG5cclxuICBzZXQgbWFzayAobWFzaykge1xyXG4gICAgdmFyIGluaXRpYWxpemVkID0gdGhpcy5fbWFzaztcclxuICAgIGlmIChpbml0aWFsaXplZCkgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuX21hc2sgPSBtYXNrO1xyXG4gICAgaWYgKGluaXRpYWxpemVkKSB7XHJcbiAgICAgIHRoaXMuX2J1aWxkUmVzb2x2ZXJzKCk7XHJcbiAgICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2FsaWduQ3Vyc29yICgpIHtcclxuICAgIHZhciBjdXJzb3JQb3MgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuICAgIGZvciAodmFyIHJQb3MgPSBjdXJzb3JQb3M7IHJQb3MgPj0gMDsgLS1yUG9zKSB7XHJcbiAgICAgIHZhciByRGVmID0gdGhpcy5fY2hhckRlZnNbclBvc107XHJcbiAgICAgIHZhciBsUG9zID0gclBvcy0xO1xyXG4gICAgICB2YXIgbERlZiA9IHRoaXMuX2NoYXJEZWZzW2xQb3NdO1xyXG4gICAgICBpZiAoKCFyRGVmIHx8IHJEZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihyUG9zKSA+IC0xKSAmJlxyXG4gICAgICAgIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihsUG9zKSA8IDApIHtcclxuICAgICAgICBjdXJzb3JQb3MgPSByUG9zO1xyXG4gICAgICAgIGlmICghbERlZiB8fCBsRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZCA9IGN1cnNvclBvcztcclxuICB9XHJcbn1cclxuUGF0dGVybk1hc2suREVGSU5JVElPTlMgPSB7XHJcbiAgJzAnOiAvXFxkLyxcclxuICAnYSc6IC9bXFx1MDA0MS1cXHUwMDVBXFx1MDA2MS1cXHUwMDdBXFx1MDBBQVxcdTAwQjVcXHUwMEJBXFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XFx1MDBGOC1cXHUwMkMxXFx1MDJDNi1cXHUwMkQxXFx1MDJFMC1cXHUwMkU0XFx1MDJFQ1xcdTAyRUVcXHUwMzcwLVxcdTAzNzRcXHUwMzc2XFx1MDM3N1xcdTAzN0EtXFx1MDM3RFxcdTAzODZcXHUwMzg4LVxcdTAzOEFcXHUwMzhDXFx1MDM4RS1cXHUwM0ExXFx1MDNBMy1cXHUwM0Y1XFx1MDNGNy1cXHUwNDgxXFx1MDQ4QS1cXHUwNTI3XFx1MDUzMS1cXHUwNTU2XFx1MDU1OVxcdTA1NjEtXFx1MDU4N1xcdTA1RDAtXFx1MDVFQVxcdTA1RjAtXFx1MDVGMlxcdTA2MjAtXFx1MDY0QVxcdTA2NkVcXHUwNjZGXFx1MDY3MS1cXHUwNkQzXFx1MDZENVxcdTA2RTVcXHUwNkU2XFx1MDZFRVxcdTA2RUZcXHUwNkZBLVxcdTA2RkNcXHUwNkZGXFx1MDcxMFxcdTA3MTItXFx1MDcyRlxcdTA3NEQtXFx1MDdBNVxcdTA3QjFcXHUwN0NBLVxcdTA3RUFcXHUwN0Y0XFx1MDdGNVxcdTA3RkFcXHUwODAwLVxcdTA4MTVcXHUwODFBXFx1MDgyNFxcdTA4MjhcXHUwODQwLVxcdTA4NThcXHUwOEEwXFx1MDhBMi1cXHUwOEFDXFx1MDkwNC1cXHUwOTM5XFx1MDkzRFxcdTA5NTBcXHUwOTU4LVxcdTA5NjFcXHUwOTcxLVxcdTA5NzdcXHUwOTc5LVxcdTA5N0ZcXHUwOTg1LVxcdTA5OENcXHUwOThGXFx1MDk5MFxcdTA5OTMtXFx1MDlBOFxcdTA5QUEtXFx1MDlCMFxcdTA5QjJcXHUwOUI2LVxcdTA5QjlcXHUwOUJEXFx1MDlDRVxcdTA5RENcXHUwOUREXFx1MDlERi1cXHUwOUUxXFx1MDlGMFxcdTA5RjFcXHUwQTA1LVxcdTBBMEFcXHUwQTBGXFx1MEExMFxcdTBBMTMtXFx1MEEyOFxcdTBBMkEtXFx1MEEzMFxcdTBBMzJcXHUwQTMzXFx1MEEzNVxcdTBBMzZcXHUwQTM4XFx1MEEzOVxcdTBBNTktXFx1MEE1Q1xcdTBBNUVcXHUwQTcyLVxcdTBBNzRcXHUwQTg1LVxcdTBBOERcXHUwQThGLVxcdTBBOTFcXHUwQTkzLVxcdTBBQThcXHUwQUFBLVxcdTBBQjBcXHUwQUIyXFx1MEFCM1xcdTBBQjUtXFx1MEFCOVxcdTBBQkRcXHUwQUQwXFx1MEFFMFxcdTBBRTFcXHUwQjA1LVxcdTBCMENcXHUwQjBGXFx1MEIxMFxcdTBCMTMtXFx1MEIyOFxcdTBCMkEtXFx1MEIzMFxcdTBCMzJcXHUwQjMzXFx1MEIzNS1cXHUwQjM5XFx1MEIzRFxcdTBCNUNcXHUwQjVEXFx1MEI1Ri1cXHUwQjYxXFx1MEI3MVxcdTBCODNcXHUwQjg1LVxcdTBCOEFcXHUwQjhFLVxcdTBCOTBcXHUwQjkyLVxcdTBCOTVcXHUwQjk5XFx1MEI5QVxcdTBCOUNcXHUwQjlFXFx1MEI5RlxcdTBCQTNcXHUwQkE0XFx1MEJBOC1cXHUwQkFBXFx1MEJBRS1cXHUwQkI5XFx1MEJEMFxcdTBDMDUtXFx1MEMwQ1xcdTBDMEUtXFx1MEMxMFxcdTBDMTItXFx1MEMyOFxcdTBDMkEtXFx1MEMzM1xcdTBDMzUtXFx1MEMzOVxcdTBDM0RcXHUwQzU4XFx1MEM1OVxcdTBDNjBcXHUwQzYxXFx1MEM4NS1cXHUwQzhDXFx1MEM4RS1cXHUwQzkwXFx1MEM5Mi1cXHUwQ0E4XFx1MENBQS1cXHUwQ0IzXFx1MENCNS1cXHUwQ0I5XFx1MENCRFxcdTBDREVcXHUwQ0UwXFx1MENFMVxcdTBDRjFcXHUwQ0YyXFx1MEQwNS1cXHUwRDBDXFx1MEQwRS1cXHUwRDEwXFx1MEQxMi1cXHUwRDNBXFx1MEQzRFxcdTBENEVcXHUwRDYwXFx1MEQ2MVxcdTBEN0EtXFx1MEQ3RlxcdTBEODUtXFx1MEQ5NlxcdTBEOUEtXFx1MERCMVxcdTBEQjMtXFx1MERCQlxcdTBEQkRcXHUwREMwLVxcdTBEQzZcXHUwRTAxLVxcdTBFMzBcXHUwRTMyXFx1MEUzM1xcdTBFNDAtXFx1MEU0NlxcdTBFODFcXHUwRTgyXFx1MEU4NFxcdTBFODdcXHUwRTg4XFx1MEU4QVxcdTBFOERcXHUwRTk0LVxcdTBFOTdcXHUwRTk5LVxcdTBFOUZcXHUwRUExLVxcdTBFQTNcXHUwRUE1XFx1MEVBN1xcdTBFQUFcXHUwRUFCXFx1MEVBRC1cXHUwRUIwXFx1MEVCMlxcdTBFQjNcXHUwRUJEXFx1MEVDMC1cXHUwRUM0XFx1MEVDNlxcdTBFREMtXFx1MEVERlxcdTBGMDBcXHUwRjQwLVxcdTBGNDdcXHUwRjQ5LVxcdTBGNkNcXHUwRjg4LVxcdTBGOENcXHUxMDAwLVxcdTEwMkFcXHUxMDNGXFx1MTA1MC1cXHUxMDU1XFx1MTA1QS1cXHUxMDVEXFx1MTA2MVxcdTEwNjVcXHUxMDY2XFx1MTA2RS1cXHUxMDcwXFx1MTA3NS1cXHUxMDgxXFx1MTA4RVxcdTEwQTAtXFx1MTBDNVxcdTEwQzdcXHUxMENEXFx1MTBEMC1cXHUxMEZBXFx1MTBGQy1cXHUxMjQ4XFx1MTI0QS1cXHUxMjREXFx1MTI1MC1cXHUxMjU2XFx1MTI1OFxcdTEyNUEtXFx1MTI1RFxcdTEyNjAtXFx1MTI4OFxcdTEyOEEtXFx1MTI4RFxcdTEyOTAtXFx1MTJCMFxcdTEyQjItXFx1MTJCNVxcdTEyQjgtXFx1MTJCRVxcdTEyQzBcXHUxMkMyLVxcdTEyQzVcXHUxMkM4LVxcdTEyRDZcXHUxMkQ4LVxcdTEzMTBcXHUxMzEyLVxcdTEzMTVcXHUxMzE4LVxcdTEzNUFcXHUxMzgwLVxcdTEzOEZcXHUxM0EwLVxcdTEzRjRcXHUxNDAxLVxcdTE2NkNcXHUxNjZGLVxcdTE2N0ZcXHUxNjgxLVxcdTE2OUFcXHUxNkEwLVxcdTE2RUFcXHUxNzAwLVxcdTE3MENcXHUxNzBFLVxcdTE3MTFcXHUxNzIwLVxcdTE3MzFcXHUxNzQwLVxcdTE3NTFcXHUxNzYwLVxcdTE3NkNcXHUxNzZFLVxcdTE3NzBcXHUxNzgwLVxcdTE3QjNcXHUxN0Q3XFx1MTdEQ1xcdTE4MjAtXFx1MTg3N1xcdTE4ODAtXFx1MThBOFxcdTE4QUFcXHUxOEIwLVxcdTE4RjVcXHUxOTAwLVxcdTE5MUNcXHUxOTUwLVxcdTE5NkRcXHUxOTcwLVxcdTE5NzRcXHUxOTgwLVxcdTE5QUJcXHUxOUMxLVxcdTE5QzdcXHUxQTAwLVxcdTFBMTZcXHUxQTIwLVxcdTFBNTRcXHUxQUE3XFx1MUIwNS1cXHUxQjMzXFx1MUI0NS1cXHUxQjRCXFx1MUI4My1cXHUxQkEwXFx1MUJBRVxcdTFCQUZcXHUxQkJBLVxcdTFCRTVcXHUxQzAwLVxcdTFDMjNcXHUxQzRELVxcdTFDNEZcXHUxQzVBLVxcdTFDN0RcXHUxQ0U5LVxcdTFDRUNcXHUxQ0VFLVxcdTFDRjFcXHUxQ0Y1XFx1MUNGNlxcdTFEMDAtXFx1MURCRlxcdTFFMDAtXFx1MUYxNVxcdTFGMTgtXFx1MUYxRFxcdTFGMjAtXFx1MUY0NVxcdTFGNDgtXFx1MUY0RFxcdTFGNTAtXFx1MUY1N1xcdTFGNTlcXHUxRjVCXFx1MUY1RFxcdTFGNUYtXFx1MUY3RFxcdTFGODAtXFx1MUZCNFxcdTFGQjYtXFx1MUZCQ1xcdTFGQkVcXHUxRkMyLVxcdTFGQzRcXHUxRkM2LVxcdTFGQ0NcXHUxRkQwLVxcdTFGRDNcXHUxRkQ2LVxcdTFGREJcXHUxRkUwLVxcdTFGRUNcXHUxRkYyLVxcdTFGRjRcXHUxRkY2LVxcdTFGRkNcXHUyMDcxXFx1MjA3RlxcdTIwOTAtXFx1MjA5Q1xcdTIxMDJcXHUyMTA3XFx1MjEwQS1cXHUyMTEzXFx1MjExNVxcdTIxMTktXFx1MjExRFxcdTIxMjRcXHUyMTI2XFx1MjEyOFxcdTIxMkEtXFx1MjEyRFxcdTIxMkYtXFx1MjEzOVxcdTIxM0MtXFx1MjEzRlxcdTIxNDUtXFx1MjE0OVxcdTIxNEVcXHUyMTgzXFx1MjE4NFxcdTJDMDAtXFx1MkMyRVxcdTJDMzAtXFx1MkM1RVxcdTJDNjAtXFx1MkNFNFxcdTJDRUItXFx1MkNFRVxcdTJDRjJcXHUyQ0YzXFx1MkQwMC1cXHUyRDI1XFx1MkQyN1xcdTJEMkRcXHUyRDMwLVxcdTJENjdcXHUyRDZGXFx1MkQ4MC1cXHUyRDk2XFx1MkRBMC1cXHUyREE2XFx1MkRBOC1cXHUyREFFXFx1MkRCMC1cXHUyREI2XFx1MkRCOC1cXHUyREJFXFx1MkRDMC1cXHUyREM2XFx1MkRDOC1cXHUyRENFXFx1MkREMC1cXHUyREQ2XFx1MkREOC1cXHUyRERFXFx1MkUyRlxcdTMwMDVcXHUzMDA2XFx1MzAzMS1cXHUzMDM1XFx1MzAzQlxcdTMwM0NcXHUzMDQxLVxcdTMwOTZcXHUzMDlELVxcdTMwOUZcXHUzMEExLVxcdTMwRkFcXHUzMEZDLVxcdTMwRkZcXHUzMTA1LVxcdTMxMkRcXHUzMTMxLVxcdTMxOEVcXHUzMUEwLVxcdTMxQkFcXHUzMUYwLVxcdTMxRkZcXHUzNDAwLVxcdTREQjVcXHU0RTAwLVxcdTlGQ0NcXHVBMDAwLVxcdUE0OENcXHVBNEQwLVxcdUE0RkRcXHVBNTAwLVxcdUE2MENcXHVBNjEwLVxcdUE2MUZcXHVBNjJBXFx1QTYyQlxcdUE2NDAtXFx1QTY2RVxcdUE2N0YtXFx1QTY5N1xcdUE2QTAtXFx1QTZFNVxcdUE3MTctXFx1QTcxRlxcdUE3MjItXFx1QTc4OFxcdUE3OEItXFx1QTc4RVxcdUE3OTAtXFx1QTc5M1xcdUE3QTAtXFx1QTdBQVxcdUE3RjgtXFx1QTgwMVxcdUE4MDMtXFx1QTgwNVxcdUE4MDctXFx1QTgwQVxcdUE4MEMtXFx1QTgyMlxcdUE4NDAtXFx1QTg3M1xcdUE4ODItXFx1QThCM1xcdUE4RjItXFx1QThGN1xcdUE4RkJcXHVBOTBBLVxcdUE5MjVcXHVBOTMwLVxcdUE5NDZcXHVBOTYwLVxcdUE5N0NcXHVBOTg0LVxcdUE5QjJcXHVBOUNGXFx1QUEwMC1cXHVBQTI4XFx1QUE0MC1cXHVBQTQyXFx1QUE0NC1cXHVBQTRCXFx1QUE2MC1cXHVBQTc2XFx1QUE3QVxcdUFBODAtXFx1QUFBRlxcdUFBQjFcXHVBQUI1XFx1QUFCNlxcdUFBQjktXFx1QUFCRFxcdUFBQzBcXHVBQUMyXFx1QUFEQi1cXHVBQUREXFx1QUFFMC1cXHVBQUVBXFx1QUFGMi1cXHVBQUY0XFx1QUIwMS1cXHVBQjA2XFx1QUIwOS1cXHVBQjBFXFx1QUIxMS1cXHVBQjE2XFx1QUIyMC1cXHVBQjI2XFx1QUIyOC1cXHVBQjJFXFx1QUJDMC1cXHVBQkUyXFx1QUMwMC1cXHVEN0EzXFx1RDdCMC1cXHVEN0M2XFx1RDdDQi1cXHVEN0ZCXFx1RjkwMC1cXHVGQTZEXFx1RkE3MC1cXHVGQUQ5XFx1RkIwMC1cXHVGQjA2XFx1RkIxMy1cXHVGQjE3XFx1RkIxRFxcdUZCMUYtXFx1RkIyOFxcdUZCMkEtXFx1RkIzNlxcdUZCMzgtXFx1RkIzQ1xcdUZCM0VcXHVGQjQwXFx1RkI0MVxcdUZCNDNcXHVGQjQ0XFx1RkI0Ni1cXHVGQkIxXFx1RkJEMy1cXHVGRDNEXFx1RkQ1MC1cXHVGRDhGXFx1RkQ5Mi1cXHVGREM3XFx1RkRGMC1cXHVGREZCXFx1RkU3MC1cXHVGRTc0XFx1RkU3Ni1cXHVGRUZDXFx1RkYyMS1cXHVGRjNBXFx1RkY0MS1cXHVGRjVBXFx1RkY2Ni1cXHVGRkJFXFx1RkZDMi1cXHVGRkM3XFx1RkZDQS1cXHVGRkNGXFx1RkZEMi1cXHVGRkQ3XFx1RkZEQS1cXHVGRkRDXS8sICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjA3NTA3MFxyXG4gICcqJzogLy4vXHJcbn07XHJcblBhdHRlcm5NYXNrLkRFRl9UWVBFUyA9IHtcclxuICBJTlBVVDogJ2lucHV0JyxcclxuICBGSVhFRDogJ2ZpeGVkJ1xyXG59XHJcblBhdHRlcm5NYXNrLkRFRkFVTFRfUExBQ0VIT0xERVIgPSB7XHJcbiAgc2hvdzogJ2luc2lkZScsXHJcbiAgY2hhcjogJ18nXHJcbn07XHJcblBhdHRlcm5NYXNrLlNIT1dfUEhfVFlQRVMgPSB7XHJcbiAgQUxXQVlTOiAnYWx3YXlzJyxcclxuICBJTlNJREU6ICdpbnNpZGUnXHJcbn1cclxuIiwiaW1wb3J0IHtpc1N0cmluZ30gZnJvbSAnLi91dGlscyc7XHJcblxyXG5pbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9tYXNrcy9iYXNlJztcclxuaW1wb3J0IFJlZ0V4cE1hc2sgZnJvbSAnLi9tYXNrcy9yZWdleHAnO1xyXG5pbXBvcnQgRnVuY01hc2sgZnJvbSAnLi9tYXNrcy9mdW5jJztcclxuaW1wb3J0IFBhdHRlcm5NYXNrIGZyb20gJy4vbWFza3MvcGF0dGVybic7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuZnVuY3Rpb24gSU1hc2sgKGVsLCBvcHRzPXt9KSB7XHJcbiAgdmFyIG1hc2sgPSBJTWFzay5NYXNrRmFjdG9yeShlbCwgb3B0cyk7XHJcbiAgbWFzay5iaW5kRXZlbnRzKCk7XHJcbiAgLy8gcmVmcmVzaFxyXG4gIG1hc2sucmF3VmFsdWUgPSBlbC52YWx1ZTtcclxuICByZXR1cm4gbWFzaztcclxufVxyXG5cclxuSU1hc2suTWFza0ZhY3RvcnkgPSBmdW5jdGlvbiAoZWwsIG9wdHMpIHtcclxuICB2YXIgbWFzayA9IG9wdHMubWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEJhc2VNYXNrKSByZXR1cm4gbWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIG5ldyBSZWdFeHBNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSByZXR1cm4gbmV3IEZ1bmNNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAoaXNTdHJpbmcobWFzaykpIHJldHVybiBuZXcgUGF0dGVybk1hc2soZWwsIG9wdHMpO1xyXG4gIHJldHVybiBuZXcgQmFzZU1hc2soZWwsIG9wdHMpO1xyXG59XHJcbklNYXNrLkJhc2VNYXNrID0gQmFzZU1hc2s7XHJcbklNYXNrLkZ1bmNNYXNrID0gRnVuY01hc2s7XHJcbklNYXNrLlJlZ0V4cE1hc2sgPSBSZWdFeHBNYXNrO1xyXG5JTWFzay5QYXR0ZXJuTWFzayA9IFBhdHRlcm5NYXNrO1xyXG53aW5kb3cuSU1hc2sgPSBJTWFzaztcclxuIl0sIm5hbWVzIjpbImlzU3RyaW5nIiwic3RyIiwiU3RyaW5nIiwiY29uZm9ybSIsInJlcyIsImZhbGxiYWNrIiwiQmFzZU1hc2siLCJlbCIsIm9wdHMiLCJtYXNrIiwiX2xpc3RlbmVycyIsIl9yZWZyZXNoaW5nQ291bnQiLCJhZGRFdmVudExpc3RlbmVyIiwic2F2ZVN0YXRlIiwiYmluZCIsInByb2Nlc3NJbnB1dCIsIl9vbkRyb3AiLCJldiIsIl9vbGRWYWx1ZSIsInZhbHVlIiwiX29sZFNlbGVjdGlvbiIsInNlbGVjdGlvblN0YXJ0Iiwic2VsZWN0aW9uRW5kIiwiaW5wdXRWYWx1ZSIsImN1cnNvclBvcyIsImRldGFpbHMiLCJyZXNvbHZlIiwiZmlyZUV2ZW50IiwiaGFuZGxlciIsInB1c2giLCJoSW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwibGlzdGVuZXJzIiwiZm9yRWFjaCIsImwiLCJfb2xkUmF3VmFsdWUiLCJfb2xkVW5tYXNrZWRWYWx1ZSIsImxlbmd0aCIsInVubWFza2VkVmFsdWUiLCJyYXdWYWx1ZSIsInJlZnJlc2giLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInN0YXJ0UmVmcmVzaCIsImVuZFJlZnJlc2giLCJSZWdFeHBNYXNrIiwidGVzdCIsIkZ1bmNNYXNrIiwiUGF0dGVybk1hc2siLCJwbGFjZWhvbGRlciIsImRlZmluaXRpb25zIiwiREVGSU5JVElPTlMiLCJfaG9sbG93cyIsIl9idWlsZFJlc29sdmVycyIsIl9hbGlnbkN1cnNvciIsIl9jaGFyRGVmcyIsInBhdHRlcm4iLCJ1bm1hc2tpbmdCbG9jayIsIm9wdGlvbmFsQmxvY2siLCJpIiwiY2giLCJ0eXBlIiwiREVGX1RZUEVTIiwiSU5QVVQiLCJGSVhFRCIsInVubWFza2luZyIsIm9wdGlvbmFsIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiTWFza0ZhY3RvcnkiLCJ0YWlsIiwicGxhY2Vob2xkZXJCdWZmZXIiLCJob2xsb3dzIiwic2xpY2UiLCJjaSIsImRpIiwiZGVmIiwicmVzb2x2ZXIiLCJjaGFyIiwiY2hyZXMiLCJfcGxhY2Vob2xkZXIiLCJzdGFydERlZkluZGV4IiwiaW5wdXQiLCJoZWFkIiwiaW5zZXJ0ZWQiLCJpbnNlcnRTdGVwcyIsIm9sZFNlbGVjdGlvbiIsIm9sZFZhbHVlIiwic3RhcnRDaGFuZ2VQb3MiLCJNYXRoIiwibWluIiwic3RhcnQiLCJyZW1vdmVkQ291bnQiLCJtYXgiLCJlbmQiLCJpbnNlcnRlZENvdW50Iiwic3Vic3RyaW5nIiwic3Vic3RyIiwidGFpbElucHV0IiwiX2V4dHJhY3RJbnB1dCIsImZpbHRlciIsImgiLCJfZ2VuZXJhdGVJbnNlcnRTdGVwcyIsImlzdGVwIiwic3RlcCIsInJlc3VsdCIsIl90cnlBcHBlbmRUYWlsIiwiYXBwZW5kZWQiLCJfYXBwZW5kRml4ZWRFbmQiLCJoYXNIb2xsb3dzIiwic2hvdyIsIlNIT1dfUEhfVFlQRVMiLCJBTFdBWVMiLCJfYXBwZW5kUGxhY2Vob2xkZXJFbmQiLCJfaXNDb21wbGV0ZSIsImRlZklucHV0cyIsInBvcyIsInBoTGFiZWwiLCJwbGFjZWhvbGRlckxhYmVsIiwiaGkiLCJyUG9zIiwickRlZiIsImxQb3MiLCJsRGVmIiwidW5tYXNrZWQiLCJwaCIsIkRFRkFVTFRfUExBQ0VIT0xERVIiLCJtYXAiLCJqb2luIiwiX2RlZmluaXRpb25zIiwiZGVmcyIsIl9tYXNrIiwiaW5pdGlhbGl6ZWQiLCJiaW5kRXZlbnRzIiwiUmVnRXhwIiwiRnVuY3Rpb24iLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLFNBQVNBLFFBQVQsQ0FBbUJDLEdBQW5CLEVBQXdCO1NBQ2YsT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLGVBQWVDLE1BQWpEOzs7QUFHRixBQUNBLFNBQVNDLE9BQVQsQ0FBa0JDLEdBQWxCLEVBQXVCSCxHQUF2QixFQUF5QztNQUFiSSxRQUFhLHVFQUFKLEVBQUk7O1NBQ2hDTCxTQUFTSSxHQUFULElBQ0xBLEdBREssR0FFTEEsTUFDRUgsR0FERixHQUVFSSxRQUpKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMRjs7Ozs7O0lBT01DO29CQUNTQyxFQUFiLEVBQWlCQyxJQUFqQixFQUF1Qjs7O1NBQ2hCRCxFQUFMLEdBQVVBLEVBQVY7U0FDS0UsSUFBTCxHQUFZRCxLQUFLQyxJQUFqQjs7U0FFS0MsVUFBTCxHQUFrQixFQUFsQjtTQUNLQyxnQkFBTCxHQUF3QixDQUF4Qjs7Ozs7aUNBR1k7V0FDUEosRUFBTCxDQUFRSyxnQkFBUixDQUF5QixTQUF6QixFQUFvQyxLQUFLQyxTQUFMLENBQWVDLElBQWYsQ0FBb0IsSUFBcEIsQ0FBcEM7V0FDS1AsRUFBTCxDQUFRSyxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxLQUFLRyxZQUFMLENBQWtCRCxJQUFsQixDQUF1QixJQUF2QixDQUFsQztXQUNLUCxF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