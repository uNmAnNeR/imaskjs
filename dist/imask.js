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
        this.cursorPos = cursorPos;

        // also queue change cursor for mobile browsers
        if (this._cursorChanging) clearTimeout(this._cursorChanging);
        if (this.cursorPos != cursorPos) {
          this._changingCursorPos = cursorPos;
          this._cursorChanging = setTimeout(function () {
            _this.cursorPos = _this._changingCursorPos;
            delete _this._cursorChanging;
          }, 10);
        }
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
          if (ch === def.char) ++ci;
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
  if (mask instanceof Function) return new FuncMask(el, opts);
  if (mask instanceof Array) return new PipeMask(el, opts);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvcGlwZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL2ltYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydFxyXG5mdW5jdGlvbiBpc1N0cmluZyAoc3RyKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnIHx8IHN0ciBpbnN0YW5jZW9mIFN0cmluZztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGNvbmZvcm0gKHJlcywgc3RyLCBmYWxsYmFjaz0nJykge1xyXG4gIHJldHVybiBpc1N0cmluZyhyZXMpID9cclxuICAgIHJlcyA6XHJcbiAgICByZXMgP1xyXG4gICAgICBzdHIgOlxyXG4gICAgICBmYWxsYmFjaztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGV4dGVuZERldGFpbHNBZGp1c3RtZW50cyhzdHIsIGRldGFpbHMpIHtcclxuICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgdmFyIG9sZFNlbGVjdGlvbiA9IGRldGFpbHMub2xkU2VsZWN0aW9uO1xyXG4gIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcblxyXG4gIHZhciBzdGFydENoYW5nZVBvcyA9IE1hdGgubWluKGN1cnNvclBvcywgb2xkU2VsZWN0aW9uLnN0YXJ0KTtcclxuICB2YXIgaW5zZXJ0ZWRDb3VudCA9IGN1cnNvclBvcyAtIHN0YXJ0Q2hhbmdlUG9zO1xyXG4gIC8vIE1hdGgubWF4IGZvciBvcHBvc2l0ZSBvcGVyYXRpb25cclxuICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgIC8vIGZvciBEZWxldGVcclxuICAgIG9sZFZhbHVlLmxlbmd0aCAtIHN0ci5sZW5ndGgsIDApO1xyXG4gIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyk7XHJcbiAgdmFyIHRhaWwgPSBzdHIuc3Vic3RyaW5nKHN0YXJ0Q2hhbmdlUG9zICsgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIGluc2VydGVkID0gc3RyLnN1YnN0cihzdGFydENoYW5nZVBvcywgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIHJlbW92ZWQgPSBzdHIuc3Vic3RyKHN0YXJ0Q2hhbmdlUG9zLCByZW1vdmVkQ291bnQpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc3RhcnRDaGFuZ2VQb3MsXHJcbiAgICBoZWFkLFxyXG4gICAgdGFpbCxcclxuICAgIGluc2VydGVkLFxyXG4gICAgcmVtb3ZlZCxcclxuICAgIC4uLmRldGFpbHNcclxuICB9O1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybSwgZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgdGhpcy5fcmVmcmVzaGluZ0NvdW50ID0gMDtcclxuICAgIHRoaXMuX3Jhd1ZhbHVlID0gXCJcIjtcclxuICAgIHRoaXMuX3VubWFza2VkVmFsdWUgPSBcIlwiO1xyXG5cclxuICAgIHRoaXMuc2F2ZVNlbGVjdGlvbiA9IHRoaXMuc2F2ZVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fb25JbnB1dCA9IHRoaXMuX29uSW5wdXQuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuX29uRHJvcCA9IHRoaXMuX29uRHJvcC5iaW5kKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgb24gKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHRoaXMuX2xpc3RlbmVyc1tldl0gPSBbXTtcclxuICAgIHRoaXMuX2xpc3RlbmVyc1tldl0ucHVzaChoYW5kbGVyKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgb2ZmIChldiwgaGFuZGxlcikge1xyXG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbZXZdKSByZXR1cm47XHJcbiAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tldl07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBoSW5kZXggPSB0aGlzLl9saXN0ZW5lcnNbZXZdLmluZGV4T2YoaGFuZGxlcik7XHJcbiAgICBpZiAoaEluZGV4ID49IDApIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaEluZGV4LCAxKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHJhd1ZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9yYXdWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCByYXdWYWx1ZSAoc3RyKSB7XHJcbiAgICB0aGlzLnByb2Nlc3NJbnB1dChzdHIsIHtcclxuICAgICAgY3Vyc29yUG9zOiBzdHIubGVuZ3RoLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5yYXdWYWx1ZSxcclxuICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiB0aGlzLnJhd1ZhbHVlLmxlbmd0aFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCB1bm1hc2tlZFZhbHVlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl91bm1hc2tlZFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHZhbHVlKSB7XHJcbiAgICB0aGlzLnJhd1ZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnNhdmVTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICB9XHJcblxyXG4gIHVuYmluZEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnNhdmVTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICB9XHJcblxyXG4gIGZpcmVFdmVudCAoZXYpIHtcclxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZdIHx8IFtdO1xyXG4gICAgbGlzdGVuZXJzLmZvckVhY2gobCA9PiBsKCkpO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChpbnB1dFZhbHVlLCBkZXRhaWxzKSB7XHJcbiAgICBkZXRhaWxzID0ge1xyXG4gICAgICBjdXJzb3JQb3M6IHRoaXMuY3Vyc29yUG9zLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHRoaXMuX3NlbGVjdGlvbixcclxuICAgICAgb2xkVmFsdWU6IHRoaXMucmF3VmFsdWUsXHJcbiAgICAgIG9sZFVubWFza2VkVmFsdWU6IHRoaXMudW5tYXNrZWRWYWx1ZSxcclxuICAgICAgLi4uZGV0YWlsc1xyXG4gICAgfTtcclxuXHJcbiAgICBkZXRhaWxzID0gZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzKGlucHV0VmFsdWUsIGRldGFpbHMpO1xyXG5cclxuICAgIHZhciByZXMgPSBjb25mb3JtKHRoaXMucmVzb2x2ZShpbnB1dFZhbHVlLCBkZXRhaWxzKSxcclxuICAgICAgaW5wdXRWYWx1ZSxcclxuICAgICAgdGhpcy5yYXdWYWx1ZSk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVFbGVtZW50KHJlcywgZGV0YWlscy5jdXJzb3JQb3MpO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG5cclxuICBnZXQgc2VsZWN0aW9uU3RhcnQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID9cclxuICAgICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOlxyXG5cclxuICAgICAgdGhpcy5lbC5zZWxlY3Rpb25TdGFydDtcclxuICB9XHJcblxyXG4gIGdldCBjdXJzb3JQb3MgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckNoYW5naW5nID9cclxuICAgICAgdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3MgOlxyXG5cclxuICAgICAgdGhpcy5lbC5zZWxlY3Rpb25FbmQ7XHJcbiAgfVxyXG5cclxuICBzZXQgY3Vyc29yUG9zIChwb3MpIHtcclxuICAgIHRoaXMuZWwuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MpO1xyXG4gIH1cclxuXHJcbiAgc2F2ZVNlbGVjdGlvbiAoZXYpIHtcclxuICAgIGlmICh0aGlzLnJhd1ZhbHVlICE9PSB0aGlzLmVsLnZhbHVlKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihcIlVuY29udHJvbGxlZCBpbnB1dCBjaGFuZ2UsIHJlZnJlc2ggbWFzayBtYW51YWxseSFcIik7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9zZWxlY3Rpb24gPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNlbGVjdGlvblN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuY3Vyc29yUG9zXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZGVzdHJveSAoKSB7XHJcbiAgICB0aGlzLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVFbGVtZW50ICh2YWx1ZSwgY3Vyc29yUG9zKSB7XHJcbiAgICB2YXIgdW5tYXNrZWRWYWx1ZSA9IHRoaXMuX2NhbGNVbm1hc2tlZCh2YWx1ZSk7XHJcbiAgICB2YXIgaXNDaGFuZ2VkID0gKHRoaXMudW5tYXNrZWRWYWx1ZSAhPT0gdW5tYXNrZWRWYWx1ZSB8fFxyXG4gICAgICB0aGlzLnJhd1ZhbHVlICE9PSB2YWx1ZSk7XHJcblxyXG4gICAgdGhpcy5fdW5tYXNrZWRWYWx1ZSA9IHVubWFza2VkVmFsdWU7XHJcbiAgICB0aGlzLl9yYXdWYWx1ZSA9IHZhbHVlO1xyXG5cclxuICAgIGlmICh0aGlzLmVsLnZhbHVlICE9PSB2YWx1ZSkgdGhpcy5lbC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgaWYgKHRoaXMuY3Vyc29yUG9zICE9IGN1cnNvclBvcyAmJiBjdXJzb3JQb3MgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLmN1cnNvclBvcyA9IGN1cnNvclBvcztcclxuXHJcbiAgICAgIC8vIGFsc28gcXVldWUgY2hhbmdlIGN1cnNvciBmb3IgbW9iaWxlIGJyb3dzZXJzXHJcbiAgICAgIGlmICh0aGlzLl9jdXJzb3JDaGFuZ2luZykgY2xlYXJUaW1lb3V0KHRoaXMuX2N1cnNvckNoYW5naW5nKTtcclxuICAgICAgaWYgKHRoaXMuY3Vyc29yUG9zICE9IGN1cnNvclBvcykge1xyXG4gICAgICAgIHRoaXMuX2NoYW5naW5nQ3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG4gICAgICAgIHRoaXMuX2N1cnNvckNoYW5naW5nID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmN1cnNvclBvcyA9IHRoaXMuX2NoYW5naW5nQ3Vyc29yUG9zO1xyXG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2N1cnNvckNoYW5naW5nO1xyXG4gICAgICAgIH0sIDEwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zYXZlU2VsZWN0aW9uKCk7XHJcblxyXG4gICAgaWYgKGlzQ2hhbmdlZCkgdGhpcy5fZmlyZUNoYW5nZUV2ZW50cygpO1xyXG4gIH1cclxuXHJcbiAgX2ZpcmVDaGFuZ2VFdmVudHMgKCkge1xyXG4gICAgdGhpcy5maXJlRXZlbnQoXCJhY2NlcHRcIik7XHJcbiAgfVxyXG5cclxuICBfb25JbnB1dCAoZXYpIHtcclxuICAgIHRoaXMucHJvY2Vzc0lucHV0KHRoaXMuZWwudmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgX29uRHJvcCAoZXYpIHtcclxuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8vIG92ZXJyaWRlXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7IHJldHVybiBzdHI7IH1cclxuXHJcbiAgX2NhbGNVbm1hc2tlZCAodmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUmVnRXhwTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlIChzdHIpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2sudGVzdChzdHIpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBGdW5jTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlICguLi5hcmdzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrKC4uLmFyZ3MpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge2NvbmZvcm19IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGF0dGVybk1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICBzdXBlcihlbCwgb3B0cyk7XHJcblxyXG4gICAgdGhpcy5faG9sbG93cyA9IFtdO1xyXG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IG9wdHMucGxhY2Vob2xkZXI7XHJcbiAgICB0aGlzLmRlZmluaXRpb25zID0ge1xyXG4gICAgICAuLi5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyxcclxuICAgICAgLi4ub3B0cy5kZWZpbml0aW9uc1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvciA9IHRoaXMuX2FsaWduQ3Vyc29yLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5ID0gdGhpcy5fYWxpZ25DdXJzb3JGcmllbmRseS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIF9hbGlnbkN1cnNvckZyaWVuZGx5ICgpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGlvblN0YXJ0ICE9PSB0aGlzLmN1cnNvclBvcykgcmV0dXJuO1xyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IoKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgX2luc3RhbGxEZWZpbml0aW9ucyAoZGVmaW5pdGlvbnMpIHtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmaW5pdGlvbnM7XHJcbiAgICB0aGlzLl9jaGFyRGVmcyA9IFtdO1xyXG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLm1hc2s7XHJcblxyXG4gICAgaWYgKCFwYXR0ZXJuIHx8ICFkZWZpbml0aW9ucykgcmV0dXJuO1xyXG5cclxuICAgIHZhciB1bm1hc2tpbmdCbG9jayA9IGZhbHNlO1xyXG4gICAgdmFyIG9wdGlvbmFsQmxvY2sgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgIHZhciB0eXBlID0gIXVubWFza2luZ0Jsb2NrICYmIGNoIGluIGRlZmluaXRpb25zID9cclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgOlxyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgdmFyIHVubWFza2luZyA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCB8fCB1bm1hc2tpbmdCbG9jaztcclxuICAgICAgdmFyIG9wdGlvbmFsID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIG9wdGlvbmFsQmxvY2s7XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICd7JyB8fCBjaCA9PT0gJ30nKSB7XHJcbiAgICAgICAgdW5tYXNraW5nQmxvY2sgPSAhdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1snIHx8IGNoID09PSAnXScpIHtcclxuICAgICAgICBvcHRpb25hbEJsb2NrID0gIW9wdGlvbmFsQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1xcXFwnKSB7XHJcbiAgICAgICAgKytpO1xyXG4gICAgICAgIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgICAvLyBUT0RPIHZhbGlkYXRpb25cclxuICAgICAgICBpZiAoIWNoKSBicmVhaztcclxuICAgICAgICB0eXBlID0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jaGFyRGVmcy5wdXNoKHtcclxuICAgICAgICBjaGFyOiBjaCxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcclxuICAgICAgICB1bm1hc2tpbmc6IHVubWFza2luZ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG4gIH1cclxuXHJcbiAgX2J1aWxkUmVzb2x2ZXJzICgpIHtcclxuICAgIHRoaXMuX3Jlc29sdmVycyA9IHt9O1xyXG4gICAgZm9yICh2YXIgZGVmS2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgdGhpcy5fcmVzb2x2ZXJzW2RlZktleV0gPSBJTWFzay5NYXNrRmFjdG9yeSh0aGlzLmVsLCB7XHJcbiAgICAgICAgbWFzazogdGhpcy5kZWZpbml0aW9uc1tkZWZLZXldXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFRhaWwgKHN0ciwgdGFpbCkge1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoc3RyLmxlbmd0aCk7IGNpIDwgdGFpbC5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gdGFpbFtjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICAvLyBmYWlsZWRcclxuICAgICAgaWYgKCFkZWYpIHtcclxuICAgICAgICBvdmVyZmxvdyA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgdmFyIHJlc29sdmVyID0gdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXTtcclxuICAgICAgICB2YXIgY2hyZXMgPSByZXNvbHZlci5yZXNvbHZlKGNoLCBkaSwgc3RyKSB8fCAnJztcclxuICAgICAgICBpZiAoY2hyZXMpIHtcclxuICAgICAgICAgIGNocmVzID0gY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgICAgKytjaTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKCFkZWYub3B0aW9uYWwpIGNocmVzID0gdGhpcy5fcGxhY2Vob2xkZXIuY2hhcjtcclxuICAgICAgICAgIGhvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0ciArPSBwbGFjZWhvbGRlckJ1ZmZlciArIGNocmVzO1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcbiAgICAgICAgaWYgKGNoID09PSBkZWYuY2hhcikgKytjaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbc3RyLCBob2xsb3dzLCBvdmVyZmxvd107XHJcbiAgfVxyXG5cclxuICBfZXh0cmFjdElucHV0IChzdHIsIGZyb21Qb3M9MCkge1xyXG4gICAgdmFyIGlucHV0ID0gJyc7XHJcblxyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9dGhpcy5fbWFwUG9zVG9EZWZJbmRleChmcm9tUG9zKTsgY2k8c3RyLmxlbmd0aCAmJiBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgIXRoaXMuX2lzSG9sbG93KGRpKSkgaW5wdXQgKz0gY2g7XHJcbiAgICAgICsrY2k7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBfaXNIb2xsb3cgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5faG9sbG93cy5pbmRleE9mKGRlZkluZGV4KSA+PSAwO1xyXG4gIH1cclxuXHJcbiAgX2lzSGlkZGVuSG9sbG93IChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2lzSG9sbG93KGRlZkluZGV4KSAmJlxyXG4gICAgICB0aGlzLl9jaGFyRGVmc1tkZWZJbmRleF0gJiYgdGhpcy5fY2hhckRlZnNbZGVmSW5kZXhdLm9wdGlvbmFsO1xyXG4gIH1cclxuXHJcbiAgX2hvbGxvd3NCZWZvcmUgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgZGVmSW5kZXggJiYgdGhpcy5faXNIaWRkZW5Ib2xsb3coaCkpO1xyXG4gIH1cclxuXHJcbiAgX21hcERlZkluZGV4VG9Qb3MgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gZGVmSW5kZXggLSB0aGlzLl9ob2xsb3dzQmVmb3JlKGRlZkluZGV4KS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBfbWFwUG9zVG9EZWZJbmRleCAocG9zKSB7XHJcbiAgICB2YXIgbGFzdEhvbGxvd0luZGV4ID0gcG9zO1xyXG4gICAgLy8gZXh0ZW5kIGNvbnRpZ3VvdXNcclxuICAgIHdoaWxlICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhsYXN0SG9sbG93SW5kZXgtMSkpICsrbGFzdEhvbGxvd0luZGV4O1xyXG5cclxuICAgIHJldHVybiBwb3MgKyB0aGlzLl9ob2xsb3dzQmVmb3JlKGxhc3RIb2xsb3dJbmRleCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX2dlbmVyYXRlSW5zZXJ0U3RlcHMgKGhlYWQsIGluc2VydGVkKSB7XHJcbiAgICB2YXIgcmVzID0gaGVhZDtcclxuICAgIHZhciBob2xsb3dzID0gdGhpcy5faG9sbG93cy5zbGljZSgpO1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaW5zZXJ0U3RlcHMgPSBbW3JlcywgaG9sbG93cy5zbGljZSgpXV07XHJcblxyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9dGhpcy5fbWFwUG9zVG9EZWZJbmRleChoZWFkLmxlbmd0aCk7IGNpPGluc2VydGVkLmxlbmd0aDspIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgaWYgKCFkZWYpIGJyZWFrO1xyXG5cclxuICAgICAgdmFyIGNoID0gaW5zZXJ0ZWRbY2ldO1xyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgY2ksIHJlcykgfHwgJyc7XHJcbiAgICAgICAgLy8gaWYgb2sgLSBuZXh0IGRpXHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICByZXMgKz0gcGxhY2Vob2xkZXJCdWZmZXIgKyBjb25mb3JtKGNocmVzLCBjaCk7IHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICAgICAgICBpbnNlcnRTdGVwcy5wdXNoKFtyZXMsIGhvbGxvd3Muc2xpY2UoKV0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGVmLm9wdGlvbmFsKSB7XHJcbiAgICAgICAgICBpZiAoaG9sbG93cy5pbmRleE9mKGRpKSA8IDApIGhvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjaHJlcyB8fCBkZWYub3B0aW9uYWwpICsrZGk7XHJcbiAgICAgICAgaWYgKGNocmVzIHx8ICFkZWYub3B0aW9uYWwpICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcblxyXG4gICAgICAgIGlmIChjaCA9PT0gZGVmLmNoYXIpICsrY2k7XHJcbiAgICAgICAgKytkaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnNlcnRTdGVwcztcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgdmFyIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgdmFyIHN0YXJ0Q2hhbmdlUG9zID0gZGV0YWlscy5zdGFydENoYW5nZVBvcztcclxuICAgIHZhciBpbnNlcnRlZCA9IGRldGFpbHMuaW5zZXJ0ZWQ7XHJcbiAgICB2YXIgcmVtb3ZlZENvdW50ID0gZGV0YWlscy5yZW1vdmVkLmxlbmd0aDtcclxuICAgIHZhciB0YWlsSW5wdXQgPSB0aGlzLl9leHRyYWN0SW5wdXQoZGV0YWlscy50YWlsLCBzdGFydENoYW5nZVBvcyArIHJlbW92ZWRDb3VudCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhvbGxvd3MgYWZ0ZXIgY3Vyc29yXHJcbiAgICB2YXIgbGFzdEhvbGxvd0luZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChzdGFydENoYW5nZVBvcyk7XHJcbiAgICB0aGlzLl9ob2xsb3dzID0gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgbGFzdEhvbGxvd0luZGV4KTtcclxuXHJcbiAgICB2YXIgcmVzID0gZGV0YWlscy5oZWFkO1xyXG5cclxuICAgIC8vIGluc2VydCBhdmFpbGFibGVcclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IHRoaXMuX2dlbmVyYXRlSW5zZXJ0U3RlcHMocmVzLCBpbnNlcnRlZCk7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcDtcclxuICAgICAgW3N0ZXAsIHRoaXMuX2hvbGxvd3NdID0gaW5zZXJ0U3RlcHNbaXN0ZXBdO1xyXG4gICAgICB2YXIgW3RyZXMsIHRob2xsb3dzLCBvdmVyZmxvd10gPSB0aGlzLl9hcHBlbmRUYWlsKHN0ZXAsIHRhaWxJbnB1dCk7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cpIHtcclxuICAgICAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IFt0cmVzLCB0aG9sbG93c107XHJcbiAgICAgICAgY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBpbnB1dCBhdCB0aGUgZW5kIC0gYXBwZW5kIGZpeGVkXHJcbiAgICBpZiAoaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIGFwcGVuZCBmaXhlZCBhdCBlbmRcclxuICAgICAgdmFyIGFwcGVuZGVkID0gdGhpcy5fYXBwZW5kRml4ZWRFbmQocmVzKTtcclxuICAgICAgY3Vyc29yUG9zICs9IGFwcGVuZGVkLmxlbmd0aCAtIHJlcy5sZW5ndGg7XHJcbiAgICAgIHJlcyA9IGFwcGVuZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaW5zZXJ0ZWQgJiYgcmVtb3ZlZENvdW50KSB7XHJcbiAgICAgIC8vIGlmIGRlbGV0ZSBhdCByaWdodFxyXG4gICAgICBpZiAoZGV0YWlscy5vbGRTZWxlY3Rpb24uZW5kID09PSBjdXJzb3JQb3MpIHtcclxuICAgICAgICBmb3IgKDs7KytjdXJzb3JQb3MpIHtcclxuICAgICAgICAgIHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGN1cnNvclBvcyk7XHJcbiAgICAgICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICAgICAgaWYgKCFkZWYgfHwgZGVmLnR5cGUgIT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCkgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZW1vdmUgaGVhZCBmaXhlZCBhbmQgaG9sbG93cyBpZiByZW1vdmVkIGF0IGVuZFxyXG4gICAgICBpZiAoY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGRpID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChjdXJzb3JQb3MtMSk7XHJcbiAgICAgICAgdmFyIGhhc0hvbGxvd3MgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKDsgZGkgPiAwOyAtLWRpKSB7XHJcbiAgICAgICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzSG9sbG93KGRpKSkgaGFzSG9sbG93cyA9IHRydWU7XHJcbiAgICAgICAgICAgIGVsc2UgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYXNIb2xsb3dzKSByZXMgPSByZXMuc2xpY2UoMCwgZGkgKyAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFwcGVuZCBwbGFjZWhvbGRlclxyXG4gICAgcmVzID0gdGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKTtcclxuICAgIGRldGFpbHMuY3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG5cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBfZmlyZUNoYW5nZUV2ZW50cyAoKSB7XHJcbiAgICAvLyBmaXJlICdjb21wbGV0ZScgYWZ0ZXIgJ2FjY2VwdCcgZXZlbnRcclxuICAgIHN1cGVyLl9maXJlQ2hhbmdlRXZlbnRzKCk7XHJcbiAgICBpZiAodGhpcy5pc0NvbXBsZXRlKSB0aGlzLmZpcmVFdmVudChcImNvbXBsZXRlXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzQ29tcGxldGUgKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLl9jaGFyRGVmcy5maWx0ZXIoKGRlZiwgZGkpID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgIWRlZi5vcHRpb25hbCAmJlxyXG4gICAgICB0aGlzLl9pc0hvbGxvdyhkaSkpLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIF9hcHBlbmRGaXhlZEVuZCAocmVzKSB7XHJcbiAgICBmb3IgKHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHJlcy5sZW5ndGgpOzsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIGJyZWFrO1xyXG4gICAgICBpZiAoZGkgPj0gcmVzLmxlbmd0aCkgcmVzICs9IGRlZi5jaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9hcHBlbmRQbGFjZWhvbGRlckVuZCAocmVzKSB7XHJcbiAgICBmb3IgKHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHJlcy5sZW5ndGgpOyBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgIXRoaXMuX2lzSG9sbG93KGRpKSkge1xyXG4gICAgICAgIHRoaXMuX2hvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuX3BsYWNlaG9sZGVyLnNob3cgPT09ICdhbHdheXMnKSB7XHJcbiAgICAgICAgcmVzICs9IGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgICAgZGVmLmNoYXIgOlxyXG4gICAgICAgICAgIWRlZi5vcHRpb25hbCA/XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgICAnJztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9jYWxjVW5tYXNrZWQgKHN0cikge1xyXG4gICAgdmFyIHVubWFza2VkID0gJyc7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT0wOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGRpKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoZGVmLnVubWFza2luZyAmJiAhdGhpcy5faXNIb2xsb3coZGkpICYmXHJcbiAgICAgICAgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXS5yZXNvbHZlKGNoLCBjaSwgc3RyKSB8fFxyXG4gICAgICAgICAgZGVmLmNoYXIgPT09IGNoKSkge1xyXG4gICAgICAgIHVubWFza2VkICs9IGNoO1xyXG4gICAgICB9XHJcbiAgICAgICsrY2k7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5tYXNrZWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fdW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuX2hvbGxvd3MubGVuZ3RoID0gMDtcclxuICAgIHZhciByZXM7XHJcbiAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IHRoaXMuX2FwcGVuZFRhaWwoJycsIHN0cik7XHJcbiAgICB0aGlzLnVwZGF0ZUVsZW1lbnQodGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgcGxhY2Vob2xkZXIgKCkgeyByZXR1cm4gdGhpcy5fcGxhY2Vob2xkZXI7IH1cclxuXHJcbiAgc2V0IHBsYWNlaG9sZGVyIChwaCkge1xyXG4gICAgdGhpcy5fcGxhY2Vob2xkZXIgPSB7XHJcbiAgICAgIC4uLlBhdHRlcm5NYXNrLkRFRkFVTFRfUExBQ0VIT0xERVIsXHJcbiAgICAgIC4uLnBoXHJcbiAgICB9O1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB0aGlzLnVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXQgcGxhY2Vob2xkZXJMYWJlbCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY2hhckRlZnMubWFwKGRlZiA9PlxyXG4gICAgICBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEID9cclxuICAgICAgICBkZWYuY2hhciA6XHJcbiAgICAgICAgIWRlZi5vcHRpb25hbCA/XHJcbiAgICAgICAgICB0aGlzLl9wbGFjZWhvbGRlci5jaGFyIDpcclxuICAgICAgICAgICcnKS5qb2luKCcnKTtcclxuICB9XHJcblxyXG4gIGdldCBkZWZpbml0aW9ucyAoKSB7IHJldHVybiB0aGlzLl9kZWZpbml0aW9uczsgfVxyXG5cclxuICBzZXQgZGVmaW5pdGlvbnMgKGRlZnMpIHtcclxuICAgIHRoaXMuX2luc3RhbGxEZWZpbml0aW9ucyhkZWZzKTtcclxuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgdGhpcy51bm1hc2tlZFZhbHVlID0gdGhpcy51bm1hc2tlZFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IG1hc2sgKCkgeyByZXR1cm4gdGhpcy5fbWFzazsgfVxyXG5cclxuICBzZXQgbWFzayAobWFzaykge1xyXG4gICAgdGhpcy5fbWFzayA9IG1hc2s7XHJcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHRoaXMuZGVmaW5pdGlvbnMgPSB0aGlzLmRlZmluaXRpb25zO1xyXG4gIH1cclxuXHJcbiAgX2FsaWduQ3Vyc29yICgpIHtcclxuICAgIHZhciBjdXJzb3JEZWZJbmRleCA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgodGhpcy5jdXJzb3JQb3MpO1xyXG4gICAgZm9yICh2YXIgclBvcyA9IGN1cnNvckRlZkluZGV4OyByUG9zID49IDA7IC0tclBvcykge1xyXG4gICAgICB2YXIgckRlZiA9IHRoaXMuX2NoYXJEZWZzW3JQb3NdO1xyXG4gICAgICB2YXIgbFBvcyA9IHJQb3MtMTtcclxuICAgICAgdmFyIGxEZWYgPSB0aGlzLl9jaGFyRGVmc1tsUG9zXTtcclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGxQb3MpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmICgoIXJEZWYgfHwgckRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgdGhpcy5faXNIb2xsb3coclBvcykgJiYgIXRoaXMuX2lzSGlkZGVuSG9sbG93KHJQb3MpKSAmJlxyXG4gICAgICAgICF0aGlzLl9pc0hvbGxvdyhsUG9zKSkge1xyXG4gICAgICAgIGN1cnNvckRlZkluZGV4ID0gclBvcztcclxuICAgICAgICBpZiAoIWxEZWYgfHwgbERlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmN1cnNvclBvcyA9IHRoaXMuX21hcERlZkluZGV4VG9Qb3MoY3Vyc29yRGVmSW5kZXgpO1xyXG4gIH1cclxufVxyXG5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyA9IHtcclxuICAnMCc6IC9cXGQvLFxyXG4gICdhJzogL1tcXHUwMDQxLVxcdTAwNUFcXHUwMDYxLVxcdTAwN0FcXHUwMEFBXFx1MDBCNVxcdTAwQkFcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZcXHUwMEY4LVxcdTAyQzFcXHUwMkM2LVxcdTAyRDFcXHUwMkUwLVxcdTAyRTRcXHUwMkVDXFx1MDJFRVxcdTAzNzAtXFx1MDM3NFxcdTAzNzZcXHUwMzc3XFx1MDM3QS1cXHUwMzdEXFx1MDM4NlxcdTAzODgtXFx1MDM4QVxcdTAzOENcXHUwMzhFLVxcdTAzQTFcXHUwM0EzLVxcdTAzRjVcXHUwM0Y3LVxcdTA0ODFcXHUwNDhBLVxcdTA1MjdcXHUwNTMxLVxcdTA1NTZcXHUwNTU5XFx1MDU2MS1cXHUwNTg3XFx1MDVEMC1cXHUwNUVBXFx1MDVGMC1cXHUwNUYyXFx1MDYyMC1cXHUwNjRBXFx1MDY2RVxcdTA2NkZcXHUwNjcxLVxcdTA2RDNcXHUwNkQ1XFx1MDZFNVxcdTA2RTZcXHUwNkVFXFx1MDZFRlxcdTA2RkEtXFx1MDZGQ1xcdTA2RkZcXHUwNzEwXFx1MDcxMi1cXHUwNzJGXFx1MDc0RC1cXHUwN0E1XFx1MDdCMVxcdTA3Q0EtXFx1MDdFQVxcdTA3RjRcXHUwN0Y1XFx1MDdGQVxcdTA4MDAtXFx1MDgxNVxcdTA4MUFcXHUwODI0XFx1MDgyOFxcdTA4NDAtXFx1MDg1OFxcdTA4QTBcXHUwOEEyLVxcdTA4QUNcXHUwOTA0LVxcdTA5MzlcXHUwOTNEXFx1MDk1MFxcdTA5NTgtXFx1MDk2MVxcdTA5NzEtXFx1MDk3N1xcdTA5NzktXFx1MDk3RlxcdTA5ODUtXFx1MDk4Q1xcdTA5OEZcXHUwOTkwXFx1MDk5My1cXHUwOUE4XFx1MDlBQS1cXHUwOUIwXFx1MDlCMlxcdTA5QjYtXFx1MDlCOVxcdTA5QkRcXHUwOUNFXFx1MDlEQ1xcdTA5RERcXHUwOURGLVxcdTA5RTFcXHUwOUYwXFx1MDlGMVxcdTBBMDUtXFx1MEEwQVxcdTBBMEZcXHUwQTEwXFx1MEExMy1cXHUwQTI4XFx1MEEyQS1cXHUwQTMwXFx1MEEzMlxcdTBBMzNcXHUwQTM1XFx1MEEzNlxcdTBBMzhcXHUwQTM5XFx1MEE1OS1cXHUwQTVDXFx1MEE1RVxcdTBBNzItXFx1MEE3NFxcdTBBODUtXFx1MEE4RFxcdTBBOEYtXFx1MEE5MVxcdTBBOTMtXFx1MEFBOFxcdTBBQUEtXFx1MEFCMFxcdTBBQjJcXHUwQUIzXFx1MEFCNS1cXHUwQUI5XFx1MEFCRFxcdTBBRDBcXHUwQUUwXFx1MEFFMVxcdTBCMDUtXFx1MEIwQ1xcdTBCMEZcXHUwQjEwXFx1MEIxMy1cXHUwQjI4XFx1MEIyQS1cXHUwQjMwXFx1MEIzMlxcdTBCMzNcXHUwQjM1LVxcdTBCMzlcXHUwQjNEXFx1MEI1Q1xcdTBCNURcXHUwQjVGLVxcdTBCNjFcXHUwQjcxXFx1MEI4M1xcdTBCODUtXFx1MEI4QVxcdTBCOEUtXFx1MEI5MFxcdTBCOTItXFx1MEI5NVxcdTBCOTlcXHUwQjlBXFx1MEI5Q1xcdTBCOUVcXHUwQjlGXFx1MEJBM1xcdTBCQTRcXHUwQkE4LVxcdTBCQUFcXHUwQkFFLVxcdTBCQjlcXHUwQkQwXFx1MEMwNS1cXHUwQzBDXFx1MEMwRS1cXHUwQzEwXFx1MEMxMi1cXHUwQzI4XFx1MEMyQS1cXHUwQzMzXFx1MEMzNS1cXHUwQzM5XFx1MEMzRFxcdTBDNThcXHUwQzU5XFx1MEM2MFxcdTBDNjFcXHUwQzg1LVxcdTBDOENcXHUwQzhFLVxcdTBDOTBcXHUwQzkyLVxcdTBDQThcXHUwQ0FBLVxcdTBDQjNcXHUwQ0I1LVxcdTBDQjlcXHUwQ0JEXFx1MENERVxcdTBDRTBcXHUwQ0UxXFx1MENGMVxcdTBDRjJcXHUwRDA1LVxcdTBEMENcXHUwRDBFLVxcdTBEMTBcXHUwRDEyLVxcdTBEM0FcXHUwRDNEXFx1MEQ0RVxcdTBENjBcXHUwRDYxXFx1MEQ3QS1cXHUwRDdGXFx1MEQ4NS1cXHUwRDk2XFx1MEQ5QS1cXHUwREIxXFx1MERCMy1cXHUwREJCXFx1MERCRFxcdTBEQzAtXFx1MERDNlxcdTBFMDEtXFx1MEUzMFxcdTBFMzJcXHUwRTMzXFx1MEU0MC1cXHUwRTQ2XFx1MEU4MVxcdTBFODJcXHUwRTg0XFx1MEU4N1xcdTBFODhcXHUwRThBXFx1MEU4RFxcdTBFOTQtXFx1MEU5N1xcdTBFOTktXFx1MEU5RlxcdTBFQTEtXFx1MEVBM1xcdTBFQTVcXHUwRUE3XFx1MEVBQVxcdTBFQUJcXHUwRUFELVxcdTBFQjBcXHUwRUIyXFx1MEVCM1xcdTBFQkRcXHUwRUMwLVxcdTBFQzRcXHUwRUM2XFx1MEVEQy1cXHUwRURGXFx1MEYwMFxcdTBGNDAtXFx1MEY0N1xcdTBGNDktXFx1MEY2Q1xcdTBGODgtXFx1MEY4Q1xcdTEwMDAtXFx1MTAyQVxcdTEwM0ZcXHUxMDUwLVxcdTEwNTVcXHUxMDVBLVxcdTEwNURcXHUxMDYxXFx1MTA2NVxcdTEwNjZcXHUxMDZFLVxcdTEwNzBcXHUxMDc1LVxcdTEwODFcXHUxMDhFXFx1MTBBMC1cXHUxMEM1XFx1MTBDN1xcdTEwQ0RcXHUxMEQwLVxcdTEwRkFcXHUxMEZDLVxcdTEyNDhcXHUxMjRBLVxcdTEyNERcXHUxMjUwLVxcdTEyNTZcXHUxMjU4XFx1MTI1QS1cXHUxMjVEXFx1MTI2MC1cXHUxMjg4XFx1MTI4QS1cXHUxMjhEXFx1MTI5MC1cXHUxMkIwXFx1MTJCMi1cXHUxMkI1XFx1MTJCOC1cXHUxMkJFXFx1MTJDMFxcdTEyQzItXFx1MTJDNVxcdTEyQzgtXFx1MTJENlxcdTEyRDgtXFx1MTMxMFxcdTEzMTItXFx1MTMxNVxcdTEzMTgtXFx1MTM1QVxcdTEzODAtXFx1MTM4RlxcdTEzQTAtXFx1MTNGNFxcdTE0MDEtXFx1MTY2Q1xcdTE2NkYtXFx1MTY3RlxcdTE2ODEtXFx1MTY5QVxcdTE2QTAtXFx1MTZFQVxcdTE3MDAtXFx1MTcwQ1xcdTE3MEUtXFx1MTcxMVxcdTE3MjAtXFx1MTczMVxcdTE3NDAtXFx1MTc1MVxcdTE3NjAtXFx1MTc2Q1xcdTE3NkUtXFx1MTc3MFxcdTE3ODAtXFx1MTdCM1xcdTE3RDdcXHUxN0RDXFx1MTgyMC1cXHUxODc3XFx1MTg4MC1cXHUxOEE4XFx1MThBQVxcdTE4QjAtXFx1MThGNVxcdTE5MDAtXFx1MTkxQ1xcdTE5NTAtXFx1MTk2RFxcdTE5NzAtXFx1MTk3NFxcdTE5ODAtXFx1MTlBQlxcdTE5QzEtXFx1MTlDN1xcdTFBMDAtXFx1MUExNlxcdTFBMjAtXFx1MUE1NFxcdTFBQTdcXHUxQjA1LVxcdTFCMzNcXHUxQjQ1LVxcdTFCNEJcXHUxQjgzLVxcdTFCQTBcXHUxQkFFXFx1MUJBRlxcdTFCQkEtXFx1MUJFNVxcdTFDMDAtXFx1MUMyM1xcdTFDNEQtXFx1MUM0RlxcdTFDNUEtXFx1MUM3RFxcdTFDRTktXFx1MUNFQ1xcdTFDRUUtXFx1MUNGMVxcdTFDRjVcXHUxQ0Y2XFx1MUQwMC1cXHUxREJGXFx1MUUwMC1cXHUxRjE1XFx1MUYxOC1cXHUxRjFEXFx1MUYyMC1cXHUxRjQ1XFx1MUY0OC1cXHUxRjREXFx1MUY1MC1cXHUxRjU3XFx1MUY1OVxcdTFGNUJcXHUxRjVEXFx1MUY1Ri1cXHUxRjdEXFx1MUY4MC1cXHUxRkI0XFx1MUZCNi1cXHUxRkJDXFx1MUZCRVxcdTFGQzItXFx1MUZDNFxcdTFGQzYtXFx1MUZDQ1xcdTFGRDAtXFx1MUZEM1xcdTFGRDYtXFx1MUZEQlxcdTFGRTAtXFx1MUZFQ1xcdTFGRjItXFx1MUZGNFxcdTFGRjYtXFx1MUZGQ1xcdTIwNzFcXHUyMDdGXFx1MjA5MC1cXHUyMDlDXFx1MjEwMlxcdTIxMDdcXHUyMTBBLVxcdTIxMTNcXHUyMTE1XFx1MjExOS1cXHUyMTFEXFx1MjEyNFxcdTIxMjZcXHUyMTI4XFx1MjEyQS1cXHUyMTJEXFx1MjEyRi1cXHUyMTM5XFx1MjEzQy1cXHUyMTNGXFx1MjE0NS1cXHUyMTQ5XFx1MjE0RVxcdTIxODNcXHUyMTg0XFx1MkMwMC1cXHUyQzJFXFx1MkMzMC1cXHUyQzVFXFx1MkM2MC1cXHUyQ0U0XFx1MkNFQi1cXHUyQ0VFXFx1MkNGMlxcdTJDRjNcXHUyRDAwLVxcdTJEMjVcXHUyRDI3XFx1MkQyRFxcdTJEMzAtXFx1MkQ2N1xcdTJENkZcXHUyRDgwLVxcdTJEOTZcXHUyREEwLVxcdTJEQTZcXHUyREE4LVxcdTJEQUVcXHUyREIwLVxcdTJEQjZcXHUyREI4LVxcdTJEQkVcXHUyREMwLVxcdTJEQzZcXHUyREM4LVxcdTJEQ0VcXHUyREQwLVxcdTJERDZcXHUyREQ4LVxcdTJEREVcXHUyRTJGXFx1MzAwNVxcdTMwMDZcXHUzMDMxLVxcdTMwMzVcXHUzMDNCXFx1MzAzQ1xcdTMwNDEtXFx1MzA5NlxcdTMwOUQtXFx1MzA5RlxcdTMwQTEtXFx1MzBGQVxcdTMwRkMtXFx1MzBGRlxcdTMxMDUtXFx1MzEyRFxcdTMxMzEtXFx1MzE4RVxcdTMxQTAtXFx1MzFCQVxcdTMxRjAtXFx1MzFGRlxcdTM0MDAtXFx1NERCNVxcdTRFMDAtXFx1OUZDQ1xcdUEwMDAtXFx1QTQ4Q1xcdUE0RDAtXFx1QTRGRFxcdUE1MDAtXFx1QTYwQ1xcdUE2MTAtXFx1QTYxRlxcdUE2MkFcXHVBNjJCXFx1QTY0MC1cXHVBNjZFXFx1QTY3Ri1cXHVBNjk3XFx1QTZBMC1cXHVBNkU1XFx1QTcxNy1cXHVBNzFGXFx1QTcyMi1cXHVBNzg4XFx1QTc4Qi1cXHVBNzhFXFx1QTc5MC1cXHVBNzkzXFx1QTdBMC1cXHVBN0FBXFx1QTdGOC1cXHVBODAxXFx1QTgwMy1cXHVBODA1XFx1QTgwNy1cXHVBODBBXFx1QTgwQy1cXHVBODIyXFx1QTg0MC1cXHVBODczXFx1QTg4Mi1cXHVBOEIzXFx1QThGMi1cXHVBOEY3XFx1QThGQlxcdUE5MEEtXFx1QTkyNVxcdUE5MzAtXFx1QTk0NlxcdUE5NjAtXFx1QTk3Q1xcdUE5ODQtXFx1QTlCMlxcdUE5Q0ZcXHVBQTAwLVxcdUFBMjhcXHVBQTQwLVxcdUFBNDJcXHVBQTQ0LVxcdUFBNEJcXHVBQTYwLVxcdUFBNzZcXHVBQTdBXFx1QUE4MC1cXHVBQUFGXFx1QUFCMVxcdUFBQjVcXHVBQUI2XFx1QUFCOS1cXHVBQUJEXFx1QUFDMFxcdUFBQzJcXHVBQURCLVxcdUFBRERcXHVBQUUwLVxcdUFBRUFcXHVBQUYyLVxcdUFBRjRcXHVBQjAxLVxcdUFCMDZcXHVBQjA5LVxcdUFCMEVcXHVBQjExLVxcdUFCMTZcXHVBQjIwLVxcdUFCMjZcXHVBQjI4LVxcdUFCMkVcXHVBQkMwLVxcdUFCRTJcXHVBQzAwLVxcdUQ3QTNcXHVEN0IwLVxcdUQ3QzZcXHVEN0NCLVxcdUQ3RkJcXHVGOTAwLVxcdUZBNkRcXHVGQTcwLVxcdUZBRDlcXHVGQjAwLVxcdUZCMDZcXHVGQjEzLVxcdUZCMTdcXHVGQjFEXFx1RkIxRi1cXHVGQjI4XFx1RkIyQS1cXHVGQjM2XFx1RkIzOC1cXHVGQjNDXFx1RkIzRVxcdUZCNDBcXHVGQjQxXFx1RkI0M1xcdUZCNDRcXHVGQjQ2LVxcdUZCQjFcXHVGQkQzLVxcdUZEM0RcXHVGRDUwLVxcdUZEOEZcXHVGRDkyLVxcdUZEQzdcXHVGREYwLVxcdUZERkJcXHVGRTcwLVxcdUZFNzRcXHVGRTc2LVxcdUZFRkNcXHVGRjIxLVxcdUZGM0FcXHVGRjQxLVxcdUZGNUFcXHVGRjY2LVxcdUZGQkVcXHVGRkMyLVxcdUZGQzdcXHVGRkNBLVxcdUZGQ0ZcXHVGRkQyLVxcdUZGRDdcXHVGRkRBLVxcdUZGRENdLywgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyMDc1MDcwXHJcbiAgJyonOiAvLi9cclxufTtcclxuUGF0dGVybk1hc2suREVGX1RZUEVTID0ge1xyXG4gIElOUFVUOiAnaW5wdXQnLFxyXG4gIEZJWEVEOiAnZml4ZWQnXHJcbn1cclxuUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUiA9IHtcclxuICBzaG93OiAnbGF6eScsXHJcbiAgY2hhcjogJ18nXHJcbn07XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5pbXBvcnQge2V4dGVuZERldGFpbHNBZGp1c3RtZW50c30gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFBpcGVNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgc3VwZXIoZWwsIG9wdHMpO1xyXG5cclxuICAgIHRoaXMubXVsdGlwYXNzID0gb3B0cy5tdWx0aXBhc3M7XHJcblxyXG4gICAgdGhpcy5fY29tcGlsZWRNYXNrcyA9IHRoaXMubWFzay5tYXAobSA9PiBJTWFzay5NYXNrRmFjdG9yeShlbCwgbSkpO1xyXG4gIH1cclxuXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICB2YXIgcmVzID0gdGhpcy5fcGlwZShzdHIsIGRldGFpbHMpO1xyXG4gICAgaWYgKCF0aGlzLm11bHRpcGFzcykgcmV0dXJuIHJlcztcclxuXHJcbiAgICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcblxyXG4gICAgdmFyIHN0ZXBSZXM7XHJcbiAgICB2YXIgdGVtcFJlcyA9IHJlcztcclxuXHJcbiAgICB3aGlsZSAoc3RlcFJlcyAhPT0gdGVtcFJlcykge1xyXG4gICAgICBzdGVwUmVzID0gdGVtcFJlcztcclxuICAgICAgdGVtcFJlcyA9IHRoaXMuX3BpcGUoc3RlcFJlcywge1xyXG4gICAgICAgIGN1cnNvclBvczogc3RlcFJlcy5sZW5ndGgsXHJcbiAgICAgICAgb2xkVmFsdWU6IHN0ZXBSZXMsXHJcbiAgICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogc3RlcFJlcy5sZW5ndGhcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGRldGFpbHMuY3Vyc29yUG9zID0gY3Vyc29yUG9zIC0gKHJlcy5sZW5ndGggLSBzdGVwUmVzLmxlbmd0aCk7XHJcblxyXG4gICAgcmV0dXJuIHN0ZXBSZXM7XHJcbiAgfVxyXG5cclxuICBfcGlwZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29tcGlsZWRNYXNrcy5yZWR1Y2UoKHMsIG0pID0+IHtcclxuICAgICAgdmFyIGQgPSBleHRlbmREZXRhaWxzQWRqdXN0bWVudHMocywgZGV0YWlscyk7XHJcbiAgICAgIHZhciByZXMgPSBtLnJlc29sdmUocywgZCk7XHJcbiAgICAgIGRldGFpbHMuY3Vyc29yUG9zID0gZC5jdXJzb3JQb3M7XHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9LCBzdHIpO1xyXG4gIH1cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLl9jb21waWxlZE1hc2tzLmZvckVhY2gobSA9PiB7XHJcbiAgICAgIG0uYmluZEV2ZW50cygpO1xyXG4gICAgICAvLyBkaXNhYmxlIGJhc2VtYXNrIGV2ZW50cyBmb3IgY2hpbGQgbWFza3NcclxuICAgICAgQmFzZU1hc2sucHJvdG90eXBlLnVuYmluZEV2ZW50cy5hcHBseShtKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5fY29tcGlsZWRNYXNrcy5mb3JFYWNoKG0gPT4gbS51bmJpbmRFdmVudHMoKSk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7aXNTdHJpbmd9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vbWFza3MvYmFzZSc7XHJcbmltcG9ydCBSZWdFeHBNYXNrIGZyb20gJy4vbWFza3MvcmVnZXhwJztcclxuaW1wb3J0IEZ1bmNNYXNrIGZyb20gJy4vbWFza3MvZnVuYyc7XHJcbmltcG9ydCBQYXR0ZXJuTWFzayBmcm9tICcuL21hc2tzL3BhdHRlcm4nO1xyXG5pbXBvcnQgUGlwZU1hc2sgZnJvbSAnLi9tYXNrcy9waXBlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5mdW5jdGlvbiBJTWFzayAoZWwsIG9wdHM9e30pIHtcclxuICB2YXIgbWFzayA9IElNYXNrLk1hc2tGYWN0b3J5KGVsLCBvcHRzKTtcclxuICBtYXNrLmJpbmRFdmVudHMoKTtcclxuICAvLyByZWZyZXNoXHJcbiAgbWFzay5yYXdWYWx1ZSA9IGVsLnZhbHVlO1xyXG4gIHJldHVybiBtYXNrO1xyXG59XHJcblxyXG5JTWFzay5NYXNrRmFjdG9yeSA9IGZ1bmN0aW9uIChlbCwgb3B0cykge1xyXG4gIHZhciBtYXNrID0gb3B0cy5tYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgQmFzZU1hc2spIHJldHVybiBtYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gbmV3IFJlZ0V4cE1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgRnVuY3Rpb24pIHJldHVybiBuZXcgRnVuY01hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgQXJyYXkpIHJldHVybiBuZXcgUGlwZU1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChpc1N0cmluZyhtYXNrKSkgcmV0dXJuIG5ldyBQYXR0ZXJuTWFzayhlbCwgb3B0cyk7XHJcbiAgcmV0dXJuIG5ldyBCYXNlTWFzayhlbCwgb3B0cyk7XHJcbn1cclxuSU1hc2suQmFzZU1hc2sgPSBCYXNlTWFzaztcclxuSU1hc2suRnVuY01hc2sgPSBGdW5jTWFzaztcclxuSU1hc2suUmVnRXhwTWFzayA9IFJlZ0V4cE1hc2s7XHJcbklNYXNrLlBhdHRlcm5NYXNrID0gUGF0dGVybk1hc2s7XHJcbndpbmRvdy5JTWFzayA9IElNYXNrO1xyXG4iXSwibmFtZXMiOlsiaXNTdHJpbmciLCJzdHIiLCJTdHJpbmciLCJjb25mb3JtIiwicmVzIiwiZmFsbGJhY2siLCJleHRlbmREZXRhaWxzQWRqdXN0bWVudHMiLCJkZXRhaWxzIiwiY3Vyc29yUG9zIiwib2xkU2VsZWN0aW9uIiwib2xkVmFsdWUiLCJzdGFydENoYW5nZVBvcyIsIk1hdGgiLCJtaW4iLCJzdGFydCIsImluc2VydGVkQ291bnQiLCJyZW1vdmVkQ291bnQiLCJtYXgiLCJlbmQiLCJsZW5ndGgiLCJoZWFkIiwic3Vic3RyaW5nIiwidGFpbCIsImluc2VydGVkIiwic3Vic3RyIiwicmVtb3ZlZCIsIkJhc2VNYXNrIiwiZWwiLCJvcHRzIiwibWFzayIsIl9saXN0ZW5lcnMiLCJfcmVmcmVzaGluZ0NvdW50IiwiX3Jhd1ZhbHVlIiwiX3VubWFza2VkVmFsdWUiLCJzYXZlU2VsZWN0aW9uIiwiYmluZCIsIl9vbklucHV0IiwiX29uRHJvcCIsImV2IiwiaGFuZGxlciIsInB1c2giLCJoSW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJsaXN0ZW5lcnMiLCJmb3JFYWNoIiwibCIsImlucHV0VmFsdWUiLCJfc2VsZWN0aW9uIiwicmF3VmFsdWUiLCJ1bm1hc2tlZFZhbHVlIiwicmVzb2x2ZSIsInVwZGF0ZUVsZW1lbnQiLCJ2YWx1ZSIsIndhcm4iLCJzZWxlY3Rpb25TdGFydCIsInVuYmluZEV2ZW50cyIsIl9jYWxjVW5tYXNrZWQiLCJpc0NoYW5nZWQiLCJfY3Vyc29yQ2hhbmdpbmciLCJjbGVhclRpbWVvdXQiLCJfY2hhbmdpbmdDdXJzb3JQb3MiLCJzZXRUaW1lb3V0IiwiX2ZpcmVDaGFuZ2VFdmVudHMiLCJmaXJlRXZlbnQiLCJwcm9jZXNzSW5wdXQiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInNlbGVjdGlvbkVuZCIsInBvcyIsInNldFNlbGVjdGlvblJhbmdlIiwiUmVnRXhwTWFzayIsInRlc3QiLCJGdW5jTWFzayIsIlBhdHRlcm5NYXNrIiwiX2hvbGxvd3MiLCJwbGFjZWhvbGRlciIsImRlZmluaXRpb25zIiwiREVGSU5JVElPTlMiLCJfYWxpZ25DdXJzb3IiLCJfYWxpZ25DdXJzb3JGcmllbmRseSIsIl9pbml0aWFsaXplZCIsIl9kZWZpbml0aW9ucyIsIl9jaGFyRGVmcyIsInBhdHRlcm4iLCJ1bm1hc2tpbmdCbG9jayIsIm9wdGlvbmFsQmxvY2siLCJpIiwiY2giLCJ0eXBlIiwiREVGX1RZUEVTIiwiSU5QVVQiLCJGSVhFRCIsInVubWFza2luZyIsIm9wdGlvbmFsIiwiX2J1aWxkUmVzb2x2ZXJzIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiTWFza0ZhY3RvcnkiLCJwbGFjZWhvbGRlckJ1ZmZlciIsImhvbGxvd3MiLCJzbGljZSIsIm92ZXJmbG93IiwiY2kiLCJkaSIsIl9tYXBQb3NUb0RlZkluZGV4IiwiZGVmIiwicmVzb2x2ZXIiLCJjaGFyIiwiY2hyZXMiLCJfcGxhY2Vob2xkZXIiLCJmcm9tUG9zIiwiaW5wdXQiLCJfaXNIaWRkZW5Ib2xsb3ciLCJfaXNIb2xsb3ciLCJkZWZJbmRleCIsImZpbHRlciIsImgiLCJfaG9sbG93c0JlZm9yZSIsImxhc3RIb2xsb3dJbmRleCIsImluc2VydFN0ZXBzIiwidGFpbElucHV0IiwiX2V4dHJhY3RJbnB1dCIsIl9nZW5lcmF0ZUluc2VydFN0ZXBzIiwiaXN0ZXAiLCJzdGVwIiwiX2FwcGVuZFRhaWwiLCJ0cmVzIiwidGhvbGxvd3MiLCJhcHBlbmRlZCIsIl9hcHBlbmRGaXhlZEVuZCIsImhhc0hvbGxvd3MiLCJfYXBwZW5kUGxhY2Vob2xkZXJFbmQiLCJpc0NvbXBsZXRlIiwic2hvdyIsInVubWFza2VkIiwiY3Vyc29yRGVmSW5kZXgiLCJyUG9zIiwickRlZiIsImxQb3MiLCJsRGVmIiwiX21hcERlZkluZGV4VG9Qb3MiLCJwaCIsIkRFRkFVTFRfUExBQ0VIT0xERVIiLCJtYXAiLCJqb2luIiwiZGVmcyIsIl9pbnN0YWxsRGVmaW5pdGlvbnMiLCJfbWFzayIsIlBpcGVNYXNrIiwibXVsdGlwYXNzIiwiX2NvbXBpbGVkTWFza3MiLCJtIiwiX3BpcGUiLCJzdGVwUmVzIiwidGVtcFJlcyIsInJlZHVjZSIsInMiLCJkIiwiYmluZEV2ZW50cyIsInByb3RvdHlwZSIsImFwcGx5IiwiUmVnRXhwIiwiRnVuY3Rpb24iLCJBcnJheSIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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