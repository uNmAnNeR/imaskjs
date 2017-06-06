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

          if (ch === def.char) ++ci;
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

      if (this.el === document.activeElement) this._alignCursor();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvcGlwZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL2ltYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydFxyXG5mdW5jdGlvbiBpc1N0cmluZyAoc3RyKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnIHx8IHN0ciBpbnN0YW5jZW9mIFN0cmluZztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGNvbmZvcm0gKHJlcywgc3RyLCBmYWxsYmFjaz0nJykge1xyXG4gIHJldHVybiBpc1N0cmluZyhyZXMpID9cclxuICAgIHJlcyA6XHJcbiAgICByZXMgP1xyXG4gICAgICBzdHIgOlxyXG4gICAgICBmYWxsYmFjaztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGV4dGVuZERldGFpbHNBZGp1c3RtZW50cyhzdHIsIGRldGFpbHMpIHtcclxuICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgdmFyIG9sZFNlbGVjdGlvbiA9IGRldGFpbHMub2xkU2VsZWN0aW9uO1xyXG4gIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcblxyXG4gIHZhciBzdGFydENoYW5nZVBvcyA9IE1hdGgubWluKGN1cnNvclBvcywgb2xkU2VsZWN0aW9uLnN0YXJ0KTtcclxuICB2YXIgaW5zZXJ0ZWRDb3VudCA9IGN1cnNvclBvcyAtIHN0YXJ0Q2hhbmdlUG9zO1xyXG4gIC8vIE1hdGgubWF4IGZvciBvcHBvc2l0ZSBvcGVyYXRpb25cclxuICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgIC8vIGZvciBEZWxldGVcclxuICAgIG9sZFZhbHVlLmxlbmd0aCAtIHN0ci5sZW5ndGgsIDApO1xyXG4gIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyk7XHJcbiAgdmFyIHRhaWwgPSBzdHIuc3Vic3RyaW5nKHN0YXJ0Q2hhbmdlUG9zICsgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIGluc2VydGVkID0gc3RyLnN1YnN0cihzdGFydENoYW5nZVBvcywgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIHJlbW92ZWQgPSBzdHIuc3Vic3RyKHN0YXJ0Q2hhbmdlUG9zLCByZW1vdmVkQ291bnQpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc3RhcnRDaGFuZ2VQb3MsXHJcbiAgICBoZWFkLFxyXG4gICAgdGFpbCxcclxuICAgIGluc2VydGVkLFxyXG4gICAgcmVtb3ZlZCxcclxuICAgIC4uLmRldGFpbHNcclxuICB9O1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybSwgZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgdGhpcy5fcmVmcmVzaGluZ0NvdW50ID0gMDtcclxuICAgIHRoaXMuX3Jhd1ZhbHVlID0gXCJcIjtcclxuICAgIHRoaXMuX3VubWFza2VkVmFsdWUgPSBcIlwiO1xyXG5cclxuICAgIHRoaXMuc2F2ZVNlbGVjdGlvbiA9IHRoaXMuc2F2ZVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fb25JbnB1dCA9IHRoaXMuX29uSW5wdXQuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuX29uRHJvcCA9IHRoaXMuX29uRHJvcC5iaW5kKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgb24gKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHRoaXMuX2xpc3RlbmVyc1tldl0gPSBbXTtcclxuICAgIHRoaXMuX2xpc3RlbmVyc1tldl0ucHVzaChoYW5kbGVyKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgb2ZmIChldiwgaGFuZGxlcikge1xyXG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbZXZdKSByZXR1cm47XHJcbiAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tldl07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBoSW5kZXggPSB0aGlzLl9saXN0ZW5lcnNbZXZdLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICBpZiAoaEluZGV4ID49IDApIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaEluZGV4LCAxKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHJhd1ZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9yYXdWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCByYXdWYWx1ZSAoc3RyKSB7XHJcbiAgICB0aGlzLnByb2Nlc3NJbnB1dChzdHIsIHtcclxuICAgICAgY3Vyc29yUG9zOiBzdHIubGVuZ3RoLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5yYXdWYWx1ZSxcclxuICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiB0aGlzLnJhd1ZhbHVlLmxlbmd0aFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl91bm1hc2tlZFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHZhbHVlKSB7XHJcbiAgICB0aGlzLnJhd1ZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnNhdmVTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICB9XHJcblxyXG4gIHVuYmluZEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnNhdmVTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICB9XHJcblxyXG4gIGZpcmVFdmVudCAoZXYpIHtcclxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZdIHx8IFtdO1xyXG4gICAgbGlzdGVuZXJzLmZvckVhY2gobCA9PiBsKCkpO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChpbnB1dFZhbHVlLCBkZXRhaWxzKSB7XHJcbiAgICBkZXRhaWxzID0ge1xyXG4gICAgICBjdXJzb3JQb3M6IHRoaXMuY3Vyc29yUG9zLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHRoaXMuX3NlbGVjdGlvbixcclxuICAgICAgb2xkVmFsdWU6IHRoaXMucmF3VmFsdWUsXHJcbiAgICAgIG9sZFVubWFza2VkVmFsdWU6IHRoaXMudW5tYXNrZWRWYWx1ZSxcclxuICAgICAgLi4uZGV0YWlsc1xyXG4gICAgfTtcclxuXHJcbiAgICBkZXRhaWxzID0gZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzKGlucHV0VmFsdWUsIGRldGFpbHMpO1xyXG5cclxuICAgIHZhciByZXMgPSBjb25mb3JtKHRoaXMucmVzb2x2ZShpbnB1dFZhbHVlLCBkZXRhaWxzKSxcclxuICAgICAgaW5wdXRWYWx1ZSxcclxuICAgICAgdGhpcy5yYXdWYWx1ZSk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVFbGVtZW50KHJlcywgZGV0YWlscy5jdXJzb3JQb3MpO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG5cclxuICBnZXQgc2VsZWN0aW9uU3RhcnQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID9cclxuICAgICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOlxyXG5cclxuICAgICAgdGhpcy5lbC5zZWxlY3Rpb25TdGFydDtcclxuICB9XHJcblxyXG4gIGdldCBjdXJzb3JQb3MgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID9cclxuICAgICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOlxyXG5cclxuICAgICAgdGhpcy5lbC5zZWxlY3Rpb25FbmQ7XHJcbiAgfVxyXG5cclxuICBzZXQgY3Vyc29yUG9zIChwb3MpIHtcclxuICAgIHRoaXMuZWwuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MpO1xyXG4gICAgdGhpcy5zYXZlU2VsZWN0aW9uKCk7XHJcbiAgfVxyXG5cclxuICBzYXZlU2VsZWN0aW9uIChldikge1xyXG4gICAgaWYgKHRoaXMucmF3VmFsdWUgIT09IHRoaXMuZWwudmFsdWUpIHtcclxuICAgICAgY29uc29sZS53YXJuKFwiVW5jb250cm9sbGVkIGlucHV0IGNoYW5nZSwgcmVmcmVzaCBtYXNrIG1hbnVhbGx5IVwiKTtcclxuICAgIH1cclxuICAgIHRoaXMuX3NlbGVjdGlvbiA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuc2VsZWN0aW9uU3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5jdXJzb3JQb3NcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBkZXN0cm95ICgpIHtcclxuICAgIHRoaXMudW5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcclxuICB9XHJcblxyXG4gIHVwZGF0ZUVsZW1lbnQgKHZhbHVlLCBjdXJzb3JQb3MpIHtcclxuICAgIHZhciB1bm1hc2tlZFZhbHVlID0gdGhpcy5fY2FsY1VubWFza2VkKHZhbHVlKTtcclxuICAgIHZhciBpc0NoYW5nZWQgPSAodGhpcy51bm1hc2tlZFZhbHVlICE9PSB1bm1hc2tlZFZhbHVlIHx8XHJcbiAgICAgIHRoaXMucmF3VmFsdWUgIT09IHZhbHVlKTtcclxuXHJcbiAgICB0aGlzLl91bm1hc2tlZFZhbHVlID0gdW5tYXNrZWRWYWx1ZTtcclxuICAgIHRoaXMuX3Jhd1ZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgaWYgKHRoaXMuZWwudmFsdWUgIT09IHZhbHVlKSB0aGlzLmVsLnZhbHVlID0gdmFsdWU7XHJcbiAgICB0aGlzLnVwZGF0ZUN1cnNvcihjdXJzb3JQb3MpO1xyXG5cclxuICAgIGlmIChpc0NoYW5nZWQpIHRoaXMuX2ZpcmVDaGFuZ2VFdmVudHMoKTtcclxuICB9XHJcblxyXG4gIF9maXJlQ2hhbmdlRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZmlyZUV2ZW50KFwiYWNjZXB0XCIpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlQ3Vyc29yIChjdXJzb3JQb3MpIHtcclxuICAgIGlmIChjdXJzb3JQb3MgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5jdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcblxyXG4gICAgLy8gYWxzbyBxdWV1ZSBjaGFuZ2UgY3Vyc29yIGZvciBtb2JpbGUgYnJvd3NlcnNcclxuICAgIHRoaXMuX2RlbGF5VXBkYXRlQ3Vyc29yKGN1cnNvclBvcyk7XHJcbiAgfVxyXG5cclxuICBfZGVsYXlVcGRhdGVDdXJzb3IgKGN1cnNvclBvcykge1xyXG4gICAgdGhpcy5fYWJvcnRVcGRhdGVDdXJzb3IoKTtcclxuICAgIHRoaXMuX2NoYW5naW5nQ3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG4gICAgdGhpcy5fY3Vyc29yQ2hhbmdpbmcgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5fYWJvcnRVcGRhdGVDdXJzb3IoKTtcclxuICAgICAgdGhpcy5jdXJzb3JQb3MgPSB0aGlzLl9jaGFuZ2luZ0N1cnNvclBvcztcclxuICAgIH0sIDEwKTtcclxuICB9XHJcblxyXG4gIF9hYm9ydFVwZGF0ZUN1cnNvcigpIHtcclxuICAgIGlmICh0aGlzLl9jdXJzb3JDaGFuZ2luZykge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fY3Vyc29yQ2hhbmdpbmcpO1xyXG4gICAgICBkZWxldGUgdGhpcy5fY3Vyc29yQ2hhbmdpbmc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBfb25JbnB1dCAoZXYpIHtcclxuICAgIHRoaXMuX2Fib3J0VXBkYXRlQ3Vyc29yKCk7XHJcbiAgICB0aGlzLnByb2Nlc3NJbnB1dCh0aGlzLmVsLnZhbHVlKTtcclxuICB9XHJcblxyXG4gIF9vbkRyb3AgKGV2KSB7XHJcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvLyBvdmVycmlkZVxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykgeyByZXR1cm4gc3RyOyB9XHJcblxyXG4gIF9jYWxjVW5tYXNrZWQgKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfVxyXG59XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFJlZ0V4cE1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoc3RyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrLnRlc3Qoc3RyKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgRnVuY01hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgcmVzb2x2ZSAoLi4uYXJncykge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzayguLi5hcmdzKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtjb25mb3JtfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFBhdHRlcm5NYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgc3VwZXIoZWwsIG9wdHMpO1xyXG5cclxuICAgIHRoaXMuX2hvbGxvd3MgPSBbXTtcclxuICAgIHRoaXMucGxhY2Vob2xkZXIgPSBvcHRzLnBsYWNlaG9sZGVyO1xyXG4gICAgdGhpcy5kZWZpbml0aW9ucyA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGSU5JVElPTlMsXHJcbiAgICAgIC4uLm9wdHMuZGVmaW5pdGlvbnNcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IgPSB0aGlzLl9hbGlnbkN1cnNvci5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3JGcmllbmRseSA9IHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkuYmluZCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBfYWxpZ25DdXJzb3JGcmllbmRseSAoKSB7XHJcbiAgICBpZiAodGhpcy5zZWxlY3Rpb25TdGFydCAhPT0gdGhpcy5jdXJzb3JQb3MpIHJldHVybjtcclxuICAgIHRoaXMuX2FsaWduQ3Vyc29yKCk7XHJcbiAgfVxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLmJpbmRFdmVudHMoKTtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5KTtcclxuICB9XHJcblxyXG4gIHVuYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci51bmJpbmRFdmVudHMoKTtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5KTtcclxuICB9XHJcblxyXG4gIF9pbnN0YWxsRGVmaW5pdGlvbnMgKGRlZmluaXRpb25zKSB7XHJcbiAgICB0aGlzLl9kZWZpbml0aW9ucyA9IGRlZmluaXRpb25zO1xyXG4gICAgdGhpcy5fY2hhckRlZnMgPSBbXTtcclxuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5tYXNrO1xyXG5cclxuICAgIGlmICghcGF0dGVybiB8fCAhZGVmaW5pdGlvbnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgdW5tYXNraW5nQmxvY2sgPSBmYWxzZTtcclxuICAgIHZhciBvcHRpb25hbEJsb2NrID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8cGF0dGVybi5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICB2YXIgdHlwZSA9ICF1bm1hc2tpbmdCbG9jayAmJiBjaCBpbiBkZWZpbml0aW9ucyA/XHJcbiAgICAgICAgUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUIDpcclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQ7XHJcbiAgICAgIHZhciB1bm1hc2tpbmcgPSB0eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgfHwgdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgIHZhciBvcHRpb25hbCA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiBvcHRpb25hbEJsb2NrO1xyXG5cclxuICAgICAgaWYgKGNoID09PSAneycgfHwgY2ggPT09ICd9Jykge1xyXG4gICAgICAgIHVubWFza2luZ0Jsb2NrID0gIXVubWFza2luZ0Jsb2NrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICdbJyB8fCBjaCA9PT0gJ10nKSB7XHJcbiAgICAgICAgb3B0aW9uYWxCbG9jayA9ICFvcHRpb25hbEJsb2NrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICdcXFxcJykge1xyXG4gICAgICAgICsraTtcclxuICAgICAgICBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgICAgLy8gVE9ETyB2YWxpZGF0aW9uXHJcbiAgICAgICAgaWYgKCFjaCkgYnJlYWs7XHJcbiAgICAgICAgdHlwZSA9IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fY2hhckRlZnMucHVzaCh7XHJcbiAgICAgICAgY2hhcjogY2gsXHJcbiAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICBvcHRpb25hbDogb3B0aW9uYWwsXHJcbiAgICAgICAgdW5tYXNraW5nOiB1bm1hc2tpbmdcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fYnVpbGRSZXNvbHZlcnMoKTtcclxuICB9XHJcblxyXG4gIF9idWlsZFJlc29sdmVycyAoKSB7XHJcbiAgICB0aGlzLl9yZXNvbHZlcnMgPSB7fTtcclxuICAgIGZvciAodmFyIGRlZktleSBpbiB0aGlzLmRlZmluaXRpb25zKSB7XHJcbiAgICAgIHRoaXMuX3Jlc29sdmVyc1tkZWZLZXldID0gSU1hc2suTWFza0ZhY3RvcnkodGhpcy5lbCwge1xyXG4gICAgICAgIG1hc2s6IHRoaXMuZGVmaW5pdGlvbnNbZGVmS2V5XVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9hcHBlbmRUYWlsIChzdHIsIHRhaWwsIHNraXBVbnJlc29sdmVkSW5wdXQ9dHJ1ZSkge1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoc3RyLmxlbmd0aCk7IGNpIDwgdGFpbC5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBjaCA9IHRhaWxbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgLy8gZmFpbGVkXHJcbiAgICAgIGlmICghZGVmKSB7XHJcbiAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgZGksIHN0ciArIHBsYWNlaG9sZGVyQnVmZmVyKSB8fCAnJztcclxuICAgICAgICB2YXIgaXNSZXNvbHZlZCA9ICEhY2hyZXM7XHJcblxyXG4gICAgICAgIC8vIGlmIG9rIC0gbmV4dCBkaVxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgY2hyZXMgPSBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICghZGVmLm9wdGlvbmFsICYmIHNraXBVbnJlc29sdmVkSW5wdXQpIGNocmVzID0gdGhpcy5fcGxhY2Vob2xkZXIuY2hhcjtcclxuICAgICAgICAgIGlmIChob2xsb3dzLmluZGV4T2YoZGkpIDwgMCkgaG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgc3RyICs9IHBsYWNlaG9sZGVyQnVmZmVyICsgY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNocmVzIHx8IGRlZi5vcHRpb25hbCB8fCAhc2tpcFVucmVzb2x2ZWRJbnB1dCkgKytkaTtcclxuICAgICAgICBpZiAoaXNSZXNvbHZlZCB8fCAhZGVmLm9wdGlvbmFsICYmICFza2lwVW5yZXNvbHZlZElucHV0KSArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG5cclxuICAgICAgICBpZiAoY2ggPT09IGRlZi5jaGFyKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3N0ciwgaG9sbG93cywgb3ZlcmZsb3ddO1xyXG4gIH1cclxuXHJcbiAgX2V4dHJhY3RJbnB1dCAoc3RyLCBmcm9tUG9zPTApIHtcclxuICAgIHZhciBpbnB1dCA9ICcnO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoZnJvbVBvcyk7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmICF0aGlzLl9pc0hvbGxvdyhkaSkpIGlucHV0ICs9IGNoO1xyXG4gICAgICArK2NpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgX2lzSG9sbG93IChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkZWZJbmRleCkgPj0gMDtcclxuICB9XHJcblxyXG4gIF9pc0hpZGRlbkhvbGxvdyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9pc0hvbGxvdyhkZWZJbmRleCkgJiZcclxuICAgICAgdGhpcy5fY2hhckRlZnNbZGVmSW5kZXhdICYmIHRoaXMuX2NoYXJEZWZzW2RlZkluZGV4XS5vcHRpb25hbDtcclxuICB9XHJcblxyXG4gIF9ob2xsb3dzQmVmb3JlIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGRlZkluZGV4ICYmIHRoaXMuX2lzSGlkZGVuSG9sbG93KGgpKTtcclxuICB9XHJcblxyXG4gIF9tYXBEZWZJbmRleFRvUG9zIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIGRlZkluZGV4IC0gdGhpcy5faG9sbG93c0JlZm9yZShkZWZJbmRleCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX21hcFBvc1RvRGVmSW5kZXggKHBvcykge1xyXG4gICAgdmFyIGRlZkluZGV4ID0gcG9zO1xyXG4gICAgZm9yICh2YXIgaGk9MDsgaGk8dGhpcy5faG9sbG93cy5sZW5ndGg7ICsraGkpIHtcclxuICAgICAgdmFyIGggPSB0aGlzLl9ob2xsb3dzW2hpXTtcclxuICAgICAgaWYgKGggPj0gZGVmSW5kZXgpIGJyZWFrO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coaCkpICsrZGVmSW5kZXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVmSW5kZXg7XHJcbiAgfVxyXG5cclxuICBfZ2VuZXJhdGVJbnNlcnRTdGVwcyAoaGVhZCwgaW5zZXJ0ZWQpIHtcclxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHNhdmUgaG9sbG93IGR1cmluZyBnZW5lcmF0aW9uXHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3M7XHJcblxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW1toZWFkLCBob2xsb3dzLnNsaWNlKCldXTtcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wOyBjaTxpbnNlcnRlZC5sZW5ndGggJiYgIW92ZXJmbG93OyArK2NpKSB7XHJcbiAgICAgIHZhciBjaCA9IGluc2VydGVkW2NpXTtcclxuICAgICAgdmFyIFtyZXMsIGhvbGxvd3MsIG92ZXJmbG93XSA9IHRoaXMuX2FwcGVuZFRhaWwoaGVhZCwgY2gsIGZhbHNlKTtcclxuICAgICAgdGhpcy5faG9sbG93cyA9IGhvbGxvd3M7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cgJiYgcmVzICE9PSBoZWFkKSB7XHJcbiAgICAgICAgaW5zZXJ0U3RlcHMucHVzaChbcmVzLCBob2xsb3dzXSk7XHJcbiAgICAgICAgaGVhZCA9IHJlcztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHBvcCBob2xsb3dzIGJhY2tcclxuICAgIHRoaXMuX2hvbGxvd3MgPSBob2xsb3dzO1xyXG5cclxuICAgIHJldHVybiBpbnNlcnRTdGVwcztcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgdmFyIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgdmFyIHN0YXJ0Q2hhbmdlUG9zID0gZGV0YWlscy5zdGFydENoYW5nZVBvcztcclxuICAgIHZhciBpbnNlcnRlZCA9IGRldGFpbHMuaW5zZXJ0ZWQ7XHJcbiAgICB2YXIgcmVtb3ZlZENvdW50ID0gZGV0YWlscy5yZW1vdmVkLmxlbmd0aDtcclxuICAgIHZhciB0YWlsSW5wdXQgPSB0aGlzLl9leHRyYWN0SW5wdXQoZGV0YWlscy50YWlsLCBzdGFydENoYW5nZVBvcyArIHJlbW92ZWRDb3VudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhvbGxvd3MgYWZ0ZXIgY3Vyc29yXHJcbiAgICB2YXIgbGFzdEhvbGxvd0luZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChzdGFydENoYW5nZVBvcyk7XHJcbiAgICB0aGlzLl9ob2xsb3dzID0gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgbGFzdEhvbGxvd0luZGV4KTtcclxuXHJcbiAgICB2YXIgcmVzID0gZGV0YWlscy5oZWFkO1xyXG5cclxuICAgIC8vIGluc2VydCBhdmFpbGFibGVcclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IHRoaXMuX2dlbmVyYXRlSW5zZXJ0U3RlcHMocmVzLCBpbnNlcnRlZCk7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcDtcclxuICAgICAgW3N0ZXAsIHRoaXMuX2hvbGxvd3NdID0gaW5zZXJ0U3RlcHNbaXN0ZXBdO1xyXG4gICAgICB2YXIgW3RyZXMsIHRob2xsb3dzLCBvdmVyZmxvd10gPSB0aGlzLl9hcHBlbmRUYWlsKHN0ZXAsIHRhaWxJbnB1dCk7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cpIHtcclxuICAgICAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IFt0cmVzLCB0aG9sbG93c107XHJcbiAgICAgICAgY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBpbnB1dCBhdCB0aGUgZW5kIC0gYXBwZW5kIGZpeGVkXHJcbiAgICBpZiAoaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIGFwcGVuZCBmaXhlZCBhdCBlbmRcclxuICAgICAgdmFyIGFwcGVuZGVkID0gdGhpcy5fYXBwZW5kRml4ZWRFbmQocmVzKTtcclxuICAgICAgY3Vyc29yUG9zICs9IGFwcGVuZGVkLmxlbmd0aCAtIHJlcy5sZW5ndGg7XHJcbiAgICAgIHJlcyA9IGFwcGVuZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaW5zZXJ0ZWQgJiYgcmVtb3ZlZENvdW50KSB7XHJcbiAgICAgIC8vIGlmIGRlbGV0ZSBhdCByaWdodFxyXG4gICAgICBpZiAoZGV0YWlscy5vbGRTZWxlY3Rpb24uZW5kID09PSBjdXJzb3JQb3MpIHtcclxuICAgICAgICBmb3IgKDs7KytjdXJzb3JQb3MpIHtcclxuICAgICAgICAgIHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGN1cnNvclBvcyk7XHJcbiAgICAgICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICAgICAgaWYgKCFkZWYgfHwgZGVmLnR5cGUgIT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCkgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZW1vdmUgaGVhZCBmaXhlZCBhbmQgaG9sbG93cyBpZiByZW1vdmVkIGF0IGVuZFxyXG4gICAgICBpZiAoY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGRpID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChjdXJzb3JQb3MtMSk7XHJcbiAgICAgICAgdmFyIGhhc0hvbGxvd3MgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKDsgZGkgPiAwOyAtLWRpKSB7XHJcbiAgICAgICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzSG9sbG93KGRpKSkgaGFzSG9sbG93cyA9IHRydWU7XHJcbiAgICAgICAgICAgIGVsc2UgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYXNIb2xsb3dzKSByZXMgPSByZXMuc2xpY2UoMCwgZGkgKyAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFwcGVuZCBwbGFjZWhvbGRlclxyXG4gICAgcmVzID0gdGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKTtcclxuICAgIGRldGFpbHMuY3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG5cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBfZmlyZUNoYW5nZUV2ZW50cyAoKSB7XHJcbiAgICAvLyBmaXJlICdjb21wbGV0ZScgYWZ0ZXIgJ2FjY2VwdCcgZXZlbnRcclxuICAgIHN1cGVyLl9maXJlQ2hhbmdlRXZlbnRzKCk7XHJcbiAgICBpZiAodGhpcy5pc0NvbXBsZXRlKSB0aGlzLmZpcmVFdmVudChcImNvbXBsZXRlXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzQ29tcGxldGUgKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLl9jaGFyRGVmcy5maWx0ZXIoKGRlZiwgZGkpID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgIWRlZi5vcHRpb25hbCAmJlxyXG4gICAgICB0aGlzLl9pc0hvbGxvdyhkaSkpLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIF9hcHBlbmRGaXhlZEVuZCAocmVzKSB7XHJcbiAgICBmb3IgKHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHJlcy5sZW5ndGgpOzsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIGJyZWFrO1xyXG4gICAgICBpZiAoZGkgPj0gcmVzLmxlbmd0aCkgcmVzICs9IGRlZi5jaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9hcHBlbmRQbGFjZWhvbGRlckVuZCAocmVzKSB7XHJcbiAgICBmb3IgKHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHJlcy5sZW5ndGgpOyBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgIXRoaXMuX2lzSG9sbG93KGRpKSkge1xyXG4gICAgICAgIHRoaXMuX2hvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuX3BsYWNlaG9sZGVyLnNob3cgPT09ICdhbHdheXMnKSB7XHJcbiAgICAgICAgcmVzICs9IGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgICAgZGVmLmNoYXIgOlxyXG4gICAgICAgICAgIWRlZi5vcHRpb25hbCA/XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgICAnJztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9jYWxjVW5tYXNrZWQgKHN0cikge1xyXG4gICAgdmFyIHVubWFza2VkID0gJyc7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT0wOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGRpKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoZGVmLnVubWFza2luZyAmJiAhdGhpcy5faXNIb2xsb3coZGkpICYmXHJcbiAgICAgICAgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXS5yZXNvbHZlKGNoLCBjaSwgc3RyKSB8fFxyXG4gICAgICAgICAgZGVmLmNoYXIgPT09IGNoKSkge1xyXG4gICAgICAgIHVubWFza2VkICs9IGNoO1xyXG4gICAgICB9XHJcbiAgICAgICsrY2k7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5tYXNrZWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fdW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuX2hvbGxvd3MubGVuZ3RoID0gMDtcclxuICAgIHZhciByZXM7XHJcbiAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IHRoaXMuX2FwcGVuZFRhaWwoJycsIHN0cik7XHJcbiAgICB0aGlzLnVwZGF0ZUVsZW1lbnQodGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKSk7XHJcblxyXG4gICAgaWYgKHRoaXMuZWwgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHRoaXMuX2FsaWduQ3Vyc29yKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgcGxhY2Vob2xkZXIgKCkgeyByZXR1cm4gdGhpcy5fcGxhY2Vob2xkZXI7IH1cclxuXHJcbiAgc2V0IHBsYWNlaG9sZGVyIChwaCkge1xyXG4gICAgdGhpcy5fcGxhY2Vob2xkZXIgPSB7XHJcbiAgICAgIC4uLlBhdHRlcm5NYXNrLkRFRkFVTFRfUExBQ0VIT0xERVIsXHJcbiAgICAgIC4uLnBoXHJcbiAgICB9O1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB0aGlzLnVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXQgcGxhY2Vob2xkZXJMYWJlbCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY2hhckRlZnMubWFwKGRlZiA9PlxyXG4gICAgICBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEID9cclxuICAgICAgICBkZWYuY2hhciA6XHJcbiAgICAgICAgIWRlZi5vcHRpb25hbCA/XHJcbiAgICAgICAgICB0aGlzLl9wbGFjZWhvbGRlci5jaGFyIDpcclxuICAgICAgICAgICcnKS5qb2luKCcnKTtcclxuICB9XHJcblxyXG4gIGdldCBkZWZpbml0aW9ucyAoKSB7IHJldHVybiB0aGlzLl9kZWZpbml0aW9uczsgfVxyXG5cclxuICBzZXQgZGVmaW5pdGlvbnMgKGRlZnMpIHtcclxuICAgIHRoaXMuX2luc3RhbGxEZWZpbml0aW9ucyhkZWZzKTtcclxuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgdGhpcy51bm1hc2tlZFZhbHVlID0gdGhpcy51bm1hc2tlZFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IG1hc2sgKCkgeyByZXR1cm4gdGhpcy5fbWFzazsgfVxyXG5cclxuICBzZXQgbWFzayAobWFzaykge1xyXG4gICAgdGhpcy5fbWFzayA9IG1hc2s7XHJcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHRoaXMuZGVmaW5pdGlvbnMgPSB0aGlzLmRlZmluaXRpb25zO1xyXG4gIH1cclxuXHJcbiAgX2FsaWduQ3Vyc29yICgpIHtcclxuICAgIHZhciBjdXJzb3JEZWZJbmRleCA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgodGhpcy5jdXJzb3JQb3MpO1xyXG4gICAgZm9yICh2YXIgclBvcyA9IGN1cnNvckRlZkluZGV4OyByUG9zID49IDA7IC0tclBvcykge1xyXG4gICAgICB2YXIgckRlZiA9IHRoaXMuX2NoYXJEZWZzW3JQb3NdO1xyXG4gICAgICB2YXIgbFBvcyA9IHJQb3MtMTtcclxuICAgICAgdmFyIGxEZWYgPSB0aGlzLl9jaGFyRGVmc1tsUG9zXTtcclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGxQb3MpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmICgoIXJEZWYgfHwgckRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgdGhpcy5faXNIb2xsb3coclBvcykgJiYgIXRoaXMuX2lzSGlkZGVuSG9sbG93KHJQb3MpKSAmJlxyXG4gICAgICAgICF0aGlzLl9pc0hvbGxvdyhsUG9zKSkge1xyXG4gICAgICAgIGN1cnNvckRlZkluZGV4ID0gclBvcztcclxuICAgICAgICBpZiAoIWxEZWYgfHwgbERlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmN1cnNvclBvcyA9IHRoaXMuX21hcERlZkluZGV4VG9Qb3MoY3Vyc29yRGVmSW5kZXgpO1xyXG4gIH1cclxufVxyXG5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyA9IHtcclxuICAnMCc6IC9cXGQvLFxyXG4gICdhJzogL1tcXHUwMDQxLVxcdTAwNUFcXHUwMDYxLVxcdTAwN0FcXHUwMEFBXFx1MDBCNVxcdTAwQkFcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZcXHUwMEY4LVxcdTAyQzFcXHUwMkM2LVxcdTAyRDFcXHUwMkUwLVxcdTAyRTRcXHUwMkVDXFx1MDJFRVxcdTAzNzAtXFx1MDM3NFxcdTAzNzZcXHUwMzc3XFx1MDM3QS1cXHUwMzdEXFx1MDM4NlxcdTAzODgtXFx1MDM4QVxcdTAzOENcXHUwMzhFLVxcdTAzQTFcXHUwM0EzLVxcdTAzRjVcXHUwM0Y3LVxcdTA0ODFcXHUwNDhBLVxcdTA1MjdcXHUwNTMxLVxcdTA1NTZcXHUwNTU5XFx1MDU2MS1cXHUwNTg3XFx1MDVEMC1cXHUwNUVBXFx1MDVGMC1cXHUwNUYyXFx1MDYyMC1cXHUwNjRBXFx1MDY2RVxcdTA2NkZcXHUwNjcxLVxcdTA2RDNcXHUwNkQ1XFx1MDZFNVxcdTA2RTZcXHUwNkVFXFx1MDZFRlxcdTA2RkEtXFx1MDZGQ1xcdTA2RkZcXHUwNzEwXFx1MDcxMi1cXHUwNzJGXFx1MDc0RC1cXHUwN0E1XFx1MDdCMVxcdTA3Q0EtXFx1MDdFQVxcdTA3RjRcXHUwN0Y1XFx1MDdGQVxcdTA4MDAtXFx1MDgxNVxcdTA4MUFcXHUwODI0XFx1MDgyOFxcdTA4NDAtXFx1MDg1OFxcdTA4QTBcXHUwOEEyLVxcdTA4QUNcXHUwOTA0LVxcdTA5MzlcXHUwOTNEXFx1MDk1MFxcdTA5NTgtXFx1MDk2MVxcdTA5NzEtXFx1MDk3N1xcdTA5NzktXFx1MDk3RlxcdTA5ODUtXFx1MDk4Q1xcdTA5OEZcXHUwOTkwXFx1MDk5My1cXHUwOUE4XFx1MDlBQS1cXHUwOUIwXFx1MDlCMlxcdTA5QjYtXFx1MDlCOVxcdTA5QkRcXHUwOUNFXFx1MDlEQ1xcdTA5RERcXHUwOURGLVxcdTA5RTFcXHUwOUYwXFx1MDlGMVxcdTBBMDUtXFx1MEEwQVxcdTBBMEZcXHUwQTEwXFx1MEExMy1cXHUwQTI4XFx1MEEyQS1cXHUwQTMwXFx1MEEzMlxcdTBBMzNcXHUwQTM1XFx1MEEzNlxcdTBBMzhcXHUwQTM5XFx1MEE1OS1cXHUwQTVDXFx1MEE1RVxcdTBBNzItXFx1MEE3NFxcdTBBODUtXFx1MEE4RFxcdTBBOEYtXFx1MEE5MVxcdTBBOTMtXFx1MEFBOFxcdTBBQUEtXFx1MEFCMFxcdTBBQjJcXHUwQUIzXFx1MEFCNS1cXHUwQUI5XFx1MEFCRFxcdTBBRDBcXHUwQUUwXFx1MEFFMVxcdTBCMDUtXFx1MEIwQ1xcdTBCMEZcXHUwQjEwXFx1MEIxMy1cXHUwQjI4XFx1MEIyQS1cXHUwQjMwXFx1MEIzMlxcdTBCMzNcXHUwQjM1LVxcdTBCMzlcXHUwQjNEXFx1MEI1Q1xcdTBCNURcXHUwQjVGLVxcdTBCNjFcXHUwQjcxXFx1MEI4M1xcdTBCODUtXFx1MEI4QVxcdTBCOEUtXFx1MEI5MFxcdTBCOTItXFx1MEI5NVxcdTBCOTlcXHUwQjlBXFx1MEI5Q1xcdTBCOUVcXHUwQjlGXFx1MEJBM1xcdTBCQTRcXHUwQkE4LVxcdTBCQUFcXHUwQkFFLVxcdTBCQjlcXHUwQkQwXFx1MEMwNS1cXHUwQzBDXFx1MEMwRS1cXHUwQzEwXFx1MEMxMi1cXHUwQzI4XFx1MEMyQS1cXHUwQzMzXFx1MEMzNS1cXHUwQzM5XFx1MEMzRFxcdTBDNThcXHUwQzU5XFx1MEM2MFxcdTBDNjFcXHUwQzg1LVxcdTBDOENcXHUwQzhFLVxcdTBDOTBcXHUwQzkyLVxcdTBDQThcXHUwQ0FBLVxcdTBDQjNcXHUwQ0I1LVxcdTBDQjlcXHUwQ0JEXFx1MENERVxcdTBDRTBcXHUwQ0UxXFx1MENGMVxcdTBDRjJcXHUwRDA1LVxcdTBEMENcXHUwRDBFLVxcdTBEMTBcXHUwRDEyLVxcdTBEM0FcXHUwRDNEXFx1MEQ0RVxcdTBENjBcXHUwRDYxXFx1MEQ3QS1cXHUwRDdGXFx1MEQ4NS1cXHUwRDk2XFx1MEQ5QS1cXHUwREIxXFx1MERCMy1cXHUwREJCXFx1MERCRFxcdTBEQzAtXFx1MERDNlxcdTBFMDEtXFx1MEUzMFxcdTBFMzJcXHUwRTMzXFx1MEU0MC1cXHUwRTQ2XFx1MEU4MVxcdTBFODJcXHUwRTg0XFx1MEU4N1xcdTBFODhcXHUwRThBXFx1MEU4RFxcdTBFOTQtXFx1MEU5N1xcdTBFOTktXFx1MEU5RlxcdTBFQTEtXFx1MEVBM1xcdTBFQTVcXHUwRUE3XFx1MEVBQVxcdTBFQUJcXHUwRUFELVxcdTBFQjBcXHUwRUIyXFx1MEVCM1xcdTBFQkRcXHUwRUMwLVxcdTBFQzRcXHUwRUM2XFx1MEVEQy1cXHUwRURGXFx1MEYwMFxcdTBGNDAtXFx1MEY0N1xcdTBGNDktXFx1MEY2Q1xcdTBGODgtXFx1MEY4Q1xcdTEwMDAtXFx1MTAyQVxcdTEwM0ZcXHUxMDUwLVxcdTEwNTVcXHUxMDVBLVxcdTEwNURcXHUxMDYxXFx1MTA2NVxcdTEwNjZcXHUxMDZFLVxcdTEwNzBcXHUxMDc1LVxcdTEwODFcXHUxMDhFXFx1MTBBMC1cXHUxMEM1XFx1MTBDN1xcdTEwQ0RcXHUxMEQwLVxcdTEwRkFcXHUxMEZDLVxcdTEyNDhcXHUxMjRBLVxcdTEyNERcXHUxMjUwLVxcdTEyNTZcXHUxMjU4XFx1MTI1QS1cXHUxMjVEXFx1MTI2MC1cXHUxMjg4XFx1MTI4QS1cXHUxMjhEXFx1MTI5MC1cXHUxMkIwXFx1MTJCMi1cXHUxMkI1XFx1MTJCOC1cXHUxMkJFXFx1MTJDMFxcdTEyQzItXFx1MTJDNVxcdTEyQzgtXFx1MTJENlxcdTEyRDgtXFx1MTMxMFxcdTEzMTItXFx1MTMxNVxcdTEzMTgtXFx1MTM1QVxcdTEzODAtXFx1MTM4RlxcdTEzQTAtXFx1MTNGNFxcdTE0MDEtXFx1MTY2Q1xcdTE2NkYtXFx1MTY3RlxcdTE2ODEtXFx1MTY5QVxcdTE2QTAtXFx1MTZFQVxcdTE3MDAtXFx1MTcwQ1xcdTE3MEUtXFx1MTcxMVxcdTE3MjAtXFx1MTczMVxcdTE3NDAtXFx1MTc1MVxcdTE3NjAtXFx1MTc2Q1xcdTE3NkUtXFx1MTc3MFxcdTE3ODAtXFx1MTdCM1xcdTE3RDdcXHUxN0RDXFx1MTgyMC1cXHUxODc3XFx1MTg4MC1cXHUxOEE4XFx1MThBQVxcdTE4QjAtXFx1MThGNVxcdTE5MDAtXFx1MTkxQ1xcdTE5NTAtXFx1MTk2RFxcdTE5NzAtXFx1MTk3NFxcdTE5ODAtXFx1MTlBQlxcdTE5QzEtXFx1MTlDN1xcdTFBMDAtXFx1MUExNlxcdTFBMjAtXFx1MUE1NFxcdTFBQTdcXHUxQjA1LVxcdTFCMzNcXHUxQjQ1LVxcdTFCNEJcXHUxQjgzLVxcdTFCQTBcXHUxQkFFXFx1MUJBRlxcdTFCQkEtXFx1MUJFNVxcdTFDMDAtXFx1MUMyM1xcdTFDNEQtXFx1MUM0RlxcdTFDNUEtXFx1MUM3RFxcdTFDRTktXFx1MUNFQ1xcdTFDRUUtXFx1MUNGMVxcdTFDRjVcXHUxQ0Y2XFx1MUQwMC1cXHUxREJGXFx1MUUwMC1cXHUxRjE1XFx1MUYxOC1cXHUxRjFEXFx1MUYyMC1cXHUxRjQ1XFx1MUY0OC1cXHUxRjREXFx1MUY1MC1cXHUxRjU3XFx1MUY1OVxcdTFGNUJcXHUxRjVEXFx1MUY1Ri1cXHUxRjdEXFx1MUY4MC1cXHUxRkI0XFx1MUZCNi1cXHUxRkJDXFx1MUZCRVxcdTFGQzItXFx1MUZDNFxcdTFGQzYtXFx1MUZDQ1xcdTFGRDAtXFx1MUZEM1xcdTFGRDYtXFx1MUZEQlxcdTFGRTAtXFx1MUZFQ1xcdTFGRjItXFx1MUZGNFxcdTFGRjYtXFx1MUZGQ1xcdTIwNzFcXHUyMDdGXFx1MjA5MC1cXHUyMDlDXFx1MjEwMlxcdTIxMDdcXHUyMTBBLVxcdTIxMTNcXHUyMTE1XFx1MjExOS1cXHUyMTFEXFx1MjEyNFxcdTIxMjZcXHUyMTI4XFx1MjEyQS1cXHUyMTJEXFx1MjEyRi1cXHUyMTM5XFx1MjEzQy1cXHUyMTNGXFx1MjE0NS1cXHUyMTQ5XFx1MjE0RVxcdTIxODNcXHUyMTg0XFx1MkMwMC1cXHUyQzJFXFx1MkMzMC1cXHUyQzVFXFx1MkM2MC1cXHUyQ0U0XFx1MkNFQi1cXHUyQ0VFXFx1MkNGMlxcdTJDRjNcXHUyRDAwLVxcdTJEMjVcXHUyRDI3XFx1MkQyRFxcdTJEMzAtXFx1MkQ2N1xcdTJENkZcXHUyRDgwLVxcdTJEOTZcXHUyREEwLVxcdTJEQTZcXHUyREE4LVxcdTJEQUVcXHUyREIwLVxcdTJEQjZcXHUyREI4LVxcdTJEQkVcXHUyREMwLVxcdTJEQzZcXHUyREM4LVxcdTJEQ0VcXHUyREQwLVxcdTJERDZcXHUyREQ4LVxcdTJEREVcXHUyRTJGXFx1MzAwNVxcdTMwMDZcXHUzMDMxLVxcdTMwMzVcXHUzMDNCXFx1MzAzQ1xcdTMwNDEtXFx1MzA5NlxcdTMwOUQtXFx1MzA5RlxcdTMwQTEtXFx1MzBGQVxcdTMwRkMtXFx1MzBGRlxcdTMxMDUtXFx1MzEyRFxcdTMxMzEtXFx1MzE4RVxcdTMxQTAtXFx1MzFCQVxcdTMxRjAtXFx1MzFGRlxcdTM0MDAtXFx1NERCNVxcdTRFMDAtXFx1OUZDQ1xcdUEwMDAtXFx1QTQ4Q1xcdUE0RDAtXFx1QTRGRFxcdUE1MDAtXFx1QTYwQ1xcdUE2MTAtXFx1QTYxRlxcdUE2MkFcXHVBNjJCXFx1QTY0MC1cXHVBNjZFXFx1QTY3Ri1cXHVBNjk3XFx1QTZBMC1cXHVBNkU1XFx1QTcxNy1cXHVBNzFGXFx1QTcyMi1cXHVBNzg4XFx1QTc4Qi1cXHVBNzhFXFx1QTc5MC1cXHVBNzkzXFx1QTdBMC1cXHVBN0FBXFx1QTdGOC1cXHVBODAxXFx1QTgwMy1cXHVBODA1XFx1QTgwNy1cXHVBODBBXFx1QTgwQy1cXHVBODIyXFx1QTg0MC1cXHVBODczXFx1QTg4Mi1cXHVBOEIzXFx1QThGMi1cXHVBOEY3XFx1QThGQlxcdUE5MEEtXFx1QTkyNVxcdUE5MzAtXFx1QTk0NlxcdUE5NjAtXFx1QTk3Q1xcdUE5ODQtXFx1QTlCMlxcdUE5Q0ZcXHVBQTAwLVxcdUFBMjhcXHVBQTQwLVxcdUFBNDJcXHVBQTQ0LVxcdUFBNEJcXHVBQTYwLVxcdUFBNzZcXHVBQTdBXFx1QUE4MC1cXHVBQUFGXFx1QUFCMVxcdUFBQjVcXHVBQUI2XFx1QUFCOS1cXHVBQUJEXFx1QUFDMFxcdUFBQzJcXHVBQURCLVxcdUFBRERcXHVBQUUwLVxcdUFBRUFcXHVBQUYyLVxcdUFBRjRcXHVBQjAxLVxcdUFCMDZcXHVBQjA5LVxcdUFCMEVcXHVBQjExLVxcdUFCMTZcXHVBQjIwLVxcdUFCMjZcXHVBQjI4LVxcdUFCMkVcXHVBQkMwLVxcdUFCRTJcXHVBQzAwLVxcdUQ3QTNcXHVEN0IwLVxcdUQ3QzZcXHVEN0NCLVxcdUQ3RkJcXHVGOTAwLVxcdUZBNkRcXHVGQTcwLVxcdUZBRDlcXHVGQjAwLVxcdUZCMDZcXHVGQjEzLVxcdUZCMTdcXHVGQjFEXFx1RkIxRi1cXHVGQjI4XFx1RkIyQS1cXHVGQjM2XFx1RkIzOC1cXHVGQjNDXFx1RkIzRVxcdUZCNDBcXHVGQjQxXFx1RkI0M1xcdUZCNDRcXHVGQjQ2LVxcdUZCQjFcXHVGQkQzLVxcdUZEM0RcXHVGRDUwLVxcdUZEOEZcXHVGRDkyLVxcdUZEQzdcXHVGREYwLVxcdUZERkJcXHVGRTcwLVxcdUZFNzRcXHVGRTc2LVxcdUZFRkNcXHVGRjIxLVxcdUZGM0FcXHVGRjQxLVxcdUZGNUFcXHVGRjY2LVxcdUZGQkVcXHVGRkMyLVxcdUZGQzdcXHVGRkNBLVxcdUZGQ0ZcXHVGRkQyLVxcdUZGRDdcXHVGRkRBLVxcdUZGRENdLywgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyMDc1MDcwXHJcbiAgJyonOiAvLi9cclxufTtcclxuUGF0dGVybk1hc2suREVGX1RZUEVTID0ge1xyXG4gIElOUFVUOiAnaW5wdXQnLFxyXG4gIEZJWEVEOiAnZml4ZWQnXHJcbn1cclxuUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUiA9IHtcclxuICBzaG93OiAnbGF6eScsXHJcbiAgY2hhcjogJ18nXHJcbn07XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5pbXBvcnQge2V4dGVuZERldGFpbHNBZGp1c3RtZW50c30gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFBpcGVNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgc3VwZXIoZWwsIG9wdHMpO1xyXG5cclxuICAgIHRoaXMubXVsdGlwYXNzID0gb3B0cy5tdWx0aXBhc3M7XHJcblxyXG4gICAgdGhpcy5fY29tcGlsZWRNYXNrcyA9IHRoaXMubWFzay5tYXAobSA9PiBJTWFzay5NYXNrRmFjdG9yeShlbCwgbSkpO1xyXG4gIH1cclxuXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICB2YXIgcmVzID0gdGhpcy5fcGlwZShzdHIsIGRldGFpbHMpO1xyXG4gICAgaWYgKCF0aGlzLm11bHRpcGFzcykgcmV0dXJuIHJlcztcclxuXHJcbiAgICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcblxyXG4gICAgdmFyIHN0ZXBSZXM7XHJcbiAgICB2YXIgdGVtcFJlcyA9IHJlcztcclxuXHJcbiAgICB3aGlsZSAoc3RlcFJlcyAhPT0gdGVtcFJlcykge1xyXG4gICAgICBzdGVwUmVzID0gdGVtcFJlcztcclxuICAgICAgdGVtcFJlcyA9IHRoaXMuX3BpcGUoc3RlcFJlcywge1xyXG4gICAgICAgIGN1cnNvclBvczogc3RlcFJlcy5sZW5ndGgsXHJcbiAgICAgICAgb2xkVmFsdWU6IHN0ZXBSZXMsXHJcbiAgICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogc3RlcFJlcy5sZW5ndGhcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGRldGFpbHMuY3Vyc29yUG9zID0gY3Vyc29yUG9zIC0gKHJlcy5sZW5ndGggLSBzdGVwUmVzLmxlbmd0aCk7XHJcblxyXG4gICAgcmV0dXJuIHN0ZXBSZXM7XHJcbiAgfVxyXG5cclxuICBfcGlwZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29tcGlsZWRNYXNrcy5yZWR1Y2UoKHMsIG0pID0+IHtcclxuICAgICAgdmFyIGQgPSBleHRlbmREZXRhaWxzQWRqdXN0bWVudHMocywgZGV0YWlscyk7XHJcbiAgICAgIHZhciByZXMgPSBtLnJlc29sdmUocywgZCk7XHJcbiAgICAgIGRldGFpbHMuY3Vyc29yUG9zID0gZC5jdXJzb3JQb3M7XHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9LCBzdHIpO1xyXG4gIH1cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLl9jb21waWxlZE1hc2tzLmZvckVhY2gobSA9PiB7XHJcbiAgICAgIG0uYmluZEV2ZW50cygpO1xyXG4gICAgICAvLyBkaXNhYmxlIGJhc2VtYXNrIGV2ZW50cyBmb3IgY2hpbGQgbWFza3NcclxuICAgICAgQmFzZU1hc2sucHJvdG90eXBlLnVuYmluZEV2ZW50cy5hcHBseShtKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5fY29tcGlsZWRNYXNrcy5mb3JFYWNoKG0gPT4gbS51bmJpbmRFdmVudHMoKSk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7aXNTdHJpbmd9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vbWFza3MvYmFzZSc7XHJcbmltcG9ydCBSZWdFeHBNYXNrIGZyb20gJy4vbWFza3MvcmVnZXhwJztcclxuaW1wb3J0IEZ1bmNNYXNrIGZyb20gJy4vbWFza3MvZnVuYyc7XHJcbmltcG9ydCBQYXR0ZXJuTWFzayBmcm9tICcuL21hc2tzL3BhdHRlcm4nO1xyXG5pbXBvcnQgUGlwZU1hc2sgZnJvbSAnLi9tYXNrcy9waXBlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5mdW5jdGlvbiBJTWFzayAoZWwsIG9wdHM9e30pIHtcclxuICB2YXIgbWFzayA9IElNYXNrLk1hc2tGYWN0b3J5KGVsLCBvcHRzKTtcclxuICBtYXNrLmJpbmRFdmVudHMoKTtcclxuICAvLyByZWZyZXNoXHJcbiAgbWFzay5yYXdWYWx1ZSA9IGVsLnZhbHVlO1xyXG4gIHJldHVybiBtYXNrO1xyXG59XHJcblxyXG5JTWFzay5NYXNrRmFjdG9yeSA9IGZ1bmN0aW9uIChlbCwgb3B0cykge1xyXG4gIHZhciBtYXNrID0gb3B0cy5tYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgQmFzZU1hc2spIHJldHVybiBtYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gbmV3IFJlZ0V4cE1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgQXJyYXkpIHJldHVybiBuZXcgUGlwZU1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChpc1N0cmluZyhtYXNrKSkgcmV0dXJuIG5ldyBQYXR0ZXJuTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKG1hc2sucHJvdG90eXBlIGluc3RhbmNlb2YgQmFzZU1hc2spIHJldHVybiBuZXcgbWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBGdW5jdGlvbikgcmV0dXJuIG5ldyBGdW5jTWFzayhlbCwgb3B0cyk7XHJcbiAgcmV0dXJuIG5ldyBCYXNlTWFzayhlbCwgb3B0cyk7XHJcbn1cclxuSU1hc2suQmFzZU1hc2sgPSBCYXNlTWFzaztcclxuSU1hc2suRnVuY01hc2sgPSBGdW5jTWFzaztcclxuSU1hc2suUmVnRXhwTWFzayA9IFJlZ0V4cE1hc2s7XHJcbklNYXNrLlBhdHRlcm5NYXNrID0gUGF0dGVybk1hc2s7XHJcbndpbmRvdy5JTWFzayA9IElNYXNrO1xyXG4iXSwibmFtZXMiOlsiaXNTdHJpbmciLCJzdHIiLCJTdHJpbmciLCJjb25mb3JtIiwicmVzIiwiZmFsbGJhY2siLCJleHRlbmREZXRhaWxzQWRqdXN0bWVudHMiLCJkZXRhaWxzIiwiY3Vyc29yUG9zIiwib2xkU2VsZWN0aW9uIiwib2xkVmFsdWUiLCJzdGFydENoYW5nZVBvcyIsIk1hdGgiLCJtaW4iLCJzdGFydCIsImluc2VydGVkQ291bnQiLCJyZW1vdmVkQ291bnQiLCJtYXgiLCJlbmQiLCJsZW5ndGgiLCJoZWFkIiwic3Vic3RyaW5nIiwidGFpbCIsImluc2VydGVkIiwic3Vic3RyIiwicmVtb3ZlZCIsIkJhc2VNYXNrIiwiZWwiLCJvcHRzIiwibWFzayIsIl9saXN0ZW5lcnMiLCJfcmVmcmVzaGluZ0NvdW50IiwiX3Jhd1ZhbHVlIiwiX3VubWFza2VkVmFsdWUiLCJzYXZlU2VsZWN0aW9uIiwiYmluZCIsIl9vbklucHV0IiwiX29uRHJvcCIsImV2IiwiaGFuZGxlciIsInB1c2giLCJoSW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJsaXN0ZW5lcnMiLCJmb3JFYWNoIiwibCIsImlucHV0VmFsdWUiLCJfc2VsZWN0aW9uIiwicmF3VmFsdWUiLCJ1bm1hc2tlZFZhbHVlIiwicmVzb2x2ZSIsInVwZGF0ZUVsZW1lbnQiLCJ2YWx1ZSIsIndhcm4iLCJzZWxlY3Rpb25TdGFydCIsInVuYmluZEV2ZW50cyIsIl9jYWxjVW5tYXNrZWQiLCJpc0NoYW5nZWQiLCJ1cGRhdGVDdXJzb3IiLCJfZmlyZUNoYW5nZUV2ZW50cyIsImZpcmVFdmVudCIsIl9kZWxheVVwZGF0ZUN1cnNvciIsIl9hYm9ydFVwZGF0ZUN1cnNvciIsIl9jaGFuZ2luZ0N1cnNvclBvcyIsIl9jdXJzb3JDaGFuZ2luZyIsInNldFRpbWVvdXQiLCJwcm9jZXNzSW5wdXQiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInNlbGVjdGlvbkVuZCIsInBvcyIsInNldFNlbGVjdGlvblJhbmdlIiwiUmVnRXhwTWFzayIsInRlc3QiLCJGdW5jTWFzayIsIlBhdHRlcm5NYXNrIiwiX2hvbGxvd3MiLCJwbGFjZWhvbGRlciIsImRlZmluaXRpb25zIiwiREVGSU5JVElPTlMiLCJfYWxpZ25DdXJzb3IiLCJfYWxpZ25DdXJzb3JGcmllbmRseSIsIl9pbml0aWFsaXplZCIsIl9kZWZpbml0aW9ucyIsIl9jaGFyRGVmcyIsInBhdHRlcm4iLCJ1bm1hc2tpbmdCbG9jayIsIm9wdGlvbmFsQmxvY2siLCJpIiwiY2giLCJ0eXBlIiwiREVGX1RZUEVTIiwiSU5QVVQiLCJGSVhFRCIsInVubWFza2luZyIsIm9wdGlvbmFsIiwiX2J1aWxkUmVzb2x2ZXJzIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiTWFza0ZhY3RvcnkiLCJza2lwVW5yZXNvbHZlZElucHV0IiwicGxhY2Vob2xkZXJCdWZmZXIiLCJob2xsb3dzIiwic2xpY2UiLCJvdmVyZmxvdyIsImNpIiwiZGkiLCJfbWFwUG9zVG9EZWZJbmRleCIsImRlZiIsInJlc29sdmVyIiwiY2hhciIsImNocmVzIiwiaXNSZXNvbHZlZCIsIl9wbGFjZWhvbGRlciIsImZyb21Qb3MiLCJpbnB1dCIsIl9pc0hpZGRlbkhvbGxvdyIsIl9pc0hvbGxvdyIsImRlZkluZGV4IiwiZmlsdGVyIiwiaCIsIl9ob2xsb3dzQmVmb3JlIiwiaGkiLCJpbnNlcnRTdGVwcyIsIl9hcHBlbmRUYWlsIiwidGFpbElucHV0IiwiX2V4dHJhY3RJbnB1dCIsImxhc3RIb2xsb3dJbmRleCIsIl9nZW5lcmF0ZUluc2VydFN0ZXBzIiwiaXN0ZXAiLCJzdGVwIiwidHJlcyIsInRob2xsb3dzIiwiYXBwZW5kZWQiLCJfYXBwZW5kRml4ZWRFbmQiLCJoYXNIb2xsb3dzIiwiX2FwcGVuZFBsYWNlaG9sZGVyRW5kIiwiaXNDb21wbGV0ZSIsInNob3ciLCJ1bm1hc2tlZCIsImN1cnNvckRlZkluZGV4IiwiclBvcyIsInJEZWYiLCJsUG9zIiwibERlZiIsIl9tYXBEZWZJbmRleFRvUG9zIiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50IiwicGgiLCJERUZBVUxUX1BMQUNFSE9MREVSIiwibWFwIiwiam9pbiIsImRlZnMiLCJfaW5zdGFsbERlZmluaXRpb25zIiwiX21hc2siLCJQaXBlTWFzayIsIm11bHRpcGFzcyIsIl9jb21waWxlZE1hc2tzIiwibSIsIl9waXBlIiwic3RlcFJlcyIsInRlbXBSZXMiLCJyZWR1Y2UiLCJzIiwiZCIsImJpbmRFdmVudHMiLCJwcm90b3R5cGUiLCJhcHBseSIsIlJlZ0V4cCIsIkFycmF5IiwiRnVuY3Rpb24iLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLFNBQVNBLFFBQVQsQ0FBbUJDLEdBQW5CLEVBQXdCO1NBQ2YsT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLGVBQWVDLE1BQWpEOzs7QUFHRixBQUNBLFNBQVNDLE9BQVQsQ0FBa0JDLEdBQWxCLEVBQXVCSCxHQUF2QixFQUF5QztNQUFiSSxRQUFhLHVFQUFKLEVBQUk7O1NBQ2hDTCxTQUFTSSxHQUFULElBQ0xBLEdBREssR0FFTEEsTUFDRUgsR0FERixHQUVFSSxRQUpKOzs7QUFPRixBQUNBLFNBQVNDLHdCQUFULENBQWtDTCxHQUFsQyxFQUF1Q00sT0FBdkMsRUFBZ0Q7TUFDMUNDLFlBQVlELFFBQVFDLFNBQXhCO01BQ0lDLGVBQWVGLFFBQVFFLFlBQTNCO01BQ0lDLFdBQVdILFFBQVFHLFFBQXZCOztNQUVJQyxpQkFBaUJDLEtBQUtDLEdBQUwsQ0FBU0wsU0FBVCxFQUFvQkMsYUFBYUssS0FBakMsQ0FBckI7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