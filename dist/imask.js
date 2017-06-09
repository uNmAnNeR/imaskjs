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
        var def = this._charDefs[di];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvcGlwZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL2ltYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydFxyXG5mdW5jdGlvbiBpc1N0cmluZyAoc3RyKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnIHx8IHN0ciBpbnN0YW5jZW9mIFN0cmluZztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGNvbmZvcm0gKHJlcywgc3RyLCBmYWxsYmFjaz0nJykge1xyXG4gIHJldHVybiBpc1N0cmluZyhyZXMpID9cclxuICAgIHJlcyA6XHJcbiAgICByZXMgP1xyXG4gICAgICBzdHIgOlxyXG4gICAgICBmYWxsYmFjaztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGV4dGVuZERldGFpbHNBZGp1c3RtZW50cyhzdHIsIGRldGFpbHMpIHtcclxuICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgdmFyIG9sZFNlbGVjdGlvbiA9IGRldGFpbHMub2xkU2VsZWN0aW9uO1xyXG4gIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcblxyXG4gIHZhciBzdGFydENoYW5nZVBvcyA9IE1hdGgubWluKGN1cnNvclBvcywgb2xkU2VsZWN0aW9uLnN0YXJ0KTtcclxuICB2YXIgaW5zZXJ0ZWRDb3VudCA9IGN1cnNvclBvcyAtIHN0YXJ0Q2hhbmdlUG9zO1xyXG4gIC8vIE1hdGgubWF4IGZvciBvcHBvc2l0ZSBvcGVyYXRpb25cclxuICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgIC8vIGZvciBEZWxldGVcclxuICAgIG9sZFZhbHVlLmxlbmd0aCAtIHN0ci5sZW5ndGgsIDApO1xyXG4gIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyk7XHJcbiAgdmFyIHRhaWwgPSBzdHIuc3Vic3RyaW5nKHN0YXJ0Q2hhbmdlUG9zICsgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIGluc2VydGVkID0gc3RyLnN1YnN0cihzdGFydENoYW5nZVBvcywgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIHJlbW92ZWQgPSBzdHIuc3Vic3RyKHN0YXJ0Q2hhbmdlUG9zLCByZW1vdmVkQ291bnQpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc3RhcnRDaGFuZ2VQb3MsXHJcbiAgICBoZWFkLFxyXG4gICAgdGFpbCxcclxuICAgIGluc2VydGVkLFxyXG4gICAgcmVtb3ZlZCxcclxuICAgIC4uLmRldGFpbHNcclxuICB9O1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybSwgZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgdGhpcy5fcmVmcmVzaGluZ0NvdW50ID0gMDtcclxuICAgIHRoaXMuX3Jhd1ZhbHVlID0gXCJcIjtcclxuICAgIHRoaXMuX3VubWFza2VkVmFsdWUgPSBcIlwiO1xyXG5cclxuICAgIHRoaXMuc2F2ZVNlbGVjdGlvbiA9IHRoaXMuc2F2ZVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fb25JbnB1dCA9IHRoaXMuX29uSW5wdXQuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuX29uRHJvcCA9IHRoaXMuX29uRHJvcC5iaW5kKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgb24gKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHRoaXMuX2xpc3RlbmVyc1tldl0gPSBbXTtcclxuICAgIHRoaXMuX2xpc3RlbmVyc1tldl0ucHVzaChoYW5kbGVyKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgb2ZmIChldiwgaGFuZGxlcikge1xyXG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbZXZdKSByZXR1cm47XHJcbiAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tldl07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBoSW5kZXggPSB0aGlzLl9saXN0ZW5lcnNbZXZdLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICBpZiAoaEluZGV4ID49IDApIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaEluZGV4LCAxKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHJhd1ZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9yYXdWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCByYXdWYWx1ZSAoc3RyKSB7XHJcbiAgICB0aGlzLnByb2Nlc3NJbnB1dChzdHIsIHtcclxuICAgICAgY3Vyc29yUG9zOiBzdHIubGVuZ3RoLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5yYXdWYWx1ZSxcclxuICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiB0aGlzLnJhd1ZhbHVlLmxlbmd0aFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl91bm1hc2tlZFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHZhbHVlKSB7XHJcbiAgICB0aGlzLnJhd1ZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnNhdmVTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICB9XHJcblxyXG4gIHVuYmluZEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnNhdmVTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICB9XHJcblxyXG4gIGZpcmVFdmVudCAoZXYpIHtcclxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZdIHx8IFtdO1xyXG4gICAgbGlzdGVuZXJzLmZvckVhY2gobCA9PiBsKCkpO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChpbnB1dFZhbHVlLCBkZXRhaWxzKSB7XHJcbiAgICBkZXRhaWxzID0ge1xyXG4gICAgICBjdXJzb3JQb3M6IHRoaXMuY3Vyc29yUG9zLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHRoaXMuX3NlbGVjdGlvbixcclxuICAgICAgb2xkVmFsdWU6IHRoaXMucmF3VmFsdWUsXHJcbiAgICAgIG9sZFVubWFza2VkVmFsdWU6IHRoaXMudW5tYXNrZWRWYWx1ZSxcclxuICAgICAgLi4uZGV0YWlsc1xyXG4gICAgfTtcclxuXHJcbiAgICBkZXRhaWxzID0gZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzKGlucHV0VmFsdWUsIGRldGFpbHMpO1xyXG5cclxuICAgIHZhciByZXMgPSBjb25mb3JtKHRoaXMucmVzb2x2ZShpbnB1dFZhbHVlLCBkZXRhaWxzKSxcclxuICAgICAgaW5wdXRWYWx1ZSxcclxuICAgICAgdGhpcy5yYXdWYWx1ZSk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVFbGVtZW50KHJlcywgZGV0YWlscy5jdXJzb3JQb3MpO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG5cclxuICBnZXQgc2VsZWN0aW9uU3RhcnQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID9cclxuICAgICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOlxyXG5cclxuICAgICAgdGhpcy5lbC5zZWxlY3Rpb25TdGFydDtcclxuICB9XHJcblxyXG4gIGdldCBjdXJzb3JQb3MgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID9cclxuICAgICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOlxyXG5cclxuICAgICAgdGhpcy5lbC5zZWxlY3Rpb25FbmQ7XHJcbiAgfVxyXG5cclxuICBzZXQgY3Vyc29yUG9zIChwb3MpIHtcclxuICAgIGlmICh0aGlzLmVsICE9PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50KSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5lbC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgICB0aGlzLnNhdmVTZWxlY3Rpb24oKTtcclxuICB9XHJcblxyXG4gIHNhdmVTZWxlY3Rpb24gKGV2KSB7XHJcbiAgICBpZiAodGhpcy5yYXdWYWx1ZSAhPT0gdGhpcy5lbC52YWx1ZSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJVbmNvbnRyb2xsZWQgaW5wdXQgY2hhbmdlLCByZWZyZXNoIG1hc2sgbWFudWFsbHkhXCIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fc2VsZWN0aW9uID0ge1xyXG4gICAgICBzdGFydDogdGhpcy5zZWxlY3Rpb25TdGFydCxcclxuICAgICAgZW5kOiB0aGlzLmN1cnNvclBvc1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3kgKCkge1xyXG4gICAgdGhpcy51bmJpbmRFdmVudHMoKTtcclxuICAgIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPSAwO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlRWxlbWVudCAodmFsdWUsIGN1cnNvclBvcykge1xyXG4gICAgdmFyIHVubWFza2VkVmFsdWUgPSB0aGlzLl9jYWxjVW5tYXNrZWQodmFsdWUpO1xyXG4gICAgdmFyIGlzQ2hhbmdlZCA9ICh0aGlzLnVubWFza2VkVmFsdWUgIT09IHVubWFza2VkVmFsdWUgfHxcclxuICAgICAgdGhpcy5yYXdWYWx1ZSAhPT0gdmFsdWUpO1xyXG5cclxuICAgIHRoaXMuX3VubWFza2VkVmFsdWUgPSB1bm1hc2tlZFZhbHVlO1xyXG4gICAgdGhpcy5fcmF3VmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICBpZiAodGhpcy5lbC52YWx1ZSAhPT0gdmFsdWUpIHRoaXMuZWwudmFsdWUgPSB2YWx1ZTtcclxuICAgIHRoaXMudXBkYXRlQ3Vyc29yKGN1cnNvclBvcyk7XHJcblxyXG4gICAgaWYgKGlzQ2hhbmdlZCkgdGhpcy5fZmlyZUNoYW5nZUV2ZW50cygpO1xyXG4gIH1cclxuXHJcbiAgX2ZpcmVDaGFuZ2VFdmVudHMgKCkge1xyXG4gICAgdGhpcy5maXJlRXZlbnQoXCJhY2NlcHRcIik7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVDdXJzb3IgKGN1cnNvclBvcykge1xyXG4gICAgaWYgKGN1cnNvclBvcyA9PSBudWxsKSByZXR1cm47XHJcbiAgICB0aGlzLmN1cnNvclBvcyA9IGN1cnNvclBvcztcclxuXHJcbiAgICAvLyBhbHNvIHF1ZXVlIGNoYW5nZSBjdXJzb3IgZm9yIG1vYmlsZSBicm93c2Vyc1xyXG4gICAgdGhpcy5fZGVsYXlVcGRhdGVDdXJzb3IoY3Vyc29yUG9zKTtcclxuICB9XHJcblxyXG4gIF9kZWxheVVwZGF0ZUN1cnNvciAoY3Vyc29yUG9zKSB7XHJcbiAgICB0aGlzLl9hYm9ydFVwZGF0ZUN1cnNvcigpO1xyXG4gICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcbiAgICB0aGlzLl9jdXJzb3JDaGFuZ2luZyA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLl9hYm9ydFVwZGF0ZUN1cnNvcigpO1xyXG4gICAgICB0aGlzLmN1cnNvclBvcyA9IHRoaXMuX2NoYW5naW5nQ3Vyc29yUG9zO1xyXG4gICAgfSwgMTApO1xyXG4gIH1cclxuXHJcbiAgX2Fib3J0VXBkYXRlQ3Vyc29yKCkge1xyXG4gICAgaWYgKHRoaXMuX2N1cnNvckNoYW5naW5nKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9jdXJzb3JDaGFuZ2luZyk7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLl9jdXJzb3JDaGFuZ2luZztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9vbklucHV0IChldikge1xyXG4gICAgdGhpcy5fYWJvcnRVcGRhdGVDdXJzb3IoKTtcclxuICAgIHRoaXMucHJvY2Vzc0lucHV0KHRoaXMuZWwudmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgX29uRHJvcCAoZXYpIHtcclxuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8vIG92ZXJyaWRlXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7IHJldHVybiBzdHI7IH1cclxuXHJcbiAgX2NhbGNVbm1hc2tlZCAodmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUmVnRXhwTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlIChzdHIpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2sudGVzdChzdHIpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBGdW5jTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlICguLi5hcmdzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrKC4uLmFyZ3MpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge2NvbmZvcm19IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGF0dGVybk1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICBzdXBlcihlbCwgb3B0cyk7XHJcblxyXG4gICAgdGhpcy5faG9sbG93cyA9IFtdO1xyXG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IG9wdHMucGxhY2Vob2xkZXI7XHJcbiAgICB0aGlzLmRlZmluaXRpb25zID0ge1xyXG4gICAgICAuLi5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyxcclxuICAgICAgLi4ub3B0cy5kZWZpbml0aW9uc1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvciA9IHRoaXMuX2FsaWduQ3Vyc29yLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5ID0gdGhpcy5fYWxpZ25DdXJzb3JGcmllbmRseS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIF9hbGlnbkN1cnNvckZyaWVuZGx5ICgpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGlvblN0YXJ0ICE9PSB0aGlzLmN1cnNvclBvcykgcmV0dXJuO1xyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IoKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgX2luc3RhbGxEZWZpbml0aW9ucyAoZGVmaW5pdGlvbnMpIHtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmaW5pdGlvbnM7XHJcbiAgICB0aGlzLl9jaGFyRGVmcyA9IFtdO1xyXG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLm1hc2s7XHJcblxyXG4gICAgaWYgKCFwYXR0ZXJuIHx8ICFkZWZpbml0aW9ucykgcmV0dXJuO1xyXG5cclxuICAgIHZhciB1bm1hc2tpbmdCbG9jayA9IGZhbHNlO1xyXG4gICAgdmFyIG9wdGlvbmFsQmxvY2sgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgIHZhciB0eXBlID0gIXVubWFza2luZ0Jsb2NrICYmIGNoIGluIGRlZmluaXRpb25zID9cclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgOlxyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgdmFyIHVubWFza2luZyA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCB8fCB1bm1hc2tpbmdCbG9jaztcclxuICAgICAgdmFyIG9wdGlvbmFsID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIG9wdGlvbmFsQmxvY2s7XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICd7JyB8fCBjaCA9PT0gJ30nKSB7XHJcbiAgICAgICAgdW5tYXNraW5nQmxvY2sgPSAhdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1snIHx8IGNoID09PSAnXScpIHtcclxuICAgICAgICBvcHRpb25hbEJsb2NrID0gIW9wdGlvbmFsQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1xcXFwnKSB7XHJcbiAgICAgICAgKytpO1xyXG4gICAgICAgIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgICAvLyBUT0RPIHZhbGlkYXRpb25cclxuICAgICAgICBpZiAoIWNoKSBicmVhaztcclxuICAgICAgICB0eXBlID0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jaGFyRGVmcy5wdXNoKHtcclxuICAgICAgICBjaGFyOiBjaCxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcclxuICAgICAgICB1bm1hc2tpbmc6IHVubWFza2luZ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG4gIH1cclxuXHJcbiAgX2J1aWxkUmVzb2x2ZXJzICgpIHtcclxuICAgIHRoaXMuX3Jlc29sdmVycyA9IHt9O1xyXG4gICAgZm9yICh2YXIgZGVmS2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgdGhpcy5fcmVzb2x2ZXJzW2RlZktleV0gPSBJTWFzay5NYXNrRmFjdG9yeSh0aGlzLmVsLCB7XHJcbiAgICAgICAgbWFzazogdGhpcy5kZWZpbml0aW9uc1tkZWZLZXldXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFRhaWwgKHN0ciwgdGFpbCwgc2tpcFVucmVzb2x2ZWRJbnB1dD10cnVlKSB7XHJcbiAgICB2YXIgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgIHZhciBob2xsb3dzID0gdGhpcy5faG9sbG93cy5zbGljZSgpO1xyXG4gICAgdmFyIG92ZXJmbG93ID0gZmFsc2U7XHJcblxyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9dGhpcy5fbWFwUG9zVG9EZWZJbmRleChzdHIubGVuZ3RoKTsgY2kgPCB0YWlsLmxlbmd0aDspIHtcclxuICAgICAgdmFyIGNoID0gdGFpbFtjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICAvLyBmYWlsZWRcclxuICAgICAgaWYgKCFkZWYpIHtcclxuICAgICAgICBvdmVyZmxvdyA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgdmFyIHJlc29sdmVyID0gdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXTtcclxuICAgICAgICB2YXIgY2hyZXMgPSByZXNvbHZlci5yZXNvbHZlKGNoLCBkaSwgc3RyICsgcGxhY2Vob2xkZXJCdWZmZXIpIHx8ICcnO1xyXG4gICAgICAgIHZhciBpc1Jlc29sdmVkID0gISFjaHJlcztcclxuXHJcbiAgICAgICAgLy8gaWYgb2sgLSBuZXh0IGRpXHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICBjaHJlcyA9IGNvbmZvcm0oY2hyZXMsIGNoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKCFkZWYub3B0aW9uYWwgJiYgc2tpcFVucmVzb2x2ZWRJbnB1dCkgY2hyZXMgPSB0aGlzLl9wbGFjZWhvbGRlci5jaGFyO1xyXG4gICAgICAgICAgaWYgKGhvbGxvd3MuaW5kZXhPZihkaSkgPCAwKSBob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICBzdHIgKz0gcGxhY2Vob2xkZXJCdWZmZXIgKyBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2hyZXMgfHwgZGVmLm9wdGlvbmFsIHx8ICFza2lwVW5yZXNvbHZlZElucHV0KSArK2RpO1xyXG4gICAgICAgIGlmIChpc1Jlc29sdmVkIHx8ICFkZWYub3B0aW9uYWwgJiYgIXNraXBVbnJlc29sdmVkSW5wdXQpICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcblxyXG4gICAgICAgIGlmIChjaCA9PT0gZGVmLmNoYXIgJiYgKGRlZi51bm1hc2tpbmcgfHwgIXNraXBVbnJlc29sdmVkSW5wdXQpKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3N0ciwgaG9sbG93cywgb3ZlcmZsb3ddO1xyXG4gIH1cclxuXHJcbiAgX2V4dHJhY3RJbnB1dCAoc3RyLCBmcm9tUG9zPTApIHtcclxuICAgIHZhciBpbnB1dCA9ICcnO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoZnJvbVBvcyk7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmICF0aGlzLl9pc0hvbGxvdyhkaSkpIGlucHV0ICs9IGNoO1xyXG4gICAgICArK2NpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgX2lzSG9sbG93IChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkZWZJbmRleCkgPj0gMDtcclxuICB9XHJcblxyXG4gIF9pc0hpZGRlbkhvbGxvdyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9pc0hvbGxvdyhkZWZJbmRleCkgJiZcclxuICAgICAgdGhpcy5fY2hhckRlZnNbZGVmSW5kZXhdICYmIHRoaXMuX2NoYXJEZWZzW2RlZkluZGV4XS5vcHRpb25hbDtcclxuICB9XHJcblxyXG4gIF9ob2xsb3dzQmVmb3JlIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGRlZkluZGV4ICYmIHRoaXMuX2lzSGlkZGVuSG9sbG93KGgpKTtcclxuICB9XHJcblxyXG4gIF9tYXBEZWZJbmRleFRvUG9zIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIGRlZkluZGV4IC0gdGhpcy5faG9sbG93c0JlZm9yZShkZWZJbmRleCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX21hcFBvc1RvRGVmSW5kZXggKHBvcykge1xyXG4gICAgdmFyIGRlZkluZGV4ID0gcG9zO1xyXG4gICAgZm9yICh2YXIgaGk9MDsgaGk8dGhpcy5faG9sbG93cy5sZW5ndGg7ICsraGkpIHtcclxuICAgICAgdmFyIGggPSB0aGlzLl9ob2xsb3dzW2hpXTtcclxuICAgICAgaWYgKGggPj0gZGVmSW5kZXgpIGJyZWFrO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coaCkpICsrZGVmSW5kZXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVmSW5kZXg7XHJcbiAgfVxyXG5cclxuICBfZ2VuZXJhdGVJbnNlcnRTdGVwcyAoaGVhZCwgaW5zZXJ0ZWQpIHtcclxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHNhdmUgaG9sbG93IGR1cmluZyBnZW5lcmF0aW9uXHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3M7XHJcblxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW1toZWFkLCBob2xsb3dzLnNsaWNlKCldXTtcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wOyBjaTxpbnNlcnRlZC5sZW5ndGggJiYgIW92ZXJmbG93OyArK2NpKSB7XHJcbiAgICAgIHZhciBjaCA9IGluc2VydGVkW2NpXTtcclxuICAgICAgdmFyIFtyZXMsIGhvbGxvd3MsIG92ZXJmbG93XSA9IHRoaXMuX2FwcGVuZFRhaWwoaGVhZCwgY2gsIGZhbHNlKTtcclxuICAgICAgdGhpcy5faG9sbG93cyA9IGhvbGxvd3M7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cgJiYgcmVzICE9PSBoZWFkKSB7XHJcbiAgICAgICAgaW5zZXJ0U3RlcHMucHVzaChbcmVzLCBob2xsb3dzXSk7XHJcbiAgICAgICAgaGVhZCA9IHJlcztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHBvcCBob2xsb3dzIGJhY2tcclxuICAgIHRoaXMuX2hvbGxvd3MgPSBob2xsb3dzO1xyXG5cclxuICAgIHJldHVybiBpbnNlcnRTdGVwcztcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgdmFyIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgdmFyIHN0YXJ0Q2hhbmdlUG9zID0gZGV0YWlscy5zdGFydENoYW5nZVBvcztcclxuICAgIHZhciBpbnNlcnRlZCA9IGRldGFpbHMuaW5zZXJ0ZWQ7XHJcbiAgICB2YXIgcmVtb3ZlZENvdW50ID0gZGV0YWlscy5yZW1vdmVkLmxlbmd0aDtcclxuICAgIHZhciB0YWlsSW5wdXQgPSB0aGlzLl9leHRyYWN0SW5wdXQoZGV0YWlscy50YWlsLCBzdGFydENoYW5nZVBvcyArIHJlbW92ZWRDb3VudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhvbGxvd3MgYWZ0ZXIgY3Vyc29yXHJcbiAgICB2YXIgbGFzdEhvbGxvd0luZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChzdGFydENoYW5nZVBvcyk7XHJcbiAgICB0aGlzLl9ob2xsb3dzID0gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgbGFzdEhvbGxvd0luZGV4KTtcclxuXHJcbiAgICB2YXIgcmVzID0gZGV0YWlscy5oZWFkO1xyXG5cclxuICAgIC8vIGluc2VydCBhdmFpbGFibGVcclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IHRoaXMuX2dlbmVyYXRlSW5zZXJ0U3RlcHMocmVzLCBpbnNlcnRlZCk7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcDtcclxuICAgICAgW3N0ZXAsIHRoaXMuX2hvbGxvd3NdID0gaW5zZXJ0U3RlcHNbaXN0ZXBdO1xyXG4gICAgICB2YXIgW3RyZXMsIHRob2xsb3dzLCBvdmVyZmxvd10gPSB0aGlzLl9hcHBlbmRUYWlsKHN0ZXAsIHRhaWxJbnB1dCk7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cpIHtcclxuICAgICAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IFt0cmVzLCB0aG9sbG93c107XHJcbiAgICAgICAgY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBpbnB1dCBhdCB0aGUgZW5kIC0gYXBwZW5kIGZpeGVkXHJcbiAgICBpZiAoaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIGFwcGVuZCBmaXhlZCBhdCBlbmRcclxuICAgICAgdmFyIGFwcGVuZGVkID0gdGhpcy5fYXBwZW5kRml4ZWRFbmQocmVzKTtcclxuICAgICAgY3Vyc29yUG9zICs9IGFwcGVuZGVkLmxlbmd0aCAtIHJlcy5sZW5ndGg7XHJcbiAgICAgIHJlcyA9IGFwcGVuZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaW5zZXJ0ZWQgJiYgcmVtb3ZlZENvdW50KSB7XHJcbiAgICAgIC8vIGlmIGRlbGV0ZSBhdCByaWdodFxyXG4gICAgICBpZiAoZGV0YWlscy5vbGRTZWxlY3Rpb24uZW5kID09PSBjdXJzb3JQb3MpIHtcclxuICAgICAgICBmb3IgKDs7KytjdXJzb3JQb3MpIHtcclxuICAgICAgICAgIHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGN1cnNvclBvcyk7XHJcbiAgICAgICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICAgICAgaWYgKCFkZWYgfHwgZGVmLnR5cGUgIT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCkgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZW1vdmUgaGVhZCBmaXhlZCBhbmQgaG9sbG93cyBpZiByZW1vdmVkIGF0IGVuZFxyXG4gICAgICBpZiAoY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGRpID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChjdXJzb3JQb3MtMSk7XHJcbiAgICAgICAgdmFyIGhhc0hvbGxvd3MgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKDsgZGkgPiAwOyAtLWRpKSB7XHJcbiAgICAgICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzSG9sbG93KGRpKSkgaGFzSG9sbG93cyA9IHRydWU7XHJcbiAgICAgICAgICAgIGVsc2UgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYXNIb2xsb3dzKSByZXMgPSByZXMuc2xpY2UoMCwgZGkgKyAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFwcGVuZCBwbGFjZWhvbGRlclxyXG4gICAgcmVzID0gdGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKTtcclxuICAgIGRldGFpbHMuY3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG5cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBfZmlyZUNoYW5nZUV2ZW50cyAoKSB7XHJcbiAgICAvLyBmaXJlICdjb21wbGV0ZScgYWZ0ZXIgJ2FjY2VwdCcgZXZlbnRcclxuICAgIHN1cGVyLl9maXJlQ2hhbmdlRXZlbnRzKCk7XHJcbiAgICBpZiAodGhpcy5pc0NvbXBsZXRlKSB0aGlzLmZpcmVFdmVudChcImNvbXBsZXRlXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzQ29tcGxldGUgKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLl9jaGFyRGVmcy5maWx0ZXIoKGRlZiwgZGkpID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgIWRlZi5vcHRpb25hbCAmJlxyXG4gICAgICB0aGlzLl9pc0hvbGxvdyhkaSkpLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIF9hcHBlbmRGaXhlZEVuZCAocmVzKSB7XHJcbiAgICBmb3IgKHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHJlcy5sZW5ndGgpOzsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIGJyZWFrO1xyXG4gICAgICBpZiAoZGkgPj0gcmVzLmxlbmd0aCkgcmVzICs9IGRlZi5jaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9hcHBlbmRQbGFjZWhvbGRlckVuZCAocmVzKSB7XHJcbiAgICBmb3IgKHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHJlcy5sZW5ndGgpOyBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgIXRoaXMuX2lzSG9sbG93KGRpKSkge1xyXG4gICAgICAgIHRoaXMuX2hvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuX3BsYWNlaG9sZGVyLnNob3cgPT09ICdhbHdheXMnKSB7XHJcbiAgICAgICAgcmVzICs9IGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgICAgZGVmLmNoYXIgOlxyXG4gICAgICAgICAgIWRlZi5vcHRpb25hbCA/XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgICAnJztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9jYWxjVW5tYXNrZWQgKHN0cikge1xyXG4gICAgdmFyIHVubWFza2VkID0gJyc7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT0wOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGRpKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoZGVmLnVubWFza2luZyAmJiAhdGhpcy5faXNIb2xsb3coZGkpICYmXHJcbiAgICAgICAgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXS5yZXNvbHZlKGNoLCBjaSwgc3RyKSB8fFxyXG4gICAgICAgICAgZGVmLmNoYXIgPT09IGNoKSkge1xyXG4gICAgICAgIHVubWFza2VkICs9IGNoO1xyXG4gICAgICB9XHJcbiAgICAgICsrY2k7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5tYXNrZWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fdW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuX2hvbGxvd3MubGVuZ3RoID0gMDtcclxuICAgIHZhciByZXM7XHJcbiAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IHRoaXMuX2FwcGVuZFRhaWwoJycsIHN0cik7XHJcbiAgICB0aGlzLnVwZGF0ZUVsZW1lbnQodGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKSk7XHJcblxyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IoKTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlciAoKSB7IHJldHVybiB0aGlzLl9wbGFjZWhvbGRlcjsgfVxyXG5cclxuICBzZXQgcGxhY2Vob2xkZXIgKHBoKSB7XHJcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUixcclxuICAgICAgLi4ucGhcclxuICAgIH07XHJcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHRoaXMudW5tYXNrZWRWYWx1ZSA9IHRoaXMudW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlckxhYmVsICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGFyRGVmcy5tYXAoZGVmID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgJycpLmpvaW4oJycpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRlZmluaXRpb25zICgpIHsgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zOyB9XHJcblxyXG4gIHNldCBkZWZpbml0aW9ucyAoZGVmcykge1xyXG4gICAgdGhpcy5faW5zdGFsbERlZmluaXRpb25zKGRlZnMpO1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB0aGlzLnVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXQgbWFzayAoKSB7IHJldHVybiB0aGlzLl9tYXNrOyB9XHJcblxyXG4gIHNldCBtYXNrIChtYXNrKSB7XHJcbiAgICB0aGlzLl9tYXNrID0gbWFzaztcclxuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgdGhpcy5kZWZpbml0aW9ucyA9IHRoaXMuZGVmaW5pdGlvbnM7XHJcbiAgfVxyXG5cclxuICBfYWxpZ25DdXJzb3IgKCkge1xyXG4gICAgdmFyIGN1cnNvckRlZkluZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleCh0aGlzLmN1cnNvclBvcyk7XHJcbiAgICBmb3IgKHZhciByUG9zID0gY3Vyc29yRGVmSW5kZXg7IHJQb3MgPj0gMDsgLS1yUG9zKSB7XHJcbiAgICAgIHZhciByRGVmID0gdGhpcy5fY2hhckRlZnNbclBvc107XHJcbiAgICAgIHZhciBsUG9zID0gclBvcy0xO1xyXG4gICAgICB2YXIgbERlZiA9IHRoaXMuX2NoYXJEZWZzW2xQb3NdO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3cobFBvcykpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaWYgKCghckRlZiB8fCByRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9pc0hvbGxvdyhyUG9zKSAmJiAhdGhpcy5faXNIaWRkZW5Ib2xsb3coclBvcykpICYmXHJcbiAgICAgICAgIXRoaXMuX2lzSG9sbG93KGxQb3MpKSB7XHJcbiAgICAgICAgY3Vyc29yRGVmSW5kZXggPSByUG9zO1xyXG4gICAgICAgIGlmICghbERlZiB8fCBsRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY3Vyc29yUG9zID0gdGhpcy5fbWFwRGVmSW5kZXhUb1BvcyhjdXJzb3JEZWZJbmRleCk7XHJcbiAgfVxyXG59XHJcblBhdHRlcm5NYXNrLkRFRklOSVRJT05TID0ge1xyXG4gICcwJzogL1xcZC8sXHJcbiAgJ2EnOiAvW1xcdTAwNDEtXFx1MDA1QVxcdTAwNjEtXFx1MDA3QVxcdTAwQUFcXHUwMEI1XFx1MDBCQVxcdTAwQzAtXFx1MDBENlxcdTAwRDgtXFx1MDBGNlxcdTAwRjgtXFx1MDJDMVxcdTAyQzYtXFx1MDJEMVxcdTAyRTAtXFx1MDJFNFxcdTAyRUNcXHUwMkVFXFx1MDM3MC1cXHUwMzc0XFx1MDM3NlxcdTAzNzdcXHUwMzdBLVxcdTAzN0RcXHUwMzg2XFx1MDM4OC1cXHUwMzhBXFx1MDM4Q1xcdTAzOEUtXFx1MDNBMVxcdTAzQTMtXFx1MDNGNVxcdTAzRjctXFx1MDQ4MVxcdTA0OEEtXFx1MDUyN1xcdTA1MzEtXFx1MDU1NlxcdTA1NTlcXHUwNTYxLVxcdTA1ODdcXHUwNUQwLVxcdTA1RUFcXHUwNUYwLVxcdTA1RjJcXHUwNjIwLVxcdTA2NEFcXHUwNjZFXFx1MDY2RlxcdTA2NzEtXFx1MDZEM1xcdTA2RDVcXHUwNkU1XFx1MDZFNlxcdTA2RUVcXHUwNkVGXFx1MDZGQS1cXHUwNkZDXFx1MDZGRlxcdTA3MTBcXHUwNzEyLVxcdTA3MkZcXHUwNzRELVxcdTA3QTVcXHUwN0IxXFx1MDdDQS1cXHUwN0VBXFx1MDdGNFxcdTA3RjVcXHUwN0ZBXFx1MDgwMC1cXHUwODE1XFx1MDgxQVxcdTA4MjRcXHUwODI4XFx1MDg0MC1cXHUwODU4XFx1MDhBMFxcdTA4QTItXFx1MDhBQ1xcdTA5MDQtXFx1MDkzOVxcdTA5M0RcXHUwOTUwXFx1MDk1OC1cXHUwOTYxXFx1MDk3MS1cXHUwOTc3XFx1MDk3OS1cXHUwOTdGXFx1MDk4NS1cXHUwOThDXFx1MDk4RlxcdTA5OTBcXHUwOTkzLVxcdTA5QThcXHUwOUFBLVxcdTA5QjBcXHUwOUIyXFx1MDlCNi1cXHUwOUI5XFx1MDlCRFxcdTA5Q0VcXHUwOURDXFx1MDlERFxcdTA5REYtXFx1MDlFMVxcdTA5RjBcXHUwOUYxXFx1MEEwNS1cXHUwQTBBXFx1MEEwRlxcdTBBMTBcXHUwQTEzLVxcdTBBMjhcXHUwQTJBLVxcdTBBMzBcXHUwQTMyXFx1MEEzM1xcdTBBMzVcXHUwQTM2XFx1MEEzOFxcdTBBMzlcXHUwQTU5LVxcdTBBNUNcXHUwQTVFXFx1MEE3Mi1cXHUwQTc0XFx1MEE4NS1cXHUwQThEXFx1MEE4Ri1cXHUwQTkxXFx1MEE5My1cXHUwQUE4XFx1MEFBQS1cXHUwQUIwXFx1MEFCMlxcdTBBQjNcXHUwQUI1LVxcdTBBQjlcXHUwQUJEXFx1MEFEMFxcdTBBRTBcXHUwQUUxXFx1MEIwNS1cXHUwQjBDXFx1MEIwRlxcdTBCMTBcXHUwQjEzLVxcdTBCMjhcXHUwQjJBLVxcdTBCMzBcXHUwQjMyXFx1MEIzM1xcdTBCMzUtXFx1MEIzOVxcdTBCM0RcXHUwQjVDXFx1MEI1RFxcdTBCNUYtXFx1MEI2MVxcdTBCNzFcXHUwQjgzXFx1MEI4NS1cXHUwQjhBXFx1MEI4RS1cXHUwQjkwXFx1MEI5Mi1cXHUwQjk1XFx1MEI5OVxcdTBCOUFcXHUwQjlDXFx1MEI5RVxcdTBCOUZcXHUwQkEzXFx1MEJBNFxcdTBCQTgtXFx1MEJBQVxcdTBCQUUtXFx1MEJCOVxcdTBCRDBcXHUwQzA1LVxcdTBDMENcXHUwQzBFLVxcdTBDMTBcXHUwQzEyLVxcdTBDMjhcXHUwQzJBLVxcdTBDMzNcXHUwQzM1LVxcdTBDMzlcXHUwQzNEXFx1MEM1OFxcdTBDNTlcXHUwQzYwXFx1MEM2MVxcdTBDODUtXFx1MEM4Q1xcdTBDOEUtXFx1MEM5MFxcdTBDOTItXFx1MENBOFxcdTBDQUEtXFx1MENCM1xcdTBDQjUtXFx1MENCOVxcdTBDQkRcXHUwQ0RFXFx1MENFMFxcdTBDRTFcXHUwQ0YxXFx1MENGMlxcdTBEMDUtXFx1MEQwQ1xcdTBEMEUtXFx1MEQxMFxcdTBEMTItXFx1MEQzQVxcdTBEM0RcXHUwRDRFXFx1MEQ2MFxcdTBENjFcXHUwRDdBLVxcdTBEN0ZcXHUwRDg1LVxcdTBEOTZcXHUwRDlBLVxcdTBEQjFcXHUwREIzLVxcdTBEQkJcXHUwREJEXFx1MERDMC1cXHUwREM2XFx1MEUwMS1cXHUwRTMwXFx1MEUzMlxcdTBFMzNcXHUwRTQwLVxcdTBFNDZcXHUwRTgxXFx1MEU4MlxcdTBFODRcXHUwRTg3XFx1MEU4OFxcdTBFOEFcXHUwRThEXFx1MEU5NC1cXHUwRTk3XFx1MEU5OS1cXHUwRTlGXFx1MEVBMS1cXHUwRUEzXFx1MEVBNVxcdTBFQTdcXHUwRUFBXFx1MEVBQlxcdTBFQUQtXFx1MEVCMFxcdTBFQjJcXHUwRUIzXFx1MEVCRFxcdTBFQzAtXFx1MEVDNFxcdTBFQzZcXHUwRURDLVxcdTBFREZcXHUwRjAwXFx1MEY0MC1cXHUwRjQ3XFx1MEY0OS1cXHUwRjZDXFx1MEY4OC1cXHUwRjhDXFx1MTAwMC1cXHUxMDJBXFx1MTAzRlxcdTEwNTAtXFx1MTA1NVxcdTEwNUEtXFx1MTA1RFxcdTEwNjFcXHUxMDY1XFx1MTA2NlxcdTEwNkUtXFx1MTA3MFxcdTEwNzUtXFx1MTA4MVxcdTEwOEVcXHUxMEEwLVxcdTEwQzVcXHUxMEM3XFx1MTBDRFxcdTEwRDAtXFx1MTBGQVxcdTEwRkMtXFx1MTI0OFxcdTEyNEEtXFx1MTI0RFxcdTEyNTAtXFx1MTI1NlxcdTEyNThcXHUxMjVBLVxcdTEyNURcXHUxMjYwLVxcdTEyODhcXHUxMjhBLVxcdTEyOERcXHUxMjkwLVxcdTEyQjBcXHUxMkIyLVxcdTEyQjVcXHUxMkI4LVxcdTEyQkVcXHUxMkMwXFx1MTJDMi1cXHUxMkM1XFx1MTJDOC1cXHUxMkQ2XFx1MTJEOC1cXHUxMzEwXFx1MTMxMi1cXHUxMzE1XFx1MTMxOC1cXHUxMzVBXFx1MTM4MC1cXHUxMzhGXFx1MTNBMC1cXHUxM0Y0XFx1MTQwMS1cXHUxNjZDXFx1MTY2Ri1cXHUxNjdGXFx1MTY4MS1cXHUxNjlBXFx1MTZBMC1cXHUxNkVBXFx1MTcwMC1cXHUxNzBDXFx1MTcwRS1cXHUxNzExXFx1MTcyMC1cXHUxNzMxXFx1MTc0MC1cXHUxNzUxXFx1MTc2MC1cXHUxNzZDXFx1MTc2RS1cXHUxNzcwXFx1MTc4MC1cXHUxN0IzXFx1MTdEN1xcdTE3RENcXHUxODIwLVxcdTE4NzdcXHUxODgwLVxcdTE4QThcXHUxOEFBXFx1MThCMC1cXHUxOEY1XFx1MTkwMC1cXHUxOTFDXFx1MTk1MC1cXHUxOTZEXFx1MTk3MC1cXHUxOTc0XFx1MTk4MC1cXHUxOUFCXFx1MTlDMS1cXHUxOUM3XFx1MUEwMC1cXHUxQTE2XFx1MUEyMC1cXHUxQTU0XFx1MUFBN1xcdTFCMDUtXFx1MUIzM1xcdTFCNDUtXFx1MUI0QlxcdTFCODMtXFx1MUJBMFxcdTFCQUVcXHUxQkFGXFx1MUJCQS1cXHUxQkU1XFx1MUMwMC1cXHUxQzIzXFx1MUM0RC1cXHUxQzRGXFx1MUM1QS1cXHUxQzdEXFx1MUNFOS1cXHUxQ0VDXFx1MUNFRS1cXHUxQ0YxXFx1MUNGNVxcdTFDRjZcXHUxRDAwLVxcdTFEQkZcXHUxRTAwLVxcdTFGMTVcXHUxRjE4LVxcdTFGMURcXHUxRjIwLVxcdTFGNDVcXHUxRjQ4LVxcdTFGNERcXHUxRjUwLVxcdTFGNTdcXHUxRjU5XFx1MUY1QlxcdTFGNURcXHUxRjVGLVxcdTFGN0RcXHUxRjgwLVxcdTFGQjRcXHUxRkI2LVxcdTFGQkNcXHUxRkJFXFx1MUZDMi1cXHUxRkM0XFx1MUZDNi1cXHUxRkNDXFx1MUZEMC1cXHUxRkQzXFx1MUZENi1cXHUxRkRCXFx1MUZFMC1cXHUxRkVDXFx1MUZGMi1cXHUxRkY0XFx1MUZGNi1cXHUxRkZDXFx1MjA3MVxcdTIwN0ZcXHUyMDkwLVxcdTIwOUNcXHUyMTAyXFx1MjEwN1xcdTIxMEEtXFx1MjExM1xcdTIxMTVcXHUyMTE5LVxcdTIxMURcXHUyMTI0XFx1MjEyNlxcdTIxMjhcXHUyMTJBLVxcdTIxMkRcXHUyMTJGLVxcdTIxMzlcXHUyMTNDLVxcdTIxM0ZcXHUyMTQ1LVxcdTIxNDlcXHUyMTRFXFx1MjE4M1xcdTIxODRcXHUyQzAwLVxcdTJDMkVcXHUyQzMwLVxcdTJDNUVcXHUyQzYwLVxcdTJDRTRcXHUyQ0VCLVxcdTJDRUVcXHUyQ0YyXFx1MkNGM1xcdTJEMDAtXFx1MkQyNVxcdTJEMjdcXHUyRDJEXFx1MkQzMC1cXHUyRDY3XFx1MkQ2RlxcdTJEODAtXFx1MkQ5NlxcdTJEQTAtXFx1MkRBNlxcdTJEQTgtXFx1MkRBRVxcdTJEQjAtXFx1MkRCNlxcdTJEQjgtXFx1MkRCRVxcdTJEQzAtXFx1MkRDNlxcdTJEQzgtXFx1MkRDRVxcdTJERDAtXFx1MkRENlxcdTJERDgtXFx1MkRERVxcdTJFMkZcXHUzMDA1XFx1MzAwNlxcdTMwMzEtXFx1MzAzNVxcdTMwM0JcXHUzMDNDXFx1MzA0MS1cXHUzMDk2XFx1MzA5RC1cXHUzMDlGXFx1MzBBMS1cXHUzMEZBXFx1MzBGQy1cXHUzMEZGXFx1MzEwNS1cXHUzMTJEXFx1MzEzMS1cXHUzMThFXFx1MzFBMC1cXHUzMUJBXFx1MzFGMC1cXHUzMUZGXFx1MzQwMC1cXHU0REI1XFx1NEUwMC1cXHU5RkNDXFx1QTAwMC1cXHVBNDhDXFx1QTREMC1cXHVBNEZEXFx1QTUwMC1cXHVBNjBDXFx1QTYxMC1cXHVBNjFGXFx1QTYyQVxcdUE2MkJcXHVBNjQwLVxcdUE2NkVcXHVBNjdGLVxcdUE2OTdcXHVBNkEwLVxcdUE2RTVcXHVBNzE3LVxcdUE3MUZcXHVBNzIyLVxcdUE3ODhcXHVBNzhCLVxcdUE3OEVcXHVBNzkwLVxcdUE3OTNcXHVBN0EwLVxcdUE3QUFcXHVBN0Y4LVxcdUE4MDFcXHVBODAzLVxcdUE4MDVcXHVBODA3LVxcdUE4MEFcXHVBODBDLVxcdUE4MjJcXHVBODQwLVxcdUE4NzNcXHVBODgyLVxcdUE4QjNcXHVBOEYyLVxcdUE4RjdcXHVBOEZCXFx1QTkwQS1cXHVBOTI1XFx1QTkzMC1cXHVBOTQ2XFx1QTk2MC1cXHVBOTdDXFx1QTk4NC1cXHVBOUIyXFx1QTlDRlxcdUFBMDAtXFx1QUEyOFxcdUFBNDAtXFx1QUE0MlxcdUFBNDQtXFx1QUE0QlxcdUFBNjAtXFx1QUE3NlxcdUFBN0FcXHVBQTgwLVxcdUFBQUZcXHVBQUIxXFx1QUFCNVxcdUFBQjZcXHVBQUI5LVxcdUFBQkRcXHVBQUMwXFx1QUFDMlxcdUFBREItXFx1QUFERFxcdUFBRTAtXFx1QUFFQVxcdUFBRjItXFx1QUFGNFxcdUFCMDEtXFx1QUIwNlxcdUFCMDktXFx1QUIwRVxcdUFCMTEtXFx1QUIxNlxcdUFCMjAtXFx1QUIyNlxcdUFCMjgtXFx1QUIyRVxcdUFCQzAtXFx1QUJFMlxcdUFDMDAtXFx1RDdBM1xcdUQ3QjAtXFx1RDdDNlxcdUQ3Q0ItXFx1RDdGQlxcdUY5MDAtXFx1RkE2RFxcdUZBNzAtXFx1RkFEOVxcdUZCMDAtXFx1RkIwNlxcdUZCMTMtXFx1RkIxN1xcdUZCMURcXHVGQjFGLVxcdUZCMjhcXHVGQjJBLVxcdUZCMzZcXHVGQjM4LVxcdUZCM0NcXHVGQjNFXFx1RkI0MFxcdUZCNDFcXHVGQjQzXFx1RkI0NFxcdUZCNDYtXFx1RkJCMVxcdUZCRDMtXFx1RkQzRFxcdUZENTAtXFx1RkQ4RlxcdUZEOTItXFx1RkRDN1xcdUZERjAtXFx1RkRGQlxcdUZFNzAtXFx1RkU3NFxcdUZFNzYtXFx1RkVGQ1xcdUZGMjEtXFx1RkYzQVxcdUZGNDEtXFx1RkY1QVxcdUZGNjYtXFx1RkZCRVxcdUZGQzItXFx1RkZDN1xcdUZGQ0EtXFx1RkZDRlxcdUZGRDItXFx1RkZEN1xcdUZGREEtXFx1RkZEQ10vLCAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjIwNzUwNzBcclxuICAnKic6IC8uL1xyXG59O1xyXG5QYXR0ZXJuTWFzay5ERUZfVFlQRVMgPSB7XHJcbiAgSU5QVVQ6ICdpbnB1dCcsXHJcbiAgRklYRUQ6ICdmaXhlZCdcclxufVxyXG5QYXR0ZXJuTWFzay5ERUZBVUxUX1BMQUNFSE9MREVSID0ge1xyXG4gIHNob3c6ICdsYXp5JyxcclxuICBjaGFyOiAnXydcclxufTtcclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcbmltcG9ydCB7ZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGlwZU1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICBzdXBlcihlbCwgb3B0cyk7XHJcblxyXG4gICAgdGhpcy5tdWx0aXBhc3MgPSBvcHRzLm11bHRpcGFzcztcclxuXHJcbiAgICB0aGlzLl9jb21waWxlZE1hc2tzID0gdGhpcy5tYXNrLm1hcChtID0+IElNYXNrLk1hc2tGYWN0b3J5KGVsLCBtKSk7XHJcbiAgfVxyXG5cclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHtcclxuICAgIHZhciByZXMgPSB0aGlzLl9waXBlKHN0ciwgZGV0YWlscyk7XHJcbiAgICBpZiAoIXRoaXMubXVsdGlwYXNzKSByZXR1cm4gcmVzO1xyXG5cclxuICAgIHZhciBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuXHJcbiAgICB2YXIgc3RlcFJlcztcclxuICAgIHZhciB0ZW1wUmVzID0gcmVzO1xyXG5cclxuICAgIHdoaWxlIChzdGVwUmVzICE9PSB0ZW1wUmVzKSB7XHJcbiAgICAgIHN0ZXBSZXMgPSB0ZW1wUmVzO1xyXG4gICAgICB0ZW1wUmVzID0gdGhpcy5fcGlwZShzdGVwUmVzLCB7XHJcbiAgICAgICAgY3Vyc29yUG9zOiBzdGVwUmVzLmxlbmd0aCxcclxuICAgICAgICBvbGRWYWx1ZTogc3RlcFJlcyxcclxuICAgICAgICBvbGRTZWxlY3Rpb246IHtcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiBzdGVwUmVzLmxlbmd0aFxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGV0YWlscy5jdXJzb3JQb3MgPSBjdXJzb3JQb3MgLSAocmVzLmxlbmd0aCAtIHN0ZXBSZXMubGVuZ3RoKTtcclxuXHJcbiAgICByZXR1cm4gc3RlcFJlcztcclxuICB9XHJcblxyXG4gIF9waXBlIChzdHIsIGRldGFpbHMpIHtcclxuICAgIHJldHVybiB0aGlzLl9jb21waWxlZE1hc2tzLnJlZHVjZSgocywgbSkgPT4ge1xyXG4gICAgICB2YXIgZCA9IGV4dGVuZERldGFpbHNBZGp1c3RtZW50cyhzLCBkZXRhaWxzKTtcclxuICAgICAgdmFyIHJlcyA9IG0ucmVzb2x2ZShzLCBkKTtcclxuICAgICAgZGV0YWlscy5jdXJzb3JQb3MgPSBkLmN1cnNvclBvcztcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0sIHN0cik7XHJcbiAgfVxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLmJpbmRFdmVudHMoKTtcclxuICAgIHRoaXMuX2NvbXBpbGVkTWFza3MuZm9yRWFjaChtID0+IHtcclxuICAgICAgbS5iaW5kRXZlbnRzKCk7XHJcbiAgICAgIC8vIGRpc2FibGUgYmFzZW1hc2sgZXZlbnRzIGZvciBjaGlsZCBtYXNrc1xyXG4gICAgICBCYXNlTWFzay5wcm90b3R5cGUudW5iaW5kRXZlbnRzLmFwcGx5KG0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB1bmJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIudW5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLl9jb21waWxlZE1hc2tzLmZvckVhY2gobSA9PiBtLnVuYmluZEV2ZW50cygpKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtpc1N0cmluZ30gZnJvbSAnLi91dGlscyc7XHJcblxyXG5pbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9tYXNrcy9iYXNlJztcclxuaW1wb3J0IFJlZ0V4cE1hc2sgZnJvbSAnLi9tYXNrcy9yZWdleHAnO1xyXG5pbXBvcnQgRnVuY01hc2sgZnJvbSAnLi9tYXNrcy9mdW5jJztcclxuaW1wb3J0IFBhdHRlcm5NYXNrIGZyb20gJy4vbWFza3MvcGF0dGVybic7XHJcbmltcG9ydCBQaXBlTWFzayBmcm9tICcuL21hc2tzL3BpcGUnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmZ1bmN0aW9uIElNYXNrIChlbCwgb3B0cz17fSkge1xyXG4gIHZhciBtYXNrID0gSU1hc2suTWFza0ZhY3RvcnkoZWwsIG9wdHMpO1xyXG4gIG1hc2suYmluZEV2ZW50cygpO1xyXG4gIC8vIHJlZnJlc2hcclxuICBtYXNrLnJhd1ZhbHVlID0gZWwudmFsdWU7XHJcbiAgcmV0dXJuIG1hc2s7XHJcbn1cclxuXHJcbklNYXNrLk1hc2tGYWN0b3J5ID0gZnVuY3Rpb24gKGVsLCBvcHRzKSB7XHJcbiAgdmFyIG1hc2sgPSBvcHRzLm1hc2s7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBCYXNlTWFzaykgcmV0dXJuIG1hc2s7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBuZXcgUmVnRXhwTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIG5ldyBQaXBlTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKGlzU3RyaW5nKG1hc2spKSByZXR1cm4gbmV3IFBhdHRlcm5NYXNrKGVsLCBvcHRzKTtcclxuICBpZiAobWFzay5wcm90b3R5cGUgaW5zdGFuY2VvZiBCYXNlTWFzaykgcmV0dXJuIG5ldyBtYXNrKGVsLCBvcHRzKTtcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSByZXR1cm4gbmV3IEZ1bmNNYXNrKGVsLCBvcHRzKTtcclxuICByZXR1cm4gbmV3IEJhc2VNYXNrKGVsLCBvcHRzKTtcclxufVxyXG5JTWFzay5CYXNlTWFzayA9IEJhc2VNYXNrO1xyXG5JTWFzay5GdW5jTWFzayA9IEZ1bmNNYXNrO1xyXG5JTWFzay5SZWdFeHBNYXNrID0gUmVnRXhwTWFzaztcclxuSU1hc2suUGF0dGVybk1hc2sgPSBQYXR0ZXJuTWFzaztcclxud2luZG93LklNYXNrID0gSU1hc2s7XHJcbiJdLCJuYW1lcyI6WyJpc1N0cmluZyIsInN0ciIsIlN0cmluZyIsImNvbmZvcm0iLCJyZXMiLCJmYWxsYmFjayIsImV4dGVuZERldGFpbHNBZGp1c3RtZW50cyIsImRldGFpbHMiLCJjdXJzb3JQb3MiLCJvbGRTZWxlY3Rpb24iLCJvbGRWYWx1ZSIsInN0YXJ0Q2hhbmdlUG9zIiwiTWF0aCIsIm1pbiIsInN0YXJ0IiwiaW5zZXJ0ZWRDb3VudCIsInJlbW92ZWRDb3VudCIsIm1heCIsImVuZCIsImxlbmd0aCIsImhlYWQiLCJzdWJzdHJpbmciLCJ0YWlsIiwiaW5zZXJ0ZWQiLCJzdWJzdHIiLCJyZW1vdmVkIiwiQmFzZU1hc2siLCJlbCIsIm9wdHMiLCJtYXNrIiwiX2xpc3RlbmVycyIsIl9yZWZyZXNoaW5nQ291bnQiLCJfcmF3VmFsdWUiLCJfdW5tYXNrZWRWYWx1ZSIsInNhdmVTZWxlY3Rpb24iLCJiaW5kIiwiX29uSW5wdXQiLCJfb25Ecm9wIiwiZXYiLCJoYW5kbGVyIiwicHVzaCIsImhJbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImxpc3RlbmVycyIsImZvckVhY2giLCJsIiwiaW5wdXRWYWx1ZSIsIl9zZWxlY3Rpb24iLCJyYXdWYWx1ZSIsInVubWFza2VkVmFsdWUiLCJyZXNvbHZlIiwidXBkYXRlRWxlbWVudCIsInZhbHVlIiwid2FybiIsInNlbGVjdGlvblN0YXJ0IiwidW5iaW5kRXZlbnRzIiwiX2NhbGNVbm1hc2tlZCIsImlzQ2hhbmdlZCIsInVwZGF0ZUN1cnNvciIsIl9maXJlQ2hhbmdlRXZlbnRzIiwiZmlyZUV2ZW50IiwiX2RlbGF5VXBkYXRlQ3Vyc29yIiwiX2Fib3J0VXBkYXRlQ3Vyc29yIiwiX2NoYW5naW5nQ3Vyc29yUG9zIiwiX2N1cnNvckNoYW5naW5nIiwic2V0VGltZW91dCIsInByb2Nlc3NJbnB1dCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2VsZWN0aW9uRW5kIiwicG9zIiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50Iiwic2V0U2VsZWN0aW9uUmFuZ2UiLCJSZWdFeHBNYXNrIiwidGVzdCIsIkZ1bmNNYXNrIiwiUGF0dGVybk1hc2siLCJfaG9sbG93cyIsInBsYWNlaG9sZGVyIiwiZGVmaW5pdGlvbnMiLCJERUZJTklUSU9OUyIsIl9hbGlnbkN1cnNvciIsIl9hbGlnbkN1cnNvckZyaWVuZGx5IiwiX2luaXRpYWxpemVkIiwiX2RlZmluaXRpb25zIiwiX2NoYXJEZWZzIiwicGF0dGVybiIsInVubWFza2luZ0Jsb2NrIiwib3B0aW9uYWxCbG9jayIsImkiLCJjaCIsInR5cGUiLCJERUZfVFlQRVMiLCJJTlBVVCIsIkZJWEVEIiwidW5tYXNraW5nIiwib3B0aW9uYWwiLCJfYnVpbGRSZXNvbHZlcnMiLCJfcmVzb2x2ZXJzIiwiZGVmS2V5IiwiSU1hc2siLCJNYXNrRmFjdG9yeSIsInNraXBVbnJlc29sdmVkSW5wdXQiLCJwbGFjZWhvbGRlckJ1ZmZlciIsImhvbGxvd3MiLCJzbGljZSIsIm92ZXJmbG93IiwiY2kiLCJkaSIsIl9tYXBQb3NUb0RlZkluZGV4IiwiZGVmIiwicmVzb2x2ZXIiLCJjaGFyIiwiY2hyZXMiLCJpc1Jlc29sdmVkIiwiX3BsYWNlaG9sZGVyIiwiZnJvbVBvcyIsImlucHV0IiwiX2lzSGlkZGVuSG9sbG93IiwiX2lzSG9sbG93IiwiZGVmSW5kZXgiLCJmaWx0ZXIiLCJoIiwiX2hvbGxvd3NCZWZvcmUiLCJoaSIsImluc2VydFN0ZXBzIiwiX2FwcGVuZFRhaWwiLCJ0YWlsSW5wdXQiLCJfZXh0cmFjdElucHV0IiwibGFzdEhvbGxvd0luZGV4IiwiX2dlbmVyYXRlSW5zZXJ0U3RlcHMiLCJpc3RlcCIsInN0ZXAiLCJ0cmVzIiwidGhvbGxvd3MiLCJhcHBlbmRlZCIsIl9hcHBlbmRGaXhlZEVuZCIsImhhc0hvbGxvd3MiLCJfYXBwZW5kUGxhY2Vob2xkZXJFbmQiLCJpc0NvbXBsZXRlIiwic2hvdyIsInVubWFza2VkIiwiY3Vyc29yRGVmSW5kZXgiLCJyUG9zIiwickRlZiIsImxQb3MiLCJsRGVmIiwiX21hcERlZkluZGV4VG9Qb3MiLCJwaCIsIkRFRkFVTFRfUExBQ0VIT0xERVIiLCJtYXAiLCJqb2luIiwiZGVmcyIsIl9pbnN0YWxsRGVmaW5pdGlvbnMiLCJfbWFzayIsIlBpcGVNYXNrIiwibXVsdGlwYXNzIiwiX2NvbXBpbGVkTWFza3MiLCJtIiwiX3BpcGUiLCJzdGVwUmVzIiwidGVtcFJlcyIsInJlZHVjZSIsInMiLCJkIiwiYmluZEV2ZW50cyIsInByb3RvdHlwZSIsImFwcGx5IiwiUmVnRXhwIiwiQXJyYXkiLCJGdW5jdGlvbiIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsU0FBU0EsUUFBVCxDQUFtQkMsR0FBbkIsRUFBd0I7U0FDZixPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsZUFBZUMsTUFBakQ7OztBQUdGLEFBQ0EsU0FBU0MsT0FBVCxDQUFrQkMsR0FBbEIsRUFBdUJILEdBQXZCLEVBQXlDO01BQWJJLFFBQWEsdUVBQUosRUFBSTs7U0FDaENMLFNBQVNJLEdBQVQsSUFDTEEsR0FESyxHQUVMQSxNQUNFSCxHQURGLEdBRUVJLFFBSko7OztBQU9GLEFBQ0EsU0FBU0Msd0JBQVQsQ0FBa0NMLEdBQWxDLEVBQXVDTSxPQUF2QyxFQUFnRDtNQUMxQ0MsWUFBWUQsUUFBUUMsU0FBeEI7TUFDSUMsZUFBZUYsUUFBUUUsWUFBM0I7TUFDSUMsV0FBV0gsUUFBUUcsUUFBdkI7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