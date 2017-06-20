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
      var unmaskedValue = this._calcUnmasked(value);
      var isChanged = this.unmaskedValue !== unmaskedValue || this.rawValue !== value;

      this._unmaskedValue = unmaskedValue;
      this._rawValue = value;

      if (this.el.value !== value) this.el.value = value;
      this.updateCursor(cursorPos);

      if (isChanged) this._fireChangeEvents();
    }
  }, {
    key: "_fireChangeEvents",
    value: function _fireChangeEvents() {
      this.fireEvent("accept");
    }
  }, {
    key: "updateCursor",
    value: function updateCursor(cursorPos) {
      if (cursorPos == null) return;
      this.cursorPos = cursorPos;

      // also queue change cursor for mobile browsers
      this._delayUpdateCursor(cursorPos);
    }
  }, {
    key: "_delayUpdateCursor",
    value: function _delayUpdateCursor(cursorPos) {
      var _this = this;

      this._abortUpdateCursor();
      this._changingCursorPos = cursorPos;
      this._cursorChanging = setTimeout(function () {
        _this._abortUpdateCursor();
        _this.cursorPos = _this._changingCursorPos;
      }, 10);
    }
  }, {
    key: "_abortUpdateCursor",
    value: function _abortUpdateCursor() {
      if (this._cursorChanging) {
        clearTimeout(this._cursorChanging);
        delete this._cursorChanging;
      }
    }
  }, {
    key: "_onInput",
    value: function _onInput(ev) {
      this._abortUpdateCursor();
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
        oldValue: this.rawValue,
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
      return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
    }
  }, {
    key: "cursorPos",
    get: function get() {
      return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
    },
    set: function set(pos) {
      if (this.el !== document.activeElement) return;

      this.el.setSelectionRange(pos, pos);
      this.saveSelection();
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
      var skipUnresolvedInput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var placeholderBuffer = '';
      var hollows = this._hollows.slice();
      var overflow = false;

      for (var ci = 0, di = this._mapPosToDefIndex(str.length); ci < tail.length;) {
        var ch = tail[ci];
        var def = this.def(di, str + placeholderBuffer);

        // failed
        if (!def) {
          overflow = true;
          break;
        }

        if (def.type === PatternMask.DEF_TYPES.INPUT) {
          var resolver = this._resolvers[def.char];
          var chres = resolver.resolve(ch, di, str + placeholderBuffer) || '';
          var isResolved = !!chres;

          // if ok - next di
          if (chres) {
            chres = conform(chres, ch);
          } else {
            if (!def.optional && skipUnresolvedInput) chres = this._placeholder.char;
            if (hollows.indexOf(di) < 0) hollows.push(di);
          }

          if (chres) {
            str += placeholderBuffer + conform(chres, ch);
            placeholderBuffer = '';
          }
          if (chres || def.optional || !skipUnresolvedInput) ++di;
          if (isResolved || !def.optional && !skipUnresolvedInput) ++ci;
        } else {
          placeholderBuffer += def.char;

          if (ch === def.char && (def.unmasking || !skipUnresolvedInput)) ++ci;
          ++di;
        }
      }

      return [str, hollows, overflow];
    }
  }, {
    key: '_extractInput',
    value: function _extractInput(str) {
      var fromPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var input = '';

      for (var ci = 0, di = this._mapPosToDefIndex(fromPos); ci < str.length; ++di) {
        var ch = str[ci];
        var def = this.def(di, str);

        if (!def) break;
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
      return this._isHollow(defIndex) && this.def(defIndex) && this.def(defIndex).optional;
    }
  }, {
    key: '_isInput',
    value: function _isInput(defIndex) {
      return this.def(defIndex) && this.def(defIndex).type === PatternMask.DEF_TYPES.INPUT;
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
      var defIndex = pos;
      for (var hi = 0; hi < this._hollows.length; ++hi) {
        var h = this._hollows[hi];
        if (h >= defIndex) break;
        if (this._isHiddenHollow(h)) ++defIndex;
      }
      return defIndex;
    }
  }, {
    key: '_generateInsertSteps',
    value: function _generateInsertSteps(head, inserted) {
      var overflow = false;

      // save hollow during generation
      var hollows = this._hollows;

      var insertSteps = [[head, hollows.slice()]];

      for (var ci = 0; ci < inserted.length && !overflow; ++ci) {
        var ch = inserted[ci];

        var _appendTail2 = this._appendTail(head, ch, false),
            _appendTail3 = slicedToArray(_appendTail2, 3),
            res = _appendTail3[0],
            hollows = _appendTail3[1],
            overflow = _appendTail3[2];

        this._hollows = hollows;
        if (!overflow && res !== head) {
          insertSteps.push([res, hollows]);
          head = res;
        }
      }

      // pop hollows back
      this._hollows = hollows;

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

        var _appendTail4 = this._appendTail(step, tailInput),
            _appendTail5 = slicedToArray(_appendTail4, 3),
            tres = _appendTail5[0],
            thollows = _appendTail5[1],
            overflow = _appendTail5[2];

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
            var def = this.def(di);
            if (!def || def.type !== PatternMask.DEF_TYPES.FIXED) break;
          }
        }

        // remove head fixed and hollows if removed at end
        if (cursorPos === res.length) {
          var di = this._mapPosToDefIndex(cursorPos - 1);
          var hasHollows = false;
          for (; di > 0; --di) {
            var def = this.def(di);
            if (def.type === PatternMask.DEF_TYPES.INPUT) {
              if (this._isHollow(di)) hasHollows = true;else break;
            }
          }
          if (hasHollows) res = res.slice(0, di + 1);
        }

        cursorPos = this._nearestInputPos(cursorPos);
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
        var def = this.def(di, res);
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
      for (var di = this._mapPosToDefIndex(res.length);; ++di) {
        var def = this.def(di, res);
        if (!def) break;

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
      for (var ci = 0, di = 0; ci < str.length; ++di) {
        var ch = str[ci];
        var def = this.def(di, str);

        if (!def) break;
        if (this._isHiddenHollow(di)) continue;

        if (def.unmasking && !this._isHollow(di) && (def.type === PatternMask.DEF_TYPES.INPUT && this._resolvers[def.char].resolve(ch, ci, str) || def.char === ch)) {
          unmasked += ch;
        }
        ++ci;
      }
      return unmasked;
    }
  }, {
    key: 'defs',
    value: function defs(str) {
      var defs = [];
      for (var i = 0;; ++i) {
        var def = this.def(i, str);
        if (!def) break;
        defs.push(def);
      }
      return defs;
    }
  }, {
    key: 'def',
    value: function def(index, str) {
      return this._charDefs[index];
    }
  }, {
    key: '_nearestInputPos',
    value: function _nearestInputPos(cursorPos) {
      var cursorDefIndex = this._mapPosToDefIndex(cursorPos);

      var lPos = cursorDefIndex - 1;

      // align left till first input
      while (lPos >= 0 && !this._isInput(lPos) && !this._isInput(lPos + 1)) {
        --lPos;
      }cursorDefIndex = lPos + 1; // adjust max available pos

      // continue align left also skipping hollows
      while (lPos >= 0 && (!this._isInput(lPos) || this._isHollow(lPos))) {
        --lPos;
      }var rPos = lPos + 1;

      // align right back until first input
      while (this.def(rPos) && !this._isInput(rPos - 1) && !this._isInput(rPos)) {
        ++rPos;
      }cursorDefIndex = Math.max(rPos, cursorDefIndex); // adjust max available pos

      // continue align right also skipping hollows
      while (rPos < cursorDefIndex && (!this._isInput(rPos) || !this._isHollow(rPos) || this._isHiddenHollow(rPos))) {
        ++rPos;
      }return this._mapDefIndexToPos(rPos);
    }
  }, {
    key: '_alignCursor',
    value: function _alignCursor() {
      this.cursorPos = this._nearestInputPos(this.cursorPos);
    }
  }, {
    key: 'isComplete',
    get: function get() {
      for (var di = 0;; ++di) {
        var def = this.def(di);
        if (!def) break;
        if (def.type === PatternMask.DEF_TYPES.INPUT && !def.optional && this._isHollow(di)) return false;
      }
      return true;
    }
  }, {
    key: 'unmaskedValue',
    get: function get() {
      return this._unmaskedValue;
    },
    set: function set(str) {
      this._hollows.length = 0;
      var res;

      var _appendTail6 = this._appendTail('', str);

      var _appendTail7 = slicedToArray(_appendTail6, 2);

      res = _appendTail7[0];
      this._hollows = _appendTail7[1];

      this.updateElement(this._appendPlaceholderEnd(res));

      this._alignCursor();
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
      var _this3 = this;

      return this.defs().map(function (def) {
        return def.type === PatternMask.DEF_TYPES.FIXED ? def.char : !def.optional ? _this3._placeholder.char : '';
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

var PipeMask = function (_BaseMask) {
  inherits(PipeMask, _BaseMask);

  function PipeMask(el, opts) {
    classCallCheck(this, PipeMask);

    var _this = possibleConstructorReturn(this, (PipeMask.__proto__ || Object.getPrototypeOf(PipeMask)).call(this, el, opts));

    _this.multipass = opts.multipass;

    _this._compiledMasks = _this.mask.map(function (m) {
      return IMask.MaskFactory(el, m);
    });
    return _this;
  }

  createClass(PipeMask, [{
    key: 'resolve',
    value: function resolve(str, details) {
      var res = this._pipe(str, details);
      if (!this.multipass) return res;

      var cursorPos = details.cursorPos;

      var stepRes;
      var tempRes = res;

      while (stepRes !== tempRes) {
        stepRes = tempRes;
        tempRes = this._pipe(stepRes, {
          cursorPos: stepRes.length,
          oldValue: stepRes,
          oldSelection: {
            start: 0,
            end: stepRes.length
          }
        });
      }

      details.cursorPos = cursorPos - (res.length - stepRes.length);

      return stepRes;
    }
  }, {
    key: '_pipe',
    value: function _pipe(str, details) {
      return this._compiledMasks.reduce(function (s, m) {
        var d = extendDetailsAdjustments(s, details);
        var res = m.resolve(s, d);
        details.cursorPos = d.cursorPos;
        return res;
      }, str);
    }
  }, {
    key: 'bindEvents',
    value: function bindEvents() {
      get$1(PipeMask.prototype.__proto__ || Object.getPrototypeOf(PipeMask.prototype), 'bindEvents', this).call(this);
      this._compiledMasks.forEach(function (m) {
        m.bindEvents();
        // disable basemask events for child masks
        BaseMask.prototype.unbindEvents.apply(m);
      });
    }
  }, {
    key: 'unbindEvents',
    value: function unbindEvents() {
      get$1(PipeMask.prototype.__proto__ || Object.getPrototypeOf(PipeMask.prototype), 'unbindEvents', this).call(this);
      this._compiledMasks.forEach(function (m) {
        return m.unbindEvents();
      });
    }
  }]);
  return PipeMask;
}(BaseMask);

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
  if (mask instanceof Array) return new PipeMask(el, opts);
  if (isString(mask)) return new PatternMask(el, opts);
  if (mask.prototype instanceof BaseMask) return new mask(el, opts);
  if (mask instanceof Function) return new FuncMask(el, opts);
  return new BaseMask(el, opts);
};
IMask$1.BaseMask = BaseMask;
IMask$1.FuncMask = FuncMask;
IMask$1.RegExpMask = RegExpMask;
IMask$1.PatternMask = PatternMask;
window.IMask = IMask$1;

return IMask$1;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvcGlwZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL2ltYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydFxyXG5mdW5jdGlvbiBpc1N0cmluZyAoc3RyKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnIHx8IHN0ciBpbnN0YW5jZW9mIFN0cmluZztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGNvbmZvcm0gKHJlcywgc3RyLCBmYWxsYmFjaz0nJykge1xyXG4gIHJldHVybiBpc1N0cmluZyhyZXMpID9cclxuICAgIHJlcyA6XHJcbiAgICByZXMgP1xyXG4gICAgICBzdHIgOlxyXG4gICAgICBmYWxsYmFjaztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGV4dGVuZERldGFpbHNBZGp1c3RtZW50cyhzdHIsIGRldGFpbHMpIHtcclxuICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgdmFyIG9sZFNlbGVjdGlvbiA9IGRldGFpbHMub2xkU2VsZWN0aW9uO1xyXG4gIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcblxyXG4gIHZhciBzdGFydENoYW5nZVBvcyA9IE1hdGgubWluKGN1cnNvclBvcywgb2xkU2VsZWN0aW9uLnN0YXJ0KTtcclxuICB2YXIgaW5zZXJ0ZWRDb3VudCA9IGN1cnNvclBvcyAtIHN0YXJ0Q2hhbmdlUG9zO1xyXG4gIC8vIE1hdGgubWF4IGZvciBvcHBvc2l0ZSBvcGVyYXRpb25cclxuICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgIC8vIGZvciBEZWxldGVcclxuICAgIG9sZFZhbHVlLmxlbmd0aCAtIHN0ci5sZW5ndGgsIDApO1xyXG4gIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyk7XHJcbiAgdmFyIHRhaWwgPSBzdHIuc3Vic3RyaW5nKHN0YXJ0Q2hhbmdlUG9zICsgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIGluc2VydGVkID0gc3RyLnN1YnN0cihzdGFydENoYW5nZVBvcywgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIHJlbW92ZWQgPSBzdHIuc3Vic3RyKHN0YXJ0Q2hhbmdlUG9zLCByZW1vdmVkQ291bnQpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc3RhcnRDaGFuZ2VQb3MsXHJcbiAgICBoZWFkLFxyXG4gICAgdGFpbCxcclxuICAgIGluc2VydGVkLFxyXG4gICAgcmVtb3ZlZCxcclxuICAgIC4uLmRldGFpbHNcclxuICB9O1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybSwgZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgdGhpcy5fcmVmcmVzaGluZ0NvdW50ID0gMDtcclxuICAgIHRoaXMuX3Jhd1ZhbHVlID0gXCJcIjtcclxuICAgIHRoaXMuX3VubWFza2VkVmFsdWUgPSBcIlwiO1xyXG5cclxuICAgIHRoaXMuc2F2ZVNlbGVjdGlvbiA9IHRoaXMuc2F2ZVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fb25JbnB1dCA9IHRoaXMuX29uSW5wdXQuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuX29uRHJvcCA9IHRoaXMuX29uRHJvcC5iaW5kKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgb24gKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHRoaXMuX2xpc3RlbmVyc1tldl0gPSBbXTtcclxuICAgIHRoaXMuX2xpc3RlbmVyc1tldl0ucHVzaChoYW5kbGVyKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgb2ZmIChldiwgaGFuZGxlcikge1xyXG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbZXZdKSByZXR1cm47XHJcbiAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tldl07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBoSW5kZXggPSB0aGlzLl9saXN0ZW5lcnNbZXZdLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICBpZiAoaEluZGV4ID49IDApIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaEluZGV4LCAxKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHJhd1ZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9yYXdWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCByYXdWYWx1ZSAoc3RyKSB7XHJcbiAgICB0aGlzLnByb2Nlc3NJbnB1dChzdHIsIHtcclxuICAgICAgY3Vyc29yUG9zOiBzdHIubGVuZ3RoLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5yYXdWYWx1ZSxcclxuICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiB0aGlzLnJhd1ZhbHVlLmxlbmd0aFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl91bm1hc2tlZFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHZhbHVlKSB7XHJcbiAgICB0aGlzLnJhd1ZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnNhdmVTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICB9XHJcblxyXG4gIHVuYmluZEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnNhdmVTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICB9XHJcblxyXG4gIGZpcmVFdmVudCAoZXYpIHtcclxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZdIHx8IFtdO1xyXG4gICAgbGlzdGVuZXJzLmZvckVhY2gobCA9PiBsKCkpO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChpbnB1dFZhbHVlLCBkZXRhaWxzKSB7XHJcbiAgICBkZXRhaWxzID0ge1xyXG4gICAgICBjdXJzb3JQb3M6IHRoaXMuY3Vyc29yUG9zLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHRoaXMuX3NlbGVjdGlvbixcclxuICAgICAgb2xkVmFsdWU6IHRoaXMucmF3VmFsdWUsXHJcbiAgICAgIG9sZFVubWFza2VkVmFsdWU6IHRoaXMudW5tYXNrZWRWYWx1ZSxcclxuICAgICAgLi4uZGV0YWlsc1xyXG4gICAgfTtcclxuXHJcbiAgICBkZXRhaWxzID0gZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzKGlucHV0VmFsdWUsIGRldGFpbHMpO1xyXG5cclxuICAgIHZhciByZXMgPSBjb25mb3JtKHRoaXMucmVzb2x2ZShpbnB1dFZhbHVlLCBkZXRhaWxzKSxcclxuICAgICAgaW5wdXRWYWx1ZSxcclxuICAgICAgdGhpcy5yYXdWYWx1ZSk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVFbGVtZW50KHJlcywgZGV0YWlscy5jdXJzb3JQb3MpO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG5cclxuICBnZXQgc2VsZWN0aW9uU3RhcnQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID9cclxuICAgICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOlxyXG5cclxuICAgICAgdGhpcy5lbC5zZWxlY3Rpb25TdGFydDtcclxuICB9XHJcblxyXG4gIGdldCBjdXJzb3JQb3MgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID9cclxuICAgICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOlxyXG5cclxuICAgICAgdGhpcy5lbC5zZWxlY3Rpb25FbmQ7XHJcbiAgfVxyXG5cclxuICBzZXQgY3Vyc29yUG9zIChwb3MpIHtcclxuICAgIGlmICh0aGlzLmVsICE9PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50KSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5lbC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgICB0aGlzLnNhdmVTZWxlY3Rpb24oKTtcclxuICB9XHJcblxyXG4gIHNhdmVTZWxlY3Rpb24gKGV2KSB7XHJcbiAgICBpZiAodGhpcy5yYXdWYWx1ZSAhPT0gdGhpcy5lbC52YWx1ZSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJVbmNvbnRyb2xsZWQgaW5wdXQgY2hhbmdlLCByZWZyZXNoIG1hc2sgbWFudWFsbHkhXCIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fc2VsZWN0aW9uID0ge1xyXG4gICAgICBzdGFydDogdGhpcy5zZWxlY3Rpb25TdGFydCxcclxuICAgICAgZW5kOiB0aGlzLmN1cnNvclBvc1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3kgKCkge1xyXG4gICAgdGhpcy51bmJpbmRFdmVudHMoKTtcclxuICAgIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPSAwO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlRWxlbWVudCAodmFsdWUsIGN1cnNvclBvcykge1xyXG4gICAgdmFyIHVubWFza2VkVmFsdWUgPSB0aGlzLl9jYWxjVW5tYXNrZWQodmFsdWUpO1xyXG4gICAgdmFyIGlzQ2hhbmdlZCA9ICh0aGlzLnVubWFza2VkVmFsdWUgIT09IHVubWFza2VkVmFsdWUgfHxcclxuICAgICAgdGhpcy5yYXdWYWx1ZSAhPT0gdmFsdWUpO1xyXG5cclxuICAgIHRoaXMuX3VubWFza2VkVmFsdWUgPSB1bm1hc2tlZFZhbHVlO1xyXG4gICAgdGhpcy5fcmF3VmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICBpZiAodGhpcy5lbC52YWx1ZSAhPT0gdmFsdWUpIHRoaXMuZWwudmFsdWUgPSB2YWx1ZTtcclxuICAgIHRoaXMudXBkYXRlQ3Vyc29yKGN1cnNvclBvcyk7XHJcblxyXG4gICAgaWYgKGlzQ2hhbmdlZCkgdGhpcy5fZmlyZUNoYW5nZUV2ZW50cygpO1xyXG4gIH1cclxuXHJcbiAgX2ZpcmVDaGFuZ2VFdmVudHMgKCkge1xyXG4gICAgdGhpcy5maXJlRXZlbnQoXCJhY2NlcHRcIik7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVDdXJzb3IgKGN1cnNvclBvcykge1xyXG4gICAgaWYgKGN1cnNvclBvcyA9PSBudWxsKSByZXR1cm47XHJcbiAgICB0aGlzLmN1cnNvclBvcyA9IGN1cnNvclBvcztcclxuXHJcbiAgICAvLyBhbHNvIHF1ZXVlIGNoYW5nZSBjdXJzb3IgZm9yIG1vYmlsZSBicm93c2Vyc1xyXG4gICAgdGhpcy5fZGVsYXlVcGRhdGVDdXJzb3IoY3Vyc29yUG9zKTtcclxuICB9XHJcblxyXG4gIF9kZWxheVVwZGF0ZUN1cnNvciAoY3Vyc29yUG9zKSB7XHJcbiAgICB0aGlzLl9hYm9ydFVwZGF0ZUN1cnNvcigpO1xyXG4gICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcbiAgICB0aGlzLl9jdXJzb3JDaGFuZ2luZyA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLl9hYm9ydFVwZGF0ZUN1cnNvcigpO1xyXG4gICAgICB0aGlzLmN1cnNvclBvcyA9IHRoaXMuX2NoYW5naW5nQ3Vyc29yUG9zO1xyXG4gICAgfSwgMTApO1xyXG4gIH1cclxuXHJcbiAgX2Fib3J0VXBkYXRlQ3Vyc29yKCkge1xyXG4gICAgaWYgKHRoaXMuX2N1cnNvckNoYW5naW5nKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9jdXJzb3JDaGFuZ2luZyk7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLl9jdXJzb3JDaGFuZ2luZztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9vbklucHV0IChldikge1xyXG4gICAgdGhpcy5fYWJvcnRVcGRhdGVDdXJzb3IoKTtcclxuICAgIHRoaXMucHJvY2Vzc0lucHV0KHRoaXMuZWwudmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgX29uRHJvcCAoZXYpIHtcclxuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8vIG92ZXJyaWRlXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7IHJldHVybiBzdHI7IH1cclxuXHJcbiAgX2NhbGNVbm1hc2tlZCAodmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUmVnRXhwTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlIChzdHIpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2sudGVzdChzdHIpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBGdW5jTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlICguLi5hcmdzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrKC4uLmFyZ3MpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge2NvbmZvcm19IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGF0dGVybk1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICBzdXBlcihlbCwgb3B0cyk7XHJcblxyXG4gICAgdGhpcy5faG9sbG93cyA9IFtdO1xyXG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IG9wdHMucGxhY2Vob2xkZXI7XHJcbiAgICB0aGlzLmRlZmluaXRpb25zID0ge1xyXG4gICAgICAuLi5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyxcclxuICAgICAgLi4ub3B0cy5kZWZpbml0aW9uc1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvciA9IHRoaXMuX2FsaWduQ3Vyc29yLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5ID0gdGhpcy5fYWxpZ25DdXJzb3JGcmllbmRseS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIF9hbGlnbkN1cnNvckZyaWVuZGx5ICgpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGlvblN0YXJ0ICE9PSB0aGlzLmN1cnNvclBvcykgcmV0dXJuO1xyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IoKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgX2luc3RhbGxEZWZpbml0aW9ucyAoZGVmaW5pdGlvbnMpIHtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmaW5pdGlvbnM7XHJcbiAgICB0aGlzLl9jaGFyRGVmcyA9IFtdO1xyXG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLm1hc2s7XHJcblxyXG4gICAgaWYgKCFwYXR0ZXJuIHx8ICFkZWZpbml0aW9ucykgcmV0dXJuO1xyXG5cclxuICAgIHZhciB1bm1hc2tpbmdCbG9jayA9IGZhbHNlO1xyXG4gICAgdmFyIG9wdGlvbmFsQmxvY2sgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgIHZhciB0eXBlID0gIXVubWFza2luZ0Jsb2NrICYmIGNoIGluIGRlZmluaXRpb25zID9cclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgOlxyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgdmFyIHVubWFza2luZyA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCB8fCB1bm1hc2tpbmdCbG9jaztcclxuICAgICAgdmFyIG9wdGlvbmFsID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIG9wdGlvbmFsQmxvY2s7XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICd7JyB8fCBjaCA9PT0gJ30nKSB7XHJcbiAgICAgICAgdW5tYXNraW5nQmxvY2sgPSAhdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1snIHx8IGNoID09PSAnXScpIHtcclxuICAgICAgICBvcHRpb25hbEJsb2NrID0gIW9wdGlvbmFsQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1xcXFwnKSB7XHJcbiAgICAgICAgKytpO1xyXG4gICAgICAgIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgICAvLyBUT0RPIHZhbGlkYXRpb25cclxuICAgICAgICBpZiAoIWNoKSBicmVhaztcclxuICAgICAgICB0eXBlID0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jaGFyRGVmcy5wdXNoKHtcclxuICAgICAgICBjaGFyOiBjaCxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcclxuICAgICAgICB1bm1hc2tpbmc6IHVubWFza2luZ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG4gIH1cclxuXHJcbiAgX2J1aWxkUmVzb2x2ZXJzICgpIHtcclxuICAgIHRoaXMuX3Jlc29sdmVycyA9IHt9O1xyXG4gICAgZm9yICh2YXIgZGVmS2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgdGhpcy5fcmVzb2x2ZXJzW2RlZktleV0gPSBJTWFzay5NYXNrRmFjdG9yeSh0aGlzLmVsLCB7XHJcbiAgICAgICAgbWFzazogdGhpcy5kZWZpbml0aW9uc1tkZWZLZXldXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFRhaWwgKHN0ciwgdGFpbCwgc2tpcFVucmVzb2x2ZWRJbnB1dD10cnVlKSB7XHJcbiAgICB2YXIgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgIHZhciBob2xsb3dzID0gdGhpcy5faG9sbG93cy5zbGljZSgpO1xyXG4gICAgdmFyIG92ZXJmbG93ID0gZmFsc2U7XHJcblxyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9dGhpcy5fbWFwUG9zVG9EZWZJbmRleChzdHIubGVuZ3RoKTsgY2kgPCB0YWlsLmxlbmd0aDspIHtcclxuICAgICAgdmFyIGNoID0gdGFpbFtjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLmRlZihkaSwgc3RyICsgcGxhY2Vob2xkZXJCdWZmZXIpO1xyXG5cclxuICAgICAgLy8gZmFpbGVkXHJcbiAgICAgIGlmICghZGVmKSB7XHJcbiAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgZGksIHN0ciArIHBsYWNlaG9sZGVyQnVmZmVyKSB8fCAnJztcclxuICAgICAgICB2YXIgaXNSZXNvbHZlZCA9ICEhY2hyZXM7XHJcblxyXG4gICAgICAgIC8vIGlmIG9rIC0gbmV4dCBkaVxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgY2hyZXMgPSBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICghZGVmLm9wdGlvbmFsICYmIHNraXBVbnJlc29sdmVkSW5wdXQpIGNocmVzID0gdGhpcy5fcGxhY2Vob2xkZXIuY2hhcjtcclxuICAgICAgICAgIGlmIChob2xsb3dzLmluZGV4T2YoZGkpIDwgMCkgaG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgc3RyICs9IHBsYWNlaG9sZGVyQnVmZmVyICsgY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNocmVzIHx8IGRlZi5vcHRpb25hbCB8fCAhc2tpcFVucmVzb2x2ZWRJbnB1dCkgKytkaTtcclxuICAgICAgICBpZiAoaXNSZXNvbHZlZCB8fCAhZGVmLm9wdGlvbmFsICYmICFza2lwVW5yZXNvbHZlZElucHV0KSArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG5cclxuICAgICAgICBpZiAoY2ggPT09IGRlZi5jaGFyICYmIChkZWYudW5tYXNraW5nIHx8ICFza2lwVW5yZXNvbHZlZElucHV0KSkgKytjaTtcclxuICAgICAgICArK2RpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtzdHIsIGhvbGxvd3MsIG92ZXJmbG93XTtcclxuICB9XHJcblxyXG4gIF9leHRyYWN0SW5wdXQgKHN0ciwgZnJvbVBvcz0wKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAnJztcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGZyb21Qb3MpOyBjaTxzdHIubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLmRlZihkaSwgc3RyKTtcclxuXHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGRpKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiAhdGhpcy5faXNIb2xsb3coZGkpKSBpbnB1dCArPSBjaDtcclxuICAgICAgKytjaTtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIF9pc0hvbGxvdyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGVmSW5kZXgpID49IDA7XHJcbiAgfVxyXG5cclxuICBfaXNIaWRkZW5Ib2xsb3cgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5faXNIb2xsb3coZGVmSW5kZXgpICYmIHRoaXMuZGVmKGRlZkluZGV4KSAmJiB0aGlzLmRlZihkZWZJbmRleCkub3B0aW9uYWw7XHJcbiAgfVxyXG5cclxuICBfaXNJbnB1dCAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLmRlZihkZWZJbmRleCkgJiYgdGhpcy5kZWYoZGVmSW5kZXgpLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVDtcclxuICB9XHJcblxyXG4gIF9ob2xsb3dzQmVmb3JlIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGRlZkluZGV4ICYmIHRoaXMuX2lzSGlkZGVuSG9sbG93KGgpKTtcclxuICB9XHJcblxyXG4gIF9tYXBEZWZJbmRleFRvUG9zIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIGRlZkluZGV4IC0gdGhpcy5faG9sbG93c0JlZm9yZShkZWZJbmRleCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX21hcFBvc1RvRGVmSW5kZXggKHBvcykge1xyXG4gICAgdmFyIGRlZkluZGV4ID0gcG9zO1xyXG4gICAgZm9yICh2YXIgaGk9MDsgaGk8dGhpcy5faG9sbG93cy5sZW5ndGg7ICsraGkpIHtcclxuICAgICAgdmFyIGggPSB0aGlzLl9ob2xsb3dzW2hpXTtcclxuICAgICAgaWYgKGggPj0gZGVmSW5kZXgpIGJyZWFrO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coaCkpICsrZGVmSW5kZXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVmSW5kZXg7XHJcbiAgfVxyXG5cclxuICBfZ2VuZXJhdGVJbnNlcnRTdGVwcyAoaGVhZCwgaW5zZXJ0ZWQpIHtcclxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHNhdmUgaG9sbG93IGR1cmluZyBnZW5lcmF0aW9uXHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3M7XHJcblxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW1toZWFkLCBob2xsb3dzLnNsaWNlKCldXTtcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wOyBjaTxpbnNlcnRlZC5sZW5ndGggJiYgIW92ZXJmbG93OyArK2NpKSB7XHJcbiAgICAgIHZhciBjaCA9IGluc2VydGVkW2NpXTtcclxuICAgICAgdmFyIFtyZXMsIGhvbGxvd3MsIG92ZXJmbG93XSA9IHRoaXMuX2FwcGVuZFRhaWwoaGVhZCwgY2gsIGZhbHNlKTtcclxuICAgICAgdGhpcy5faG9sbG93cyA9IGhvbGxvd3M7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cgJiYgcmVzICE9PSBoZWFkKSB7XHJcbiAgICAgICAgaW5zZXJ0U3RlcHMucHVzaChbcmVzLCBob2xsb3dzXSk7XHJcbiAgICAgICAgaGVhZCA9IHJlcztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHBvcCBob2xsb3dzIGJhY2tcclxuICAgIHRoaXMuX2hvbGxvd3MgPSBob2xsb3dzO1xyXG5cclxuICAgIHJldHVybiBpbnNlcnRTdGVwcztcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgdmFyIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgdmFyIHN0YXJ0Q2hhbmdlUG9zID0gZGV0YWlscy5zdGFydENoYW5nZVBvcztcclxuICAgIHZhciBpbnNlcnRlZCA9IGRldGFpbHMuaW5zZXJ0ZWQ7XHJcbiAgICB2YXIgcmVtb3ZlZENvdW50ID0gZGV0YWlscy5yZW1vdmVkLmxlbmd0aDtcclxuICAgIHZhciB0YWlsSW5wdXQgPSB0aGlzLl9leHRyYWN0SW5wdXQoZGV0YWlscy50YWlsLCBzdGFydENoYW5nZVBvcyArIHJlbW92ZWRDb3VudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhvbGxvd3MgYWZ0ZXIgY3Vyc29yXHJcbiAgICB2YXIgbGFzdEhvbGxvd0luZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChzdGFydENoYW5nZVBvcyk7XHJcbiAgICB0aGlzLl9ob2xsb3dzID0gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgbGFzdEhvbGxvd0luZGV4KTtcclxuXHJcbiAgICB2YXIgcmVzID0gZGV0YWlscy5oZWFkO1xyXG5cclxuICAgIC8vIGluc2VydCBhdmFpbGFibGVcclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IHRoaXMuX2dlbmVyYXRlSW5zZXJ0U3RlcHMocmVzLCBpbnNlcnRlZCk7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcDtcclxuICAgICAgW3N0ZXAsIHRoaXMuX2hvbGxvd3NdID0gaW5zZXJ0U3RlcHNbaXN0ZXBdO1xyXG4gICAgICB2YXIgW3RyZXMsIHRob2xsb3dzLCBvdmVyZmxvd10gPSB0aGlzLl9hcHBlbmRUYWlsKHN0ZXAsIHRhaWxJbnB1dCk7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cpIHtcclxuICAgICAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IFt0cmVzLCB0aG9sbG93c107XHJcbiAgICAgICAgY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBpbnB1dCBhdCB0aGUgZW5kIC0gYXBwZW5kIGZpeGVkXHJcbiAgICBpZiAoaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIGFwcGVuZCBmaXhlZCBhdCBlbmRcclxuICAgICAgdmFyIGFwcGVuZGVkID0gdGhpcy5fYXBwZW5kRml4ZWRFbmQocmVzKTtcclxuICAgICAgY3Vyc29yUG9zICs9IGFwcGVuZGVkLmxlbmd0aCAtIHJlcy5sZW5ndGg7XHJcbiAgICAgIHJlcyA9IGFwcGVuZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaW5zZXJ0ZWQgJiYgcmVtb3ZlZENvdW50KSB7XHJcbiAgICAgIC8vIGlmIGRlbGV0ZSBhdCByaWdodFxyXG4gICAgICBpZiAoZGV0YWlscy5vbGRTZWxlY3Rpb24uZW5kID09PSBjdXJzb3JQb3MpIHtcclxuICAgICAgICBmb3IgKDs7KytjdXJzb3JQb3MpIHtcclxuICAgICAgICAgIHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGN1cnNvclBvcyk7XHJcbiAgICAgICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGkpO1xyXG4gICAgICAgICAgaWYgKCFkZWYgfHwgZGVmLnR5cGUgIT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCkgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZW1vdmUgaGVhZCBmaXhlZCBhbmQgaG9sbG93cyBpZiByZW1vdmVkIGF0IGVuZFxyXG4gICAgICBpZiAoY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGRpID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChjdXJzb3JQb3MtMSk7XHJcbiAgICAgICAgdmFyIGhhc0hvbGxvd3MgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKDsgZGkgPiAwOyAtLWRpKSB7XHJcbiAgICAgICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGkpO1xyXG4gICAgICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzSG9sbG93KGRpKSkgaGFzSG9sbG93cyA9IHRydWU7XHJcbiAgICAgICAgICAgIGVsc2UgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYXNIb2xsb3dzKSByZXMgPSByZXMuc2xpY2UoMCwgZGkgKyAxKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY3Vyc29yUG9zID0gdGhpcy5fbmVhcmVzdElucHV0UG9zKGN1cnNvclBvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXBwZW5kIHBsYWNlaG9sZGVyXHJcbiAgICByZXMgPSB0aGlzLl9hcHBlbmRQbGFjZWhvbGRlckVuZChyZXMpO1xyXG4gICAgZGV0YWlscy5jdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcblxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9maXJlQ2hhbmdlRXZlbnRzICgpIHtcclxuICAgIC8vIGZpcmUgJ2NvbXBsZXRlJyBhZnRlciAnYWNjZXB0JyBldmVudFxyXG4gICAgc3VwZXIuX2ZpcmVDaGFuZ2VFdmVudHMoKTtcclxuICAgIGlmICh0aGlzLmlzQ29tcGxldGUpIHRoaXMuZmlyZUV2ZW50KFwiY29tcGxldGVcIik7XHJcbiAgfVxyXG5cclxuICBnZXQgaXNDb21wbGV0ZSAoKSB7XHJcbiAgICBmb3IgKHZhciBkaT0wOyA7KytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGkpO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmICFkZWYub3B0aW9uYWwgJiYgdGhpcy5faXNIb2xsb3coZGkpKSByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIF9hcHBlbmRGaXhlZEVuZCAocmVzKSB7XHJcbiAgICBmb3IgKHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHJlcy5sZW5ndGgpOzsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGksIHJlcyk7XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIGlmIChkaSA+PSByZXMubGVuZ3RoKSByZXMgKz0gZGVmLmNoYXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFBsYWNlaG9sZGVyRW5kIChyZXMpIHtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7IDsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGksIHJlcyk7XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmICF0aGlzLl9pc0hvbGxvdyhkaSkpIHtcclxuICAgICAgICB0aGlzLl9ob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLl9wbGFjZWhvbGRlci5zaG93ID09PSAnYWx3YXlzJykge1xyXG4gICAgICAgIHJlcyArPSBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEID9cclxuICAgICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAgICFkZWYub3B0aW9uYWwgP1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZWhvbGRlci5jaGFyIDpcclxuICAgICAgICAgICAgJyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBfY2FsY1VubWFza2VkIChzdHIpIHtcclxuICAgIHZhciB1bm1hc2tlZCA9ICcnO1xyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9MDsgY2k8c3RyLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGksIHN0cik7XHJcblxyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaWYgKGRlZi51bm1hc2tpbmcgJiYgIXRoaXMuX2lzSG9sbG93KGRpKSAmJlxyXG4gICAgICAgIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl0ucmVzb2x2ZShjaCwgY2ksIHN0cikgfHxcclxuICAgICAgICAgIGRlZi5jaGFyID09PSBjaCkpIHtcclxuICAgICAgICB1bm1hc2tlZCArPSBjaDtcclxuICAgICAgfVxyXG4gICAgICArK2NpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVubWFza2VkO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHVubWFza2VkVmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3VubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgdW5tYXNrZWRWYWx1ZSAoc3RyKSB7XHJcbiAgICB0aGlzLl9ob2xsb3dzLmxlbmd0aCA9IDA7XHJcbiAgICB2YXIgcmVzO1xyXG4gICAgW3JlcywgdGhpcy5faG9sbG93c10gPSB0aGlzLl9hcHBlbmRUYWlsKCcnLCBzdHIpO1xyXG4gICAgdGhpcy51cGRhdGVFbGVtZW50KHRoaXMuX2FwcGVuZFBsYWNlaG9sZGVyRW5kKHJlcykpO1xyXG5cclxuICAgIHRoaXMuX2FsaWduQ3Vyc29yKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgcGxhY2Vob2xkZXIgKCkgeyByZXR1cm4gdGhpcy5fcGxhY2Vob2xkZXI7IH1cclxuXHJcbiAgc2V0IHBsYWNlaG9sZGVyIChwaCkge1xyXG4gICAgdGhpcy5fcGxhY2Vob2xkZXIgPSB7XHJcbiAgICAgIC4uLlBhdHRlcm5NYXNrLkRFRkFVTFRfUExBQ0VIT0xERVIsXHJcbiAgICAgIC4uLnBoXHJcbiAgICB9O1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB0aGlzLnVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXQgcGxhY2Vob2xkZXJMYWJlbCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kZWZzKCkubWFwKGRlZiA9PlxyXG4gICAgICBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEID9cclxuICAgICAgICBkZWYuY2hhciA6XHJcbiAgICAgICAgIWRlZi5vcHRpb25hbCA/XHJcbiAgICAgICAgICB0aGlzLl9wbGFjZWhvbGRlci5jaGFyIDpcclxuICAgICAgICAgICcnKS5qb2luKCcnKTtcclxuICB9XHJcblxyXG4gIGdldCBkZWZpbml0aW9ucyAoKSB7IHJldHVybiB0aGlzLl9kZWZpbml0aW9uczsgfVxyXG5cclxuICBzZXQgZGVmaW5pdGlvbnMgKGRlZnMpIHtcclxuICAgIHRoaXMuX2luc3RhbGxEZWZpbml0aW9ucyhkZWZzKTtcclxuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgdGhpcy51bm1hc2tlZFZhbHVlID0gdGhpcy51bm1hc2tlZFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IG1hc2sgKCkgeyByZXR1cm4gdGhpcy5fbWFzazsgfVxyXG5cclxuICBzZXQgbWFzayAobWFzaykge1xyXG4gICAgdGhpcy5fbWFzayA9IG1hc2s7XHJcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHRoaXMuZGVmaW5pdGlvbnMgPSB0aGlzLmRlZmluaXRpb25zO1xyXG4gIH1cclxuXHJcbiAgZGVmcyAoc3RyKSB7XHJcbiAgICB2YXIgZGVmcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaT0wOyA7KytpKSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLmRlZihpLCBzdHIpO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcbiAgICAgIGRlZnMucHVzaChkZWYpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlZnM7XHJcbiAgfVxyXG5cclxuICBkZWYgKGluZGV4LCBzdHIpIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGFyRGVmc1tpbmRleF07XHJcbiAgfVxyXG5cclxuICBfbmVhcmVzdElucHV0UG9zIChjdXJzb3JQb3MpIHtcclxuICAgIHZhciBjdXJzb3JEZWZJbmRleCA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgoY3Vyc29yUG9zKTtcclxuXHJcbiAgICB2YXIgbFBvcyA9IGN1cnNvckRlZkluZGV4IC0gMTtcclxuXHJcbiAgICAvLyBhbGlnbiBsZWZ0IHRpbGwgZmlyc3QgaW5wdXRcclxuICAgIHdoaWxlIChsUG9zID49IDAgJiYgIXRoaXMuX2lzSW5wdXQobFBvcykgJiYgIXRoaXMuX2lzSW5wdXQobFBvcysxKSkgLS1sUG9zO1xyXG4gICAgY3Vyc29yRGVmSW5kZXggPSBsUG9zICsgMTsgIC8vIGFkanVzdCBtYXggYXZhaWxhYmxlIHBvc1xyXG5cclxuICAgIC8vIGNvbnRpbnVlIGFsaWduIGxlZnQgYWxzbyBza2lwcGluZyBob2xsb3dzXHJcbiAgICB3aGlsZSAobFBvcyA+PSAwICYmICghdGhpcy5faXNJbnB1dChsUG9zKSB8fCB0aGlzLl9pc0hvbGxvdyhsUG9zKSkpIC0tbFBvcztcclxuXHJcbiAgICB2YXIgclBvcyA9IGxQb3MgKyAxO1xyXG5cclxuICAgIC8vIGFsaWduIHJpZ2h0IGJhY2sgdW50aWwgZmlyc3QgaW5wdXRcclxuICAgIHdoaWxlICh0aGlzLmRlZihyUG9zKSAmJiAhdGhpcy5faXNJbnB1dChyUG9zLTEpICYmICF0aGlzLl9pc0lucHV0KHJQb3MpKSArK3JQb3M7XHJcbiAgICBjdXJzb3JEZWZJbmRleCA9IE1hdGgubWF4KHJQb3MsIGN1cnNvckRlZkluZGV4KTsgIC8vIGFkanVzdCBtYXggYXZhaWxhYmxlIHBvc1xyXG5cclxuICAgIC8vIGNvbnRpbnVlIGFsaWduIHJpZ2h0IGFsc28gc2tpcHBpbmcgaG9sbG93c1xyXG4gICAgd2hpbGUgKHJQb3MgPCBjdXJzb3JEZWZJbmRleCAmJiAoIXRoaXMuX2lzSW5wdXQoclBvcykgfHwgIXRoaXMuX2lzSG9sbG93KHJQb3MpIHx8IHRoaXMuX2lzSGlkZGVuSG9sbG93KHJQb3MpKSkgKytyUG9zO1xyXG5cclxuICAgIHJldHVybiB0aGlzLl9tYXBEZWZJbmRleFRvUG9zKHJQb3MpO1xyXG4gIH1cclxuXHJcbiAgX2FsaWduQ3Vyc29yICgpIHtcclxuICAgIHRoaXMuY3Vyc29yUG9zID0gdGhpcy5fbmVhcmVzdElucHV0UG9zKHRoaXMuY3Vyc29yUG9zKTtcclxuICB9XHJcbn1cclxuUGF0dGVybk1hc2suREVGSU5JVElPTlMgPSB7XHJcbiAgJzAnOiAvXFxkLyxcclxuICAnYSc6IC9bXFx1MDA0MS1cXHUwMDVBXFx1MDA2MS1cXHUwMDdBXFx1MDBBQVxcdTAwQjVcXHUwMEJBXFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XFx1MDBGOC1cXHUwMkMxXFx1MDJDNi1cXHUwMkQxXFx1MDJFMC1cXHUwMkU0XFx1MDJFQ1xcdTAyRUVcXHUwMzcwLVxcdTAzNzRcXHUwMzc2XFx1MDM3N1xcdTAzN0EtXFx1MDM3RFxcdTAzODZcXHUwMzg4LVxcdTAzOEFcXHUwMzhDXFx1MDM4RS1cXHUwM0ExXFx1MDNBMy1cXHUwM0Y1XFx1MDNGNy1cXHUwNDgxXFx1MDQ4QS1cXHUwNTI3XFx1MDUzMS1cXHUwNTU2XFx1MDU1OVxcdTA1NjEtXFx1MDU4N1xcdTA1RDAtXFx1MDVFQVxcdTA1RjAtXFx1MDVGMlxcdTA2MjAtXFx1MDY0QVxcdTA2NkVcXHUwNjZGXFx1MDY3MS1cXHUwNkQzXFx1MDZENVxcdTA2RTVcXHUwNkU2XFx1MDZFRVxcdTA2RUZcXHUwNkZBLVxcdTA2RkNcXHUwNkZGXFx1MDcxMFxcdTA3MTItXFx1MDcyRlxcdTA3NEQtXFx1MDdBNVxcdTA3QjFcXHUwN0NBLVxcdTA3RUFcXHUwN0Y0XFx1MDdGNVxcdTA3RkFcXHUwODAwLVxcdTA4MTVcXHUwODFBXFx1MDgyNFxcdTA4MjhcXHUwODQwLVxcdTA4NThcXHUwOEEwXFx1MDhBMi1cXHUwOEFDXFx1MDkwNC1cXHUwOTM5XFx1MDkzRFxcdTA5NTBcXHUwOTU4LVxcdTA5NjFcXHUwOTcxLVxcdTA5NzdcXHUwOTc5LVxcdTA5N0ZcXHUwOTg1LVxcdTA5OENcXHUwOThGXFx1MDk5MFxcdTA5OTMtXFx1MDlBOFxcdTA5QUEtXFx1MDlCMFxcdTA5QjJcXHUwOUI2LVxcdTA5QjlcXHUwOUJEXFx1MDlDRVxcdTA5RENcXHUwOUREXFx1MDlERi1cXHUwOUUxXFx1MDlGMFxcdTA5RjFcXHUwQTA1LVxcdTBBMEFcXHUwQTBGXFx1MEExMFxcdTBBMTMtXFx1MEEyOFxcdTBBMkEtXFx1MEEzMFxcdTBBMzJcXHUwQTMzXFx1MEEzNVxcdTBBMzZcXHUwQTM4XFx1MEEzOVxcdTBBNTktXFx1MEE1Q1xcdTBBNUVcXHUwQTcyLVxcdTBBNzRcXHUwQTg1LVxcdTBBOERcXHUwQThGLVxcdTBBOTFcXHUwQTkzLVxcdTBBQThcXHUwQUFBLVxcdTBBQjBcXHUwQUIyXFx1MEFCM1xcdTBBQjUtXFx1MEFCOVxcdTBBQkRcXHUwQUQwXFx1MEFFMFxcdTBBRTFcXHUwQjA1LVxcdTBCMENcXHUwQjBGXFx1MEIxMFxcdTBCMTMtXFx1MEIyOFxcdTBCMkEtXFx1MEIzMFxcdTBCMzJcXHUwQjMzXFx1MEIzNS1cXHUwQjM5XFx1MEIzRFxcdTBCNUNcXHUwQjVEXFx1MEI1Ri1cXHUwQjYxXFx1MEI3MVxcdTBCODNcXHUwQjg1LVxcdTBCOEFcXHUwQjhFLVxcdTBCOTBcXHUwQjkyLVxcdTBCOTVcXHUwQjk5XFx1MEI5QVxcdTBCOUNcXHUwQjlFXFx1MEI5RlxcdTBCQTNcXHUwQkE0XFx1MEJBOC1cXHUwQkFBXFx1MEJBRS1cXHUwQkI5XFx1MEJEMFxcdTBDMDUtXFx1MEMwQ1xcdTBDMEUtXFx1MEMxMFxcdTBDMTItXFx1MEMyOFxcdTBDMkEtXFx1MEMzM1xcdTBDMzUtXFx1MEMzOVxcdTBDM0RcXHUwQzU4XFx1MEM1OVxcdTBDNjBcXHUwQzYxXFx1MEM4NS1cXHUwQzhDXFx1MEM4RS1cXHUwQzkwXFx1MEM5Mi1cXHUwQ0E4XFx1MENBQS1cXHUwQ0IzXFx1MENCNS1cXHUwQ0I5XFx1MENCRFxcdTBDREVcXHUwQ0UwXFx1MENFMVxcdTBDRjFcXHUwQ0YyXFx1MEQwNS1cXHUwRDBDXFx1MEQwRS1cXHUwRDEwXFx1MEQxMi1cXHUwRDNBXFx1MEQzRFxcdTBENEVcXHUwRDYwXFx1MEQ2MVxcdTBEN0EtXFx1MEQ3RlxcdTBEODUtXFx1MEQ5NlxcdTBEOUEtXFx1MERCMVxcdTBEQjMtXFx1MERCQlxcdTBEQkRcXHUwREMwLVxcdTBEQzZcXHUwRTAxLVxcdTBFMzBcXHUwRTMyXFx1MEUzM1xcdTBFNDAtXFx1MEU0NlxcdTBFODFcXHUwRTgyXFx1MEU4NFxcdTBFODdcXHUwRTg4XFx1MEU4QVxcdTBFOERcXHUwRTk0LVxcdTBFOTdcXHUwRTk5LVxcdTBFOUZcXHUwRUExLVxcdTBFQTNcXHUwRUE1XFx1MEVBN1xcdTBFQUFcXHUwRUFCXFx1MEVBRC1cXHUwRUIwXFx1MEVCMlxcdTBFQjNcXHUwRUJEXFx1MEVDMC1cXHUwRUM0XFx1MEVDNlxcdTBFREMtXFx1MEVERlxcdTBGMDBcXHUwRjQwLVxcdTBGNDdcXHUwRjQ5LVxcdTBGNkNcXHUwRjg4LVxcdTBGOENcXHUxMDAwLVxcdTEwMkFcXHUxMDNGXFx1MTA1MC1cXHUxMDU1XFx1MTA1QS1cXHUxMDVEXFx1MTA2MVxcdTEwNjVcXHUxMDY2XFx1MTA2RS1cXHUxMDcwXFx1MTA3NS1cXHUxMDgxXFx1MTA4RVxcdTEwQTAtXFx1MTBDNVxcdTEwQzdcXHUxMENEXFx1MTBEMC1cXHUxMEZBXFx1MTBGQy1cXHUxMjQ4XFx1MTI0QS1cXHUxMjREXFx1MTI1MC1cXHUxMjU2XFx1MTI1OFxcdTEyNUEtXFx1MTI1RFxcdTEyNjAtXFx1MTI4OFxcdTEyOEEtXFx1MTI4RFxcdTEyOTAtXFx1MTJCMFxcdTEyQjItXFx1MTJCNVxcdTEyQjgtXFx1MTJCRVxcdTEyQzBcXHUxMkMyLVxcdTEyQzVcXHUxMkM4LVxcdTEyRDZcXHUxMkQ4LVxcdTEzMTBcXHUxMzEyLVxcdTEzMTVcXHUxMzE4LVxcdTEzNUFcXHUxMzgwLVxcdTEzOEZcXHUxM0EwLVxcdTEzRjRcXHUxNDAxLVxcdTE2NkNcXHUxNjZGLVxcdTE2N0ZcXHUxNjgxLVxcdTE2OUFcXHUxNkEwLVxcdTE2RUFcXHUxNzAwLVxcdTE3MENcXHUxNzBFLVxcdTE3MTFcXHUxNzIwLVxcdTE3MzFcXHUxNzQwLVxcdTE3NTFcXHUxNzYwLVxcdTE3NkNcXHUxNzZFLVxcdTE3NzBcXHUxNzgwLVxcdTE3QjNcXHUxN0Q3XFx1MTdEQ1xcdTE4MjAtXFx1MTg3N1xcdTE4ODAtXFx1MThBOFxcdTE4QUFcXHUxOEIwLVxcdTE4RjVcXHUxOTAwLVxcdTE5MUNcXHUxOTUwLVxcdTE5NkRcXHUxOTcwLVxcdTE5NzRcXHUxOTgwLVxcdTE5QUJcXHUxOUMxLVxcdTE5QzdcXHUxQTAwLVxcdTFBMTZcXHUxQTIwLVxcdTFBNTRcXHUxQUE3XFx1MUIwNS1cXHUxQjMzXFx1MUI0NS1cXHUxQjRCXFx1MUI4My1cXHUxQkEwXFx1MUJBRVxcdTFCQUZcXHUxQkJBLVxcdTFCRTVcXHUxQzAwLVxcdTFDMjNcXHUxQzRELVxcdTFDNEZcXHUxQzVBLVxcdTFDN0RcXHUxQ0U5LVxcdTFDRUNcXHUxQ0VFLVxcdTFDRjFcXHUxQ0Y1XFx1MUNGNlxcdTFEMDAtXFx1MURCRlxcdTFFMDAtXFx1MUYxNVxcdTFGMTgtXFx1MUYxRFxcdTFGMjAtXFx1MUY0NVxcdTFGNDgtXFx1MUY0RFxcdTFGNTAtXFx1MUY1N1xcdTFGNTlcXHUxRjVCXFx1MUY1RFxcdTFGNUYtXFx1MUY3RFxcdTFGODAtXFx1MUZCNFxcdTFGQjYtXFx1MUZCQ1xcdTFGQkVcXHUxRkMyLVxcdTFGQzRcXHUxRkM2LVxcdTFGQ0NcXHUxRkQwLVxcdTFGRDNcXHUxRkQ2LVxcdTFGREJcXHUxRkUwLVxcdTFGRUNcXHUxRkYyLVxcdTFGRjRcXHUxRkY2LVxcdTFGRkNcXHUyMDcxXFx1MjA3RlxcdTIwOTAtXFx1MjA5Q1xcdTIxMDJcXHUyMTA3XFx1MjEwQS1cXHUyMTEzXFx1MjExNVxcdTIxMTktXFx1MjExRFxcdTIxMjRcXHUyMTI2XFx1MjEyOFxcdTIxMkEtXFx1MjEyRFxcdTIxMkYtXFx1MjEzOVxcdTIxM0MtXFx1MjEzRlxcdTIxNDUtXFx1MjE0OVxcdTIxNEVcXHUyMTgzXFx1MjE4NFxcdTJDMDAtXFx1MkMyRVxcdTJDMzAtXFx1MkM1RVxcdTJDNjAtXFx1MkNFNFxcdTJDRUItXFx1MkNFRVxcdTJDRjJcXHUyQ0YzXFx1MkQwMC1cXHUyRDI1XFx1MkQyN1xcdTJEMkRcXHUyRDMwLVxcdTJENjdcXHUyRDZGXFx1MkQ4MC1cXHUyRDk2XFx1MkRBMC1cXHUyREE2XFx1MkRBOC1cXHUyREFFXFx1MkRCMC1cXHUyREI2XFx1MkRCOC1cXHUyREJFXFx1MkRDMC1cXHUyREM2XFx1MkRDOC1cXHUyRENFXFx1MkREMC1cXHUyREQ2XFx1MkREOC1cXHUyRERFXFx1MkUyRlxcdTMwMDVcXHUzMDA2XFx1MzAzMS1cXHUzMDM1XFx1MzAzQlxcdTMwM0NcXHUzMDQxLVxcdTMwOTZcXHUzMDlELVxcdTMwOUZcXHUzMEExLVxcdTMwRkFcXHUzMEZDLVxcdTMwRkZcXHUzMTA1LVxcdTMxMkRcXHUzMTMxLVxcdTMxOEVcXHUzMUEwLVxcdTMxQkFcXHUzMUYwLVxcdTMxRkZcXHUzNDAwLVxcdTREQjVcXHU0RTAwLVxcdTlGQ0NcXHVBMDAwLVxcdUE0OENcXHVBNEQwLVxcdUE0RkRcXHVBNTAwLVxcdUE2MENcXHVBNjEwLVxcdUE2MUZcXHVBNjJBXFx1QTYyQlxcdUE2NDAtXFx1QTY2RVxcdUE2N0YtXFx1QTY5N1xcdUE2QTAtXFx1QTZFNVxcdUE3MTctXFx1QTcxRlxcdUE3MjItXFx1QTc4OFxcdUE3OEItXFx1QTc4RVxcdUE3OTAtXFx1QTc5M1xcdUE3QTAtXFx1QTdBQVxcdUE3RjgtXFx1QTgwMVxcdUE4MDMtXFx1QTgwNVxcdUE4MDctXFx1QTgwQVxcdUE4MEMtXFx1QTgyMlxcdUE4NDAtXFx1QTg3M1xcdUE4ODItXFx1QThCM1xcdUE4RjItXFx1QThGN1xcdUE4RkJcXHVBOTBBLVxcdUE5MjVcXHVBOTMwLVxcdUE5NDZcXHVBOTYwLVxcdUE5N0NcXHVBOTg0LVxcdUE5QjJcXHVBOUNGXFx1QUEwMC1cXHVBQTI4XFx1QUE0MC1cXHVBQTQyXFx1QUE0NC1cXHVBQTRCXFx1QUE2MC1cXHVBQTc2XFx1QUE3QVxcdUFBODAtXFx1QUFBRlxcdUFBQjFcXHVBQUI1XFx1QUFCNlxcdUFBQjktXFx1QUFCRFxcdUFBQzBcXHVBQUMyXFx1QUFEQi1cXHVBQUREXFx1QUFFMC1cXHVBQUVBXFx1QUFGMi1cXHVBQUY0XFx1QUIwMS1cXHVBQjA2XFx1QUIwOS1cXHVBQjBFXFx1QUIxMS1cXHVBQjE2XFx1QUIyMC1cXHVBQjI2XFx1QUIyOC1cXHVBQjJFXFx1QUJDMC1cXHVBQkUyXFx1QUMwMC1cXHVEN0EzXFx1RDdCMC1cXHVEN0M2XFx1RDdDQi1cXHVEN0ZCXFx1RjkwMC1cXHVGQTZEXFx1RkE3MC1cXHVGQUQ5XFx1RkIwMC1cXHVGQjA2XFx1RkIxMy1cXHVGQjE3XFx1RkIxRFxcdUZCMUYtXFx1RkIyOFxcdUZCMkEtXFx1RkIzNlxcdUZCMzgtXFx1RkIzQ1xcdUZCM0VcXHVGQjQwXFx1RkI0MVxcdUZCNDNcXHVGQjQ0XFx1RkI0Ni1cXHVGQkIxXFx1RkJEMy1cXHVGRDNEXFx1RkQ1MC1cXHVGRDhGXFx1RkQ5Mi1cXHVGREM3XFx1RkRGMC1cXHVGREZCXFx1RkU3MC1cXHVGRTc0XFx1RkU3Ni1cXHVGRUZDXFx1RkYyMS1cXHVGRjNBXFx1RkY0MS1cXHVGRjVBXFx1RkY2Ni1cXHVGRkJFXFx1RkZDMi1cXHVGRkM3XFx1RkZDQS1cXHVGRkNGXFx1RkZEMi1cXHVGRkQ3XFx1RkZEQS1cXHVGRkRDXS8sICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjA3NTA3MFxyXG4gICcqJzogLy4vXHJcbn07XHJcblBhdHRlcm5NYXNrLkRFRl9UWVBFUyA9IHtcclxuICBJTlBVVDogJ2lucHV0JyxcclxuICBGSVhFRDogJ2ZpeGVkJ1xyXG59XHJcblBhdHRlcm5NYXNrLkRFRkFVTFRfUExBQ0VIT0xERVIgPSB7XHJcbiAgc2hvdzogJ2xhenknLFxyXG4gIGNoYXI6ICdfJ1xyXG59O1xyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuaW1wb3J0IHtleHRlbmREZXRhaWxzQWRqdXN0bWVudHN9IGZyb20gJy4uL3V0aWxzJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBQaXBlTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICBjb25zdHJ1Y3RvciAoZWwsIG9wdHMpIHtcclxuICAgIHN1cGVyKGVsLCBvcHRzKTtcclxuXHJcbiAgICB0aGlzLm11bHRpcGFzcyA9IG9wdHMubXVsdGlwYXNzO1xyXG5cclxuICAgIHRoaXMuX2NvbXBpbGVkTWFza3MgPSB0aGlzLm1hc2subWFwKG0gPT4gSU1hc2suTWFza0ZhY3RvcnkoZWwsIG0pKTtcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgdmFyIHJlcyA9IHRoaXMuX3BpcGUoc3RyLCBkZXRhaWxzKTtcclxuICAgIGlmICghdGhpcy5tdWx0aXBhc3MpIHJldHVybiByZXM7XHJcblxyXG4gICAgdmFyIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG5cclxuICAgIHZhciBzdGVwUmVzO1xyXG4gICAgdmFyIHRlbXBSZXMgPSByZXM7XHJcblxyXG4gICAgd2hpbGUgKHN0ZXBSZXMgIT09IHRlbXBSZXMpIHtcclxuICAgICAgc3RlcFJlcyA9IHRlbXBSZXM7XHJcbiAgICAgIHRlbXBSZXMgPSB0aGlzLl9waXBlKHN0ZXBSZXMsIHtcclxuICAgICAgICBjdXJzb3JQb3M6IHN0ZXBSZXMubGVuZ3RoLFxyXG4gICAgICAgIG9sZFZhbHVlOiBzdGVwUmVzLFxyXG4gICAgICAgIG9sZFNlbGVjdGlvbjoge1xyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IHN0ZXBSZXMubGVuZ3RoXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBkZXRhaWxzLmN1cnNvclBvcyA9IGN1cnNvclBvcyAtIChyZXMubGVuZ3RoIC0gc3RlcFJlcy5sZW5ndGgpO1xyXG5cclxuICAgIHJldHVybiBzdGVwUmVzO1xyXG4gIH1cclxuXHJcbiAgX3BpcGUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbXBpbGVkTWFza3MucmVkdWNlKChzLCBtKSA9PiB7XHJcbiAgICAgIHZhciBkID0gZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzKHMsIGRldGFpbHMpO1xyXG4gICAgICB2YXIgcmVzID0gbS5yZXNvbHZlKHMsIGQpO1xyXG4gICAgICBkZXRhaWxzLmN1cnNvclBvcyA9IGQuY3Vyc29yUG9zO1xyXG4gICAgICByZXR1cm4gcmVzO1xyXG4gICAgfSwgc3RyKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5fY29tcGlsZWRNYXNrcy5mb3JFYWNoKG0gPT4ge1xyXG4gICAgICBtLmJpbmRFdmVudHMoKTtcclxuICAgICAgLy8gZGlzYWJsZSBiYXNlbWFzayBldmVudHMgZm9yIGNoaWxkIG1hc2tzXHJcbiAgICAgIEJhc2VNYXNrLnByb3RvdHlwZS51bmJpbmRFdmVudHMuYXBwbHkobSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHVuYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci51bmJpbmRFdmVudHMoKTtcclxuICAgIHRoaXMuX2NvbXBpbGVkTWFza3MuZm9yRWFjaChtID0+IG0udW5iaW5kRXZlbnRzKCkpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge2lzU3RyaW5nfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmltcG9ydCBCYXNlTWFzayBmcm9tICcuL21hc2tzL2Jhc2UnO1xyXG5pbXBvcnQgUmVnRXhwTWFzayBmcm9tICcuL21hc2tzL3JlZ2V4cCc7XHJcbmltcG9ydCBGdW5jTWFzayBmcm9tICcuL21hc2tzL2Z1bmMnO1xyXG5pbXBvcnQgUGF0dGVybk1hc2sgZnJvbSAnLi9tYXNrcy9wYXR0ZXJuJztcclxuaW1wb3J0IFBpcGVNYXNrIGZyb20gJy4vbWFza3MvcGlwZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuZnVuY3Rpb24gSU1hc2sgKGVsLCBvcHRzPXt9KSB7XHJcbiAgdmFyIG1hc2sgPSBJTWFzay5NYXNrRmFjdG9yeShlbCwgb3B0cyk7XHJcbiAgbWFzay5iaW5kRXZlbnRzKCk7XHJcbiAgLy8gcmVmcmVzaFxyXG4gIG1hc2sucmF3VmFsdWUgPSBlbC52YWx1ZTtcclxuICByZXR1cm4gbWFzaztcclxufVxyXG5cclxuSU1hc2suTWFza0ZhY3RvcnkgPSBmdW5jdGlvbiAoZWwsIG9wdHMpIHtcclxuICB2YXIgbWFzayA9IG9wdHMubWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEJhc2VNYXNrKSByZXR1cm4gbWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIG5ldyBSZWdFeHBNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEFycmF5KSByZXR1cm4gbmV3IFBpcGVNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAoaXNTdHJpbmcobWFzaykpIHJldHVybiBuZXcgUGF0dGVybk1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChtYXNrLnByb3RvdHlwZSBpbnN0YW5jZW9mIEJhc2VNYXNrKSByZXR1cm4gbmV3IG1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHJldHVybiBuZXcgRnVuY01hc2soZWwsIG9wdHMpO1xyXG4gIHJldHVybiBuZXcgQmFzZU1hc2soZWwsIG9wdHMpO1xyXG59XHJcbklNYXNrLkJhc2VNYXNrID0gQmFzZU1hc2s7XHJcbklNYXNrLkZ1bmNNYXNrID0gRnVuY01hc2s7XHJcbklNYXNrLlJlZ0V4cE1hc2sgPSBSZWdFeHBNYXNrO1xyXG5JTWFzay5QYXR0ZXJuTWFzayA9IFBhdHRlcm5NYXNrO1xyXG53aW5kb3cuSU1hc2sgPSBJTWFzaztcclxuIl0sIm5hbWVzIjpbImlzU3RyaW5nIiwic3RyIiwiU3RyaW5nIiwiY29uZm9ybSIsInJlcyIsImZhbGxiYWNrIiwiZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzIiwiZGV0YWlscyIsImN1cnNvclBvcyIsIm9sZFNlbGVjdGlvbiIsIm9sZFZhbHVlIiwic3RhcnRDaGFuZ2VQb3MiLCJNYXRoIiwibWluIiwic3RhcnQiLCJpbnNlcnRlZENvdW50IiwicmVtb3ZlZENvdW50IiwibWF4IiwiZW5kIiwibGVuZ3RoIiwiaGVhZCIsInN1YnN0cmluZyIsInRhaWwiLCJpbnNlcnRlZCIsInN1YnN0ciIsInJlbW92ZWQiLCJCYXNlTWFzayIsImVsIiwib3B0cyIsIm1hc2siLCJfbGlzdGVuZXJzIiwiX3JlZnJlc2hpbmdDb3VudCIsIl9yYXdWYWx1ZSIsIl91bm1hc2tlZFZhbHVlIiwic2F2ZVNlbGVjdGlvbiIsImJpbmQiLCJfb25JbnB1dCIsIl9vbkRyb3AiLCJldiIsImhhbmRsZXIiLCJwdXNoIiwiaEluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwibGlzdGVuZXJzIiwiZm9yRWFjaCIsImwiLCJpbnB1dFZhbHVlIiwiX3NlbGVjdGlvbiIsInJhd1ZhbHVlIiwidW5tYXNrZWRWYWx1ZSIsInJlc29sdmUiLCJ1cGRhdGVFbGVtZW50IiwidmFsdWUiLCJ3YXJuIiwic2VsZWN0aW9uU3RhcnQiLCJ1bmJpbmRFdmVudHMiLCJfY2FsY1VubWFza2VkIiwiaXNDaGFuZ2VkIiwidXBkYXRlQ3Vyc29yIiwiX2ZpcmVDaGFuZ2VFdmVudHMiLCJmaXJlRXZlbnQiLCJfZGVsYXlVcGRhdGVDdXJzb3IiLCJfYWJvcnRVcGRhdGVDdXJzb3IiLCJfY2hhbmdpbmdDdXJzb3JQb3MiLCJfY3Vyc29yQ2hhbmdpbmciLCJzZXRUaW1lb3V0IiwicHJvY2Vzc0lucHV0IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzZWxlY3Rpb25FbmQiLCJwb3MiLCJkb2N1bWVudCIsImFjdGl2ZUVsZW1lbnQiLCJzZXRTZWxlY3Rpb25SYW5nZSIsIlJlZ0V4cE1hc2siLCJ0ZXN0IiwiRnVuY01hc2siLCJQYXR0ZXJuTWFzayIsIl9ob2xsb3dzIiwicGxhY2Vob2xkZXIiLCJkZWZpbml0aW9ucyIsIkRFRklOSVRJT05TIiwiX2FsaWduQ3Vyc29yIiwiX2FsaWduQ3Vyc29yRnJpZW5kbHkiLCJfaW5pdGlhbGl6ZWQiLCJfZGVmaW5pdGlvbnMiLCJfY2hhckRlZnMiLCJwYXR0ZXJuIiwidW5tYXNraW5nQmxvY2siLCJvcHRpb25hbEJsb2NrIiwiaSIsImNoIiwidHlwZSIsIkRFRl9UWVBFUyIsIklOUFVUIiwiRklYRUQiLCJ1bm1hc2tpbmciLCJvcHRpb25hbCIsIl9idWlsZFJlc29sdmVycyIsIl9yZXNvbHZlcnMiLCJkZWZLZXkiLCJJTWFzayIsIk1hc2tGYWN0b3J5Iiwic2tpcFVucmVzb2x2ZWRJbnB1dCIsInBsYWNlaG9sZGVyQnVmZmVyIiwiaG9sbG93cyIsInNsaWNlIiwib3ZlcmZsb3ciLCJjaSIsImRpIiwiX21hcFBvc1RvRGVmSW5kZXgiLCJkZWYiLCJyZXNvbHZlciIsImNoYXIiLCJjaHJlcyIsImlzUmVzb2x2ZWQiLCJfcGxhY2Vob2xkZXIiLCJmcm9tUG9zIiwiaW5wdXQiLCJfaXNIaWRkZW5Ib2xsb3ciLCJfaXNIb2xsb3ciLCJkZWZJbmRleCIsImZpbHRlciIsImgiLCJfaG9sbG93c0JlZm9yZSIsImhpIiwiaW5zZXJ0U3RlcHMiLCJfYXBwZW5kVGFpbCIsInRhaWxJbnB1dCIsIl9leHRyYWN0SW5wdXQiLCJsYXN0SG9sbG93SW5kZXgiLCJfZ2VuZXJhdGVJbnNlcnRTdGVwcyIsImlzdGVwIiwic3RlcCIsInRyZXMiLCJ0aG9sbG93cyIsImFwcGVuZGVkIiwiX2FwcGVuZEZpeGVkRW5kIiwiaGFzSG9sbG93cyIsIl9uZWFyZXN0SW5wdXRQb3MiLCJfYXBwZW5kUGxhY2Vob2xkZXJFbmQiLCJpc0NvbXBsZXRlIiwic2hvdyIsInVubWFza2VkIiwiZGVmcyIsImluZGV4IiwiY3Vyc29yRGVmSW5kZXgiLCJsUG9zIiwiX2lzSW5wdXQiLCJyUG9zIiwiX21hcERlZkluZGV4VG9Qb3MiLCJwaCIsIkRFRkFVTFRfUExBQ0VIT0xERVIiLCJtYXAiLCJqb2luIiwiX2luc3RhbGxEZWZpbml0aW9ucyIsIl9tYXNrIiwiUGlwZU1hc2siLCJtdWx0aXBhc3MiLCJfY29tcGlsZWRNYXNrcyIsIm0iLCJfcGlwZSIsInN0ZXBSZXMiLCJ0ZW1wUmVzIiwicmVkdWNlIiwicyIsImQiLCJiaW5kRXZlbnRzIiwicHJvdG90eXBlIiwiYXBwbHkiLCJSZWdFeHAiLCJBcnJheSIsIkZ1bmN0aW9uIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxTQUFTQSxRQUFULENBQW1CQyxHQUFuQixFQUF3QjtTQUNmLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxlQUFlQyxNQUFqRDs7O0FBR0YsQUFDQSxTQUFTQyxPQUFULENBQWtCQyxHQUFsQixFQUF1QkgsR0FBdkIsRUFBeUM7TUFBYkksUUFBYSx1RUFBSixFQUFJOztTQUNoQ0wsU0FBU0ksR0FBVCxJQUNMQSxHQURLLEdBRUxBLE1BQ0VILEdBREYsR0FFRUksUUFKSjs7O0FBT0YsQUFDQSxTQUFTQyx3QkFBVCxDQUFrQ0wsR0FBbEMsRUFBdUNNLE9BQXZDLEVBQWdEO01BQzFDQyxZQUFZRCxRQUFRQyxTQUF4QjtNQUNJQyxlQUFlRixRQUFRRSxZQUEzQjtNQUNJQyxXQUFX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