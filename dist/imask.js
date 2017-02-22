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

        if (def.type === PatternMask.DEF_TYPES.INPUT && this._hollows.indexOf(di) < 0) input += ch;
        ++ci;
      }
      return input;
    }
  }, {
    key: '_isHiddenHollow',
    value: function _isHiddenHollow(defIndex) {
      return this._hollows.indexOf(defIndex) >= 0 && this._charDefs[defIndex] && this._charDefs[defIndex].optional;
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
            if (this._hollows.indexOf(di) >= 0) hasHollows = true;else break;
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
        if (def.type === PatternMask.DEF_TYPES.INPUT && this._hollows.indexOf(di) < 0) {
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
      var cursorPos = this.el.selectionEnd;
      var cursorDefIndex = this._mapPosToDefIndex(cursorPos);
      for (var rPos = cursorDefIndex; rPos >= 0; --rPos) {
        var rDef = this._charDefs[rPos];
        var lPos = rPos - 1;
        var lDef = this._charDefs[lPos];
        if (this._isHiddenHollow(lPos)) continue;

        if ((!rDef || rDef.type === PatternMask.DEF_TYPES.INPUT && this._hollows.indexOf(rPos) >= 0 && !this._isHiddenHollow(rPos)) && this._hollows.indexOf(lPos) < 0) {
          cursorDefIndex = rPos;
          if (!lDef || lDef.type === PatternMask.DEF_TYPES.INPUT) break;
        }
      }
      cursorPos = this._mapDefIndexToPos(cursorDefIndex);
      this.el.setSelectionRange(cursorPos, cursorPos);
    }
  }, {
    key: 'isComplete',
    get: function get() {
      var _this5 = this;

      return !this._charDefs.filter(function (def, di) {
        return def.type === PatternMask.DEF_TYPES.INPUT && !def.optional && _this5._hollows.indexOf(di) >= 0;
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

        if (def.unmasking && this._hollows.indexOf(di) < 0 && (def.type === PatternMask.DEF_TYPES.INPUT && this._resolvers[def.char].resolve(ch, ci, str) || def.char === ch)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvaW1hc2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0XHJcbmZ1bmN0aW9uIGlzU3RyaW5nIChzdHIpIHtcclxuICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gY29uZm9ybSAocmVzLCBzdHIsIGZhbGxiYWNrPScnKSB7XHJcbiAgcmV0dXJuIGlzU3RyaW5nKHJlcykgP1xyXG4gICAgcmVzIDpcclxuICAgIHJlcyA/XHJcbiAgICAgIHN0ciA6XHJcbiAgICAgIGZhbGxiYWNrO1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuLy8gVE9ET1xyXG4vLyAtIGVtcHR5IHBsYWNlaG9sZGVyXHJcbi8vIC0gdmFsaWRhdGVPbmx5XHJcbi8vIC0gYWRkIGNvbW1lbnRzXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgdGhpcy5fcmVmcmVzaGluZ0NvdW50ID0gMDtcclxuXHJcbiAgICB0aGlzLnNhdmVTdGF0ZSA9IHRoaXMuc2F2ZVN0YXRlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLnByb2Nlc3NJbnB1dCA9IHRoaXMucHJvY2Vzc0lucHV0LmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9vbkRyb3AgPSB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zYXZlU3RhdGUpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMucHJvY2Vzc0lucHV0KTtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcCk7XHJcbiAgfVxyXG5cclxuICB1bmJpbmRFdmVudHMgKCkge1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zYXZlU3RhdGUpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMucHJvY2Vzc0lucHV0KTtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcCk7XHJcbiAgfVxyXG5cclxuICBkZXN0cm95ICgpIHtcclxuICAgIHRoaXMudW5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcclxuICB9XHJcblxyXG4gIGdldCBzZWxlY3Rpb25TdGFydCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbC5zZWxlY3Rpb25TdGFydDtcclxuICB9XHJcblxyXG4gIGdldCBjdXJzb3JQb3MgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWwuc2VsZWN0aW9uRW5kO1xyXG4gIH1cclxuXHJcbiAgc2V0IGN1cnNvclBvcyAocG9zKSB7XHJcbiAgICB0aGlzLmVsLnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zKTtcclxuICB9XHJcblxyXG4gIHNhdmVTdGF0ZSAoZXYpIHtcclxuICAgIHRoaXMuX29sZFZhbHVlID0gdGhpcy5yYXdWYWx1ZTtcclxuICAgIHRoaXMuX29sZFNlbGVjdGlvbiA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuc2VsZWN0aW9uU3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5jdXJzb3JQb3NcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb2Nlc3NJbnB1dCAoZXYpIHtcclxuICAgICB2YXIgaW5wdXRWYWx1ZSA9IHRoaXMucmF3VmFsdWU7XHJcblxyXG4gICAgLy8gdXNlIHNlbGVjdGlvbkVuZCBmb3IgaGFuZGxlIFVuZG9cclxuICAgIHZhciBjdXJzb3JQb3MgPSB0aGlzLmN1cnNvclBvcztcclxuICAgIHZhciBkZXRhaWxzID0ge1xyXG4gICAgICBvbGRTZWxlY3Rpb246IHRoaXMuX29sZFNlbGVjdGlvbixcclxuICAgICAgY3Vyc29yUG9zOiBjdXJzb3JQb3MsXHJcbiAgICAgIG9sZFZhbHVlOiB0aGlzLl9vbGRWYWx1ZVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmVzID0gaW5wdXRWYWx1ZTtcclxuICAgIHJlcyA9IGNvbmZvcm0odGhpcy5yZXNvbHZlKHJlcywgZGV0YWlscyksXHJcbiAgICAgIHJlcyxcclxuICAgICAgdGhpcy5fb2xkVmFsdWUpO1xyXG5cclxuICAgIGlmIChyZXMgIT09IGlucHV0VmFsdWUpIHtcclxuICAgICAgKyt0aGlzLl9yZWZyZXNoaW5nQ291bnQ7XHJcbiAgICAgIHRoaXMucmF3VmFsdWUgPSByZXM7XHJcbiAgICAgIC0tdGhpcy5fcmVmcmVzaGluZ0NvdW50O1xyXG4gICAgICBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuXHJcbiAgICAgIHRoaXMuY3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG4gICAgICAvLyBhbHNvIHF1ZXVlIGNoYW5nZSBjdXJzb3IgZm9yIHNvbWUgYnJvd3NlcnNcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmN1cnNvclBvcyA9IGN1cnNvclBvcywgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlcyAhPT0gdGhpcy5fb2xkVmFsdWUpIHRoaXMuZmlyZUV2ZW50KFwiYWNjZXB0XCIpO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIG9uIChldiwgaGFuZGxlcikge1xyXG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbZXZdKSB0aGlzLl9saXN0ZW5lcnNbZXZdID0gW107XHJcbiAgICB0aGlzLl9saXN0ZW5lcnNbZXZdLnB1c2goaGFuZGxlcik7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIG9mZiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgcmV0dXJuO1xyXG4gICAgaWYgKCFoYW5kbGVyKSB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbZXZdO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgaEluZGV4ID0gdGhpcy5fbGlzdGVuZXJzW2V2XS5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgaWYgKGhJbmRleCA+PSAwKSB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGhJbmRleCwgMSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGZpcmVFdmVudCAoZXYpIHtcclxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZdIHx8IFtdO1xyXG4gICAgbGlzdGVuZXJzLmZvckVhY2gobCA9PiBsKCkpO1xyXG4gIH1cclxuXHJcbiAgLy8gb3ZlcnJpZGUgdGhpc1xyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykgeyByZXR1cm4gc3RyOyB9XHJcblxyXG4gIGdldCByYXdWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbC52YWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCByYXdWYWx1ZSAoc3RyKSB7XHJcbiAgICB0aGlzLnN0YXJ0UmVmcmVzaCgpO1xyXG4gICAgdGhpcy5lbC52YWx1ZSA9IHN0cjtcclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHVubWFza2VkVmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucmF3VmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgdW5tYXNrZWRWYWx1ZSAodmFsdWUpIHtcclxuICAgIHRoaXMucmF3VmFsdWUgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHJlZnJlc2ggKCkge1xyXG4gICAgaWYgKHRoaXMuX3JlZnJlc2hpbmdDb3VudCkgcmV0dXJuO1xyXG4gICAgKyt0aGlzLl9yZWZyZXNoaW5nQ291bnQ7XHJcblxyXG4gICAgdmFyIHN0ciA9IHRoaXMucmF3VmFsdWU7XHJcbiAgICAvLyB1c2UgdW5tYXNrZWQgdmFsdWUgaWYgdmFsdWUgd2FzIG5vdCBjaGFuZ2VkIHRvIHVwZGF0ZSB3aXRoIG9wdGlvbnMgY29ycmVjdGx5XHJcbiAgICBpZiAodGhpcy5fb2xkUmF3VmFsdWUgPT09IHN0cikgc3RyID0gdGhpcy5fb2xkVW5tYXNrZWRWYWx1ZTtcclxuICAgIGRlbGV0ZSB0aGlzLl9vbGRSYXdWYWx1ZTtcclxuICAgIGRlbGV0ZSB0aGlzLl9vbGRVbm1hc2tlZFZhbHVlO1xyXG5cclxuICAgIHZhciBkZXRhaWxzID0ge1xyXG4gICAgICBjdXJzb3JQb3M6IHN0ci5sZW5ndGgsXHJcbiAgICAgIHN0YXJ0Q2hhbmdlUG9zOiAwLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHtcclxuICAgICAgICBzdGFydDogMCxcclxuICAgICAgICBlbmQ6IHN0ci5sZW5ndGhcclxuICAgICAgfSxcclxuICAgICAgcmVtb3ZlZENvdW50OiBzdHIubGVuZ3RoLFxyXG4gICAgICBpbnNlcnRlZENvdW50OiBzdHIubGVuZ3RoLFxyXG4gICAgICBvbGRWYWx1ZTogc3RyXHJcbiAgICB9O1xyXG4gICAgdGhpcy5yYXdWYWx1ZSA9IGNvbmZvcm0odGhpcy5yZXNvbHZlKHN0ciwgZGV0YWlscyksIHN0cik7XHJcblxyXG4gICAgLS10aGlzLl9yZWZyZXNoaW5nQ291bnQ7XHJcbiAgfVxyXG5cclxuICBzdGFydFJlZnJlc2ggKCkge1xyXG4gICAgLy8gc3RvcmUgdW5tYXNrZWQgdmFsdWUgdG8gYXBwbHkgYWZ0ZXIgY2hhbmdlc1xyXG4gICAgaWYgKCF0aGlzLl9yZWZyZXNoaW5nQ291bnQpIHtcclxuICAgICAgdGhpcy5fb2xkVW5tYXNrZWRWYWx1ZSA9IHRoaXMudW5tYXNrZWRWYWx1ZTtcclxuICAgICAgdGhpcy5fb2xkUmF3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlO1xyXG4gICAgfVxyXG4gICAgKyt0aGlzLl9yZWZyZXNoaW5nQ291bnQ7XHJcbiAgfVxyXG5cclxuICBlbmRSZWZyZXNoICgpIHtcclxuICAgIC0tdGhpcy5fcmVmcmVzaGluZ0NvdW50O1xyXG4gICAgaWYgKCF0aGlzLl9yZWZyZXNoaW5nQ291bnQpIHRoaXMucmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgX29uRHJvcCAoZXYpIHtcclxuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBSZWdFeHBNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIHJlc29sdmUgKHN0cikge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzay50ZXN0KHN0cik7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgRnVuY01hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoLi4uYXJncykge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzayguLi5hcmdzKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtjb25mb3JtfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFBhdHRlcm5NYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgc3VwZXIoZWwsIG9wdHMpO1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuXHJcbiAgICB0aGlzLnBsYWNlaG9sZGVyID0gb3B0cy5wbGFjZWhvbGRlcjtcclxuICAgIHRoaXMuZGVmaW5pdGlvbnMgPSB7XHJcbiAgICAgIC4uLlBhdHRlcm5NYXNrLkRFRklOSVRJT05TLFxyXG4gICAgICAuLi5vcHRzLmRlZmluaXRpb25zXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2hvbGxvd3MgPSBbXTtcclxuICAgIHRoaXMuX2J1aWxkUmVzb2x2ZXJzKCk7XHJcblxyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IgPSB0aGlzLl9hbGlnbkN1cnNvci5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci5iaW5kRXZlbnRzKCk7XHJcbiAgICBbJ2NsaWNrJywgJ2ZvY3VzJ10uZm9yRWFjaChldiA9PlxyXG4gICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoZXYsIHRoaXMuX2FsaWduQ3Vyc29yKSk7XHJcbiAgfVxyXG5cclxuICB1bmJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIudW5iaW5kRXZlbnRzKCk7XHJcbiAgICBbJ2NsaWNrJywgJ2ZvY3VzJ10uZm9yRWFjaChldiA9PlxyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXYsIHRoaXMuX2FsaWduQ3Vyc29yKSk7XHJcbiAgfVxyXG5cclxuICBfYnVpbGRSZXNvbHZlcnMgKCkge1xyXG4gICAgdGhpcy5fY2hhckRlZnMgPSBbXTtcclxuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5tYXNrO1xyXG5cclxuICAgIGlmICghcGF0dGVybiB8fCAhdGhpcy5kZWZpbml0aW9ucykgcmV0dXJuO1xyXG5cclxuICAgIHZhciB1bm1hc2tpbmdCbG9jayA9IGZhbHNlO1xyXG4gICAgdmFyIG9wdGlvbmFsQmxvY2sgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgIHZhciB0eXBlID0gIXVubWFza2luZ0Jsb2NrICYmIGNoIGluIHRoaXMuZGVmaW5pdGlvbnMgP1xyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCA6XHJcbiAgICAgICAgUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB2YXIgdW5tYXNraW5nID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUIHx8IHVubWFza2luZ0Jsb2NrO1xyXG4gICAgICB2YXIgb3B0aW9uYWwgPSB0eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgb3B0aW9uYWxCbG9jaztcclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ3snIHx8IGNoID09PSAnfScpIHtcclxuICAgICAgICB1bm1hc2tpbmdCbG9jayA9ICF1bm1hc2tpbmdCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSAnWycgfHwgY2ggPT09ICddJykge1xyXG4gICAgICAgIG9wdGlvbmFsQmxvY2sgPSAhb3B0aW9uYWxCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSAnXFxcXCcpIHtcclxuICAgICAgICArK2k7XHJcbiAgICAgICAgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICAgIC8vIFRPRE8gdmFsaWRhdGlvblxyXG4gICAgICAgIGlmICghY2gpIGJyZWFrO1xyXG4gICAgICAgIHR5cGUgPSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2NoYXJEZWZzLnB1c2goe1xyXG4gICAgICAgIGNoYXI6IGNoLFxyXG4gICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgb3B0aW9uYWw6IG9wdGlvbmFsLFxyXG4gICAgICAgIHVubWFza2luZzogdW5tYXNraW5nXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3Jlc29sdmVycyA9IHt9O1xyXG4gICAgZm9yICh2YXIgZGVmS2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgdGhpcy5fcmVzb2x2ZXJzW2RlZktleV0gPSBJTWFzay5NYXNrRmFjdG9yeSh0aGlzLmVsLCB7XHJcbiAgICAgICAgbWFzazogdGhpcy5kZWZpbml0aW9uc1tkZWZLZXldXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX3RyeUFwcGVuZFRhaWwgKHN0ciwgdGFpbCkge1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHN0ci5sZW5ndGgpOyBjaSA8IHRhaWwubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHRhaWxbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgLy8gZmFpbGVkXHJcbiAgICAgIGlmICghZGVmKSByZXR1cm47XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgZGksIHN0cikgfHwgJyc7XHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICBjaHJlcyA9IGNvbmZvcm0oY2hyZXMsIGNoKTtcclxuICAgICAgICAgICsrY2k7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICghZGVmLm9wdGlvbmFsKSBjaHJlcyA9IHRoaXMuX3BsYWNlaG9sZGVyLmNoYXI7XHJcbiAgICAgICAgICBob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdHIgKz0gcGxhY2Vob2xkZXJCdWZmZXIgKyBjaHJlcztcclxuICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtzdHIsIGhvbGxvd3NdO1xyXG4gIH1cclxuXHJcbiAgX2V4dHJhY3RJbnB1dCAoc3RyLCBmcm9tUG9zPTApIHtcclxuICAgIHZhciBpbnB1dCA9ICcnO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoZnJvbVBvcyk7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmXHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5pbmRleE9mKGRpKSA8IDApIGlucHV0ICs9IGNoO1xyXG4gICAgICArK2NpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgX2lzSGlkZGVuSG9sbG93IChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkZWZJbmRleCkgPj0gMCAmJlxyXG4gICAgICB0aGlzLl9jaGFyRGVmc1tkZWZJbmRleF0gJiYgdGhpcy5fY2hhckRlZnNbZGVmSW5kZXhdLm9wdGlvbmFsO1xyXG4gIH1cclxuXHJcbiAgX2hvbGxvd3NCZWZvcmUgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgZGVmSW5kZXggJiYgdGhpcy5faXNIaWRkZW5Ib2xsb3coaCkpO1xyXG4gIH1cclxuXHJcbiAgX21hcERlZkluZGV4VG9Qb3MgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gZGVmSW5kZXggLSB0aGlzLl9ob2xsb3dzQmVmb3JlKGRlZkluZGV4KS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBfbWFwUG9zVG9EZWZJbmRleCAocG9zKSB7XHJcbiAgICB2YXIgbGFzdEhvbGxvd0luZGV4ID0gcG9zO1xyXG4gICAgLy8gZXh0ZW5kIGNvbnRpZ3VvdXNcclxuICAgIHdoaWxlICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhsYXN0SG9sbG93SW5kZXgtMSkpICsrbGFzdEhvbGxvd0luZGV4O1xyXG5cclxuICAgIHJldHVybiBwb3MgKyB0aGlzLl9ob2xsb3dzQmVmb3JlKGxhc3RIb2xsb3dJbmRleCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX2dlbmVyYXRlSW5zZXJ0U3RlcHMgKGhlYWQsIGluc2VydGVkKSB7XHJcbiAgICB2YXIgcmVzID0gaGVhZDtcclxuICAgIHZhciBob2xsb3dzID0gdGhpcy5faG9sbG93cy5zbGljZSgpO1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaW5zZXJ0U3RlcHMgPSBbW3JlcywgaG9sbG93cy5zbGljZSgpXV07XHJcblxyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9dGhpcy5fbWFwUG9zVG9EZWZJbmRleChoZWFkLmxlbmd0aCk7IGNpPGluc2VydGVkLmxlbmd0aDspIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgaWYgKCFkZWYpIGJyZWFrO1xyXG5cclxuICAgICAgdmFyIGNoID0gaW5zZXJ0ZWRbY2ldO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgY2ksIHJlcykgfHwgJyc7XHJcbiAgICAgICAgLy8gaWYgb2sgLSBuZXh0IGRpXHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICByZXMgKz0gcGxhY2Vob2xkZXJCdWZmZXIgKyBjb25mb3JtKGNocmVzLCBjaCk7IHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICAgICAgICBpbnNlcnRTdGVwcy5wdXNoKFtyZXMsIGhvbGxvd3Muc2xpY2UoKV0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGVmLm9wdGlvbmFsKSB7XHJcbiAgICAgICAgICBpZiAoaG9sbG93cy5pbmRleE9mKGRpKSA8IDApIGhvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjaHJlcyB8fCBkZWYub3B0aW9uYWwpICsrZGk7XHJcbiAgICAgICAgaWYgKGNocmVzIHx8ICFkZWYub3B0aW9uYWwpICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcblxyXG4gICAgICAgIGlmIChjaCA9PT0gZGVmLmNoYXIpICsrY2k7XHJcbiAgICAgICAgKytkaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnNlcnRTdGVwcztcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgdmFyIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgdmFyIG9sZFNlbGVjdGlvbiA9IGRldGFpbHMub2xkU2VsZWN0aW9uO1xyXG4gICAgdmFyIG9sZFZhbHVlID0gZGV0YWlscy5vbGRWYWx1ZTtcclxuICAgIHZhciBzdGFydENoYW5nZVBvcyA9IE1hdGgubWluKGN1cnNvclBvcywgb2xkU2VsZWN0aW9uLnN0YXJ0KTtcclxuICAgIC8vIE1hdGgubWF4IGZvciBvcHBvc2l0ZSBvcGVyYXRpb25cclxuICAgIHZhciByZW1vdmVkQ291bnQgPSBNYXRoLm1heCgob2xkU2VsZWN0aW9uLmVuZCAtIHN0YXJ0Q2hhbmdlUG9zKSB8fFxyXG4gICAgICAvLyBmb3IgRGVsZXRlXHJcbiAgICAgIG9sZFZhbHVlLmxlbmd0aCAtIHN0ci5sZW5ndGgsIDApO1xyXG4gICAgdmFyIGluc2VydGVkQ291bnQgPSBjdXJzb3JQb3MgLSBzdGFydENoYW5nZVBvcztcclxuXHJcblxyXG4gICAgdmFyIGhlYWQgPSBzdHIuc3Vic3RyaW5nKDAsIHN0YXJ0Q2hhbmdlUG9zKTtcclxuICAgIHZhciB0YWlsID0gc3RyLnN1YnN0cmluZyhzdGFydENoYW5nZVBvcyArIGluc2VydGVkQ291bnQpO1xyXG4gICAgdmFyIGluc2VydGVkID0gc3RyLnN1YnN0cihzdGFydENoYW5nZVBvcywgaW5zZXJ0ZWRDb3VudCk7XHJcblxyXG4gICAgdmFyIHRhaWxJbnB1dCA9IHRoaXMuX2V4dHJhY3RJbnB1dCh0YWlsLCBzdGFydENoYW5nZVBvcyArIHJlbW92ZWRDb3VudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhvbGxvd3MgYWZ0ZXIgY3Vyc29yXHJcbiAgICB2YXIgbGFzdEhvbGxvd0luZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChzdGFydENoYW5nZVBvcyk7XHJcbiAgICB0aGlzLl9ob2xsb3dzID0gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgbGFzdEhvbGxvd0luZGV4KTtcclxuXHJcbiAgICB2YXIgcmVzID0gaGVhZDtcclxuXHJcbiAgICAvLyBpbnNlcnQgYXZhaWxhYmxlXHJcbiAgICB2YXIgaW5zZXJ0U3RlcHMgPSB0aGlzLl9nZW5lcmF0ZUluc2VydFN0ZXBzKGhlYWQsIGluc2VydGVkKTtcclxuICAgIGZvciAodmFyIGlzdGVwPWluc2VydFN0ZXBzLmxlbmd0aC0xOyBpc3RlcCA+PSAwOyAtLWlzdGVwKSB7XHJcbiAgICAgIHZhciBzdGVwO1xyXG4gICAgICBbc3RlcCwgdGhpcy5faG9sbG93c10gPSBpbnNlcnRTdGVwc1tpc3RlcF07XHJcbiAgICAgIHZhciByZXN1bHQgPSB0aGlzLl90cnlBcHBlbmRUYWlsKHN0ZXAsIHRhaWxJbnB1dCk7XHJcbiAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IHJlc3VsdDtcclxuICAgICAgICBjdXJzb3JQb3MgPSBzdGVwLmxlbmd0aDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbnNlcnRlZCkge1xyXG4gICAgICAvLyBhcHBlbmQgZml4ZWQgYXQgZW5kXHJcbiAgICAgIHZhciBhcHBlbmRlZCA9IHRoaXMuX2FwcGVuZEZpeGVkRW5kKHJlcyk7XHJcbiAgICAgIGN1cnNvclBvcyArPSBhcHBlbmRlZC5sZW5ndGggLSByZXMubGVuZ3RoO1xyXG4gICAgICByZXMgPSBhcHBlbmRlZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgaGVhZCBmaXhlZCBhbmQgaG9sbG93cyBpZiByZW1vdmVkIGF0IGVuZFxyXG4gICAgaWYgKCFpbnNlcnRlZCAmJiBjdXJzb3JQb3MgPT09IHJlcy5sZW5ndGgpIHtcclxuICAgICAgdmFyIGRpID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChjdXJzb3JQb3MtMSk7XHJcbiAgICAgIHZhciBoYXNIb2xsb3dzID0gZmFsc2U7XHJcbiAgICAgIGZvciAoOyBkaSA+IDA7IC0tZGkpIHtcclxuICAgICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5faG9sbG93cy5pbmRleE9mKGRpKSA+PSAwKSBoYXNIb2xsb3dzID0gdHJ1ZTtcclxuICAgICAgICAgIGVsc2UgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChoYXNIb2xsb3dzKSByZXMgPSByZXMuc2xpY2UoMCwgZGkgKyAxKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhcHBlbmQgcGxhY2Vob2xkZXJcclxuICAgIHJlcyA9IHRoaXMuX2FwcGVuZFBsYWNlaG9sZGVyRW5kKHJlcyk7XHJcbiAgICBkZXRhaWxzLmN1cnNvclBvcyA9IGN1cnNvclBvcztcclxuXHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChldikge1xyXG4gICAgdmFyIHJlcyA9IHN1cGVyLnByb2Nlc3NJbnB1dChldik7XHJcbiAgICBpZiAocmVzICE9PSB0aGlzLl9vbGRWYWx1ZSAmJiB0aGlzLmlzQ29tcGxldGUpIHRoaXMuZmlyZUV2ZW50KFwiY29tcGxldGVcIik7XHJcbiAgfVxyXG5cclxuICBnZXQgaXNDb21wbGV0ZSAoKSB7XHJcbiAgICByZXR1cm4gIXRoaXMuX2NoYXJEZWZzLmZpbHRlcigoZGVmLCBkaSkgPT5cclxuICAgICAgZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiAhZGVmLm9wdGlvbmFsICYmXHJcbiAgICAgIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkaSkgPj0gMCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZEZpeGVkRW5kIChyZXMpIHtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7OyArK2RpKSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIGlmIChkaSA+PSByZXMubGVuZ3RoKSByZXMgKz0gZGVmLmNoYXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFBsYWNlaG9sZGVyRW5kIChyZXMpIHtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7IGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGkpIDwgMCkge1xyXG4gICAgICAgIHRoaXMuX2hvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuX3BsYWNlaG9sZGVyLnNob3cgPT09ICdhbHdheXMnKSB7XHJcbiAgICAgICAgcmVzICs9IGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgICAgZGVmLmNoYXIgOlxyXG4gICAgICAgICAgIWRlZi5vcHRpb25hbCA/XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgICAnJztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHZhciBzdHIgPSB0aGlzLnJhd1ZhbHVlO1xyXG4gICAgdmFyIHVubWFza2VkID0gJyc7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT0wOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGRpKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoZGVmLnVubWFza2luZyAmJiB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGkpIDwgMCAmJlxyXG4gICAgICAgIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl0ucmVzb2x2ZShjaCwgY2ksIHN0cikgfHxcclxuICAgICAgICAgIGRlZi5jaGFyID09PSBjaCkpIHtcclxuICAgICAgICB1bm1hc2tlZCArPSBjaDtcclxuICAgICAgfVxyXG4gICAgICArK2NpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVubWFza2VkO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHN0cikge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuXHJcbiAgICB2YXIgcmVzID0gJyc7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT0wOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDspIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuXHJcbiAgICAgIHZhciBjaHJlcyA9ICcnO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdLnJlc29sdmUoY2gsIGNpLCByZXMpKSB7XHJcbiAgICAgICAgICBjaHJlcyA9IGNoO1xyXG4gICAgICAgICAgKytkaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKytjaTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjaHJlcyA9IGRlZi5jaGFyO1xyXG4gICAgICAgIGlmIChkZWYudW5tYXNraW5nICYmIGRlZi5jaGFyID09PSBjaCkgKytjaTtcclxuICAgICAgICArK2RpO1xyXG4gICAgICB9XHJcbiAgICAgIHJlcyArPSBjaHJlcztcclxuICAgIH1cclxuICAgIHRoaXMuX2hvbGxvd3MubGVuZ3RoID0gMDtcclxuICAgIHRoaXMucmF3VmFsdWUgPSByZXM7XHJcblxyXG4gICAgdGhpcy5lbmRSZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgcGxhY2Vob2xkZXIgKCkgeyByZXR1cm4gdGhpcy5fcGxhY2Vob2xkZXI7IH1cclxuXHJcbiAgc2V0IHBsYWNlaG9sZGVyIChwaCkge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuX3BsYWNlaG9sZGVyID0ge1xyXG4gICAgICAuLi5QYXR0ZXJuTWFzay5ERUZBVUxUX1BMQUNFSE9MREVSLFxyXG4gICAgICAuLi5waFxyXG4gICAgfTtcclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHBsYWNlaG9sZGVyTGFiZWwgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NoYXJEZWZzLm1hcChkZWYgPT5cclxuICAgICAgZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCA/XHJcbiAgICAgICAgZGVmLmNoYXIgOlxyXG4gICAgICAgICFkZWYub3B0aW9uYWwgP1xyXG4gICAgICAgICAgdGhpcy5fcGxhY2Vob2xkZXIuY2hhciA6XHJcbiAgICAgICAgICAnJykuam9pbignJyk7XHJcbiAgfVxyXG5cclxuICBnZXQgZGVmaW5pdGlvbnMgKCkgeyByZXR1cm4gdGhpcy5fZGVmaW5pdGlvbnM7IH1cclxuXHJcbiAgc2V0IGRlZmluaXRpb25zIChkZWZzKSB7XHJcbiAgICB0aGlzLnN0YXJ0UmVmcmVzaCgpO1xyXG4gICAgdGhpcy5fZGVmaW5pdGlvbnMgPSBkZWZzO1xyXG4gICAgdGhpcy5fYnVpbGRSZXNvbHZlcnMoKTtcclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IG1hc2sgKCkgeyByZXR1cm4gdGhpcy5fbWFzazsgfVxyXG5cclxuICBzZXQgbWFzayAobWFzaykge1xyXG4gICAgdmFyIGluaXRpYWxpemVkID0gdGhpcy5fbWFzaztcclxuICAgIGlmIChpbml0aWFsaXplZCkgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuX21hc2sgPSBtYXNrO1xyXG4gICAgaWYgKGluaXRpYWxpemVkKSB7XHJcbiAgICAgIHRoaXMuX2J1aWxkUmVzb2x2ZXJzKCk7XHJcbiAgICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2FsaWduQ3Vyc29yICgpIHtcclxuICAgIHZhciBjdXJzb3JQb3MgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuICAgIHZhciBjdXJzb3JEZWZJbmRleCA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgoY3Vyc29yUG9zKTtcclxuICAgIGZvciAodmFyIHJQb3MgPSBjdXJzb3JEZWZJbmRleDsgclBvcyA+PSAwOyAtLXJQb3MpIHtcclxuICAgICAgdmFyIHJEZWYgPSB0aGlzLl9jaGFyRGVmc1tyUG9zXTtcclxuICAgICAgdmFyIGxQb3MgPSByUG9zLTE7XHJcbiAgICAgIHZhciBsRGVmID0gdGhpcy5fY2hhckRlZnNbbFBvc107XHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhsUG9zKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoKCFyRGVmIHx8IHJEZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihyUG9zKSA+PSAwICYmICF0aGlzLl9pc0hpZGRlbkhvbGxvdyhyUG9zKSkgJiZcclxuICAgICAgICB0aGlzLl9ob2xsb3dzLmluZGV4T2YobFBvcykgPCAwKSB7XHJcbiAgICAgICAgY3Vyc29yRGVmSW5kZXggPSByUG9zO1xyXG4gICAgICAgIGlmICghbERlZiB8fCBsRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGN1cnNvclBvcyA9IHRoaXMuX21hcERlZkluZGV4VG9Qb3MoY3Vyc29yRGVmSW5kZXgpO1xyXG4gICAgdGhpcy5lbC5zZXRTZWxlY3Rpb25SYW5nZShjdXJzb3JQb3MsIGN1cnNvclBvcyk7XHJcbiAgfVxyXG59XHJcblBhdHRlcm5NYXNrLkRFRklOSVRJT05TID0ge1xyXG4gICcwJzogL1xcZC8sXHJcbiAgJ2EnOiAvW1xcdTAwNDEtXFx1MDA1QVxcdTAwNjEtXFx1MDA3QVxcdTAwQUFcXHUwMEI1XFx1MDBCQVxcdTAwQzAtXFx1MDBENlxcdTAwRDgtXFx1MDBGNlxcdTAwRjgtXFx1MDJDMVxcdTAyQzYtXFx1MDJEMVxcdTAyRTAtXFx1MDJFNFxcdTAyRUNcXHUwMkVFXFx1MDM3MC1cXHUwMzc0XFx1MDM3NlxcdTAzNzdcXHUwMzdBLVxcdTAzN0RcXHUwMzg2XFx1MDM4OC1cXHUwMzhBXFx1MDM4Q1xcdTAzOEUtXFx1MDNBMVxcdTAzQTMtXFx1MDNGNVxcdTAzRjctXFx1MDQ4MVxcdTA0OEEtXFx1MDUyN1xcdTA1MzEtXFx1MDU1NlxcdTA1NTlcXHUwNTYxLVxcdTA1ODdcXHUwNUQwLVxcdTA1RUFcXHUwNUYwLVxcdTA1RjJcXHUwNjIwLVxcdTA2NEFcXHUwNjZFXFx1MDY2RlxcdTA2NzEtXFx1MDZEM1xcdTA2RDVcXHUwNkU1XFx1MDZFNlxcdTA2RUVcXHUwNkVGXFx1MDZGQS1cXHUwNkZDXFx1MDZGRlxcdTA3MTBcXHUwNzEyLVxcdTA3MkZcXHUwNzRELVxcdTA3QTVcXHUwN0IxXFx1MDdDQS1cXHUwN0VBXFx1MDdGNFxcdTA3RjVcXHUwN0ZBXFx1MDgwMC1cXHUwODE1XFx1MDgxQVxcdTA4MjRcXHUwODI4XFx1MDg0MC1cXHUwODU4XFx1MDhBMFxcdTA4QTItXFx1MDhBQ1xcdTA5MDQtXFx1MDkzOVxcdTA5M0RcXHUwOTUwXFx1MDk1OC1cXHUwOTYxXFx1MDk3MS1cXHUwOTc3XFx1MDk3OS1cXHUwOTdGXFx1MDk4NS1cXHUwOThDXFx1MDk4RlxcdTA5OTBcXHUwOTkzLVxcdTA5QThcXHUwOUFBLVxcdTA5QjBcXHUwOUIyXFx1MDlCNi1cXHUwOUI5XFx1MDlCRFxcdTA5Q0VcXHUwOURDXFx1MDlERFxcdTA5REYtXFx1MDlFMVxcdTA5RjBcXHUwOUYxXFx1MEEwNS1cXHUwQTBBXFx1MEEwRlxcdTBBMTBcXHUwQTEzLVxcdTBBMjhcXHUwQTJBLVxcdTBBMzBcXHUwQTMyXFx1MEEzM1xcdTBBMzVcXHUwQTM2XFx1MEEzOFxcdTBBMzlcXHUwQTU5LVxcdTBBNUNcXHUwQTVFXFx1MEE3Mi1cXHUwQTc0XFx1MEE4NS1cXHUwQThEXFx1MEE4Ri1cXHUwQTkxXFx1MEE5My1cXHUwQUE4XFx1MEFBQS1cXHUwQUIwXFx1MEFCMlxcdTBBQjNcXHUwQUI1LVxcdTBBQjlcXHUwQUJEXFx1MEFEMFxcdTBBRTBcXHUwQUUxXFx1MEIwNS1cXHUwQjBDXFx1MEIwRlxcdTBCMTBcXHUwQjEzLVxcdTBCMjhcXHUwQjJBLVxcdTBCMzBcXHUwQjMyXFx1MEIzM1xcdTBCMzUtXFx1MEIzOVxcdTBCM0RcXHUwQjVDXFx1MEI1RFxcdTBCNUYtXFx1MEI2MVxcdTBCNzFcXHUwQjgzXFx1MEI4NS1cXHUwQjhBXFx1MEI4RS1cXHUwQjkwXFx1MEI5Mi1cXHUwQjk1XFx1MEI5OVxcdTBCOUFcXHUwQjlDXFx1MEI5RVxcdTBCOUZcXHUwQkEzXFx1MEJBNFxcdTBCQTgtXFx1MEJBQVxcdTBCQUUtXFx1MEJCOVxcdTBCRDBcXHUwQzA1LVxcdTBDMENcXHUwQzBFLVxcdTBDMTBcXHUwQzEyLVxcdTBDMjhcXHUwQzJBLVxcdTBDMzNcXHUwQzM1LVxcdTBDMzlcXHUwQzNEXFx1MEM1OFxcdTBDNTlcXHUwQzYwXFx1MEM2MVxcdTBDODUtXFx1MEM4Q1xcdTBDOEUtXFx1MEM5MFxcdTBDOTItXFx1MENBOFxcdTBDQUEtXFx1MENCM1xcdTBDQjUtXFx1MENCOVxcdTBDQkRcXHUwQ0RFXFx1MENFMFxcdTBDRTFcXHUwQ0YxXFx1MENGMlxcdTBEMDUtXFx1MEQwQ1xcdTBEMEUtXFx1MEQxMFxcdTBEMTItXFx1MEQzQVxcdTBEM0RcXHUwRDRFXFx1MEQ2MFxcdTBENjFcXHUwRDdBLVxcdTBEN0ZcXHUwRDg1LVxcdTBEOTZcXHUwRDlBLVxcdTBEQjFcXHUwREIzLVxcdTBEQkJcXHUwREJEXFx1MERDMC1cXHUwREM2XFx1MEUwMS1cXHUwRTMwXFx1MEUzMlxcdTBFMzNcXHUwRTQwLVxcdTBFNDZcXHUwRTgxXFx1MEU4MlxcdTBFODRcXHUwRTg3XFx1MEU4OFxcdTBFOEFcXHUwRThEXFx1MEU5NC1cXHUwRTk3XFx1MEU5OS1cXHUwRTlGXFx1MEVBMS1cXHUwRUEzXFx1MEVBNVxcdTBFQTdcXHUwRUFBXFx1MEVBQlxcdTBFQUQtXFx1MEVCMFxcdTBFQjJcXHUwRUIzXFx1MEVCRFxcdTBFQzAtXFx1MEVDNFxcdTBFQzZcXHUwRURDLVxcdTBFREZcXHUwRjAwXFx1MEY0MC1cXHUwRjQ3XFx1MEY0OS1cXHUwRjZDXFx1MEY4OC1cXHUwRjhDXFx1MTAwMC1cXHUxMDJBXFx1MTAzRlxcdTEwNTAtXFx1MTA1NVxcdTEwNUEtXFx1MTA1RFxcdTEwNjFcXHUxMDY1XFx1MTA2NlxcdTEwNkUtXFx1MTA3MFxcdTEwNzUtXFx1MTA4MVxcdTEwOEVcXHUxMEEwLVxcdTEwQzVcXHUxMEM3XFx1MTBDRFxcdTEwRDAtXFx1MTBGQVxcdTEwRkMtXFx1MTI0OFxcdTEyNEEtXFx1MTI0RFxcdTEyNTAtXFx1MTI1NlxcdTEyNThcXHUxMjVBLVxcdTEyNURcXHUxMjYwLVxcdTEyODhcXHUxMjhBLVxcdTEyOERcXHUxMjkwLVxcdTEyQjBcXHUxMkIyLVxcdTEyQjVcXHUxMkI4LVxcdTEyQkVcXHUxMkMwXFx1MTJDMi1cXHUxMkM1XFx1MTJDOC1cXHUxMkQ2XFx1MTJEOC1cXHUxMzEwXFx1MTMxMi1cXHUxMzE1XFx1MTMxOC1cXHUxMzVBXFx1MTM4MC1cXHUxMzhGXFx1MTNBMC1cXHUxM0Y0XFx1MTQwMS1cXHUxNjZDXFx1MTY2Ri1cXHUxNjdGXFx1MTY4MS1cXHUxNjlBXFx1MTZBMC1cXHUxNkVBXFx1MTcwMC1cXHUxNzBDXFx1MTcwRS1cXHUxNzExXFx1MTcyMC1cXHUxNzMxXFx1MTc0MC1cXHUxNzUxXFx1MTc2MC1cXHUxNzZDXFx1MTc2RS1cXHUxNzcwXFx1MTc4MC1cXHUxN0IzXFx1MTdEN1xcdTE3RENcXHUxODIwLVxcdTE4NzdcXHUxODgwLVxcdTE4QThcXHUxOEFBXFx1MThCMC1cXHUxOEY1XFx1MTkwMC1cXHUxOTFDXFx1MTk1MC1cXHUxOTZEXFx1MTk3MC1cXHUxOTc0XFx1MTk4MC1cXHUxOUFCXFx1MTlDMS1cXHUxOUM3XFx1MUEwMC1cXHUxQTE2XFx1MUEyMC1cXHUxQTU0XFx1MUFBN1xcdTFCMDUtXFx1MUIzM1xcdTFCNDUtXFx1MUI0QlxcdTFCODMtXFx1MUJBMFxcdTFCQUVcXHUxQkFGXFx1MUJCQS1cXHUxQkU1XFx1MUMwMC1cXHUxQzIzXFx1MUM0RC1cXHUxQzRGXFx1MUM1QS1cXHUxQzdEXFx1MUNFOS1cXHUxQ0VDXFx1MUNFRS1cXHUxQ0YxXFx1MUNGNVxcdTFDRjZcXHUxRDAwLVxcdTFEQkZcXHUxRTAwLVxcdTFGMTVcXHUxRjE4LVxcdTFGMURcXHUxRjIwLVxcdTFGNDVcXHUxRjQ4LVxcdTFGNERcXHUxRjUwLVxcdTFGNTdcXHUxRjU5XFx1MUY1QlxcdTFGNURcXHUxRjVGLVxcdTFGN0RcXHUxRjgwLVxcdTFGQjRcXHUxRkI2LVxcdTFGQkNcXHUxRkJFXFx1MUZDMi1cXHUxRkM0XFx1MUZDNi1cXHUxRkNDXFx1MUZEMC1cXHUxRkQzXFx1MUZENi1cXHUxRkRCXFx1MUZFMC1cXHUxRkVDXFx1MUZGMi1cXHUxRkY0XFx1MUZGNi1cXHUxRkZDXFx1MjA3MVxcdTIwN0ZcXHUyMDkwLVxcdTIwOUNcXHUyMTAyXFx1MjEwN1xcdTIxMEEtXFx1MjExM1xcdTIxMTVcXHUyMTE5LVxcdTIxMURcXHUyMTI0XFx1MjEyNlxcdTIxMjhcXHUyMTJBLVxcdTIxMkRcXHUyMTJGLVxcdTIxMzlcXHUyMTNDLVxcdTIxM0ZcXHUyMTQ1LVxcdTIxNDlcXHUyMTRFXFx1MjE4M1xcdTIxODRcXHUyQzAwLVxcdTJDMkVcXHUyQzMwLVxcdTJDNUVcXHUyQzYwLVxcdTJDRTRcXHUyQ0VCLVxcdTJDRUVcXHUyQ0YyXFx1MkNGM1xcdTJEMDAtXFx1MkQyNVxcdTJEMjdcXHUyRDJEXFx1MkQzMC1cXHUyRDY3XFx1MkQ2RlxcdTJEODAtXFx1MkQ5NlxcdTJEQTAtXFx1MkRBNlxcdTJEQTgtXFx1MkRBRVxcdTJEQjAtXFx1MkRCNlxcdTJEQjgtXFx1MkRCRVxcdTJEQzAtXFx1MkRDNlxcdTJEQzgtXFx1MkRDRVxcdTJERDAtXFx1MkRENlxcdTJERDgtXFx1MkRERVxcdTJFMkZcXHUzMDA1XFx1MzAwNlxcdTMwMzEtXFx1MzAzNVxcdTMwM0JcXHUzMDNDXFx1MzA0MS1cXHUzMDk2XFx1MzA5RC1cXHUzMDlGXFx1MzBBMS1cXHUzMEZBXFx1MzBGQy1cXHUzMEZGXFx1MzEwNS1cXHUzMTJEXFx1MzEzMS1cXHUzMThFXFx1MzFBMC1cXHUzMUJBXFx1MzFGMC1cXHUzMUZGXFx1MzQwMC1cXHU0REI1XFx1NEUwMC1cXHU5RkNDXFx1QTAwMC1cXHVBNDhDXFx1QTREMC1cXHVBNEZEXFx1QTUwMC1cXHVBNjBDXFx1QTYxMC1cXHVBNjFGXFx1QTYyQVxcdUE2MkJcXHVBNjQwLVxcdUE2NkVcXHVBNjdGLVxcdUE2OTdcXHVBNkEwLVxcdUE2RTVcXHVBNzE3LVxcdUE3MUZcXHVBNzIyLVxcdUE3ODhcXHVBNzhCLVxcdUE3OEVcXHVBNzkwLVxcdUE3OTNcXHVBN0EwLVxcdUE3QUFcXHVBN0Y4LVxcdUE4MDFcXHVBODAzLVxcdUE4MDVcXHVBODA3LVxcdUE4MEFcXHVBODBDLVxcdUE4MjJcXHVBODQwLVxcdUE4NzNcXHVBODgyLVxcdUE4QjNcXHVBOEYyLVxcdUE4RjdcXHVBOEZCXFx1QTkwQS1cXHVBOTI1XFx1QTkzMC1cXHVBOTQ2XFx1QTk2MC1cXHVBOTdDXFx1QTk4NC1cXHVBOUIyXFx1QTlDRlxcdUFBMDAtXFx1QUEyOFxcdUFBNDAtXFx1QUE0MlxcdUFBNDQtXFx1QUE0QlxcdUFBNjAtXFx1QUE3NlxcdUFBN0FcXHVBQTgwLVxcdUFBQUZcXHVBQUIxXFx1QUFCNVxcdUFBQjZcXHVBQUI5LVxcdUFBQkRcXHVBQUMwXFx1QUFDMlxcdUFBREItXFx1QUFERFxcdUFBRTAtXFx1QUFFQVxcdUFBRjItXFx1QUFGNFxcdUFCMDEtXFx1QUIwNlxcdUFCMDktXFx1QUIwRVxcdUFCMTEtXFx1QUIxNlxcdUFCMjAtXFx1QUIyNlxcdUFCMjgtXFx1QUIyRVxcdUFCQzAtXFx1QUJFMlxcdUFDMDAtXFx1RDdBM1xcdUQ3QjAtXFx1RDdDNlxcdUQ3Q0ItXFx1RDdGQlxcdUY5MDAtXFx1RkE2RFxcdUZBNzAtXFx1RkFEOVxcdUZCMDAtXFx1RkIwNlxcdUZCMTMtXFx1RkIxN1xcdUZCMURcXHVGQjFGLVxcdUZCMjhcXHVGQjJBLVxcdUZCMzZcXHVGQjM4LVxcdUZCM0NcXHVGQjNFXFx1RkI0MFxcdUZCNDFcXHVGQjQzXFx1RkI0NFxcdUZCNDYtXFx1RkJCMVxcdUZCRDMtXFx1RkQzRFxcdUZENTAtXFx1RkQ4RlxcdUZEOTItXFx1RkRDN1xcdUZERjAtXFx1RkRGQlxcdUZFNzAtXFx1RkU3NFxcdUZFNzYtXFx1RkVGQ1xcdUZGMjEtXFx1RkYzQVxcdUZGNDEtXFx1RkY1QVxcdUZGNjYtXFx1RkZCRVxcdUZGQzItXFx1RkZDN1xcdUZGQ0EtXFx1RkZDRlxcdUZGRDItXFx1RkZEN1xcdUZGREEtXFx1RkZEQ10vLCAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjIwNzUwNzBcclxuICAnKic6IC8uL1xyXG59O1xyXG5QYXR0ZXJuTWFzay5ERUZfVFlQRVMgPSB7XHJcbiAgSU5QVVQ6ICdpbnB1dCcsXHJcbiAgRklYRUQ6ICdmaXhlZCdcclxufVxyXG5QYXR0ZXJuTWFzay5ERUZBVUxUX1BMQUNFSE9MREVSID0ge1xyXG4gIHNob3c6ICdsYXp5JyxcclxuICBjaGFyOiAnXydcclxufTtcclxuIiwiaW1wb3J0IHtpc1N0cmluZ30gZnJvbSAnLi91dGlscyc7XHJcblxyXG5pbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9tYXNrcy9iYXNlJztcclxuaW1wb3J0IFJlZ0V4cE1hc2sgZnJvbSAnLi9tYXNrcy9yZWdleHAnO1xyXG5pbXBvcnQgRnVuY01hc2sgZnJvbSAnLi9tYXNrcy9mdW5jJztcclxuaW1wb3J0IFBhdHRlcm5NYXNrIGZyb20gJy4vbWFza3MvcGF0dGVybic7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuZnVuY3Rpb24gSU1hc2sgKGVsLCBvcHRzPXt9KSB7XHJcbiAgdmFyIG1hc2sgPSBJTWFzay5NYXNrRmFjdG9yeShlbCwgb3B0cyk7XHJcbiAgbWFzay5iaW5kRXZlbnRzKCk7XHJcbiAgLy8gcmVmcmVzaFxyXG4gIG1hc2sucmF3VmFsdWUgPSBlbC52YWx1ZTtcclxuICByZXR1cm4gbWFzaztcclxufVxyXG5cclxuSU1hc2suTWFza0ZhY3RvcnkgPSBmdW5jdGlvbiAoZWwsIG9wdHMpIHtcclxuICB2YXIgbWFzayA9IG9wdHMubWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEJhc2VNYXNrKSByZXR1cm4gbWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIG5ldyBSZWdFeHBNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSByZXR1cm4gbmV3IEZ1bmNNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAoaXNTdHJpbmcobWFzaykpIHJldHVybiBuZXcgUGF0dGVybk1hc2soZWwsIG9wdHMpO1xyXG4gIHJldHVybiBuZXcgQmFzZU1hc2soZWwsIG9wdHMpO1xyXG59XHJcbklNYXNrLkJhc2VNYXNrID0gQmFzZU1hc2s7XHJcbklNYXNrLkZ1bmNNYXNrID0gRnVuY01hc2s7XHJcbklNYXNrLlJlZ0V4cE1hc2sgPSBSZWdFeHBNYXNrO1xyXG5JTWFzay5QYXR0ZXJuTWFzayA9IFBhdHRlcm5NYXNrO1xyXG53aW5kb3cuSU1hc2sgPSBJTWFzaztcclxuIl0sIm5hbWVzIjpbImlzU3RyaW5nIiwic3RyIiwiU3RyaW5nIiwiY29uZm9ybSIsInJlcyIsImZhbGxiYWNrIiwiQmFzZU1hc2siLCJlbCIsIm9wdHMiLCJtYXNrIiwiX2xpc3RlbmVycyIsIl9yZWZyZXNoaW5nQ291bnQiLCJzYXZlU3RhdGUiLCJiaW5kIiwicHJvY2Vzc0lucHV0IiwiX29uRHJvcCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidW5iaW5kRXZlbnRzIiwibGVuZ3RoIiwiZXYiLCJfb2xkVmFsdWUiLCJyYXdWYWx1ZSIsIl9vbGRTZWxlY3Rpb24iLCJzZWxlY3Rpb25TdGFydCIsImN1cnNvclBvcyIsImlucHV0VmFsdWUiLCJkZXRhaWxzIiwicmVzb2x2ZSIsImZpcmVFdmVudCIsImhhbmRsZXIiLCJwdXNoIiwiaEluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImxpc3RlbmVycyIsImZvckVhY2giLCJsIiwiX29sZFJhd1ZhbHVlIiwiX29sZFVubWFza2VkVmFsdWUiLCJ1bm1hc2tlZFZhbHVlIiwicmVmcmVzaCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2VsZWN0aW9uRW5kIiwicG9zIiwic2V0U2VsZWN0aW9uUmFuZ2UiLCJ2YWx1ZSIsInN0YXJ0UmVmcmVzaCIsImVuZFJlZnJlc2giLCJSZWdFeHBNYXNrIiwidGVzdCIsIkZ1bmNNYXNrIiwiUGF0dGVybk1hc2siLCJwbGFjZWhvbGRlciIsImRlZmluaXRpb25zIiwiREVGSU5JVElPTlMiLCJfaG9sbG93cyIsIl9idWlsZFJlc29sdmVycyIsIl9hbGlnbkN1cnNvciIsIl9jaGFyRGVmcyIsInBhdHRlcm4iLCJ1bm1hc2tpbmdCbG9jayIsIm9wdGlvbmFsQmxvY2siLCJpIiwiY2giLCJ0eXBlIiwiREVGX1RZUEVTIiwiSU5QVVQiLCJGSVhFRCIsInVubWFza2luZyIsIm9wdGlvbmFsIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiTWFza0ZhY3RvcnkiLCJ0YWlsIiwicGxhY2Vob2xkZXJCdWZmZXIiLCJob2xsb3dzIiwic2xpY2UiLCJjaSIsImRpIiwiX21hcFBvc1RvRGVmSW5kZXgiLCJkZWYiLCJyZXNvbHZlciIsImNoYXIiLCJjaHJlcyIsIl9wbGFjZWhvbGRlciIsImZyb21Qb3MiLCJpbnB1dCIsIl9pc0hpZGRlbkhvbGxvdyIsImRlZkluZGV4IiwiZmlsdGVyIiwiaCIsIl9ob2xsb3dzQmVmb3JlIiwibGFzdEhvbGxvd0luZGV4IiwiaGVhZCIsImluc2VydGVkIiwiaW5zZXJ0U3RlcHMiLCJvbGRTZWxlY3Rpb24iLCJvbGRWYWx1ZSIsInN0YXJ0Q2hhbmdlUG9zIiwiTWF0aCIsIm1pbiIsInN0YXJ0IiwicmVtb3ZlZENvdW50IiwibWF4IiwiZW5kIiwiaW5zZXJ0ZWRDb3VudCIsInN1YnN0cmluZyIsInN1YnN0ciIsInRhaWxJbnB1dCIsIl9leHRyYWN0SW5wdXQiLCJfZ2VuZXJhdGVJbnNlcnRTdGVwcyIsImlzdGVwIiwic3RlcCIsInJlc3VsdCIsIl90cnlBcHBlbmRUYWlsIiwiYXBwZW5kZWQiLCJfYXBwZW5kRml4ZWRFbmQiLCJoYXNIb2xsb3dzIiwiX2FwcGVuZFBsYWNlaG9sZGVyRW5kIiwiaXNDb21wbGV0ZSIsInNob3ciLCJjdXJzb3JEZWZJbmRleCIsInJQb3MiLCJyRGVmIiwibFBvcyIsImxEZWYiLCJfbWFwRGVmSW5kZXhUb1BvcyIsInVubWFza2VkIiwicGgiLCJERUZBVUxUX1BMQUNFSE9MREVSIiwibWFwIiwiam9pbiIsIl9kZWZpbml0aW9ucyIsImRlZnMiLCJfbWFzayIsImluaXRpYWxpemVkIiwiYmluZEV2ZW50cyIsIlJlZ0V4cCIsIkZ1bmN0aW9uIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxTQUFTQSxRQUFULENBQW1CQyxHQUFuQixFQUF3QjtTQUNmLE9BQU9BLEdBQVAsS0FBZSxRQUFm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