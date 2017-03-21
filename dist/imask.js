(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.imask = factory());
}(this, (function () { 'use strict';

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

function isString(str) {
  return typeof str === 'string' || str instanceof String;
}

function conform(res, str) {
  var fallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  return isString(res) ? res : res ? str : fallback;
}

function extendDetailsAdjustments(str, details) {
  var cursorPos = details.cursorPos;
  var oldSelection = details.oldSelection;
  var oldValue = details.oldValue;

  var startChangePos = Math.min(cursorPos, oldSelection.start);
  var insertedCount = cursorPos - startChangePos;
  // Math.max for opposite operation
  var removedCount = Math.max(oldSelection.end - startChangePos ||
  // for Delete
  oldValue.length - str.length, 0);
  var head = str.substring(0, startChangePos);
  var tail = str.substring(startChangePos + insertedCount);
  var inserted = str.substr(startChangePos, insertedCount);
  var removed = str.substr(startChangePos, removedCount);

  return _extends({
    startChangePos: startChangePos,
    head: head,
    tail: tail,
    inserted: inserted,
    removed: removed
  }, details);
}

var BaseMask = function () {
  function BaseMask(el, opts) {
    classCallCheck(this, BaseMask);

    this.el = el;
    this.mask = opts.mask;

    this._listeners = {};
    this._refreshingCount = 0;
    this._rawValue = "";
    this._unmaskedValue = "";

    this.saveSelection = this.saveSelection.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onDrop = this._onDrop.bind(this);
  }

  createClass(BaseMask, [{
    key: "on",
    value: function on(ev, handler) {
      if (!this._listeners[ev]) this._listeners[ev] = [];
      this._listeners[ev].push(handler);
      return this;
    }
  }, {
    key: "off",
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
    key: "bindEvents",
    value: function bindEvents() {
      this.el.addEventListener('keydown', this.saveSelection);
      this.el.addEventListener('input', this._onInput);
      this.el.addEventListener('drop', this._onDrop);
    }
  }, {
    key: "unbindEvents",
    value: function unbindEvents() {
      this.el.removeEventListener('keydown', this.saveSelection);
      this.el.removeEventListener('input', this._onInput);
      this.el.removeEventListener('drop', this._onDrop);
    }
  }, {
    key: "fireEvent",
    value: function fireEvent(ev) {
      var listeners = this._listeners[ev] || [];
      listeners.forEach(function (l) {
        return l();
      });
    }
  }, {
    key: "processInput",
    value: function processInput(inputValue, details) {
      details = _extends({
        cursorPos: this.cursorPos,
        oldSelection: this._selection,
        oldValue: this.rawValue,
        oldUnmaskedValue: this.unmaskedValue
      }, details);

      details = extendDetailsAdjustments(inputValue, details);

      var res = conform(this.resolve(inputValue, details), inputValue, this.rawValue);

      this.updateElement(res, details.cursorPos);
      return res;
    }
  }, {
    key: "saveSelection",
    value: function saveSelection(ev) {
      if (this.rawValue !== this.el.value) {
        console.warn("Uncontrolled input change, refresh mask manually!");
      }
      this._selection = {
        start: this.selectionStart,
        end: this.cursorPos
      };
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.unbindEvents();
      this._listeners.length = 0;
    }
  }, {
    key: "updateElement",
    value: function updateElement(value, cursorPos) {
      var _this = this;

      var unmaskedValue = this._calcUnmasked(value);
      var isChanged = this.unmaskedValue !== unmaskedValue || this.rawValue !== value;

      this._unmaskedValue = unmaskedValue;
      this._rawValue = value;

      if (this.el.value !== value) this.el.value = value;
      if (this.cursorPos != cursorPos && cursorPos != null) {
        // also queue change cursor for some browsers
        if (this._cursorChanging) clearTimeout(this._cursorChanging);
        this._changingCursorPos = cursorPos;
        this._cursorChanging = setTimeout(function () {
          _this.cursorPos = _this._changingCursorPos;
          delete _this._cursorChanging;
        }, 10);
        this.cursorPos = cursorPos;
      }
      this.saveSelection();

      if (isChanged) this._fireChangeEvents();
    }
  }, {
    key: "_fireChangeEvents",
    value: function _fireChangeEvents() {
      this.fireEvent("accept");
    }
  }, {
    key: "_onInput",
    value: function _onInput(ev) {
      if (this._cursorChanging) {
        ev.preventDefault();
        return;
      }
      this.processInput(this.el.value);
    }
  }, {
    key: "_onDrop",
    value: function _onDrop(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    // override

  }, {
    key: "resolve",
    value: function resolve(str, details) {
      return str;
    }
  }, {
    key: "_calcUnmasked",
    value: function _calcUnmasked(value) {
      return value;
    }
  }, {
    key: "rawValue",
    get: function get() {
      return this._rawValue;
    },
    set: function set(str) {
      this.processInput(str, {
        cursorPos: str.length,
        oldSelection: {
          start: 0,
          end: this.rawValue.length
        }
      });
    }
  }, {
    key: "unmaskedValue",
    get: function get() {
      return this._unmaskedValue;
    },
    set: function set(value) {
      this.rawValue = value;
    }
  }, {
    key: "selectionStart",
    get: function get() {
      return this.el.selectionStart;
    }
  }, {
    key: "cursorPos",
    get: function get() {
      return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
    },
    set: function set(pos) {
      this.el.setSelectionRange(pos, pos);
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

    _this._hollows = [];
    _this.placeholder = opts.placeholder;
    _this.definitions = _extends({}, PatternMask.DEFINITIONS, opts.definitions);

    _this._alignCursor = _this._alignCursor.bind(_this);
    _this._alignCursorFriendly = _this._alignCursorFriendly.bind(_this);

    _this._initialized = true;
    return _this;
  }

  createClass(PatternMask, [{
    key: '_alignCursorFriendly',
    value: function _alignCursorFriendly() {
      if (this.selectionStart !== this.cursorPos) return;
      this._alignCursor();
    }
  }, {
    key: 'bindEvents',
    value: function bindEvents() {
      get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), 'bindEvents', this).call(this);
      this.el.addEventListener('click', this._alignCursorFriendly);
    }
  }, {
    key: 'unbindEvents',
    value: function unbindEvents() {
      get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), 'unbindEvents', this).call(this);
      this.el.removeEventListener('click', this._alignCursorFriendly);
    }
  }, {
    key: '_installDefinitions',
    value: function _installDefinitions(definitions) {
      this._definitions = definitions;
      this._charDefs = [];
      var pattern = this.mask;

      if (!pattern || !definitions) return;

      var unmaskingBlock = false;
      var optionalBlock = false;
      for (var i = 0; i < pattern.length; ++i) {
        var ch = pattern[i];
        var type = !unmaskingBlock && ch in definitions ? PatternMask.DEF_TYPES.INPUT : PatternMask.DEF_TYPES.FIXED;
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

      this._buildResolvers();
    }
  }, {
    key: '_buildResolvers',
    value: function _buildResolvers() {
      this._resolvers = {};
      for (var defKey in this.definitions) {
        this._resolvers[defKey] = IMask.MaskFactory(this.el, {
          mask: this.definitions[defKey]
        });
      }
    }
  }, {
    key: '_appendTail',
    value: function _appendTail(str, tail) {
      var placeholderBuffer = '';
      var hollows = this._hollows.slice();
      var overflow = false;

      for (var ci = 0, di = this._mapPosToDefIndex(str.length); ci < tail.length; ++di) {
        var ch = tail[ci];
        var def = this._charDefs[di];

        // failed
        if (!def) {
          overflow = true;
          break;
        }

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

      return [str, hollows, overflow];
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
      var _this2 = this;

      return this._hollows.filter(function (h) {
        return h < defIndex && _this2._isHiddenHollow(h);
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
      var startChangePos = details.startChangePos;
      var inserted = details.inserted;
      var removedCount = details.removed.length;
      var tailInput = this._extractInput(details.tail, startChangePos + removedCount);

      // remove hollows after cursor
      var lastHollowIndex = this._mapPosToDefIndex(startChangePos);
      this._hollows = this._hollows.filter(function (h) {
        return h < lastHollowIndex;
      });

      var res = details.head;

      // insert available
      var insertSteps = this._generateInsertSteps(res, inserted);
      for (var istep = insertSteps.length - 1; istep >= 0; --istep) {
        var step;

        var _insertSteps$istep = slicedToArray(insertSteps[istep], 2);

        step = _insertSteps$istep[0];
        this._hollows = _insertSteps$istep[1];

        var _appendTail2 = this._appendTail(step, tailInput),
            _appendTail3 = slicedToArray(_appendTail2, 3),
            tres = _appendTail3[0],
            thollows = _appendTail3[1],
            overflow = _appendTail3[2];

        if (!overflow) {
          var _ref = [tres, thollows];
          res = _ref[0];
          this._hollows = _ref[1];

          cursorPos = step.length;
          break;
        }
      }

      // if input at the end - append fixed
      if (inserted && cursorPos === res.length) {
        // append fixed at end
        var appended = this._appendFixedEnd(res);
        cursorPos += appended.length - res.length;
        res = appended;
      }

      if (!inserted && removedCount) {
        // if delete at right
        if (details.oldSelection.end === cursorPos) {
          for (;; ++cursorPos) {
            var di = this._mapPosToDefIndex(cursorPos);
            var def = this._charDefs[di];
            if (!def || def.type !== PatternMask.DEF_TYPES.FIXED) break;
          }
        }

        // remove head fixed and hollows if removed at end
        if (cursorPos === res.length) {
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
      }

      // append placeholder
      res = this._appendPlaceholderEnd(res);
      details.cursorPos = cursorPos;

      return res;
    }
  }, {
    key: '_fireChangeEvents',
    value: function _fireChangeEvents() {
      // fire 'complete' after 'accept' event
      get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), '_fireChangeEvents', this).call(this);
      if (this.isComplete) this.fireEvent("complete");
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
    key: '_calcUnmasked',
    value: function _calcUnmasked(str) {
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
      var _this3 = this;

      return !this._charDefs.filter(function (def, di) {
        return def.type === PatternMask.DEF_TYPES.INPUT && !def.optional && _this3._isHollow(di);
      }).length;
    }
  }, {
    key: 'unmaskedValue',
    get: function get() {
      return this._unmaskedValue;
    },
    set: function set(str) {
      this._hollows.length = 0;
      var res;

      var _appendTail4 = this._appendTail('', str);

      var _appendTail5 = slicedToArray(_appendTail4, 2);

      res = _appendTail5[0];
      this._hollows = _appendTail5[1];

      this.updateElement(this._appendPlaceholderEnd(res));
    }
  }, {
    key: 'placeholder',
    get: function get() {
      return this._placeholder;
    },
    set: function set(ph) {
      this._placeholder = _extends({}, PatternMask.DEFAULT_PLACEHOLDER, ph);
      if (this._initialized) this.unmaskedValue = this.unmaskedValue;
    }
  }, {
    key: 'placeholderLabel',
    get: function get() {
      var _this4 = this;

      return this._charDefs.map(function (def) {
        return def.type === PatternMask.DEF_TYPES.FIXED ? def.char : !def.optional ? _this4._placeholder.char : '';
      }).join('');
    }
  }, {
    key: 'definitions',
    get: function get() {
      return this._definitions;
    },
    set: function set(defs) {
      this._installDefinitions(defs);
      if (this._initialized) this.unmaskedValue = this.unmaskedValue;
    }
  }, {
    key: 'mask',
    get: function get() {
      return this._mask;
    },
    set: function set(mask) {
      this._mask = mask;
      if (this._initialized) this.definitions = this.definitions;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvaW1hc2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0XHJcbmZ1bmN0aW9uIGlzU3RyaW5nIChzdHIpIHtcclxuICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gY29uZm9ybSAocmVzLCBzdHIsIGZhbGxiYWNrPScnKSB7XHJcbiAgcmV0dXJuIGlzU3RyaW5nKHJlcykgP1xyXG4gICAgcmVzIDpcclxuICAgIHJlcyA/XHJcbiAgICAgIHN0ciA6XHJcbiAgICAgIGZhbGxiYWNrO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzKHN0ciwgZGV0YWlscykge1xyXG4gIHZhciBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICB2YXIgb2xkU2VsZWN0aW9uID0gZGV0YWlscy5vbGRTZWxlY3Rpb247XHJcbiAgdmFyIG9sZFZhbHVlID0gZGV0YWlscy5vbGRWYWx1ZTtcclxuXHJcbiAgdmFyIHN0YXJ0Q2hhbmdlUG9zID0gTWF0aC5taW4oY3Vyc29yUG9zLCBvbGRTZWxlY3Rpb24uc3RhcnQpO1xyXG4gIHZhciBpbnNlcnRlZENvdW50ID0gY3Vyc29yUG9zIC0gc3RhcnRDaGFuZ2VQb3M7XHJcbiAgLy8gTWF0aC5tYXggZm9yIG9wcG9zaXRlIG9wZXJhdGlvblxyXG4gIHZhciByZW1vdmVkQ291bnQgPSBNYXRoLm1heCgob2xkU2VsZWN0aW9uLmVuZCAtIHN0YXJ0Q2hhbmdlUG9zKSB8fFxyXG4gICAgLy8gZm9yIERlbGV0ZVxyXG4gICAgb2xkVmFsdWUubGVuZ3RoIC0gc3RyLmxlbmd0aCwgMCk7XHJcbiAgdmFyIGhlYWQgPSBzdHIuc3Vic3RyaW5nKDAsIHN0YXJ0Q2hhbmdlUG9zKTtcclxuICB2YXIgdGFpbCA9IHN0ci5zdWJzdHJpbmcoc3RhcnRDaGFuZ2VQb3MgKyBpbnNlcnRlZENvdW50KTtcclxuICB2YXIgaW5zZXJ0ZWQgPSBzdHIuc3Vic3RyKHN0YXJ0Q2hhbmdlUG9zLCBpbnNlcnRlZENvdW50KTtcclxuICB2YXIgcmVtb3ZlZCA9IHN0ci5zdWJzdHIoc3RhcnRDaGFuZ2VQb3MsIHJlbW92ZWRDb3VudCk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBzdGFydENoYW5nZVBvcyxcclxuICAgIGhlYWQsXHJcbiAgICB0YWlsLFxyXG4gICAgaW5zZXJ0ZWQsXHJcbiAgICByZW1vdmVkLFxyXG4gICAgLi4uZGV0YWlsc1xyXG4gIH07XHJcbn1cclxuIiwiaW1wb3J0IHtjb25mb3JtLCBleHRlbmREZXRhaWxzQWRqdXN0bWVudHN9IGZyb20gJy4uL3V0aWxzJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICB0aGlzLmVsID0gZWw7XHJcbiAgICB0aGlzLm1hc2sgPSBvcHRzLm1hc2s7XHJcblxyXG4gICAgdGhpcy5fbGlzdGVuZXJzID0ge307XHJcbiAgICB0aGlzLl9yZWZyZXNoaW5nQ291bnQgPSAwO1xyXG4gICAgdGhpcy5fcmF3VmFsdWUgPSBcIlwiO1xyXG4gICAgdGhpcy5fdW5tYXNrZWRWYWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgdGhpcy5zYXZlU2VsZWN0aW9uID0gdGhpcy5zYXZlU2VsZWN0aW9uLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9vbklucHV0ID0gdGhpcy5fb25JbnB1dC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fb25Ecm9wID0gdGhpcy5fb25Ecm9wLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBvbiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgdGhpcy5fbGlzdGVuZXJzW2V2XSA9IFtdO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzW2V2XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBvZmYgKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHJldHVybjtcclxuICAgIGlmICghaGFuZGxlcikge1xyXG4gICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2XTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGhJbmRleCA9IHRoaXMuX2xpc3RlbmVyc1tldl0uaW5kZXhPZihoYW5kbGVyKTtcclxuICAgIGlmIChoSW5kZXggPj0gMCkgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShoSW5kZXgsIDEpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBnZXQgcmF3VmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Jhd1ZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHJhd1ZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMucHJvY2Vzc0lucHV0KHN0ciwge1xyXG4gICAgICBjdXJzb3JQb3M6IHN0ci5sZW5ndGgsXHJcbiAgICAgIG9sZFNlbGVjdGlvbjoge1xyXG4gICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgIGVuZDogdGhpcy5yYXdWYWx1ZS5sZW5ndGhcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHVubWFza2VkVmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3VubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgdW5tYXNrZWRWYWx1ZSAodmFsdWUpIHtcclxuICAgIHRoaXMucmF3VmFsdWUgPSB2YWx1ZTtcclxuICB9XHJcblxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVNlbGVjdGlvbik7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dCk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVNlbGVjdGlvbik7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dCk7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgZmlyZUV2ZW50IChldikge1xyXG4gICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1tldl0gfHwgW107XHJcbiAgICBsaXN0ZW5lcnMuZm9yRWFjaChsID0+IGwoKSk7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzSW5wdXQgKGlucHV0VmFsdWUsIGRldGFpbHMpIHtcclxuICAgIGRldGFpbHMgPSB7XHJcbiAgICAgIGN1cnNvclBvczogdGhpcy5jdXJzb3JQb3MsXHJcbiAgICAgIG9sZFNlbGVjdGlvbjogdGhpcy5fc2VsZWN0aW9uLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5yYXdWYWx1ZSxcclxuICAgICAgb2xkVW5tYXNrZWRWYWx1ZTogdGhpcy51bm1hc2tlZFZhbHVlLFxyXG4gICAgICAuLi5kZXRhaWxzXHJcbiAgICB9O1xyXG5cclxuICAgIGRldGFpbHMgPSBleHRlbmREZXRhaWxzQWRqdXN0bWVudHMoaW5wdXRWYWx1ZSwgZGV0YWlscyk7XHJcblxyXG4gICAgdmFyIHJlcyA9IGNvbmZvcm0odGhpcy5yZXNvbHZlKGlucHV0VmFsdWUsIGRldGFpbHMpLFxyXG4gICAgICBpbnB1dFZhbHVlLFxyXG4gICAgICB0aGlzLnJhd1ZhbHVlKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUVsZW1lbnQocmVzLCBkZXRhaWxzLmN1cnNvclBvcyk7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcblxyXG4gIGdldCBzZWxlY3Rpb25TdGFydCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbC5zZWxlY3Rpb25TdGFydDtcclxuICB9XHJcblxyXG4gIGdldCBjdXJzb3JQb3MgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID9cclxuICAgICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOlxyXG4gICAgICB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuICB9XHJcblxyXG4gIHNldCBjdXJzb3JQb3MgKHBvcykge1xyXG4gICAgdGhpcy5lbC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgfVxyXG5cclxuICBzYXZlU2VsZWN0aW9uIChldikge1xyXG4gICAgaWYgKHRoaXMucmF3VmFsdWUgIT09IHRoaXMuZWwudmFsdWUpIHtcclxuICAgICAgY29uc29sZS53YXJuKFwiVW5jb250cm9sbGVkIGlucHV0IGNoYW5nZSwgcmVmcmVzaCBtYXNrIG1hbnVhbGx5IVwiKTtcclxuICAgIH1cclxuICAgIHRoaXMuX3NlbGVjdGlvbiA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuc2VsZWN0aW9uU3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5jdXJzb3JQb3NcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBkZXN0cm95ICgpIHtcclxuICAgIHRoaXMudW5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcclxuICB9XHJcblxyXG4gIHVwZGF0ZUVsZW1lbnQgKHZhbHVlLCBjdXJzb3JQb3MpIHtcclxuICAgIHZhciB1bm1hc2tlZFZhbHVlID0gdGhpcy5fY2FsY1VubWFza2VkKHZhbHVlKTtcclxuICAgIHZhciBpc0NoYW5nZWQgPSAodGhpcy51bm1hc2tlZFZhbHVlICE9PSB1bm1hc2tlZFZhbHVlIHx8XHJcbiAgICAgIHRoaXMucmF3VmFsdWUgIT09IHZhbHVlKTtcclxuXHJcbiAgICB0aGlzLl91bm1hc2tlZFZhbHVlID0gdW5tYXNrZWRWYWx1ZTtcclxuICAgIHRoaXMuX3Jhd1ZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgaWYgKHRoaXMuZWwudmFsdWUgIT09IHZhbHVlKSB0aGlzLmVsLnZhbHVlID0gdmFsdWU7XHJcbiAgICBpZiAodGhpcy5jdXJzb3JQb3MgIT0gY3Vyc29yUG9zICYmIGN1cnNvclBvcyAhPSBudWxsKSB7XHJcbiAgICAgIC8vIGFsc28gcXVldWUgY2hhbmdlIGN1cnNvciBmb3Igc29tZSBicm93c2Vyc1xyXG4gICAgICBpZiAodGhpcy5fY3Vyc29yQ2hhbmdpbmcpIGNsZWFyVGltZW91dCh0aGlzLl9jdXJzb3JDaGFuZ2luZyk7XHJcbiAgICAgIHRoaXMuX2NoYW5naW5nQ3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG4gICAgICB0aGlzLl9jdXJzb3JDaGFuZ2luZyA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY3Vyc29yUG9zID0gdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3M7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2N1cnNvckNoYW5naW5nO1xyXG4gICAgICB9LCAxMCk7XHJcbiAgICAgIHRoaXMuY3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zYXZlU2VsZWN0aW9uKCk7XHJcblxyXG4gICAgaWYgKGlzQ2hhbmdlZCkgdGhpcy5fZmlyZUNoYW5nZUV2ZW50cygpO1xyXG4gIH1cclxuXHJcbiAgX2ZpcmVDaGFuZ2VFdmVudHMgKCkge1xyXG4gICAgdGhpcy5maXJlRXZlbnQoXCJhY2NlcHRcIik7XHJcbiAgfVxyXG5cclxuICBfb25JbnB1dCAoZXYpIHtcclxuICAgIGlmICh0aGlzLl9jdXJzb3JDaGFuZ2luZykge1xyXG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLnByb2Nlc3NJbnB1dCh0aGlzLmVsLnZhbHVlKTtcclxuICB9XHJcblxyXG4gIF9vbkRyb3AgKGV2KSB7XHJcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvLyBvdmVycmlkZVxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykgeyByZXR1cm4gc3RyOyB9XHJcblxyXG4gIF9jYWxjVW5tYXNrZWQgKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfVxyXG59XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFJlZ0V4cE1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoc3RyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrLnRlc3Qoc3RyKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgRnVuY01hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoLi4uYXJncykge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzayguLi5hcmdzKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtjb25mb3JtfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFBhdHRlcm5NYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgc3VwZXIoZWwsIG9wdHMpO1xyXG5cclxuICAgIHRoaXMuX2hvbGxvd3MgPSBbXTtcclxuICAgIHRoaXMucGxhY2Vob2xkZXIgPSBvcHRzLnBsYWNlaG9sZGVyO1xyXG4gICAgdGhpcy5kZWZpbml0aW9ucyA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGSU5JVElPTlMsXHJcbiAgICAgIC4uLm9wdHMuZGVmaW5pdGlvbnNcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IgPSB0aGlzLl9hbGlnbkN1cnNvci5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3JGcmllbmRseSA9IHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkuYmluZCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBfYWxpZ25DdXJzb3JGcmllbmRseSAoKSB7XHJcbiAgICBpZiAodGhpcy5zZWxlY3Rpb25TdGFydCAhPT0gdGhpcy5jdXJzb3JQb3MpIHJldHVybjtcclxuICAgIHRoaXMuX2FsaWduQ3Vyc29yKCk7XHJcbiAgfVxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLmJpbmRFdmVudHMoKTtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5KTtcclxuICB9XHJcblxyXG4gIHVuYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci51bmJpbmRFdmVudHMoKTtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5KTtcclxuICB9XHJcblxyXG4gIF9pbnN0YWxsRGVmaW5pdGlvbnMgKGRlZmluaXRpb25zKSB7XHJcbiAgICB0aGlzLl9kZWZpbml0aW9ucyA9IGRlZmluaXRpb25zO1xyXG4gICAgdGhpcy5fY2hhckRlZnMgPSBbXTtcclxuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5tYXNrO1xyXG5cclxuICAgIGlmICghcGF0dGVybiB8fCAhZGVmaW5pdGlvbnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgdW5tYXNraW5nQmxvY2sgPSBmYWxzZTtcclxuICAgIHZhciBvcHRpb25hbEJsb2NrID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8cGF0dGVybi5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICB2YXIgdHlwZSA9ICF1bm1hc2tpbmdCbG9jayAmJiBjaCBpbiBkZWZpbml0aW9ucyA/XHJcbiAgICAgICAgUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUIDpcclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQ7XHJcbiAgICAgIHZhciB1bm1hc2tpbmcgPSB0eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgfHwgdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgIHZhciBvcHRpb25hbCA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiBvcHRpb25hbEJsb2NrO1xyXG5cclxuICAgICAgaWYgKGNoID09PSAneycgfHwgY2ggPT09ICd9Jykge1xyXG4gICAgICAgIHVubWFza2luZ0Jsb2NrID0gIXVubWFza2luZ0Jsb2NrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICdbJyB8fCBjaCA9PT0gJ10nKSB7XHJcbiAgICAgICAgb3B0aW9uYWxCbG9jayA9ICFvcHRpb25hbEJsb2NrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICdcXFxcJykge1xyXG4gICAgICAgICsraTtcclxuICAgICAgICBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgICAgLy8gVE9ETyB2YWxpZGF0aW9uXHJcbiAgICAgICAgaWYgKCFjaCkgYnJlYWs7XHJcbiAgICAgICAgdHlwZSA9IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fY2hhckRlZnMucHVzaCh7XHJcbiAgICAgICAgY2hhcjogY2gsXHJcbiAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICBvcHRpb25hbDogb3B0aW9uYWwsXHJcbiAgICAgICAgdW5tYXNraW5nOiB1bm1hc2tpbmdcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fYnVpbGRSZXNvbHZlcnMoKTtcclxuICB9XHJcblxyXG4gIF9idWlsZFJlc29sdmVycyAoKSB7XHJcbiAgICB0aGlzLl9yZXNvbHZlcnMgPSB7fTtcclxuICAgIGZvciAodmFyIGRlZktleSBpbiB0aGlzLmRlZmluaXRpb25zKSB7XHJcbiAgICAgIHRoaXMuX3Jlc29sdmVyc1tkZWZLZXldID0gSU1hc2suTWFza0ZhY3RvcnkodGhpcy5lbCwge1xyXG4gICAgICAgIG1hc2s6IHRoaXMuZGVmaW5pdGlvbnNbZGVmS2V5XVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9hcHBlbmRUYWlsIChzdHIsIHRhaWwpIHtcclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGhvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLnNsaWNlKCk7XHJcbiAgICB2YXIgb3ZlcmZsb3cgPSBmYWxzZTtcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHN0ci5sZW5ndGgpOyBjaSA8IHRhaWwubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHRhaWxbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgLy8gZmFpbGVkXHJcbiAgICAgIGlmICghZGVmKSB7XHJcbiAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgZGksIHN0cikgfHwgJyc7XHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICBjaHJlcyA9IGNvbmZvcm0oY2hyZXMsIGNoKTtcclxuICAgICAgICAgICsrY2k7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICghZGVmLm9wdGlvbmFsKSBjaHJlcyA9IHRoaXMuX3BsYWNlaG9sZGVyLmNoYXI7XHJcbiAgICAgICAgICBob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdHIgKz0gcGxhY2Vob2xkZXJCdWZmZXIgKyBjaHJlcztcclxuICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtzdHIsIGhvbGxvd3MsIG92ZXJmbG93XTtcclxuICB9XHJcblxyXG4gIF9leHRyYWN0SW5wdXQgKHN0ciwgZnJvbVBvcz0wKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAnJztcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGZyb21Qb3MpOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGRpKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiAhdGhpcy5faXNIb2xsb3coZGkpKSBpbnB1dCArPSBjaDtcclxuICAgICAgKytjaTtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIF9pc0hvbGxvdyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGVmSW5kZXgpID49IDA7XHJcbiAgfVxyXG5cclxuICBfaXNIaWRkZW5Ib2xsb3cgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5faXNIb2xsb3coZGVmSW5kZXgpICYmXHJcbiAgICAgIHRoaXMuX2NoYXJEZWZzW2RlZkluZGV4XSAmJiB0aGlzLl9jaGFyRGVmc1tkZWZJbmRleF0ub3B0aW9uYWw7XHJcbiAgfVxyXG5cclxuICBfaG9sbG93c0JlZm9yZSAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9ob2xsb3dzLmZpbHRlcihoID0+IGggPCBkZWZJbmRleCAmJiB0aGlzLl9pc0hpZGRlbkhvbGxvdyhoKSk7XHJcbiAgfVxyXG5cclxuICBfbWFwRGVmSW5kZXhUb1BvcyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiBkZWZJbmRleCAtIHRoaXMuX2hvbGxvd3NCZWZvcmUoZGVmSW5kZXgpLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIF9tYXBQb3NUb0RlZkluZGV4IChwb3MpIHtcclxuICAgIHZhciBsYXN0SG9sbG93SW5kZXggPSBwb3M7XHJcbiAgICAvLyBleHRlbmQgY29udGlndW91c1xyXG4gICAgd2hpbGUgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGxhc3RIb2xsb3dJbmRleC0xKSkgKytsYXN0SG9sbG93SW5kZXg7XHJcblxyXG4gICAgcmV0dXJuIHBvcyArIHRoaXMuX2hvbGxvd3NCZWZvcmUobGFzdEhvbGxvd0luZGV4KS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBfZ2VuZXJhdGVJbnNlcnRTdGVwcyAoaGVhZCwgaW5zZXJ0ZWQpIHtcclxuICAgIHZhciByZXMgPSBoZWFkO1xyXG4gICAgdmFyIGhvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLnNsaWNlKCk7XHJcbiAgICB2YXIgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IFtbcmVzLCBob2xsb3dzLnNsaWNlKCldXTtcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGhlYWQubGVuZ3RoKTsgY2k8aW5zZXJ0ZWQubGVuZ3RoOykge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcblxyXG4gICAgICB2YXIgY2ggPSBpbnNlcnRlZFtjaV07XHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgdmFyIHJlc29sdmVyID0gdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXTtcclxuICAgICAgICB2YXIgY2hyZXMgPSByZXNvbHZlci5yZXNvbHZlKGNoLCBjaSwgcmVzKSB8fCAnJztcclxuICAgICAgICAvLyBpZiBvayAtIG5leHQgZGlcclxuICAgICAgICBpZiAoY2hyZXMpIHtcclxuICAgICAgICAgIHJlcyArPSBwbGFjZWhvbGRlckJ1ZmZlciArIGNvbmZvcm0oY2hyZXMsIGNoKTsgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgICAgIGluc2VydFN0ZXBzLnB1c2goW3JlcywgaG9sbG93cy5zbGljZSgpXSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkZWYub3B0aW9uYWwpIHtcclxuICAgICAgICAgIGlmIChob2xsb3dzLmluZGV4T2YoZGkpIDwgMCkgaG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNocmVzIHx8IGRlZi5vcHRpb25hbCkgKytkaTtcclxuICAgICAgICBpZiAoY2hyZXMgfHwgIWRlZi5vcHRpb25hbCkgKytjaTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciArPSBkZWYuY2hhcjtcclxuXHJcbiAgICAgICAgaWYgKGNoID09PSBkZWYuY2hhcikgKytjaTtcclxuICAgICAgICArK2RpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGluc2VydFN0ZXBzO1xyXG4gIH1cclxuXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgICB2YXIgc3RhcnRDaGFuZ2VQb3MgPSBkZXRhaWxzLnN0YXJ0Q2hhbmdlUG9zO1xyXG4gICAgdmFyIGluc2VydGVkID0gZGV0YWlscy5pbnNlcnRlZDtcclxuICAgIHZhciByZW1vdmVkQ291bnQgPSBkZXRhaWxzLnJlbW92ZWQubGVuZ3RoO1xyXG4gICAgdmFyIHRhaWxJbnB1dCA9IHRoaXMuX2V4dHJhY3RJbnB1dChkZXRhaWxzLnRhaWwsIHN0YXJ0Q2hhbmdlUG9zICsgcmVtb3ZlZENvdW50KTtcclxuXHJcbiAgICAvLyByZW1vdmUgaG9sbG93cyBhZnRlciBjdXJzb3JcclxuICAgIHZhciBsYXN0SG9sbG93SW5kZXggPSB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KHN0YXJ0Q2hhbmdlUG9zKTtcclxuICAgIHRoaXMuX2hvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLmZpbHRlcihoID0+IGggPCBsYXN0SG9sbG93SW5kZXgpO1xyXG5cclxuICAgIHZhciByZXMgPSBkZXRhaWxzLmhlYWQ7XHJcblxyXG4gICAgLy8gaW5zZXJ0IGF2YWlsYWJsZVxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gdGhpcy5fZ2VuZXJhdGVJbnNlcnRTdGVwcyhyZXMsIGluc2VydGVkKTtcclxuICAgIGZvciAodmFyIGlzdGVwPWluc2VydFN0ZXBzLmxlbmd0aC0xOyBpc3RlcCA+PSAwOyAtLWlzdGVwKSB7XHJcbiAgICAgIHZhciBzdGVwO1xyXG4gICAgICBbc3RlcCwgdGhpcy5faG9sbG93c10gPSBpbnNlcnRTdGVwc1tpc3RlcF07XHJcbiAgICAgIHZhciBbdHJlcywgdGhvbGxvd3MsIG92ZXJmbG93XSA9IHRoaXMuX2FwcGVuZFRhaWwoc3RlcCwgdGFpbElucHV0KTtcclxuICAgICAgaWYgKCFvdmVyZmxvdykge1xyXG4gICAgICAgIFtyZXMsIHRoaXMuX2hvbGxvd3NdID0gW3RyZXMsIHRob2xsb3dzXTtcclxuICAgICAgICBjdXJzb3JQb3MgPSBzdGVwLmxlbmd0aDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGlucHV0IGF0IHRoZSBlbmQgLSBhcHBlbmQgZml4ZWRcclxuICAgIGlmIChpbnNlcnRlZCAmJiBjdXJzb3JQb3MgPT09IHJlcy5sZW5ndGgpIHtcclxuICAgICAgLy8gYXBwZW5kIGZpeGVkIGF0IGVuZFxyXG4gICAgICB2YXIgYXBwZW5kZWQgPSB0aGlzLl9hcHBlbmRGaXhlZEVuZChyZXMpO1xyXG4gICAgICBjdXJzb3JQb3MgKz0gYXBwZW5kZWQubGVuZ3RoIC0gcmVzLmxlbmd0aDtcclxuICAgICAgcmVzID0gYXBwZW5kZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpbnNlcnRlZCAmJiByZW1vdmVkQ291bnQpIHtcclxuICAgICAgLy8gaWYgZGVsZXRlIGF0IHJpZ2h0XHJcbiAgICAgIGlmIChkZXRhaWxzLm9sZFNlbGVjdGlvbi5lbmQgPT09IGN1cnNvclBvcykge1xyXG4gICAgICAgIGZvciAoOzsrK2N1cnNvclBvcykge1xyXG4gICAgICAgICAgdmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoY3Vyc29yUG9zKTtcclxuICAgICAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgICAgICBpZiAoIWRlZiB8fCBkZWYudHlwZSAhPT0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEKSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJlbW92ZSBoZWFkIGZpeGVkIGFuZCBob2xsb3dzIGlmIHJlbW92ZWQgYXQgZW5kXHJcbiAgICAgIGlmIChjdXJzb3JQb3MgPT09IHJlcy5sZW5ndGgpIHtcclxuICAgICAgICB2YXIgZGkgPSB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KGN1cnNvclBvcy0xKTtcclxuICAgICAgICB2YXIgaGFzSG9sbG93cyA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAoOyBkaSA+IDA7IC0tZGkpIHtcclxuICAgICAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNIb2xsb3coZGkpKSBoYXNIb2xsb3dzID0gdHJ1ZTtcclxuICAgICAgICAgICAgZWxzZSBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhc0hvbGxvd3MpIHJlcyA9IHJlcy5zbGljZSgwLCBkaSArIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXBwZW5kIHBsYWNlaG9sZGVyXHJcbiAgICByZXMgPSB0aGlzLl9hcHBlbmRQbGFjZWhvbGRlckVuZChyZXMpO1xyXG4gICAgZGV0YWlscy5jdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcblxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9maXJlQ2hhbmdlRXZlbnRzICgpIHtcclxuICAgIC8vIGZpcmUgJ2NvbXBsZXRlJyBhZnRlciAnYWNjZXB0JyBldmVudFxyXG4gICAgc3VwZXIuX2ZpcmVDaGFuZ2VFdmVudHMoKTtcclxuICAgIGlmICh0aGlzLmlzQ29tcGxldGUpIHRoaXMuZmlyZUV2ZW50KFwiY29tcGxldGVcIik7XHJcbiAgfVxyXG5cclxuICBnZXQgaXNDb21wbGV0ZSAoKSB7XHJcbiAgICByZXR1cm4gIXRoaXMuX2NoYXJEZWZzLmZpbHRlcigoZGVmLCBkaSkgPT5cclxuICAgICAgZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiAhZGVmLm9wdGlvbmFsICYmXHJcbiAgICAgIHRoaXMuX2lzSG9sbG93KGRpKSkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZEZpeGVkRW5kIChyZXMpIHtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7OyArK2RpKSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIGlmIChkaSA+PSByZXMubGVuZ3RoKSByZXMgKz0gZGVmLmNoYXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFBsYWNlaG9sZGVyRW5kIChyZXMpIHtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7IGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiAhdGhpcy5faXNIb2xsb3coZGkpKSB7XHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5fcGxhY2Vob2xkZXIuc2hvdyA9PT0gJ2Fsd2F5cycpIHtcclxuICAgICAgICByZXMgKz0gZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCA/XHJcbiAgICAgICAgICBkZWYuY2hhciA6XHJcbiAgICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgICAgdGhpcy5fcGxhY2Vob2xkZXIuY2hhciA6XHJcbiAgICAgICAgICAgICcnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX2NhbGNVbm1hc2tlZCAoc3RyKSB7XHJcbiAgICB2YXIgdW5tYXNrZWQgPSAnJztcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPTA7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmIChkZWYudW5tYXNraW5nICYmICF0aGlzLl9pc0hvbGxvdyhkaSkgJiZcclxuICAgICAgICAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdLnJlc29sdmUoY2gsIGNpLCBzdHIpIHx8XHJcbiAgICAgICAgICBkZWYuY2hhciA9PT0gY2gpKSB7XHJcbiAgICAgICAgdW5tYXNrZWQgKz0gY2g7XHJcbiAgICAgIH1cclxuICAgICAgKytjaTtcclxuICAgIH1cclxuICAgIHJldHVybiB1bm1hc2tlZDtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl91bm1hc2tlZFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHN0cikge1xyXG4gICAgdGhpcy5faG9sbG93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIHJlcztcclxuICAgIFtyZXMsIHRoaXMuX2hvbGxvd3NdID0gdGhpcy5fYXBwZW5kVGFpbCgnJywgc3RyKTtcclxuICAgIHRoaXMudXBkYXRlRWxlbWVudCh0aGlzLl9hcHBlbmRQbGFjZWhvbGRlckVuZChyZXMpKTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlciAoKSB7IHJldHVybiB0aGlzLl9wbGFjZWhvbGRlcjsgfVxyXG5cclxuICBzZXQgcGxhY2Vob2xkZXIgKHBoKSB7XHJcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUixcclxuICAgICAgLi4ucGhcclxuICAgIH07XHJcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHRoaXMudW5tYXNrZWRWYWx1ZSA9IHRoaXMudW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlckxhYmVsICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGFyRGVmcy5tYXAoZGVmID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgJycpLmpvaW4oJycpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRlZmluaXRpb25zICgpIHsgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zOyB9XHJcblxyXG4gIHNldCBkZWZpbml0aW9ucyAoZGVmcykge1xyXG4gICAgdGhpcy5faW5zdGFsbERlZmluaXRpb25zKGRlZnMpO1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB0aGlzLnVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXQgbWFzayAoKSB7IHJldHVybiB0aGlzLl9tYXNrOyB9XHJcblxyXG4gIHNldCBtYXNrIChtYXNrKSB7XHJcbiAgICB0aGlzLl9tYXNrID0gbWFzaztcclxuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgdGhpcy5kZWZpbml0aW9ucyA9IHRoaXMuZGVmaW5pdGlvbnM7XHJcbiAgfVxyXG5cclxuICBfYWxpZ25DdXJzb3IgKCkge1xyXG4gICAgdmFyIGN1cnNvckRlZkluZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleCh0aGlzLmN1cnNvclBvcyk7XHJcbiAgICBmb3IgKHZhciByUG9zID0gY3Vyc29yRGVmSW5kZXg7IHJQb3MgPj0gMDsgLS1yUG9zKSB7XHJcbiAgICAgIHZhciByRGVmID0gdGhpcy5fY2hhckRlZnNbclBvc107XHJcbiAgICAgIHZhciBsUG9zID0gclBvcy0xO1xyXG4gICAgICB2YXIgbERlZiA9IHRoaXMuX2NoYXJEZWZzW2xQb3NdO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3cobFBvcykpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaWYgKCghckRlZiB8fCByRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9pc0hvbGxvdyhyUG9zKSAmJiAhdGhpcy5faXNIaWRkZW5Ib2xsb3coclBvcykpICYmXHJcbiAgICAgICAgIXRoaXMuX2lzSG9sbG93KGxQb3MpKSB7XHJcbiAgICAgICAgY3Vyc29yRGVmSW5kZXggPSByUG9zO1xyXG4gICAgICAgIGlmICghbERlZiB8fCBsRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY3Vyc29yUG9zID0gdGhpcy5fbWFwRGVmSW5kZXhUb1BvcyhjdXJzb3JEZWZJbmRleCk7XHJcbiAgfVxyXG59XHJcblBhdHRlcm5NYXNrLkRFRklOSVRJT05TID0ge1xyXG4gICcwJzogL1xcZC8sXHJcbiAgJ2EnOiAvW1xcdTAwNDEtXFx1MDA1QVxcdTAwNjEtXFx1MDA3QVxcdTAwQUFcXHUwMEI1XFx1MDBCQVxcdTAwQzAtXFx1MDBENlxcdTAwRDgtXFx1MDBGNlxcdTAwRjgtXFx1MDJDMVxcdTAyQzYtXFx1MDJEMVxcdTAyRTAtXFx1MDJFNFxcdTAyRUNcXHUwMkVFXFx1MDM3MC1cXHUwMzc0XFx1MDM3NlxcdTAzNzdcXHUwMzdBLVxcdTAzN0RcXHUwMzg2XFx1MDM4OC1cXHUwMzhBXFx1MDM4Q1xcdTAzOEUtXFx1MDNBMVxcdTAzQTMtXFx1MDNGNVxcdTAzRjctXFx1MDQ4MVxcdTA0OEEtXFx1MDUyN1xcdTA1MzEtXFx1MDU1NlxcdTA1NTlcXHUwNTYxLVxcdTA1ODdcXHUwNUQwLVxcdTA1RUFcXHUwNUYwLVxcdTA1RjJcXHUwNjIwLVxcdTA2NEFcXHUwNjZFXFx1MDY2RlxcdTA2NzEtXFx1MDZEM1xcdTA2RDVcXHUwNkU1XFx1MDZFNlxcdTA2RUVcXHUwNkVGXFx1MDZGQS1cXHUwNkZDXFx1MDZGRlxcdTA3MTBcXHUwNzEyLVxcdTA3MkZcXHUwNzRELVxcdTA3QTVcXHUwN0IxXFx1MDdDQS1cXHUwN0VBXFx1MDdGNFxcdTA3RjVcXHUwN0ZBXFx1MDgwMC1cXHUwODE1XFx1MDgxQVxcdTA4MjRcXHUwODI4XFx1MDg0MC1cXHUwODU4XFx1MDhBMFxcdTA4QTItXFx1MDhBQ1xcdTA5MDQtXFx1MDkzOVxcdTA5M0RcXHUwOTUwXFx1MDk1OC1cXHUwOTYxXFx1MDk3MS1cXHUwOTc3XFx1MDk3OS1cXHUwOTdGXFx1MDk4NS1cXHUwOThDXFx1MDk4RlxcdTA5OTBcXHUwOTkzLVxcdTA5QThcXHUwOUFBLVxcdTA5QjBcXHUwOUIyXFx1MDlCNi1cXHUwOUI5XFx1MDlCRFxcdTA5Q0VcXHUwOURDXFx1MDlERFxcdTA5REYtXFx1MDlFMVxcdTA5RjBcXHUwOUYxXFx1MEEwNS1cXHUwQTBBXFx1MEEwRlxcdTBBMTBcXHUwQTEzLVxcdTBBMjhcXHUwQTJBLVxcdTBBMzBcXHUwQTMyXFx1MEEzM1xcdTBBMzVcXHUwQTM2XFx1MEEzOFxcdTBBMzlcXHUwQTU5LVxcdTBBNUNcXHUwQTVFXFx1MEE3Mi1cXHUwQTc0XFx1MEE4NS1cXHUwQThEXFx1MEE4Ri1cXHUwQTkxXFx1MEE5My1cXHUwQUE4XFx1MEFBQS1cXHUwQUIwXFx1MEFCMlxcdTBBQjNcXHUwQUI1LVxcdTBBQjlcXHUwQUJEXFx1MEFEMFxcdTBBRTBcXHUwQUUxXFx1MEIwNS1cXHUwQjBDXFx1MEIwRlxcdTBCMTBcXHUwQjEzLVxcdTBCMjhcXHUwQjJBLVxcdTBCMzBcXHUwQjMyXFx1MEIzM1xcdTBCMzUtXFx1MEIzOVxcdTBCM0RcXHUwQjVDXFx1MEI1RFxcdTBCNUYtXFx1MEI2MVxcdTBCNzFcXHUwQjgzXFx1MEI4NS1cXHUwQjhBXFx1MEI4RS1cXHUwQjkwXFx1MEI5Mi1cXHUwQjk1XFx1MEI5OVxcdTBCOUFcXHUwQjlDXFx1MEI5RVxcdTBCOUZcXHUwQkEzXFx1MEJBNFxcdTBCQTgtXFx1MEJBQVxcdTBCQUUtXFx1MEJCOVxcdTBCRDBcXHUwQzA1LVxcdTBDMENcXHUwQzBFLVxcdTBDMTBcXHUwQzEyLVxcdTBDMjhcXHUwQzJBLVxcdTBDMzNcXHUwQzM1LVxcdTBDMzlcXHUwQzNEXFx1MEM1OFxcdTBDNTlcXHUwQzYwXFx1MEM2MVxcdTBDODUtXFx1MEM4Q1xcdTBDOEUtXFx1MEM5MFxcdTBDOTItXFx1MENBOFxcdTBDQUEtXFx1MENCM1xcdTBDQjUtXFx1MENCOVxcdTBDQkRcXHUwQ0RFXFx1MENFMFxcdTBDRTFcXHUwQ0YxXFx1MENGMlxcdTBEMDUtXFx1MEQwQ1xcdTBEMEUtXFx1MEQxMFxcdTBEMTItXFx1MEQzQVxcdTBEM0RcXHUwRDRFXFx1MEQ2MFxcdTBENjFcXHUwRDdBLVxcdTBEN0ZcXHUwRDg1LVxcdTBEOTZcXHUwRDlBLVxcdTBEQjFcXHUwREIzLVxcdTBEQkJcXHUwREJEXFx1MERDMC1cXHUwREM2XFx1MEUwMS1cXHUwRTMwXFx1MEUzMlxcdTBFMzNcXHUwRTQwLVxcdTBFNDZcXHUwRTgxXFx1MEU4MlxcdTBFODRcXHUwRTg3XFx1MEU4OFxcdTBFOEFcXHUwRThEXFx1MEU5NC1cXHUwRTk3XFx1MEU5OS1cXHUwRTlGXFx1MEVBMS1cXHUwRUEzXFx1MEVBNVxcdTBFQTdcXHUwRUFBXFx1MEVBQlxcdTBFQUQtXFx1MEVCMFxcdTBFQjJcXHUwRUIzXFx1MEVCRFxcdTBFQzAtXFx1MEVDNFxcdTBFQzZcXHUwRURDLVxcdTBFREZcXHUwRjAwXFx1MEY0MC1cXHUwRjQ3XFx1MEY0OS1cXHUwRjZDXFx1MEY4OC1cXHUwRjhDXFx1MTAwMC1cXHUxMDJBXFx1MTAzRlxcdTEwNTAtXFx1MTA1NVxcdTEwNUEtXFx1MTA1RFxcdTEwNjFcXHUxMDY1XFx1MTA2NlxcdTEwNkUtXFx1MTA3MFxcdTEwNzUtXFx1MTA4MVxcdTEwOEVcXHUxMEEwLVxcdTEwQzVcXHUxMEM3XFx1MTBDRFxcdTEwRDAtXFx1MTBGQVxcdTEwRkMtXFx1MTI0OFxcdTEyNEEtXFx1MTI0RFxcdTEyNTAtXFx1MTI1NlxcdTEyNThcXHUxMjVBLVxcdTEyNURcXHUxMjYwLVxcdTEyODhcXHUxMjhBLVxcdTEyOERcXHUxMjkwLVxcdTEyQjBcXHUxMkIyLVxcdTEyQjVcXHUxMkI4LVxcdTEyQkVcXHUxMkMwXFx1MTJDMi1cXHUxMkM1XFx1MTJDOC1cXHUxMkQ2XFx1MTJEOC1cXHUxMzEwXFx1MTMxMi1cXHUxMzE1XFx1MTMxOC1cXHUxMzVBXFx1MTM4MC1cXHUxMzhGXFx1MTNBMC1cXHUxM0Y0XFx1MTQwMS1cXHUxNjZDXFx1MTY2Ri1cXHUxNjdGXFx1MTY4MS1cXHUxNjlBXFx1MTZBMC1cXHUxNkVBXFx1MTcwMC1cXHUxNzBDXFx1MTcwRS1cXHUxNzExXFx1MTcyMC1cXHUxNzMxXFx1MTc0MC1cXHUxNzUxXFx1MTc2MC1cXHUxNzZDXFx1MTc2RS1cXHUxNzcwXFx1MTc4MC1cXHUxN0IzXFx1MTdEN1xcdTE3RENcXHUxODIwLVxcdTE4NzdcXHUxODgwLVxcdTE4QThcXHUxOEFBXFx1MThCMC1cXHUxOEY1XFx1MTkwMC1cXHUxOTFDXFx1MTk1MC1cXHUxOTZEXFx1MTk3MC1cXHUxOTc0XFx1MTk4MC1cXHUxOUFCXFx1MTlDMS1cXHUxOUM3XFx1MUEwMC1cXHUxQTE2XFx1MUEyMC1cXHUxQTU0XFx1MUFBN1xcdTFCMDUtXFx1MUIzM1xcdTFCNDUtXFx1MUI0QlxcdTFCODMtXFx1MUJBMFxcdTFCQUVcXHUxQkFGXFx1MUJCQS1cXHUxQkU1XFx1MUMwMC1cXHUxQzIzXFx1MUM0RC1cXHUxQzRGXFx1MUM1QS1cXHUxQzdEXFx1MUNFOS1cXHUxQ0VDXFx1MUNFRS1cXHUxQ0YxXFx1MUNGNVxcdTFDRjZcXHUxRDAwLVxcdTFEQkZcXHUxRTAwLVxcdTFGMTVcXHUxRjE4LVxcdTFGMURcXHUxRjIwLVxcdTFGNDVcXHUxRjQ4LVxcdTFGNERcXHUxRjUwLVxcdTFGNTdcXHUxRjU5XFx1MUY1QlxcdTFGNURcXHUxRjVGLVxcdTFGN0RcXHUxRjgwLVxcdTFGQjRcXHUxRkI2LVxcdTFGQkNcXHUxRkJFXFx1MUZDMi1cXHUxRkM0XFx1MUZDNi1cXHUxRkNDXFx1MUZEMC1cXHUxRkQzXFx1MUZENi1cXHUxRkRCXFx1MUZFMC1cXHUxRkVDXFx1MUZGMi1cXHUxRkY0XFx1MUZGNi1cXHUxRkZDXFx1MjA3MVxcdTIwN0ZcXHUyMDkwLVxcdTIwOUNcXHUyMTAyXFx1MjEwN1xcdTIxMEEtXFx1MjExM1xcdTIxMTVcXHUyMTE5LVxcdTIxMURcXHUyMTI0XFx1MjEyNlxcdTIxMjhcXHUyMTJBLVxcdTIxMkRcXHUyMTJGLVxcdTIxMzlcXHUyMTNDLVxcdTIxM0ZcXHUyMTQ1LVxcdTIxNDlcXHUyMTRFXFx1MjE4M1xcdTIxODRcXHUyQzAwLVxcdTJDMkVcXHUyQzMwLVxcdTJDNUVcXHUyQzYwLVxcdTJDRTRcXHUyQ0VCLVxcdTJDRUVcXHUyQ0YyXFx1MkNGM1xcdTJEMDAtXFx1MkQyNVxcdTJEMjdcXHUyRDJEXFx1MkQzMC1cXHUyRDY3XFx1MkQ2RlxcdTJEODAtXFx1MkQ5NlxcdTJEQTAtXFx1MkRBNlxcdTJEQTgtXFx1MkRBRVxcdTJEQjAtXFx1MkRCNlxcdTJEQjgtXFx1MkRCRVxcdTJEQzAtXFx1MkRDNlxcdTJEQzgtXFx1MkRDRVxcdTJERDAtXFx1MkRENlxcdTJERDgtXFx1MkRERVxcdTJFMkZcXHUzMDA1XFx1MzAwNlxcdTMwMzEtXFx1MzAzNVxcdTMwM0JcXHUzMDNDXFx1MzA0MS1cXHUzMDk2XFx1MzA5RC1cXHUzMDlGXFx1MzBBMS1cXHUzMEZBXFx1MzBGQy1cXHUzMEZGXFx1MzEwNS1cXHUzMTJEXFx1MzEzMS1cXHUzMThFXFx1MzFBMC1cXHUzMUJBXFx1MzFGMC1cXHUzMUZGXFx1MzQwMC1cXHU0REI1XFx1NEUwMC1cXHU5RkNDXFx1QTAwMC1cXHVBNDhDXFx1QTREMC1cXHVBNEZEXFx1QTUwMC1cXHVBNjBDXFx1QTYxMC1cXHVBNjFGXFx1QTYyQVxcdUE2MkJcXHVBNjQwLVxcdUE2NkVcXHVBNjdGLVxcdUE2OTdcXHVBNkEwLVxcdUE2RTVcXHVBNzE3LVxcdUE3MUZcXHVBNzIyLVxcdUE3ODhcXHVBNzhCLVxcdUE3OEVcXHVBNzkwLVxcdUE3OTNcXHVBN0EwLVxcdUE3QUFcXHVBN0Y4LVxcdUE4MDFcXHVBODAzLVxcdUE4MDVcXHVBODA3LVxcdUE4MEFcXHVBODBDLVxcdUE4MjJcXHVBODQwLVxcdUE4NzNcXHVBODgyLVxcdUE4QjNcXHVBOEYyLVxcdUE4RjdcXHVBOEZCXFx1QTkwQS1cXHVBOTI1XFx1QTkzMC1cXHVBOTQ2XFx1QTk2MC1cXHVBOTdDXFx1QTk4NC1cXHVBOUIyXFx1QTlDRlxcdUFBMDAtXFx1QUEyOFxcdUFBNDAtXFx1QUE0MlxcdUFBNDQtXFx1QUE0QlxcdUFBNjAtXFx1QUE3NlxcdUFBN0FcXHVBQTgwLVxcdUFBQUZcXHVBQUIxXFx1QUFCNVxcdUFBQjZcXHVBQUI5LVxcdUFBQkRcXHVBQUMwXFx1QUFDMlxcdUFBREItXFx1QUFERFxcdUFBRTAtXFx1QUFFQVxcdUFBRjItXFx1QUFGNFxcdUFCMDEtXFx1QUIwNlxcdUFCMDktXFx1QUIwRVxcdUFCMTEtXFx1QUIxNlxcdUFCMjAtXFx1QUIyNlxcdUFCMjgtXFx1QUIyRVxcdUFCQzAtXFx1QUJFMlxcdUFDMDAtXFx1RDdBM1xcdUQ3QjAtXFx1RDdDNlxcdUQ3Q0ItXFx1RDdGQlxcdUY5MDAtXFx1RkE2RFxcdUZBNzAtXFx1RkFEOVxcdUZCMDAtXFx1RkIwNlxcdUZCMTMtXFx1RkIxN1xcdUZCMURcXHVGQjFGLVxcdUZCMjhcXHVGQjJBLVxcdUZCMzZcXHVGQjM4LVxcdUZCM0NcXHVGQjNFXFx1RkI0MFxcdUZCNDFcXHVGQjQzXFx1RkI0NFxcdUZCNDYtXFx1RkJCMVxcdUZCRDMtXFx1RkQzRFxcdUZENTAtXFx1RkQ4RlxcdUZEOTItXFx1RkRDN1xcdUZERjAtXFx1RkRGQlxcdUZFNzAtXFx1RkU3NFxcdUZFNzYtXFx1RkVGQ1xcdUZGMjEtXFx1RkYzQVxcdUZGNDEtXFx1RkY1QVxcdUZGNjYtXFx1RkZCRVxcdUZGQzItXFx1RkZDN1xcdUZGQ0EtXFx1RkZDRlxcdUZGRDItXFx1RkZEN1xcdUZGREEtXFx1RkZEQ10vLCAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjIwNzUwNzBcclxuICAnKic6IC8uL1xyXG59O1xyXG5QYXR0ZXJuTWFzay5ERUZfVFlQRVMgPSB7XHJcbiAgSU5QVVQ6ICdpbnB1dCcsXHJcbiAgRklYRUQ6ICdmaXhlZCdcclxufVxyXG5QYXR0ZXJuTWFzay5ERUZBVUxUX1BMQUNFSE9MREVSID0ge1xyXG4gIHNob3c6ICdsYXp5JyxcclxuICBjaGFyOiAnXydcclxufTtcclxuIiwiaW1wb3J0IHtpc1N0cmluZ30gZnJvbSAnLi91dGlscyc7XHJcblxyXG5pbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9tYXNrcy9iYXNlJztcclxuaW1wb3J0IFJlZ0V4cE1hc2sgZnJvbSAnLi9tYXNrcy9yZWdleHAnO1xyXG5pbXBvcnQgRnVuY01hc2sgZnJvbSAnLi9tYXNrcy9mdW5jJztcclxuaW1wb3J0IFBhdHRlcm5NYXNrIGZyb20gJy4vbWFza3MvcGF0dGVybic7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuZnVuY3Rpb24gSU1hc2sgKGVsLCBvcHRzPXt9KSB7XHJcbiAgdmFyIG1hc2sgPSBJTWFzay5NYXNrRmFjdG9yeShlbCwgb3B0cyk7XHJcbiAgbWFzay5iaW5kRXZlbnRzKCk7XHJcbiAgLy8gcmVmcmVzaFxyXG4gIG1hc2sucmF3VmFsdWUgPSBlbC52YWx1ZTtcclxuICByZXR1cm4gbWFzaztcclxufVxyXG5cclxuSU1hc2suTWFza0ZhY3RvcnkgPSBmdW5jdGlvbiAoZWwsIG9wdHMpIHtcclxuICB2YXIgbWFzayA9IG9wdHMubWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEJhc2VNYXNrKSByZXR1cm4gbWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIG5ldyBSZWdFeHBNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSByZXR1cm4gbmV3IEZ1bmNNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAoaXNTdHJpbmcobWFzaykpIHJldHVybiBuZXcgUGF0dGVybk1hc2soZWwsIG9wdHMpO1xyXG4gIHJldHVybiBuZXcgQmFzZU1hc2soZWwsIG9wdHMpO1xyXG59XHJcbklNYXNrLkJhc2VNYXNrID0gQmFzZU1hc2s7XHJcbklNYXNrLkZ1bmNNYXNrID0gRnVuY01hc2s7XHJcbklNYXNrLlJlZ0V4cE1hc2sgPSBSZWdFeHBNYXNrO1xyXG5JTWFzay5QYXR0ZXJuTWFzayA9IFBhdHRlcm5NYXNrO1xyXG53aW5kb3cuSU1hc2sgPSBJTWFzaztcclxuIl0sIm5hbWVzIjpbImlzU3RyaW5nIiwic3RyIiwiU3RyaW5nIiwiY29uZm9ybSIsInJlcyIsImZhbGxiYWNrIiwiZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzIiwiZGV0YWlscyIsImN1cnNvclBvcyIsIm9sZFNlbGVjdGlvbiIsIm9sZFZhbHVlIiwic3RhcnRDaGFuZ2VQb3MiLCJNYXRoIiwibWluIiwic3RhcnQiLCJpbnNlcnRlZENvdW50IiwicmVtb3ZlZENvdW50IiwibWF4IiwiZW5kIiwibGVuZ3RoIiwiaGVhZCIsInN1YnN0cmluZyIsInRhaWwiLCJpbnNlcnRlZCIsInN1YnN0ciIsInJlbW92ZWQiLCJCYXNlTWFzayIsImVsIiwib3B0cyIsIm1hc2siLCJfbGlzdGVuZXJzIiwiX3JlZnJlc2hpbmdDb3VudCIsIl9yYXdWYWx1ZSIsIl91bm1hc2tlZFZhbHVlIiwic2F2ZVNlbGVjdGlvbiIsImJpbmQiLCJfb25JbnB1dCIsIl9vbkRyb3AiLCJldiIsImhhbmRsZXIiLCJwdXNoIiwiaEluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwibGlzdGVuZXJzIiwiZm9yRWFjaCIsImwiLCJpbnB1dFZhbHVlIiwiX3NlbGVjdGlvbiIsInJhd1ZhbHVlIiwidW5tYXNrZWRWYWx1ZSIsInJlc29sdmUiLCJ1cGRhdGVFbGVtZW50IiwidmFsdWUiLCJ3YXJuIiwic2VsZWN0aW9uU3RhcnQiLCJ1bmJpbmRFdmVudHMiLCJfY2FsY1VubWFza2VkIiwiaXNDaGFuZ2VkIiwiX2N1cnNvckNoYW5naW5nIiwiY2xlYXJUaW1lb3V0IiwiX2NoYW5naW5nQ3Vyc29yUG9zIiwic2V0VGltZW91dCIsIl9maXJlQ2hhbmdlRXZlbnRzIiwiZmlyZUV2ZW50IiwicHJldmVudERlZmF1bHQiLCJwcm9jZXNzSW5wdXQiLCJzdG9wUHJvcGFnYXRpb24iLCJzZWxlY3Rpb25FbmQiLCJwb3MiLCJzZXRTZWxlY3Rpb25SYW5nZSIsIlJlZ0V4cE1hc2siLCJ0ZXN0IiwiRnVuY01hc2siLCJQYXR0ZXJuTWFzayIsIl9ob2xsb3dzIiwicGxhY2Vob2xkZXIiLCJkZWZpbml0aW9ucyIsIkRFRklOSVRJT05TIiwiX2FsaWduQ3Vyc29yIiwiX2FsaWduQ3Vyc29yRnJpZW5kbHkiLCJfaW5pdGlhbGl6ZWQiLCJfZGVmaW5pdGlvbnMiLCJfY2hhckRlZnMiLCJwYXR0ZXJuIiwidW5tYXNraW5nQmxvY2siLCJvcHRpb25hbEJsb2NrIiwiaSIsImNoIiwidHlwZSIsIkRFRl9UWVBFUyIsIklOUFVUIiwiRklYRUQiLCJ1bm1hc2tpbmciLCJvcHRpb25hbCIsIl9idWlsZFJlc29sdmVycyIsIl9yZXNvbHZlcnMiLCJkZWZLZXkiLCJJTWFzayIsIk1hc2tGYWN0b3J5IiwicGxhY2Vob2xkZXJCdWZmZXIiLCJob2xsb3dzIiwic2xpY2UiLCJvdmVyZmxvdyIsImNpIiwiZGkiLCJfbWFwUG9zVG9EZWZJbmRleCIsImRlZiIsInJlc29sdmVyIiwiY2hhciIsImNocmVzIiwiX3BsYWNlaG9sZGVyIiwiZnJvbVBvcyIsImlucHV0IiwiX2lzSGlkZGVuSG9sbG93IiwiX2lzSG9sbG93IiwiZGVmSW5kZXgiLCJmaWx0ZXIiLCJoIiwiX2hvbGxvd3NCZWZvcmUiLCJsYXN0SG9sbG93SW5kZXgiLCJpbnNlcnRTdGVwcyIsInRhaWxJbnB1dCIsIl9leHRyYWN0SW5wdXQiLCJfZ2VuZXJhdGVJbnNlcnRTdGVwcyIsImlzdGVwIiwic3RlcCIsIl9hcHBlbmRUYWlsIiwidHJlcyIsInRob2xsb3dzIiwiYXBwZW5kZWQiLCJfYXBwZW5kRml4ZWRFbmQiLCJoYXNIb2xsb3dzIiwiX2FwcGVuZFBsYWNlaG9sZGVyRW5kIiwiaXNDb21wbGV0ZSIsInNob3ciLCJ1bm1hc2tlZCIsImN1cnNvckRlZkluZGV4IiwiclBvcyIsInJEZWYiLCJsUG9zIiwibERlZiIsIl9tYXBEZWZJbmRleFRvUG9zIiwicGgiLCJERUZBVUxUX1BMQUNFSE9MREVSIiwibWFwIiwiam9pbiIsImRlZnMiLCJfaW5zdGFsbERlZmluaXRpb25zIiwiX21hc2siLCJiaW5kRXZlbnRzIiwiUmVnRXhwIiwiRnVuY3Rpb24iLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLFNBQVNBLFFBQVQsQ0FBbUJDLEdBQW5CLEVBQXdCO1NBQ2YsT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJB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