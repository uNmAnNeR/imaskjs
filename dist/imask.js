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

var BaseMask = function () {
  function BaseMask(el, opts) {
    classCallCheck(this, BaseMask);

    this.el = el;
    this.mask = opts.mask;

    this._listeners = {};
    this._refreshingCount = 0;

    this.saveState = this.saveState.bind(this);
    this.processInput = this.processInput.bind(this);
    this._onDrop = this._onDrop.bind(this);
  }

  createClass(BaseMask, [{
    key: 'bindEvents',
    value: function bindEvents() {
      this.el.addEventListener('keydown', this.saveState);
      this.el.addEventListener('input', this.processInput);
      this.el.addEventListener('drop', this._onDrop);
    }
  }, {
    key: 'unbindEvents',
    value: function unbindEvents() {
      this.el.removeEventListener('keydown', this.saveState);
      this.el.removeEventListener('input', this.processInput);
      this.el.removeEventListener('drop', this._onDrop);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.unbindEvents();
      this._listeners.length = 0;
    }
  }, {
    key: 'saveState',
    value: function saveState(ev) {
      this._oldValue = this.rawValue;
      this._oldSelection = {
        start: this.selectionStart,
        end: this.cursorPos
      };
    }
  }, {
    key: 'processInput',
    value: function processInput(ev) {
      var _this = this;

      var inputValue = this.rawValue;

      // use selectionEnd for handle Undo
      var cursorPos = this.cursorPos;
      var details = {
        oldSelection: this._oldSelection,
        cursorPos: cursorPos,
        oldValue: this._oldValue
      };

      var res = inputValue;
      res = conform(this.resolve(res, details), res, this._oldValue);

      if (res !== inputValue) {
        ++this._refreshingCount;
        this.rawValue = res;
        --this._refreshingCount;
        cursorPos = details.cursorPos;

        this.cursorPos = cursorPos;
        // also queue change cursor for some browsers
        setTimeout(function () {
          return _this.cursorPos = cursorPos;
        }, 0);
      }

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
      ++this._refreshingCount;

      var str = this.rawValue;
      // use unmasked value if value was not changed to update with options correctly
      if (this._oldRawValue === str) str = this._oldUnmaskedValue;
      delete this._oldRawValue;
      delete this._oldUnmaskedValue;

      var details = {
        cursorPos: str.length,
        startChangePos: 0,
        oldSelection: {
          start: 0,
          end: str.length
        },
        removedCount: str.length,
        insertedCount: str.length,
        oldValue: str
      };
      this.rawValue = conform(this.resolve(str, details), str);

      --this._refreshingCount;
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
    key: 'selectionStart',
    get: function get() {
      return this.el.selectionStart;
    }
  }, {
    key: 'cursorPos',
    get: function get() {
      return this.el.selectionEnd;
    },
    set: function set(pos) {
      this.el.setSelectionRange(pos, pos);
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
      return this.rawValue;
    },
    set: function set(value) {
      this.rawValue = value;
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

    _this._alignCursor = _this._alignCursor.bind(_this);

    _this.endRefresh();
    return _this;
  }

  createClass(PatternMask, [{
    key: 'bindEvents',
    value: function bindEvents() {
      var _this2 = this;

      get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), 'bindEvents', this).call(this);
      ['click', 'focus'].forEach(function (ev) {
        return _this2.el.addEventListener(ev, _this2._alignCursor);
      });
    }
  }, {
    key: 'unbindEvents',
    value: function unbindEvents() {
      var _this3 = this;

      get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), 'unbindEvents', this).call(this);
      ['click', 'focus'].forEach(function (ev) {
        return _this3.el.removeEventListener(ev, _this3._alignCursor);
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

      for (var ci = 0, di = this._mapPosToDefIndex(str.length); ci < tail.length; ++di) {
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
            if (!def.optional) chres = this._placeholder.char;
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
      var fromPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var input = '';

      for (var ci = 0, di = this._mapPosToDefIndex(fromPos); ci < str.length && di < this._charDefs.length; ++di) {
        var ch = str[ci];
        var def = this._charDefs[di];

        if (this._isHiddenHollow(di)) continue;

        if (def.type === PatternMask.DEF_TYPES.INPUT && !this._isHollow(di)) input += ch;
        ++ci;
      }
      return input;
    }
  }, {
    key: '_isHollow',
    value: function _isHollow(defIndex) {
      return this._hollows.indexOf(defIndex) >= 0;
    }
  }, {
    key: '_isHiddenHollow',
    value: function _isHiddenHollow(defIndex) {
      return this._isHollow(defIndex) && this._charDefs[defIndex] && this._charDefs[defIndex].optional;
    }
  }, {
    key: '_hollowsBefore',
    value: function _hollowsBefore(defIndex) {
      var _this4 = this;

      return this._hollows.filter(function (h) {
        return h < defIndex && _this4._isHiddenHollow(h);
      });
    }
  }, {
    key: '_mapDefIndexToPos',
    value: function _mapDefIndexToPos(defIndex) {
      return defIndex - this._hollowsBefore(defIndex).length;
    }
  }, {
    key: '_mapPosToDefIndex',
    value: function _mapPosToDefIndex(pos) {
      var lastHollowIndex = pos;
      // extend contiguous
      while (this._isHiddenHollow(lastHollowIndex - 1)) {
        ++lastHollowIndex;
      }return pos + this._hollowsBefore(lastHollowIndex).length;
    }
  }, {
    key: '_generateInsertSteps',
    value: function _generateInsertSteps(head, inserted) {
      var res = head;
      var hollows = this._hollows.slice();
      var placeholderBuffer = '';
      var insertSteps = [[res, hollows.slice()]];

      for (var ci = 0, di = this._mapPosToDefIndex(head.length); ci < inserted.length;) {
        var def = this._charDefs[di];
        if (!def) break;

        var ch = inserted[ci];
        if (def.type === PatternMask.DEF_TYPES.INPUT) {
          var resolver = this._resolvers[def.char];
          var chres = resolver.resolve(ch, ci, res) || '';
          // if ok - next di
          if (chres) {
            res += placeholderBuffer + conform(chres, ch);placeholderBuffer = '';
            insertSteps.push([res, hollows.slice()]);
          } else if (def.optional) {
            if (hollows.indexOf(di) < 0) hollows.push(di);
          }
          if (chres || def.optional) ++di;
          if (chres || !def.optional) ++ci;
        } else {
          placeholderBuffer += def.char;

          if (ch === def.char) ++ci;
          ++di;
        }
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
      var lastHollowIndex = this._mapPosToDefIndex(startChangePos);
      this._hollows = this._hollows.filter(function (h) {
        return h < lastHollowIndex;
      });

      var res = head;

      // insert available
      var insertSteps = this._generateInsertSteps(head, inserted);
      for (var istep = insertSteps.length - 1; istep >= 0; --istep) {
        var step;

        var _insertSteps$istep = slicedToArray(insertSteps[istep], 2);

        step = _insertSteps$istep[0];
        this._hollows = _insertSteps$istep[1];

        var result = this._tryAppendTail(step, tailInput);
        if (result) {
          var _result = slicedToArray(result, 2);

          res = _result[0];
          this._hollows = _result[1];

          cursorPos = step.length;
          break;
        }
      }

      if (inserted) {
        // append fixed at end
        var appended = this._appendFixedEnd(res);
        cursorPos += appended.length - res.length;
        res = appended;
      }

      // remove head fixed and hollows if removed at end
      if (!inserted && cursorPos === res.length) {
        var di = this._mapPosToDefIndex(cursorPos - 1);
        var hasHollows = false;
        for (; di > 0; --di) {
          var def = this._charDefs[di];
          if (def.type === PatternMask.DEF_TYPES.INPUT) {
            if (this._isHollow(di)) hasHollows = true;else break;
          }
        }
        if (hasHollows) res = res.slice(0, di + 1);
      }

      // append placeholder
      res = this._appendPlaceholderEnd(res);
      details.cursorPos = cursorPos;

      return res;
    }
  }, {
    key: 'processInput',
    value: function processInput(ev) {
      var res = get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), 'processInput', this).call(this, ev);
      if (res !== this._oldValue && this.isComplete) this.fireEvent("complete");
    }
  }, {
    key: '_appendFixedEnd',
    value: function _appendFixedEnd(res) {
      for (var di = this._mapPosToDefIndex(res.length);; ++di) {
        var def = this._charDefs[di];
        if (!def) break;

        if (this._isHiddenHollow(di)) continue;
        if (def.type === PatternMask.DEF_TYPES.INPUT) break;
        if (di >= res.length) res += def.char;
      }
      return res;
    }
  }, {
    key: '_appendPlaceholderEnd',
    value: function _appendPlaceholderEnd(res) {
      for (var di = this._mapPosToDefIndex(res.length); di < this._charDefs.length; ++di) {
        var def = this._charDefs[di];
        if (def.type === PatternMask.DEF_TYPES.INPUT && !this._isHollow(di)) {
          this._hollows.push(di);
        }
        if (this._placeholder.show === 'always') {
          res += def.type === PatternMask.DEF_TYPES.FIXED ? def.char : !def.optional ? this._placeholder.char : '';
        }
      }
      return res;
    }
  }, {
    key: '_alignCursor',
    value: function _alignCursor() {
      var cursorDefIndex = this._mapPosToDefIndex(this.cursorPos);
      for (var rPos = cursorDefIndex; rPos >= 0; --rPos) {
        var rDef = this._charDefs[rPos];
        var lPos = rPos - 1;
        var lDef = this._charDefs[lPos];
        if (this._isHiddenHollow(lPos)) continue;

        if ((!rDef || rDef.type === PatternMask.DEF_TYPES.INPUT && this._isHollow(rPos) && !this._isHiddenHollow(rPos)) && !this._isHollow(lPos)) {
          cursorDefIndex = rPos;
          if (!lDef || lDef.type === PatternMask.DEF_TYPES.INPUT) break;
        }
      }
      this.cursorPos = this._mapDefIndexToPos(cursorDefIndex);
    }
  }, {
    key: 'isComplete',
    get: function get() {
      var _this5 = this;

      return !this._charDefs.filter(function (def, di) {
        return def.type === PatternMask.DEF_TYPES.INPUT && !def.optional && _this5._isHollow(di) >= 0;
      }).length;
    }
  }, {
    key: 'unmaskedValue',
    get: function get() {
      var str = this.rawValue;
      var unmasked = '';
      for (var ci = 0, di = 0; ci < str.length && di < this._charDefs.length; ++di) {
        var ch = str[ci];
        var def = this._charDefs[di];

        if (this._isHiddenHollow(di)) continue;

        if (def.unmasking && !this._isHollow(di) && (def.type === PatternMask.DEF_TYPES.INPUT && this._resolvers[def.char].resolve(ch, ci, str) || def.char === ch)) {
          unmasked += ch;
        }
        ++ci;
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
          if (this._resolvers[def.char].resolve(ch, ci, res)) {
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
      this.rawValue = res;

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
      var _this6 = this;

      return this._charDefs.map(function (def) {
        return def.type === PatternMask.DEF_TYPES.FIXED ? def.char : !def.optional ? _this6._placeholder.char : '';
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
  show: 'lazy',
  char: '_'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvaW1hc2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0XHJcbmZ1bmN0aW9uIGlzU3RyaW5nIChzdHIpIHtcclxuICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gY29uZm9ybSAocmVzLCBzdHIsIGZhbGxiYWNrPScnKSB7XHJcbiAgcmV0dXJuIGlzU3RyaW5nKHJlcykgP1xyXG4gICAgcmVzIDpcclxuICAgIHJlcyA/XHJcbiAgICAgIHN0ciA6XHJcbiAgICAgIGZhbGxiYWNrO1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIEJhc2VNYXNrIHtcclxuICBjb25zdHJ1Y3RvciAoZWwsIG9wdHMpIHtcclxuICAgIHRoaXMuZWwgPSBlbDtcclxuICAgIHRoaXMubWFzayA9IG9wdHMubWFzaztcclxuXHJcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcclxuICAgIHRoaXMuX3JlZnJlc2hpbmdDb3VudCA9IDA7XHJcblxyXG4gICAgdGhpcy5zYXZlU3RhdGUgPSB0aGlzLnNhdmVTdGF0ZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5wcm9jZXNzSW5wdXQgPSB0aGlzLnByb2Nlc3NJbnB1dC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fb25Ecm9wID0gdGhpcy5fb25Ecm9wLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVN0YXRlKTtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLnByb2Nlc3NJbnB1dCk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVN0YXRlKTtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLnByb2Nlc3NJbnB1dCk7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgZGVzdHJveSAoKSB7XHJcbiAgICB0aGlzLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICBnZXQgc2VsZWN0aW9uU3RhcnQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgfVxyXG5cclxuICBnZXQgY3Vyc29yUG9zICgpIHtcclxuICAgIHJldHVybiB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuICB9XHJcblxyXG4gIHNldCBjdXJzb3JQb3MgKHBvcykge1xyXG4gICAgdGhpcy5lbC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgfVxyXG5cclxuICBzYXZlU3RhdGUgKGV2KSB7XHJcbiAgICB0aGlzLl9vbGRWYWx1ZSA9IHRoaXMucmF3VmFsdWU7XHJcbiAgICB0aGlzLl9vbGRTZWxlY3Rpb24gPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNlbGVjdGlvblN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuY3Vyc29yUG9zXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzSW5wdXQgKGV2KSB7XHJcbiAgICAgdmFyIGlucHV0VmFsdWUgPSB0aGlzLnJhd1ZhbHVlO1xyXG5cclxuICAgIC8vIHVzZSBzZWxlY3Rpb25FbmQgZm9yIGhhbmRsZSBVbmRvXHJcbiAgICB2YXIgY3Vyc29yUG9zID0gdGhpcy5jdXJzb3JQb3M7XHJcbiAgICB2YXIgZGV0YWlscyA9IHtcclxuICAgICAgb2xkU2VsZWN0aW9uOiB0aGlzLl9vbGRTZWxlY3Rpb24sXHJcbiAgICAgIGN1cnNvclBvczogY3Vyc29yUG9zLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5fb2xkVmFsdWVcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHJlcyA9IGlucHV0VmFsdWU7XHJcbiAgICByZXMgPSBjb25mb3JtKHRoaXMucmVzb2x2ZShyZXMsIGRldGFpbHMpLFxyXG4gICAgICByZXMsXHJcbiAgICAgIHRoaXMuX29sZFZhbHVlKTtcclxuXHJcbiAgICBpZiAocmVzICE9PSBpbnB1dFZhbHVlKSB7XHJcbiAgICAgICsrdGhpcy5fcmVmcmVzaGluZ0NvdW50O1xyXG4gICAgICB0aGlzLnJhd1ZhbHVlID0gcmVzO1xyXG4gICAgICAtLXRoaXMuX3JlZnJlc2hpbmdDb3VudDtcclxuICAgICAgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcblxyXG4gICAgICB0aGlzLmN1cnNvclBvcyA9IGN1cnNvclBvcztcclxuICAgICAgLy8gYWxzbyBxdWV1ZSBjaGFuZ2UgY3Vyc29yIGZvciBzb21lIGJyb3dzZXJzXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5jdXJzb3JQb3MgPSBjdXJzb3JQb3MsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXMgIT09IHRoaXMuX29sZFZhbHVlKSB0aGlzLmZpcmVFdmVudChcImFjY2VwdFwiKTtcclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBvbiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgdGhpcy5fbGlzdGVuZXJzW2V2XSA9IFtdO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzW2V2XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBvZmYgKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHJldHVybjtcclxuICAgIGlmICghaGFuZGxlcikge1xyXG4gICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2XTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGhJbmRleCA9IHRoaXMuX2xpc3RlbmVyc1tldl0uaW5kZXhPZihoYW5kbGVyKTtcclxuICAgIGlmIChoSW5kZXggPj0gMCkgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShoSW5kZXgsIDEpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBmaXJlRXZlbnQgKGV2KSB7XHJcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzW2V2XSB8fCBbXTtcclxuICAgIGxpc3RlbmVycy5mb3JFYWNoKGwgPT4gbCgpKTtcclxuICB9XHJcblxyXG4gIC8vIG92ZXJyaWRlIHRoaXNcclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHsgcmV0dXJuIHN0cjsgfVxyXG5cclxuICBnZXQgcmF3VmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWwudmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgcmF3VmFsdWUgKHN0cikge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuZWwudmFsdWUgPSBzdHI7XHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLnJhd1ZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHZhbHVlKSB7XHJcbiAgICB0aGlzLnJhd1ZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICByZWZyZXNoICgpIHtcclxuICAgIGlmICh0aGlzLl9yZWZyZXNoaW5nQ291bnQpIHJldHVybjtcclxuICAgICsrdGhpcy5fcmVmcmVzaGluZ0NvdW50O1xyXG5cclxuICAgIHZhciBzdHIgPSB0aGlzLnJhd1ZhbHVlO1xyXG4gICAgLy8gdXNlIHVubWFza2VkIHZhbHVlIGlmIHZhbHVlIHdhcyBub3QgY2hhbmdlZCB0byB1cGRhdGUgd2l0aCBvcHRpb25zIGNvcnJlY3RseVxyXG4gICAgaWYgKHRoaXMuX29sZFJhd1ZhbHVlID09PSBzdHIpIHN0ciA9IHRoaXMuX29sZFVubWFza2VkVmFsdWU7XHJcbiAgICBkZWxldGUgdGhpcy5fb2xkUmF3VmFsdWU7XHJcbiAgICBkZWxldGUgdGhpcy5fb2xkVW5tYXNrZWRWYWx1ZTtcclxuXHJcbiAgICB2YXIgZGV0YWlscyA9IHtcclxuICAgICAgY3Vyc29yUG9zOiBzdHIubGVuZ3RoLFxyXG4gICAgICBzdGFydENoYW5nZVBvczogMCxcclxuICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiBzdHIubGVuZ3RoXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlbW92ZWRDb3VudDogc3RyLmxlbmd0aCxcclxuICAgICAgaW5zZXJ0ZWRDb3VudDogc3RyLmxlbmd0aCxcclxuICAgICAgb2xkVmFsdWU6IHN0clxyXG4gICAgfTtcclxuICAgIHRoaXMucmF3VmFsdWUgPSBjb25mb3JtKHRoaXMucmVzb2x2ZShzdHIsIGRldGFpbHMpLCBzdHIpO1xyXG5cclxuICAgIC0tdGhpcy5fcmVmcmVzaGluZ0NvdW50O1xyXG4gIH1cclxuXHJcbiAgc3RhcnRSZWZyZXNoICgpIHtcclxuICAgIC8vIHN0b3JlIHVubWFza2VkIHZhbHVlIHRvIGFwcGx5IGFmdGVyIGNoYW5nZXNcclxuICAgIGlmICghdGhpcy5fcmVmcmVzaGluZ0NvdW50KSB7XHJcbiAgICAgIHRoaXMuX29sZFVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgICAgIHRoaXMuX29sZFJhd1ZhbHVlID0gdGhpcy5yYXdWYWx1ZTtcclxuICAgIH1cclxuICAgICsrdGhpcy5fcmVmcmVzaGluZ0NvdW50O1xyXG4gIH1cclxuXHJcbiAgZW5kUmVmcmVzaCAoKSB7XHJcbiAgICAtLXRoaXMuX3JlZnJlc2hpbmdDb3VudDtcclxuICAgIGlmICghdGhpcy5fcmVmcmVzaGluZ0NvdW50KSB0aGlzLnJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIF9vbkRyb3AgKGV2KSB7XHJcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFJlZ0V4cE1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoc3RyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrLnRlc3Qoc3RyKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgRnVuY01hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoLi4uYXJncykge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzayguLi5hcmdzKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtjb25mb3JtfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFBhdHRlcm5NYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgc3VwZXIoZWwsIG9wdHMpO1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuXHJcbiAgICB0aGlzLnBsYWNlaG9sZGVyID0gb3B0cy5wbGFjZWhvbGRlcjtcclxuICAgIHRoaXMuZGVmaW5pdGlvbnMgPSB7XHJcbiAgICAgIC4uLlBhdHRlcm5NYXNrLkRFRklOSVRJT05TLFxyXG4gICAgICAuLi5vcHRzLmRlZmluaXRpb25zXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2hvbGxvd3MgPSBbXTtcclxuICAgIHRoaXMuX2J1aWxkUmVzb2x2ZXJzKCk7XHJcblxyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IgPSB0aGlzLl9hbGlnbkN1cnNvci5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci5iaW5kRXZlbnRzKCk7XHJcbiAgICBbJ2NsaWNrJywgJ2ZvY3VzJ10uZm9yRWFjaChldiA9PlxyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoZXYsIHRoaXMuX2FsaWduQ3Vyc29yKSk7XHJcbiAgfVxyXG5cclxuICB1bmJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIudW5iaW5kRXZlbnRzKCk7XHJcbiAgICBbJ2NsaWNrJywgJ2ZvY3VzJ10uZm9yRWFjaChldiA9PlxyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXYsIHRoaXMuX2FsaWduQ3Vyc29yKSk7XHJcbiAgfVxyXG5cclxuICBfYnVpbGRSZXNvbHZlcnMgKCkge1xyXG4gICAgdGhpcy5fY2hhckRlZnMgPSBbXTtcclxuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5tYXNrO1xyXG5cclxuICAgIGlmICghcGF0dGVybiB8fCAhdGhpcy5kZWZpbml0aW9ucykgcmV0dXJuO1xyXG5cclxuICAgIHZhciB1bm1hc2tpbmdCbG9jayA9IGZhbHNlO1xyXG4gICAgdmFyIG9wdGlvbmFsQmxvY2sgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgIHZhciB0eXBlID0gIXVubWFza2luZ0Jsb2NrICYmIGNoIGluIHRoaXMuZGVmaW5pdGlvbnMgP1xyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCA6XHJcbiAgICAgICAgUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB2YXIgdW5tYXNraW5nID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUIHx8IHVubWFza2luZ0Jsb2NrO1xyXG4gICAgICB2YXIgb3B0aW9uYWwgPSB0eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgb3B0aW9uYWxCbG9jaztcclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ3snIHx8IGNoID09PSAnfScpIHtcclxuICAgICAgICB1bm1hc2tpbmdCbG9jayA9ICF1bm1hc2tpbmdCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSAnWycgfHwgY2ggPT09ICddJykge1xyXG4gICAgICAgIG9wdGlvbmFsQmxvY2sgPSAhb3B0aW9uYWxCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSAnXFxcXCcpIHtcclxuICAgICAgICArK2k7XHJcbiAgICAgICAgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICAgIC8vIFRPRE8gdmFsaWRhdGlvblxyXG4gICAgICAgIGlmICghY2gpIGJyZWFrO1xyXG4gICAgICAgIHR5cGUgPSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2NoYXJEZWZzLnB1c2goe1xyXG4gICAgICAgIGNoYXI6IGNoLFxyXG4gICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgb3B0aW9uYWw6IG9wdGlvbmFsLFxyXG4gICAgICAgIHVubWFza2luZzogdW5tYXNraW5nXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3Jlc29sdmVycyA9IHt9O1xyXG4gICAgZm9yICh2YXIgZGVmS2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgdGhpcy5fcmVzb2x2ZXJzW2RlZktleV0gPSBJTWFzay5NYXNrRmFjdG9yeSh0aGlzLmVsLCB7XHJcbiAgICAgICAgbWFzazogdGhpcy5kZWZpbml0aW9uc1tkZWZLZXldXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX3RyeUFwcGVuZFRhaWwgKHN0ciwgdGFpbCkge1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHN0ci5sZW5ndGgpOyBjaSA8IHRhaWwubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHRhaWxbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgLy8gZmFpbGVkXHJcbiAgICAgIGlmICghZGVmKSByZXR1cm47XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgZGksIHN0cikgfHwgJyc7XHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICBjaHJlcyA9IGNvbmZvcm0oY2hyZXMsIGNoKTtcclxuICAgICAgICAgICsrY2k7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICghZGVmLm9wdGlvbmFsKSBjaHJlcyA9IHRoaXMuX3BsYWNlaG9sZGVyLmNoYXI7XHJcbiAgICAgICAgICBob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdHIgKz0gcGxhY2Vob2xkZXJCdWZmZXIgKyBjaHJlcztcclxuICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtzdHIsIGhvbGxvd3NdO1xyXG4gIH1cclxuXHJcbiAgX2V4dHJhY3RJbnB1dCAoc3RyLCBmcm9tUG9zPTApIHtcclxuICAgIHZhciBpbnB1dCA9ICcnO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoZnJvbVBvcyk7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmICF0aGlzLl9pc0hvbGxvdyhkaSkpIGlucHV0ICs9IGNoO1xyXG4gICAgICArK2NpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgX2lzSG9sbG93IChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkZWZJbmRleCkgPj0gMDtcclxuICB9XHJcblxyXG4gIF9pc0hpZGRlbkhvbGxvdyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9pc0hvbGxvdyhkZWZJbmRleCkgJiZcclxuICAgICAgdGhpcy5fY2hhckRlZnNbZGVmSW5kZXhdICYmIHRoaXMuX2NoYXJEZWZzW2RlZkluZGV4XS5vcHRpb25hbDtcclxuICB9XHJcblxyXG4gIF9ob2xsb3dzQmVmb3JlIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGRlZkluZGV4ICYmIHRoaXMuX2lzSGlkZGVuSG9sbG93KGgpKTtcclxuICB9XHJcblxyXG4gIF9tYXBEZWZJbmRleFRvUG9zIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIGRlZkluZGV4IC0gdGhpcy5faG9sbG93c0JlZm9yZShkZWZJbmRleCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX21hcFBvc1RvRGVmSW5kZXggKHBvcykge1xyXG4gICAgdmFyIGxhc3RIb2xsb3dJbmRleCA9IHBvcztcclxuICAgIC8vIGV4dGVuZCBjb250aWd1b3VzXHJcbiAgICB3aGlsZSAodGhpcy5faXNIaWRkZW5Ib2xsb3cobGFzdEhvbGxvd0luZGV4LTEpKSArK2xhc3RIb2xsb3dJbmRleDtcclxuXHJcbiAgICByZXR1cm4gcG9zICsgdGhpcy5faG9sbG93c0JlZm9yZShsYXN0SG9sbG93SW5kZXgpLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIF9nZW5lcmF0ZUluc2VydFN0ZXBzIChoZWFkLCBpbnNlcnRlZCkge1xyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW1tyZXMsIGhvbGxvd3Muc2xpY2UoKV1dO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoaGVhZC5sZW5ndGgpOyBjaTxpbnNlcnRlZC5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIHZhciBjaCA9IGluc2VydGVkW2NpXTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIHZhciBjaHJlcyA9IHJlc29sdmVyLnJlc29sdmUoY2gsIGNpLCByZXMpIHx8ICcnO1xyXG4gICAgICAgIC8vIGlmIG9rIC0gbmV4dCBkaVxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgcmVzICs9IHBsYWNlaG9sZGVyQnVmZmVyICsgY29uZm9ybShjaHJlcywgY2gpOyBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgaW5zZXJ0U3RlcHMucHVzaChbcmVzLCBob2xsb3dzLnNsaWNlKCldKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRlZi5vcHRpb25hbCkge1xyXG4gICAgICAgICAgaWYgKGhvbGxvd3MuaW5kZXhPZihkaSkgPCAwKSBob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2hyZXMgfHwgZGVmLm9wdGlvbmFsKSArK2RpO1xyXG4gICAgICAgIGlmIChjaHJlcyB8fCAhZGVmLm9wdGlvbmFsKSArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG5cclxuICAgICAgICBpZiAoY2ggPT09IGRlZi5jaGFyKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaW5zZXJ0U3RlcHM7XHJcbiAgfVxyXG5cclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHtcclxuICAgIHZhciBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICAgIHZhciBvbGRTZWxlY3Rpb24gPSBkZXRhaWxzLm9sZFNlbGVjdGlvbjtcclxuICAgIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcbiAgICB2YXIgc3RhcnRDaGFuZ2VQb3MgPSBNYXRoLm1pbihjdXJzb3JQb3MsIG9sZFNlbGVjdGlvbi5zdGFydCk7XHJcbiAgICAvLyBNYXRoLm1heCBmb3Igb3Bwb3NpdGUgb3BlcmF0aW9uXHJcbiAgICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgICAgLy8gZm9yIERlbGV0ZVxyXG4gICAgICBvbGRWYWx1ZS5sZW5ndGggLSBzdHIubGVuZ3RoLCAwKTtcclxuICAgIHZhciBpbnNlcnRlZENvdW50ID0gY3Vyc29yUG9zIC0gc3RhcnRDaGFuZ2VQb3M7XHJcblxyXG5cclxuICAgIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyk7XHJcbiAgICB2YXIgdGFpbCA9IHN0ci5zdWJzdHJpbmcoc3RhcnRDaGFuZ2VQb3MgKyBpbnNlcnRlZENvdW50KTtcclxuICAgIHZhciBpbnNlcnRlZCA9IHN0ci5zdWJzdHIoc3RhcnRDaGFuZ2VQb3MsIGluc2VydGVkQ291bnQpO1xyXG5cclxuICAgIHZhciB0YWlsSW5wdXQgPSB0aGlzLl9leHRyYWN0SW5wdXQodGFpbCwgc3RhcnRDaGFuZ2VQb3MgKyByZW1vdmVkQ291bnQpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBob2xsb3dzIGFmdGVyIGN1cnNvclxyXG4gICAgdmFyIGxhc3RIb2xsb3dJbmRleCA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgoc3RhcnRDaGFuZ2VQb3MpO1xyXG4gICAgdGhpcy5faG9sbG93cyA9IHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGxhc3RIb2xsb3dJbmRleCk7XHJcblxyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcblxyXG4gICAgLy8gaW5zZXJ0IGF2YWlsYWJsZVxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gdGhpcy5fZ2VuZXJhdGVJbnNlcnRTdGVwcyhoZWFkLCBpbnNlcnRlZCk7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcDtcclxuICAgICAgW3N0ZXAsIHRoaXMuX2hvbGxvd3NdID0gaW5zZXJ0U3RlcHNbaXN0ZXBdO1xyXG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fdHJ5QXBwZW5kVGFpbChzdGVwLCB0YWlsSW5wdXQpO1xyXG4gICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgW3JlcywgdGhpcy5faG9sbG93c10gPSByZXN1bHQ7XHJcbiAgICAgICAgY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5zZXJ0ZWQpIHtcclxuICAgICAgLy8gYXBwZW5kIGZpeGVkIGF0IGVuZFxyXG4gICAgICB2YXIgYXBwZW5kZWQgPSB0aGlzLl9hcHBlbmRGaXhlZEVuZChyZXMpO1xyXG4gICAgICBjdXJzb3JQb3MgKz0gYXBwZW5kZWQubGVuZ3RoIC0gcmVzLmxlbmd0aDtcclxuICAgICAgcmVzID0gYXBwZW5kZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhlYWQgZml4ZWQgYW5kIGhvbGxvd3MgaWYgcmVtb3ZlZCBhdCBlbmRcclxuICAgIGlmICghaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIHZhciBkaSA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgoY3Vyc29yUG9zLTEpO1xyXG4gICAgICB2YXIgaGFzSG9sbG93cyA9IGZhbHNlO1xyXG4gICAgICBmb3IgKDsgZGkgPiAwOyAtLWRpKSB7XHJcbiAgICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuX2lzSG9sbG93KGRpKSkgaGFzSG9sbG93cyA9IHRydWU7XHJcbiAgICAgICAgICBlbHNlIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoaGFzSG9sbG93cykgcmVzID0gcmVzLnNsaWNlKDAsIGRpICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXBwZW5kIHBsYWNlaG9sZGVyXHJcbiAgICByZXMgPSB0aGlzLl9hcHBlbmRQbGFjZWhvbGRlckVuZChyZXMpO1xyXG4gICAgZGV0YWlscy5jdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcblxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIHByb2Nlc3NJbnB1dCAoZXYpIHtcclxuICAgIHZhciByZXMgPSBzdXBlci5wcm9jZXNzSW5wdXQoZXYpO1xyXG4gICAgaWYgKHJlcyAhPT0gdGhpcy5fb2xkVmFsdWUgJiYgdGhpcy5pc0NvbXBsZXRlKSB0aGlzLmZpcmVFdmVudChcImNvbXBsZXRlXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzQ29tcGxldGUgKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLl9jaGFyRGVmcy5maWx0ZXIoKGRlZiwgZGkpID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgIWRlZi5vcHRpb25hbCAmJlxyXG4gICAgICB0aGlzLl9pc0hvbGxvdyhkaSkgPj0gMCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZEZpeGVkRW5kIChyZXMpIHtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7OyArK2RpKSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIGlmIChkaSA+PSByZXMubGVuZ3RoKSByZXMgKz0gZGVmLmNoYXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFBsYWNlaG9sZGVyRW5kIChyZXMpIHtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7IGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiAhdGhpcy5faXNIb2xsb3coZGkpKSB7XHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5fcGxhY2Vob2xkZXIuc2hvdyA9PT0gJ2Fsd2F5cycpIHtcclxuICAgICAgICByZXMgKz0gZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCA/XHJcbiAgICAgICAgICBkZWYuY2hhciA6XHJcbiAgICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgICAgdGhpcy5fcGxhY2Vob2xkZXIuY2hhciA6XHJcbiAgICAgICAgICAgICcnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHVubWFza2VkVmFsdWUgKCkge1xyXG4gICAgdmFyIHN0ciA9IHRoaXMucmF3VmFsdWU7XHJcbiAgICB2YXIgdW5tYXNrZWQgPSAnJztcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPTA7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmIChkZWYudW5tYXNraW5nICYmICF0aGlzLl9pc0hvbGxvdyhkaSkgJiZcclxuICAgICAgICAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdLnJlc29sdmUoY2gsIGNpLCBzdHIpIHx8XHJcbiAgICAgICAgICBkZWYuY2hhciA9PT0gY2gpKSB7XHJcbiAgICAgICAgdW5tYXNrZWQgKz0gY2g7XHJcbiAgICAgIH1cclxuICAgICAgKytjaTtcclxuICAgIH1cclxuICAgIHJldHVybiB1bm1hc2tlZDtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcblxyXG4gICAgdmFyIHJlcyA9ICcnO1xyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9MDsgY2k8c3RyLmxlbmd0aCAmJiBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcblxyXG4gICAgICB2YXIgY2hyZXMgPSAnJztcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICBpZiAodGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXS5yZXNvbHZlKGNoLCBjaSwgcmVzKSkge1xyXG4gICAgICAgICAgY2hyZXMgPSBjaDtcclxuICAgICAgICAgICsrZGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hyZXMgPSBkZWYuY2hhcjtcclxuICAgICAgICBpZiAoZGVmLnVubWFza2luZyAmJiBkZWYuY2hhciA9PT0gY2gpICsrY2k7XHJcbiAgICAgICAgKytkaTtcclxuICAgICAgfVxyXG4gICAgICByZXMgKz0gY2hyZXM7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9ob2xsb3dzLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLnJhd1ZhbHVlID0gcmVzO1xyXG5cclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHBsYWNlaG9sZGVyICgpIHsgcmV0dXJuIHRoaXMuX3BsYWNlaG9sZGVyOyB9XHJcblxyXG4gIHNldCBwbGFjZWhvbGRlciAocGgpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUixcclxuICAgICAgLi4ucGhcclxuICAgIH07XHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlckxhYmVsICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGFyRGVmcy5tYXAoZGVmID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgJycpLmpvaW4oJycpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRlZmluaXRpb25zICgpIHsgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zOyB9XHJcblxyXG4gIHNldCBkZWZpbml0aW9ucyAoZGVmcykge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmcztcclxuICAgIHRoaXMuX2J1aWxkUmVzb2x2ZXJzKCk7XHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGdldCBtYXNrICgpIHsgcmV0dXJuIHRoaXMuX21hc2s7IH1cclxuXHJcbiAgc2V0IG1hc2sgKG1hc2spIHtcclxuICAgIHZhciBpbml0aWFsaXplZCA9IHRoaXMuX21hc2s7XHJcbiAgICBpZiAoaW5pdGlhbGl6ZWQpIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLl9tYXNrID0gbWFzaztcclxuICAgIGlmIChpbml0aWFsaXplZCkge1xyXG4gICAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG4gICAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9hbGlnbkN1cnNvciAoKSB7XHJcbiAgICB2YXIgY3Vyc29yRGVmSW5kZXggPSB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KHRoaXMuY3Vyc29yUG9zKTtcclxuICAgIGZvciAodmFyIHJQb3MgPSBjdXJzb3JEZWZJbmRleDsgclBvcyA+PSAwOyAtLXJQb3MpIHtcclxuICAgICAgdmFyIHJEZWYgPSB0aGlzLl9jaGFyRGVmc1tyUG9zXTtcclxuICAgICAgdmFyIGxQb3MgPSByUG9zLTE7XHJcbiAgICAgIHZhciBsRGVmID0gdGhpcy5fY2hhckRlZnNbbFBvc107XHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhsUG9zKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoKCFyRGVmIHx8IHJEZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIHRoaXMuX2lzSG9sbG93KHJQb3MpICYmICF0aGlzLl9pc0hpZGRlbkhvbGxvdyhyUG9zKSkgJiZcclxuICAgICAgICAhdGhpcy5faXNIb2xsb3cobFBvcykpIHtcclxuICAgICAgICBjdXJzb3JEZWZJbmRleCA9IHJQb3M7XHJcbiAgICAgICAgaWYgKCFsRGVmIHx8IGxEZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdXJzb3JQb3MgPSB0aGlzLl9tYXBEZWZJbmRleFRvUG9zKGN1cnNvckRlZkluZGV4KTtcclxuICB9XHJcbn1cclxuUGF0dGVybk1hc2suREVGSU5JVElPTlMgPSB7XHJcbiAgJzAnOiAvXFxkLyxcclxuICAnYSc6IC9bXFx1MDA0MS1cXHUwMDVBXFx1MDA2MS1cXHUwMDdBXFx1MDBBQVxcdTAwQjVcXHUwMEJBXFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XFx1MDBGOC1cXHUwMkMxXFx1MDJDNi1cXHUwMkQxXFx1MDJFMC1cXHUwMkU0XFx1MDJFQ1xcdTAyRUVcXHUwMzcwLVxcdTAzNzRcXHUwMzc2XFx1MDM3N1xcdTAzN0EtXFx1MDM3RFxcdTAzODZcXHUwMzg4LVxcdTAzOEFcXHUwMzhDXFx1MDM4RS1cXHUwM0ExXFx1MDNBMy1cXHUwM0Y1XFx1MDNGNy1cXHUwNDgxXFx1MDQ4QS1cXHUwNTI3XFx1MDUzMS1cXHUwNTU2XFx1MDU1OVxcdTA1NjEtXFx1MDU4N1xcdTA1RDAtXFx1MDVFQVxcdTA1RjAtXFx1MDVGMlxcdTA2MjAtXFx1MDY0QVxcdTA2NkVcXHUwNjZGXFx1MDY3MS1cXHUwNkQzXFx1MDZENVxcdTA2RTVcXHUwNkU2XFx1MDZFRVxcdTA2RUZcXHUwNkZBLVxcdTA2RkNcXHUwNkZGXFx1MDcxMFxcdTA3MTItXFx1MDcyRlxcdTA3NEQtXFx1MDdBNVxcdTA3QjFcXHUwN0NBLVxcdTA3RUFcXHUwN0Y0XFx1MDdGNVxcdTA3RkFcXHUwODAwLVxcdTA4MTVcXHUwODFBXFx1MDgyNFxcdTA4MjhcXHUwODQwLVxcdTA4NThcXHUwOEEwXFx1MDhBMi1cXHUwOEFDXFx1MDkwNC1cXHUwOTM5XFx1MDkzRFxcdTA5NTBcXHUwOTU4LVxcdTA5NjFcXHUwOTcxLVxcdTA5NzdcXHUwOTc5LVxcdTA5N0ZcXHUwOTg1LVxcdTA5OENcXHUwOThGXFx1MDk5MFxcdTA5OTMtXFx1MDlBOFxcdTA5QUEtXFx1MDlCMFxcdTA5QjJcXHUwOUI2LVxcdTA5QjlcXHUwOUJEXFx1MDlDRVxcdTA5RENcXHUwOUREXFx1MDlERi1cXHUwOUUxXFx1MDlGMFxcdTA5RjFcXHUwQTA1LVxcdTBBMEFcXHUwQTBGXFx1MEExMFxcdTBBMTMtXFx1MEEyOFxcdTBBMkEtXFx1MEEzMFxcdTBBMzJcXHUwQTMzXFx1MEEzNVxcdTBBMzZcXHUwQTM4XFx1MEEzOVxcdTBBNTktXFx1MEE1Q1xcdTBBNUVcXHUwQTcyLVxcdTBBNzRcXHUwQTg1LVxcdTBBOERcXHUwQThGLVxcdTBBOTFcXHUwQTkzLVxcdTBBQThcXHUwQUFBLVxcdTBBQjBcXHUwQUIyXFx1MEFCM1xcdTBBQjUtXFx1MEFCOVxcdTBBQkRcXHUwQUQwXFx1MEFFMFxcdTBBRTFcXHUwQjA1LVxcdTBCMENcXHUwQjBGXFx1MEIxMFxcdTBCMTMtXFx1MEIyOFxcdTBCMkEtXFx1MEIzMFxcdTBCMzJcXHUwQjMzXFx1MEIzNS1cXHUwQjM5XFx1MEIzRFxcdTBCNUNcXHUwQjVEXFx1MEI1Ri1cXHUwQjYxXFx1MEI3MVxcdTBCODNcXHUwQjg1LVxcdTBCOEFcXHUwQjhFLVxcdTBCOTBcXHUwQjkyLVxcdTBCOTVcXHUwQjk5XFx1MEI5QVxcdTBCOUNcXHUwQjlFXFx1MEI5RlxcdTBCQTNcXHUwQkE0XFx1MEJBOC1cXHUwQkFBXFx1MEJBRS1cXHUwQkI5XFx1MEJEMFxcdTBDMDUtXFx1MEMwQ1xcdTBDMEUtXFx1MEMxMFxcdTBDMTItXFx1MEMyOFxcdTBDMkEtXFx1MEMzM1xcdTBDMzUtXFx1MEMzOVxcdTBDM0RcXHUwQzU4XFx1MEM1OVxcdTBDNjBcXHUwQzYxXFx1MEM4NS1cXHUwQzhDXFx1MEM4RS1cXHUwQzkwXFx1MEM5Mi1cXHUwQ0E4XFx1MENBQS1cXHUwQ0IzXFx1MENCNS1cXHUwQ0I5XFx1MENCRFxcdTBDREVcXHUwQ0UwXFx1MENFMVxcdTBDRjFcXHUwQ0YyXFx1MEQwNS1cXHUwRDBDXFx1MEQwRS1cXHUwRDEwXFx1MEQxMi1cXHUwRDNBXFx1MEQzRFxcdTBENEVcXHUwRDYwXFx1MEQ2MVxcdTBEN0EtXFx1MEQ3RlxcdTBEODUtXFx1MEQ5NlxcdTBEOUEtXFx1MERCMVxcdTBEQjMtXFx1MERCQlxcdTBEQkRcXHUwREMwLVxcdTBEQzZcXHUwRTAxLVxcdTBFMzBcXHUwRTMyXFx1MEUzM1xcdTBFNDAtXFx1MEU0NlxcdTBFODFcXHUwRTgyXFx1MEU4NFxcdTBFODdcXHUwRTg4XFx1MEU4QVxcdTBFOERcXHUwRTk0LVxcdTBFOTdcXHUwRTk5LVxcdTBFOUZcXHUwRUExLVxcdTBFQTNcXHUwRUE1XFx1MEVBN1xcdTBFQUFcXHUwRUFCXFx1MEVBRC1cXHUwRUIwXFx1MEVCMlxcdTBFQjNcXHUwRUJEXFx1MEVDMC1cXHUwRUM0XFx1MEVDNlxcdTBFREMtXFx1MEVERlxcdTBGMDBcXHUwRjQwLVxcdTBGNDdcXHUwRjQ5LVxcdTBGNkNcXHUwRjg4LVxcdTBGOENcXHUxMDAwLVxcdTEwMkFcXHUxMDNGXFx1MTA1MC1cXHUxMDU1XFx1MTA1QS1cXHUxMDVEXFx1MTA2MVxcdTEwNjVcXHUxMDY2XFx1MTA2RS1cXHUxMDcwXFx1MTA3NS1cXHUxMDgxXFx1MTA4RVxcdTEwQTAtXFx1MTBDNVxcdTEwQzdcXHUxMENEXFx1MTBEMC1cXHUxMEZBXFx1MTBGQy1cXHUxMjQ4XFx1MTI0QS1cXHUxMjREXFx1MTI1MC1cXHUxMjU2XFx1MTI1OFxcdTEyNUEtXFx1MTI1RFxcdTEyNjAtXFx1MTI4OFxcdTEyOEEtXFx1MTI4RFxcdTEyOTAtXFx1MTJCMFxcdTEyQjItXFx1MTJCNVxcdTEyQjgtXFx1MTJCRVxcdTEyQzBcXHUxMkMyLVxcdTEyQzVcXHUxMkM4LVxcdTEyRDZcXHUxMkQ4LVxcdTEzMTBcXHUxMzEyLVxcdTEzMTVcXHUxMzE4LVxcdTEzNUFcXHUxMzgwLVxcdTEzOEZcXHUxM0EwLVxcdTEzRjRcXHUxNDAxLVxcdTE2NkNcXHUxNjZGLVxcdTE2N0ZcXHUxNjgxLVxcdTE2OUFcXHUxNkEwLVxcdTE2RUFcXHUxNzAwLVxcdTE3MENcXHUxNzBFLVxcdTE3MTFcXHUxNzIwLVxcdTE3MzFcXHUxNzQwLVxcdTE3NTFcXHUxNzYwLVxcdTE3NkNcXHUxNzZFLVxcdTE3NzBcXHUxNzgwLVxcdTE3QjNcXHUxN0Q3XFx1MTdEQ1xcdTE4MjAtXFx1MTg3N1xcdTE4ODAtXFx1MThBOFxcdTE4QUFcXHUxOEIwLVxcdTE4RjVcXHUxOTAwLVxcdTE5MUNcXHUxOTUwLVxcdTE5NkRcXHUxOTcwLVxcdTE5NzRcXHUxOTgwLVxcdTE5QUJcXHUxOUMxLVxcdTE5QzdcXHUxQTAwLVxcdTFBMTZcXHUxQTIwLVxcdTFBNTRcXHUxQUE3XFx1MUIwNS1cXHUxQjMzXFx1MUI0NS1cXHUxQjRCXFx1MUI4My1cXHUxQkEwXFx1MUJBRVxcdTFCQUZcXHUxQkJBLVxcdTFCRTVcXHUxQzAwLVxcdTFDMjNcXHUxQzRELVxcdTFDNEZcXHUxQzVBLVxcdTFDN0RcXHUxQ0U5LVxcdTFDRUNcXHUxQ0VFLVxcdTFDRjFcXHUxQ0Y1XFx1MUNGNlxcdTFEMDAtXFx1MURCRlxcdTFFMDAtXFx1MUYxNVxcdTFGMTgtXFx1MUYxRFxcdTFGMjAtXFx1MUY0NVxcdTFGNDgtXFx1MUY0RFxcdTFGNTAtXFx1MUY1N1xcdTFGNTlcXHUxRjVCXFx1MUY1RFxcdTFGNUYtXFx1MUY3RFxcdTFGODAtXFx1MUZCNFxcdTFGQjYtXFx1MUZCQ1xcdTFGQkVcXHUxRkMyLVxcdTFGQzRcXHUxRkM2LVxcdTFGQ0NcXHUxRkQwLVxcdTFGRDNcXHUxRkQ2LVxcdTFGREJcXHUxRkUwLVxcdTFGRUNcXHUxRkYyLVxcdTFGRjRcXHUxRkY2LVxcdTFGRkNcXHUyMDcxXFx1MjA3RlxcdTIwOTAtXFx1MjA5Q1xcdTIxMDJcXHUyMTA3XFx1MjEwQS1cXHUyMTEzXFx1MjExNVxcdTIxMTktXFx1MjExRFxcdTIxMjRcXHUyMTI2XFx1MjEyOFxcdTIxMkEtXFx1MjEyRFxcdTIxMkYtXFx1MjEzOVxcdTIxM0MtXFx1MjEzRlxcdTIxNDUtXFx1MjE0OVxcdTIxNEVcXHUyMTgzXFx1MjE4NFxcdTJDMDAtXFx1MkMyRVxcdTJDMzAtXFx1MkM1RVxcdTJDNjAtXFx1MkNFNFxcdTJDRUItXFx1MkNFRVxcdTJDRjJcXHUyQ0YzXFx1MkQwMC1cXHUyRDI1XFx1MkQyN1xcdTJEMkRcXHUyRDMwLVxcdTJENjdcXHUyRDZGXFx1MkQ4MC1cXHUyRDk2XFx1MkRBMC1cXHUyREE2XFx1MkRBOC1cXHUyREFFXFx1MkRCMC1cXHUyREI2XFx1MkRCOC1cXHUyREJFXFx1MkRDMC1cXHUyREM2XFx1MkRDOC1cXHUyRENFXFx1MkREMC1cXHUyREQ2XFx1MkREOC1cXHUyRERFXFx1MkUyRlxcdTMwMDVcXHUzMDA2XFx1MzAzMS1cXHUzMDM1XFx1MzAzQlxcdTMwM0NcXHUzMDQxLVxcdTMwOTZcXHUzMDlELVxcdTMwOUZcXHUzMEExLVxcdTMwRkFcXHUzMEZDLVxcdTMwRkZcXHUzMTA1LVxcdTMxMkRcXHUzMTMxLVxcdTMxOEVcXHUzMUEwLVxcdTMxQkFcXHUzMUYwLVxcdTMxRkZcXHUzNDAwLVxcdTREQjVcXHU0RTAwLVxcdTlGQ0NcXHVBMDAwLVxcdUE0OENcXHVBNEQwLVxcdUE0RkRcXHVBNTAwLVxcdUE2MENcXHVBNjEwLVxcdUE2MUZcXHVBNjJBXFx1QTYyQlxcdUE2NDAtXFx1QTY2RVxcdUE2N0YtXFx1QTY5N1xcdUE2QTAtXFx1QTZFNVxcdUE3MTctXFx1QTcxRlxcdUE3MjItXFx1QTc4OFxcdUE3OEItXFx1QTc4RVxcdUE3OTAtXFx1QTc5M1xcdUE3QTAtXFx1QTdBQVxcdUE3RjgtXFx1QTgwMVxcdUE4MDMtXFx1QTgwNVxcdUE4MDctXFx1QTgwQVxcdUE4MEMtXFx1QTgyMlxcdUE4NDAtXFx1QTg3M1xcdUE4ODItXFx1QThCM1xcdUE4RjItXFx1QThGN1xcdUE4RkJcXHVBOTBBLVxcdUE5MjVcXHVBOTMwLVxcdUE5NDZcXHVBOTYwLVxcdUE5N0NcXHVBOTg0LVxcdUE5QjJcXHVBOUNGXFx1QUEwMC1cXHVBQTI4XFx1QUE0MC1cXHVBQTQyXFx1QUE0NC1cXHVBQTRCXFx1QUE2MC1cXHVBQTc2XFx1QUE3QVxcdUFBODAtXFx1QUFBRlxcdUFBQjFcXHVBQUI1XFx1QUFCNlxcdUFBQjktXFx1QUFCRFxcdUFBQzBcXHVBQUMyXFx1QUFEQi1cXHVBQUREXFx1QUFFMC1cXHVBQUVBXFx1QUFGMi1cXHVBQUY0XFx1QUIwMS1cXHVBQjA2XFx1QUIwOS1cXHVBQjBFXFx1QUIxMS1cXHVBQjE2XFx1QUIyMC1cXHVBQjI2XFx1QUIyOC1cXHVBQjJFXFx1QUJDMC1cXHVBQkUyXFx1QUMwMC1cXHVEN0EzXFx1RDdCMC1cXHVEN0M2XFx1RDdDQi1cXHVEN0ZCXFx1RjkwMC1cXHVGQTZEXFx1RkE3MC1cXHVGQUQ5XFx1RkIwMC1cXHVGQjA2XFx1RkIxMy1cXHVGQjE3XFx1RkIxRFxcdUZCMUYtXFx1RkIyOFxcdUZCMkEtXFx1RkIzNlxcdUZCMzgtXFx1RkIzQ1xcdUZCM0VcXHVGQjQwXFx1RkI0MVxcdUZCNDNcXHVGQjQ0XFx1RkI0Ni1cXHVGQkIxXFx1RkJEMy1cXHVGRDNEXFx1RkQ1MC1cXHVGRDhGXFx1RkQ5Mi1cXHVGREM3XFx1RkRGMC1cXHVGREZCXFx1RkU3MC1cXHVGRTc0XFx1RkU3Ni1cXHVGRUZDXFx1RkYyMS1cXHVGRjNBXFx1RkY0MS1cXHVGRjVBXFx1RkY2Ni1cXHVGRkJFXFx1RkZDMi1cXHVGRkM3XFx1RkZDQS1cXHVGRkNGXFx1RkZEMi1cXHVGRkQ3XFx1RkZEQS1cXHVGRkRDXS8sICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjA3NTA3MFxyXG4gICcqJzogLy4vXHJcbn07XHJcblBhdHRlcm5NYXNrLkRFRl9UWVBFUyA9IHtcclxuICBJTlBVVDogJ2lucHV0JyxcclxuICBGSVhFRDogJ2ZpeGVkJ1xyXG59XHJcblBhdHRlcm5NYXNrLkRFRkFVTFRfUExBQ0VIT0xERVIgPSB7XHJcbiAgc2hvdzogJ2xhenknLFxyXG4gIGNoYXI6ICdfJ1xyXG59O1xyXG4iLCJpbXBvcnQge2lzU3RyaW5nfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmltcG9ydCBCYXNlTWFzayBmcm9tICcuL21hc2tzL2Jhc2UnO1xyXG5pbXBvcnQgUmVnRXhwTWFzayBmcm9tICcuL21hc2tzL3JlZ2V4cCc7XHJcbmltcG9ydCBGdW5jTWFzayBmcm9tICcuL21hc2tzL2Z1bmMnO1xyXG5pbXBvcnQgUGF0dGVybk1hc2sgZnJvbSAnLi9tYXNrcy9wYXR0ZXJuJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5mdW5jdGlvbiBJTWFzayAoZWwsIG9wdHM9e30pIHtcclxuICB2YXIgbWFzayA9IElNYXNrLk1hc2tGYWN0b3J5KGVsLCBvcHRzKTtcclxuICBtYXNrLmJpbmRFdmVudHMoKTtcclxuICAvLyByZWZyZXNoXHJcbiAgbWFzay5yYXdWYWx1ZSA9IGVsLnZhbHVlO1xyXG4gIHJldHVybiBtYXNrO1xyXG59XHJcblxyXG5JTWFzay5NYXNrRmFjdG9yeSA9IGZ1bmN0aW9uIChlbCwgb3B0cykge1xyXG4gIHZhciBtYXNrID0gb3B0cy5tYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgQmFzZU1hc2spIHJldHVybiBtYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gbmV3IFJlZ0V4cE1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHJldHVybiBuZXcgRnVuY01hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChpc1N0cmluZyhtYXNrKSkgcmV0dXJuIG5ldyBQYXR0ZXJuTWFzayhlbCwgb3B0cyk7XHJcbiAgcmV0dXJuIG5ldyBCYXNlTWFzayhlbCwgb3B0cyk7XHJcbn1cclxuSU1hc2suQmFzZU1hc2sgPSBCYXNlTWFzaztcclxuSU1hc2suRnVuY01hc2sgPSBGdW5jTWFzaztcclxuSU1hc2suUmVnRXhwTWFzayA9IFJlZ0V4cE1hc2s7XHJcbklNYXNrLlBhdHRlcm5NYXNrID0gUGF0dGVybk1hc2s7XHJcbndpbmRvdy5JTWFzayA9IElNYXNrO1xyXG4iXSwibmFtZXMiOlsiaXNTdHJpbmciLCJzdHIiLCJTdHJpbmciLCJjb25mb3JtIiwicmVzIiwiZmFsbGJhY2siLCJCYXNlTWFzayIsImVsIiwib3B0cyIsIm1hc2siLCJfbGlzdGVuZXJzIiwiX3JlZnJlc2hpbmdDb3VudCIsInNhdmVTdGF0ZSIsImJpbmQiLCJwcm9jZXNzSW5wdXQiLCJfb25Ecm9wIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ1bmJpbmRFdmVudHMiLCJsZW5ndGgiLCJldiIsIl9vbGRWYWx1ZSIsInJhd1ZhbHVlIiwiX29sZFNlbGVjdGlvbiIsInNlbGVjdGlvblN0YXJ0IiwiY3Vyc29yUG9zIiwiaW5wdXRWYWx1ZSIsImRldGFpbHMiLCJyZXNvbHZlIiwiZmlyZUV2ZW50IiwiaGFuZGxlciIsInB1c2giLCJoSW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwibGlzdGVuZXJzIiwiZm9yRWFjaCIsImwiLCJfb2xkUmF3VmFsdWUiLCJfb2xkVW5tYXNrZWRWYWx1ZSIsInVubWFza2VkVmFsdWUiLCJyZWZyZXNoIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzZWxlY3Rpb25FbmQiLCJwb3MiLCJzZXRTZWxlY3Rpb25SYW5nZSIsInZhbHVlIiwic3RhcnRSZWZyZXNoIiwiZW5kUmVmcmVzaCIsIlJlZ0V4cE1hc2siLCJ0ZXN0IiwiRnVuY01hc2siLCJQYXR0ZXJuTWFzayIsInBsYWNlaG9sZGVyIiwiZGVmaW5pdGlvbnMiLCJERUZJTklUSU9OUyIsIl9ob2xsb3dzIiwiX2J1aWxkUmVzb2x2ZXJzIiwiX2FsaWduQ3Vyc29yIiwiX2NoYXJEZWZzIiwicGF0dGVybiIsInVubWFza2luZ0Jsb2NrIiwib3B0aW9uYWxCbG9jayIsImkiLCJjaCIsInR5cGUiLCJERUZfVFlQRVMiLCJJTlBVVCIsIkZJWEVEIiwidW5tYXNraW5nIiwib3B0aW9uYWwiLCJfcmVzb2x2ZXJzIiwiZGVmS2V5IiwiSU1hc2siLCJNYXNrRmFjdG9yeSIsInRhaWwiLCJwbGFjZWhvbGRlckJ1ZmZlciIsImhvbGxvd3MiLCJzbGljZSIsImNpIiwiZGkiLCJfbWFwUG9zVG9EZWZJbmRleCIsImRlZiIsInJlc29sdmVyIiwiY2hhciIsImNocmVzIiwiX3BsYWNlaG9sZGVyIiwiZnJvbVBvcyIsImlucHV0IiwiX2lzSGlkZGVuSG9sbG93IiwiX2lzSG9sbG93IiwiZGVmSW5kZXgiLCJmaWx0ZXIiLCJoIiwiX2hvbGxvd3NCZWZvcmUiLCJsYXN0SG9sbG93SW5kZXgiLCJoZWFkIiwiaW5zZXJ0ZWQiLCJpbnNlcnRTdGVwcyIsIm9sZFNlbGVjdGlvbiIsIm9sZFZhbHVlIiwic3RhcnRDaGFuZ2VQb3MiLCJNYXRoIiwibWluIiwic3RhcnQiLCJyZW1vdmVkQ291bnQiLCJtYXgiLCJlbmQiLCJpbnNlcnRlZENvdW50Iiwic3Vic3RyaW5nIiwic3Vic3RyIiwidGFpbElucHV0IiwiX2V4dHJhY3RJbnB1dCIsIl9nZW5lcmF0ZUluc2VydFN0ZXBzIiwiaXN0ZXAiLCJzdGVwIiwicmVzdWx0IiwiX3RyeUFwcGVuZFRhaWwiLCJhcHBlbmRlZCIsIl9hcHBlbmRGaXhlZEVuZCIsImhhc0hvbGxvd3MiLCJfYXBwZW5kUGxhY2Vob2xkZXJFbmQiLCJpc0NvbXBsZXRlIiwic2hvdyIsImN1cnNvckRlZkluZGV4IiwiclBvcyIsInJEZWYiLCJsUG9zIiwibERlZiIsIl9tYXBEZWZJbmRleFRvUG9zIiwidW5tYXNrZWQiLCJwaCIsIkRFRkFVTFRfUExBQ0VIT0xERVIiLCJtYXAiLCJqb2luIiwiX2RlZmluaXRpb25zIiwiZGVmcyIsIl9tYXNrIiwiaW5pdGlhbGl6ZWQiLCJiaW5kRXZlbnRzIiwiUmVnRXhwIiwiRnVuY3Rpb24iLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLFNBQVNBLFFBQVQsQ0FBbUJDLEdBQW5CLEVBQXdCO1NBQ2YsT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLGVBQWVDLE1BQWpEOzs7QUFHRixBQUNBLFNBQVNDLE9BQVQsQ0FBa0JDLEdBQWxCLEVBQXVCSCxHQUF2QixFQUF5QztNQUFiSSxRQUFhLHVFQUFKLEVBQUk7O1NBQ2hDTCxTQUFTSSxHQUFULElBQ0xBLEdBREssR0FFTEEsTUFDRUgsR0FERixHQUVFSSxRQUpKOzs7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