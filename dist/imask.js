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













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

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
  var removed = oldValue.substr(startChangePos, removedCount);

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
      this._alignStops = [];

      var pattern = this.mask;
      if (!pattern || !definitions) return;

      var unmaskingBlock = false;
      var optionalBlock = false;
      for (var i = 0; i < pattern.length; ++i) {
        var ch = pattern[i];
        var type = !unmaskingBlock && ch in definitions ? PatternMask.DEF_TYPES.INPUT : PatternMask.DEF_TYPES.FIXED;
        var unmasking = type === PatternMask.DEF_TYPES.INPUT || unmaskingBlock;
        var optional = type === PatternMask.DEF_TYPES.INPUT && optionalBlock;

        if (ch === PatternMask.STOP_CHAR) {
          this._alignStops.push(this._charDefs.length);
          continue;
        }

        if (ch === '{' || ch === '}') {
          unmaskingBlock = !unmaskingBlock;
          continue;
        }

        if (ch === '[' || ch === ']') {
          optionalBlock = !optionalBlock;
          continue;
        }

        if (ch === PatternMask.ESCAPE_CHAR) {
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
        if (this._isHollow(di)) {
          // TODO check other cases
          ++di;
          continue;
        }

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
            // TODO seems check is useless
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
    key: '_appendTailChunks',
    value: function _appendTailChunks(str, chunks, skipUnresolvedInput) {
      var overflow = false;
      for (var ci = 0; ci < chunks.length; ++ci) {
        var _chunks$ci = slicedToArray(chunks[ci], 2),
            input = _chunks$ci[1];

        var _appendTail2 = this._appendTail(str, input, skipUnresolvedInput);

        var _appendTail3 = slicedToArray(_appendTail2, 3);

        str = _appendTail3[0];
        this._hollows = _appendTail3[1];
        overflow = _appendTail3[2];

        if (overflow) break;

        // not last - append placeholder between stops
        var chunk2 = chunks[ci + 1];
        var stop2 = chunk2 && chunk2[0];
        if (stop2) str = this._appendPlaceholderEnd(str, stop2);
      }
      return [str, this._hollows, overflow];
    }
  }, {
    key: '_extractInput',
    value: function _extractInput(str) {
      var fromPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var toPos = arguments[2];

      var input = '';

      var toDefIndex = toPos && this._mapPosToDefIndex(toPos);
      for (var ci = 0, di = this._mapPosToDefIndex(fromPos); ci < str.length && (!toDefIndex || di < toDefIndex); ++di) {
        var ch = str[ci];
        var def = this.def(di, str);

        if (!def) break;
        if (this._isHiddenHollow(di)) continue;

        if (this._isInput(di) && !this._isHollow(di)) input += ch;
        ++ci;
      }
      return input;
    }
  }, {
    key: '_extractInputChunks',
    value: function _extractInputChunks(str, stops) {
      var chunks = [];
      for (var si = 0; si < stops.length && str; ++si) {
        var s = stops[si];
        var s2 = stops[si + 1];
        chunks.push([s, this._extractInput(str, s, s2)]);
        if (s2) str = str.slice(s2 - s);
      }
      return chunks;
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

        var _appendTail4 = this._appendTail(head, ch, false),
            _appendTail5 = slicedToArray(_appendTail4, 3),
            res = _appendTail5[0],
            hollows = _appendTail5[1],
            overflow = _appendTail5[2];

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
      var _this3 = this;

      var cursorPos = details.cursorPos;
      var startChangePos = details.startChangePos;
      var inserted = details.inserted;
      var removedCount = details.removed.length;
      var tailPos = startChangePos + removedCount;
      var tailDefIndex = this._mapPosToDefIndex(tailPos);
      var tailAlignStopsPos = [tailPos].concat(toConsumableArray(this._alignStops.filter(function (s) {
        return s >= tailDefIndex;
      }).map(function (s) {
        return _this3._mapDefIndexToPos(s);
      })));
      var tailInputChunks = this._extractInputChunks(details.tail, tailAlignStopsPos);

      // remove hollows after cursor
      var lastHollowIndex = this._mapPosToDefIndex(startChangePos);
      this._hollows = this._hollows.filter(function (h) {
        return h < lastHollowIndex;
      });

      var res = details.head;

      // insert available
      var insertSteps = this._generateInsertSteps(res, inserted);
      for (var istep = insertSteps.length - 1; istep >= 0; --istep) {
        var step, tres, overflow;

        var _insertSteps$istep = slicedToArray(insertSteps[istep], 2);

        step = _insertSteps$istep[0];
        this._hollows = _insertSteps$istep[1];

        var _appendTailChunks2 = this._appendTailChunks(step, tailInputChunks);

        var _appendTailChunks3 = slicedToArray(_appendTailChunks2, 3);

        tres = _appendTailChunks3[0];
        this._hollows = _appendTailChunks3[1];
        overflow = _appendTailChunks3[2];

        if (!overflow) {
          res = tres;
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
        // if (details.oldSelection.end === cursorPos) {
        //   for (;;++cursorPos) {
        //     var di=this._mapPosToDefIndex(cursorPos);
        //     var def = this.def(di);
        //     if (!def || def.type !== PatternMask.DEF_TYPES.FIXED) break;
        //   }
        // }

        // remove head fixed and hollows if removed at end
        if (cursorPos === res.length) {
          var hasHollows = false;
          var di = this._mapPosToDefIndex(cursorPos - 1);
          for (; di > 0; --di) {
            if (this._isInput(di)) {
              if (this._isHollow(di)) hasHollows = true;else break;
            }
          }
          if (hasHollows) res = res.slice(0, di + 1);
        }

        cursorPos = this._nearestInputPos(cursorPos);
      }

      details.cursorPos = cursorPos;
      res = this._appendPlaceholderEnd(res);

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
        if (this._isInput(di)) break;
        if (di >= res.length) res += def.char;
      }
      return res;
    }
  }, {
    key: '_appendPlaceholderEnd',
    value: function _appendPlaceholderEnd(res, toPos) {
      var toDefIndex = toPos && this._mapPosToDefIndex(toPos);
      for (var di = this._mapPosToDefIndex(res.length); !toDefIndex || di < toDefIndex; ++di) {
        var def = this.def(di, res);
        if (!def) break;

        if (this._isInput(di) && !this._isHollow(di)) {
          this._hollows.push(di);
        }
        if (this._placeholder.show === 'always' || toPos) {
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

        if (def.unmasking && !this._isHollow(di) && (this._isInput(di) && this._resolvers[def.char].resolve(ch, ci, str) || def.char === ch)) {
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
      while (rPos < cursorDefIndex && (!this._isInput(rPos) || !this._isHollow(rPos))) {
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
        if (this._isInput(di) && !def.optional && this._isHollow(di)) return false;
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
      var _this4 = this;

      return this.defs().map(function (def) {
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
PatternMask.STOP_CHAR = '\'';
PatternMask.ESCAPE_CHAR = '\\';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvcGlwZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL2ltYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydFxyXG5mdW5jdGlvbiBpc1N0cmluZyAoc3RyKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnIHx8IHN0ciBpbnN0YW5jZW9mIFN0cmluZztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGNvbmZvcm0gKHJlcywgc3RyLCBmYWxsYmFjaz0nJykge1xyXG4gIHJldHVybiBpc1N0cmluZyhyZXMpID9cclxuICAgIHJlcyA6XHJcbiAgICByZXMgP1xyXG4gICAgICBzdHIgOlxyXG4gICAgICBmYWxsYmFjaztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGV4dGVuZERldGFpbHNBZGp1c3RtZW50cyhzdHIsIGRldGFpbHMpIHtcclxuICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgdmFyIG9sZFNlbGVjdGlvbiA9IGRldGFpbHMub2xkU2VsZWN0aW9uO1xyXG4gIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcblxyXG4gIHZhciBzdGFydENoYW5nZVBvcyA9IE1hdGgubWluKGN1cnNvclBvcywgb2xkU2VsZWN0aW9uLnN0YXJ0KTtcclxuICB2YXIgaW5zZXJ0ZWRDb3VudCA9IGN1cnNvclBvcyAtIHN0YXJ0Q2hhbmdlUG9zO1xyXG4gIC8vIE1hdGgubWF4IGZvciBvcHBvc2l0ZSBvcGVyYXRpb25cclxuICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgIC8vIGZvciBEZWxldGVcclxuICAgIG9sZFZhbHVlLmxlbmd0aCAtIHN0ci5sZW5ndGgsIDApO1xyXG4gIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyk7XHJcbiAgdmFyIHRhaWwgPSBzdHIuc3Vic3RyaW5nKHN0YXJ0Q2hhbmdlUG9zICsgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIGluc2VydGVkID0gc3RyLnN1YnN0cihzdGFydENoYW5nZVBvcywgaW5zZXJ0ZWRDb3VudCk7XHJcbiAgdmFyIHJlbW92ZWQgPSBvbGRWYWx1ZS5zdWJzdHIoc3RhcnRDaGFuZ2VQb3MsIHJlbW92ZWRDb3VudCk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBzdGFydENoYW5nZVBvcyxcclxuICAgIGhlYWQsXHJcbiAgICB0YWlsLFxyXG4gICAgaW5zZXJ0ZWQsXHJcbiAgICByZW1vdmVkLFxyXG4gICAgLi4uZGV0YWlsc1xyXG4gIH07XHJcbn1cclxuIiwiaW1wb3J0IHtjb25mb3JtLCBleHRlbmREZXRhaWxzQWRqdXN0bWVudHN9IGZyb20gJy4uL3V0aWxzJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICB0aGlzLmVsID0gZWw7XHJcbiAgICB0aGlzLm1hc2sgPSBvcHRzLm1hc2s7XHJcblxyXG4gICAgdGhpcy5fbGlzdGVuZXJzID0ge307XHJcbiAgICB0aGlzLl9yZWZyZXNoaW5nQ291bnQgPSAwO1xyXG4gICAgdGhpcy5fcmF3VmFsdWUgPSBcIlwiO1xyXG4gICAgdGhpcy5fdW5tYXNrZWRWYWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgdGhpcy5zYXZlU2VsZWN0aW9uID0gdGhpcy5zYXZlU2VsZWN0aW9uLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9vbklucHV0ID0gdGhpcy5fb25JbnB1dC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fb25Ecm9wID0gdGhpcy5fb25Ecm9wLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBvbiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgdGhpcy5fbGlzdGVuZXJzW2V2XSA9IFtdO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzW2V2XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBvZmYgKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHJldHVybjtcclxuICAgIGlmICghaGFuZGxlcikge1xyXG4gICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2XTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGhJbmRleCA9IHRoaXMuX2xpc3RlbmVyc1tldl0uaW5kZXhPZihoYW5kbGVyKTtcclxuICAgIGlmIChoSW5kZXggPj0gMCkgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShoSW5kZXgsIDEpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBnZXQgcmF3VmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Jhd1ZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHJhd1ZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMucHJvY2Vzc0lucHV0KHN0ciwge1xyXG4gICAgICBjdXJzb3JQb3M6IHN0ci5sZW5ndGgsXHJcbiAgICAgIG9sZFZhbHVlOiB0aGlzLnJhd1ZhbHVlLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHtcclxuICAgICAgICBzdGFydDogMCxcclxuICAgICAgICBlbmQ6IHRoaXMucmF3VmFsdWUubGVuZ3RoXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHVubWFza2VkVmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3VubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgdW5tYXNrZWRWYWx1ZSAodmFsdWUpIHtcclxuICAgIHRoaXMucmF3VmFsdWUgPSB2YWx1ZTtcclxuICB9XHJcblxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVNlbGVjdGlvbik7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dCk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVNlbGVjdGlvbik7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dCk7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgZmlyZUV2ZW50IChldikge1xyXG4gICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1tldl0gfHwgW107XHJcbiAgICBsaXN0ZW5lcnMuZm9yRWFjaChsID0+IGwoKSk7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzSW5wdXQgKGlucHV0VmFsdWUsIGRldGFpbHMpIHtcclxuICAgIGRldGFpbHMgPSB7XHJcbiAgICAgIGN1cnNvclBvczogdGhpcy5jdXJzb3JQb3MsXHJcbiAgICAgIG9sZFNlbGVjdGlvbjogdGhpcy5fc2VsZWN0aW9uLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5yYXdWYWx1ZSxcclxuICAgICAgb2xkVW5tYXNrZWRWYWx1ZTogdGhpcy51bm1hc2tlZFZhbHVlLFxyXG4gICAgICAuLi5kZXRhaWxzXHJcbiAgICB9O1xyXG5cclxuICAgIGRldGFpbHMgPSBleHRlbmREZXRhaWxzQWRqdXN0bWVudHMoaW5wdXRWYWx1ZSwgZGV0YWlscyk7XHJcblxyXG4gICAgdmFyIHJlcyA9IGNvbmZvcm0odGhpcy5yZXNvbHZlKGlucHV0VmFsdWUsIGRldGFpbHMpLFxyXG4gICAgICBpbnB1dFZhbHVlLFxyXG4gICAgICB0aGlzLnJhd1ZhbHVlKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUVsZW1lbnQocmVzLCBkZXRhaWxzLmN1cnNvclBvcyk7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcblxyXG4gIGdldCBzZWxlY3Rpb25TdGFydCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY3Vyc29yQ2hhbmdpbmcgP1xyXG4gICAgICB0aGlzLl9jaGFuZ2luZ0N1cnNvclBvcyA6XHJcblxyXG4gICAgICB0aGlzLmVsLnNlbGVjdGlvblN0YXJ0O1xyXG4gIH1cclxuXHJcbiAgZ2V0IGN1cnNvclBvcyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY3Vyc29yQ2hhbmdpbmcgP1xyXG4gICAgICB0aGlzLl9jaGFuZ2luZ0N1cnNvclBvcyA6XHJcblxyXG4gICAgICB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuICB9XHJcblxyXG4gIHNldCBjdXJzb3JQb3MgKHBvcykge1xyXG4gICAgaWYgKHRoaXMuZWwgIT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLmVsLnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zKTtcclxuICAgIHRoaXMuc2F2ZVNlbGVjdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgc2F2ZVNlbGVjdGlvbiAoZXYpIHtcclxuICAgIGlmICh0aGlzLnJhd1ZhbHVlICE9PSB0aGlzLmVsLnZhbHVlKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihcIlVuY29udHJvbGxlZCBpbnB1dCBjaGFuZ2UsIHJlZnJlc2ggbWFzayBtYW51YWxseSFcIik7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9zZWxlY3Rpb24gPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNlbGVjdGlvblN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuY3Vyc29yUG9zXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZGVzdHJveSAoKSB7XHJcbiAgICB0aGlzLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVFbGVtZW50ICh2YWx1ZSwgY3Vyc29yUG9zKSB7XHJcbiAgICB2YXIgdW5tYXNrZWRWYWx1ZSA9IHRoaXMuX2NhbGNVbm1hc2tlZCh2YWx1ZSk7XHJcbiAgICB2YXIgaXNDaGFuZ2VkID0gKHRoaXMudW5tYXNrZWRWYWx1ZSAhPT0gdW5tYXNrZWRWYWx1ZSB8fFxyXG4gICAgICB0aGlzLnJhd1ZhbHVlICE9PSB2YWx1ZSk7XHJcblxyXG4gICAgdGhpcy5fdW5tYXNrZWRWYWx1ZSA9IHVubWFza2VkVmFsdWU7XHJcbiAgICB0aGlzLl9yYXdWYWx1ZSA9IHZhbHVlO1xyXG5cclxuICAgIGlmICh0aGlzLmVsLnZhbHVlICE9PSB2YWx1ZSkgdGhpcy5lbC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgdGhpcy51cGRhdGVDdXJzb3IoY3Vyc29yUG9zKTtcclxuXHJcbiAgICBpZiAoaXNDaGFuZ2VkKSB0aGlzLl9maXJlQ2hhbmdlRXZlbnRzKCk7XHJcbiAgfVxyXG5cclxuICBfZmlyZUNoYW5nZUV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmZpcmVFdmVudChcImFjY2VwdFwiKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZUN1cnNvciAoY3Vyc29yUG9zKSB7XHJcbiAgICBpZiAoY3Vyc29yUG9zID09IG51bGwpIHJldHVybjtcclxuICAgIHRoaXMuY3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG5cclxuICAgIC8vIGFsc28gcXVldWUgY2hhbmdlIGN1cnNvciBmb3IgbW9iaWxlIGJyb3dzZXJzXHJcbiAgICB0aGlzLl9kZWxheVVwZGF0ZUN1cnNvcihjdXJzb3JQb3MpO1xyXG4gIH1cclxuXHJcbiAgX2RlbGF5VXBkYXRlQ3Vyc29yIChjdXJzb3JQb3MpIHtcclxuICAgIHRoaXMuX2Fib3J0VXBkYXRlQ3Vyc29yKCk7XHJcbiAgICB0aGlzLl9jaGFuZ2luZ0N1cnNvclBvcyA9IGN1cnNvclBvcztcclxuICAgIHRoaXMuX2N1cnNvckNoYW5naW5nID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuX2Fib3J0VXBkYXRlQ3Vyc29yKCk7XHJcbiAgICAgIHRoaXMuY3Vyc29yUG9zID0gdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3M7XHJcbiAgICB9LCAxMCk7XHJcbiAgfVxyXG5cclxuICBfYWJvcnRVcGRhdGVDdXJzb3IoKSB7XHJcbiAgICBpZiAodGhpcy5fY3Vyc29yQ2hhbmdpbmcpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2N1cnNvckNoYW5naW5nKTtcclxuICAgICAgZGVsZXRlIHRoaXMuX2N1cnNvckNoYW5naW5nO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX29uSW5wdXQgKGV2KSB7XHJcbiAgICB0aGlzLl9hYm9ydFVwZGF0ZUN1cnNvcigpO1xyXG4gICAgdGhpcy5wcm9jZXNzSW5wdXQodGhpcy5lbC52YWx1ZSk7XHJcbiAgfVxyXG5cclxuICBfb25Ecm9wIChldikge1xyXG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLy8gb3ZlcnJpZGVcclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHsgcmV0dXJuIHN0cjsgfVxyXG5cclxuICBfY2FsY1VubWFza2VkICh2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBSZWdFeHBNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIHJlc29sdmUgKHN0cikge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzay50ZXN0KHN0cik7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIEZ1bmNNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIHJlc29sdmUgKC4uLmFyZ3MpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2soLi4uYXJncyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBQYXR0ZXJuTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICBjb25zdHJ1Y3RvciAoZWwsIG9wdHMpIHtcclxuICAgIHN1cGVyKGVsLCBvcHRzKTtcclxuXHJcbiAgICB0aGlzLl9ob2xsb3dzID0gW107XHJcbiAgICB0aGlzLnBsYWNlaG9sZGVyID0gb3B0cy5wbGFjZWhvbGRlcjtcclxuICAgIHRoaXMuZGVmaW5pdGlvbnMgPSB7XHJcbiAgICAgIC4uLlBhdHRlcm5NYXNrLkRFRklOSVRJT05TLFxyXG4gICAgICAuLi5vcHRzLmRlZmluaXRpb25zXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2FsaWduQ3Vyc29yID0gdGhpcy5fYWxpZ25DdXJzb3IuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkgPSB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5LmJpbmQodGhpcyk7XHJcblxyXG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgX2FsaWduQ3Vyc29yRnJpZW5kbHkgKCkge1xyXG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uU3RhcnQgIT09IHRoaXMuY3Vyc29yUG9zKSByZXR1cm47XHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvcigpO1xyXG4gIH1cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fYWxpZ25DdXJzb3JGcmllbmRseSk7XHJcbiAgfVxyXG5cclxuICB1bmJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIudW5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fYWxpZ25DdXJzb3JGcmllbmRseSk7XHJcbiAgfVxyXG5cclxuICBfaW5zdGFsbERlZmluaXRpb25zIChkZWZpbml0aW9ucykge1xyXG4gICAgdGhpcy5fZGVmaW5pdGlvbnMgPSBkZWZpbml0aW9ucztcclxuICAgIHRoaXMuX2NoYXJEZWZzID0gW107XHJcbiAgICB0aGlzLl9hbGlnblN0b3BzID0gW107XHJcblxyXG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLm1hc2s7XHJcbiAgICBpZiAoIXBhdHRlcm4gfHwgIWRlZmluaXRpb25zKSByZXR1cm47XHJcblxyXG4gICAgdmFyIHVubWFza2luZ0Jsb2NrID0gZmFsc2U7XHJcbiAgICB2YXIgb3B0aW9uYWxCbG9jayA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaT0wOyBpPHBhdHRlcm4ubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdmFyIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgdmFyIHR5cGUgPSAhdW5tYXNraW5nQmxvY2sgJiYgY2ggaW4gZGVmaW5pdGlvbnMgP1xyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCA6XHJcbiAgICAgICAgUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB2YXIgdW5tYXNraW5nID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUIHx8IHVubWFza2luZ0Jsb2NrO1xyXG4gICAgICB2YXIgb3B0aW9uYWwgPSB0eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgb3B0aW9uYWxCbG9jaztcclxuXHJcbiAgICAgIGlmIChjaCA9PT0gUGF0dGVybk1hc2suU1RPUF9DSEFSKSB7XHJcbiAgICAgICAgdGhpcy5fYWxpZ25TdG9wcy5wdXNoKHRoaXMuX2NoYXJEZWZzLmxlbmd0aCk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ3snIHx8IGNoID09PSAnfScpIHtcclxuICAgICAgICB1bm1hc2tpbmdCbG9jayA9ICF1bm1hc2tpbmdCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSAnWycgfHwgY2ggPT09ICddJykge1xyXG4gICAgICAgIG9wdGlvbmFsQmxvY2sgPSAhb3B0aW9uYWxCbG9jaztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNoID09PSBQYXR0ZXJuTWFzay5FU0NBUEVfQ0hBUikge1xyXG4gICAgICAgICsraTtcclxuICAgICAgICBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgICAgLy8gVE9ETyB2YWxpZGF0aW9uXHJcbiAgICAgICAgaWYgKCFjaCkgYnJlYWs7XHJcbiAgICAgICAgdHlwZSA9IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fY2hhckRlZnMucHVzaCh7XHJcbiAgICAgICAgY2hhcjogY2gsXHJcbiAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICBvcHRpb25hbDogb3B0aW9uYWwsXHJcbiAgICAgICAgdW5tYXNraW5nOiB1bm1hc2tpbmdcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fYnVpbGRSZXNvbHZlcnMoKTtcclxuICB9XHJcblxyXG4gIF9idWlsZFJlc29sdmVycyAoKSB7XHJcbiAgICB0aGlzLl9yZXNvbHZlcnMgPSB7fTtcclxuICAgIGZvciAodmFyIGRlZktleSBpbiB0aGlzLmRlZmluaXRpb25zKSB7XHJcbiAgICAgIHRoaXMuX3Jlc29sdmVyc1tkZWZLZXldID0gSU1hc2suTWFza0ZhY3RvcnkodGhpcy5lbCwge1xyXG4gICAgICAgIG1hc2s6IHRoaXMuZGVmaW5pdGlvbnNbZGVmS2V5XVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9hcHBlbmRUYWlsIChzdHIsIHRhaWwsIHNraXBVbnJlc29sdmVkSW5wdXQ9dHJ1ZSkge1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoc3RyLmxlbmd0aCk7IGNpIDwgdGFpbC5sZW5ndGg7KSB7XHJcbiAgICAgIGlmICh0aGlzLl9pc0hvbGxvdyhkaSkpIHtcclxuICAgICAgICAvLyBUT0RPIGNoZWNrIG90aGVyIGNhc2VzXHJcbiAgICAgICAgKytkaTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGNoID0gdGFpbFtjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLmRlZihkaSwgc3RyICsgcGxhY2Vob2xkZXJCdWZmZXIpO1xyXG5cclxuICAgICAgLy8gZmFpbGVkXHJcbiAgICAgIGlmICghZGVmKSB7XHJcbiAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgIHZhciByZXNvbHZlciA9IHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl07XHJcbiAgICAgICAgdmFyIGNocmVzID0gcmVzb2x2ZXIucmVzb2x2ZShjaCwgZGksIHN0ciArIHBsYWNlaG9sZGVyQnVmZmVyKSB8fCAnJztcclxuICAgICAgICB2YXIgaXNSZXNvbHZlZCA9ICEhY2hyZXM7XHJcblxyXG4gICAgICAgIC8vIGlmIG9rIC0gbmV4dCBkaVxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgY2hyZXMgPSBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICghZGVmLm9wdGlvbmFsICYmIHNraXBVbnJlc29sdmVkSW5wdXQpIGNocmVzID0gdGhpcy5fcGxhY2Vob2xkZXIuY2hhcjtcclxuICAgICAgICAgIC8vIFRPRE8gc2VlbXMgY2hlY2sgaXMgdXNlbGVzc1xyXG4gICAgICAgICAgaWYgKGhvbGxvd3MuaW5kZXhPZihkaSkgPCAwKSBob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNocmVzKSB7XHJcbiAgICAgICAgICBzdHIgKz0gcGxhY2Vob2xkZXJCdWZmZXIgKyBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2hyZXMgfHwgZGVmLm9wdGlvbmFsIHx8ICFza2lwVW5yZXNvbHZlZElucHV0KSArK2RpO1xyXG4gICAgICAgIGlmIChpc1Jlc29sdmVkIHx8ICFkZWYub3B0aW9uYWwgJiYgIXNraXBVbnJlc29sdmVkSW5wdXQpICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcblxyXG4gICAgICAgIGlmIChjaCA9PT0gZGVmLmNoYXIgJiYgKGRlZi51bm1hc2tpbmcgfHwgIXNraXBVbnJlc29sdmVkSW5wdXQpKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3N0ciwgaG9sbG93cywgb3ZlcmZsb3ddO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFRhaWxDaHVua3MgKHN0ciwgY2h1bmtzLCBza2lwVW5yZXNvbHZlZElucHV0KSB7XHJcbiAgICB2YXIgb3ZlcmZsb3cgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGNpPTA7IGNpIDwgY2h1bmtzLmxlbmd0aDsgKytjaSkge1xyXG4gICAgICB2YXIgWywgaW5wdXRdID0gY2h1bmtzW2NpXTtcclxuICAgICAgW3N0ciwgdGhpcy5faG9sbG93cywgb3ZlcmZsb3ddID0gdGhpcy5fYXBwZW5kVGFpbChzdHIsIGlucHV0LCBza2lwVW5yZXNvbHZlZElucHV0KTtcclxuICAgICAgaWYgKG92ZXJmbG93KSBicmVhaztcclxuXHJcbiAgICAgIC8vIG5vdCBsYXN0IC0gYXBwZW5kIHBsYWNlaG9sZGVyIGJldHdlZW4gc3RvcHNcclxuICAgICAgdmFyIGNodW5rMiA9IGNodW5rc1tjaSsxXVxyXG4gICAgICB2YXIgc3RvcDIgPSBjaHVuazIgJiYgY2h1bmsyWzBdO1xyXG4gICAgICBpZiAoc3RvcDIpIHN0ciA9IHRoaXMuX2FwcGVuZFBsYWNlaG9sZGVyRW5kKHN0ciwgc3RvcDIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFtzdHIsIHRoaXMuX2hvbGxvd3MsIG92ZXJmbG93XTtcclxuICB9XHJcblxyXG4gIF9leHRyYWN0SW5wdXQgKHN0ciwgZnJvbVBvcz0wLCB0b1Bvcykge1xyXG4gICAgdmFyIGlucHV0ID0gJyc7XHJcblxyXG4gICAgdmFyIHRvRGVmSW5kZXggPSB0b1BvcyAmJiB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KHRvUG9zKTtcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoZnJvbVBvcyk7IGNpPHN0ci5sZW5ndGggJiYgKCF0b0RlZkluZGV4IHx8IGRpIDwgdG9EZWZJbmRleCk7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuZGVmKGRpLCBzdHIpO1xyXG5cclxuICAgICAgaWYgKCFkZWYpIGJyZWFrO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0lucHV0KGRpKSAmJiAhdGhpcy5faXNIb2xsb3coZGkpKSBpbnB1dCArPSBjaDtcclxuICAgICAgKytjaTtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIF9leHRyYWN0SW5wdXRDaHVua3MgKHN0ciwgc3RvcHMpIHtcclxuICAgIHZhciBjaHVua3MgPSBbXTtcclxuICAgIGZvciAodmFyIHNpPTA7IHNpPHN0b3BzLmxlbmd0aCAmJiBzdHI7ICsrc2kpIHtcclxuICAgICAgdmFyIHMgPSBzdG9wc1tzaV07XHJcbiAgICAgIHZhciBzMiA9IHN0b3BzW3NpKzFdO1xyXG4gICAgICBjaHVua3MucHVzaChbcywgdGhpcy5fZXh0cmFjdElucHV0KHN0ciwgcywgczIpXSk7XHJcbiAgICAgIGlmIChzMikgc3RyID0gc3RyLnNsaWNlKHMyIC0gcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2h1bmtzO1xyXG4gIH1cclxuXHJcbiAgX2lzSG9sbG93IChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkZWZJbmRleCkgPj0gMDtcclxuICB9XHJcblxyXG4gIF9pc0hpZGRlbkhvbGxvdyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9pc0hvbGxvdyhkZWZJbmRleCkgJiYgdGhpcy5kZWYoZGVmSW5kZXgpICYmIHRoaXMuZGVmKGRlZkluZGV4KS5vcHRpb25hbDtcclxuICB9XHJcblxyXG4gIF9pc0lucHV0IChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZGVmKGRlZkluZGV4KSAmJiB0aGlzLmRlZihkZWZJbmRleCkudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUO1xyXG4gIH1cclxuXHJcbiAgX2hvbGxvd3NCZWZvcmUgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgZGVmSW5kZXggJiYgdGhpcy5faXNIaWRkZW5Ib2xsb3coaCkpO1xyXG4gIH1cclxuXHJcbiAgX21hcERlZkluZGV4VG9Qb3MgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gZGVmSW5kZXggLSB0aGlzLl9ob2xsb3dzQmVmb3JlKGRlZkluZGV4KS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBfbWFwUG9zVG9EZWZJbmRleCAocG9zKSB7XHJcbiAgICB2YXIgZGVmSW5kZXggPSBwb3M7XHJcbiAgICBmb3IgKHZhciBoaT0wOyBoaTx0aGlzLl9ob2xsb3dzLmxlbmd0aDsgKytoaSkge1xyXG4gICAgICB2YXIgaCA9IHRoaXMuX2hvbGxvd3NbaGldO1xyXG4gICAgICBpZiAoaCA+PSBkZWZJbmRleCkgYnJlYWs7XHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhoKSkgKytkZWZJbmRleDtcclxuICAgIH1cclxuICAgIHJldHVybiBkZWZJbmRleDtcclxuICB9XHJcblxyXG4gIF9nZW5lcmF0ZUluc2VydFN0ZXBzIChoZWFkLCBpbnNlcnRlZCkge1xyXG4gICAgdmFyIG92ZXJmbG93ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gc2F2ZSBob2xsb3cgZHVyaW5nIGdlbmVyYXRpb25cclxuICAgIHZhciBob2xsb3dzID0gdGhpcy5faG9sbG93cztcclxuXHJcbiAgICB2YXIgaW5zZXJ0U3RlcHMgPSBbW2hlYWQsIGhvbGxvd3Muc2xpY2UoKV1dO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTA7IGNpPGluc2VydGVkLmxlbmd0aCAmJiAhb3ZlcmZsb3c7ICsrY2kpIHtcclxuICAgICAgdmFyIGNoID0gaW5zZXJ0ZWRbY2ldO1xyXG4gICAgICB2YXIgW3JlcywgaG9sbG93cywgb3ZlcmZsb3ddID0gdGhpcy5fYXBwZW5kVGFpbChoZWFkLCBjaCwgZmFsc2UpO1xyXG4gICAgICB0aGlzLl9ob2xsb3dzID0gaG9sbG93cztcclxuICAgICAgaWYgKCFvdmVyZmxvdyAmJiByZXMgIT09IGhlYWQpIHtcclxuICAgICAgICBpbnNlcnRTdGVwcy5wdXNoKFtyZXMsIGhvbGxvd3NdKTtcclxuICAgICAgICBoZWFkID0gcmVzO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcG9wIGhvbGxvd3MgYmFja1xyXG4gICAgdGhpcy5faG9sbG93cyA9IGhvbGxvd3M7XHJcblxyXG4gICAgcmV0dXJuIGluc2VydFN0ZXBzO1xyXG4gIH1cclxuXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgICB2YXIgc3RhcnRDaGFuZ2VQb3MgPSBkZXRhaWxzLnN0YXJ0Q2hhbmdlUG9zO1xyXG4gICAgdmFyIGluc2VydGVkID0gZGV0YWlscy5pbnNlcnRlZDtcclxuICAgIHZhciByZW1vdmVkQ291bnQgPSBkZXRhaWxzLnJlbW92ZWQubGVuZ3RoO1xyXG4gICAgdmFyIHRhaWxQb3MgPSBzdGFydENoYW5nZVBvcyArIHJlbW92ZWRDb3VudDtcclxuICAgIHZhciB0YWlsRGVmSW5kZXggPSB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KHRhaWxQb3MpO1xyXG4gICAgdmFyIHRhaWxBbGlnblN0b3BzUG9zID0gW1xyXG4gICAgICB0YWlsUG9zLFxyXG4gICAgICAuLi50aGlzLl9hbGlnblN0b3BzXHJcbiAgICAgICAgLmZpbHRlcihzID0+IHMgPj0gdGFpbERlZkluZGV4KVxyXG4gICAgICAgIC5tYXAocyA9PiB0aGlzLl9tYXBEZWZJbmRleFRvUG9zKHMpKVxyXG4gICAgXTtcclxuICAgIHZhciB0YWlsSW5wdXRDaHVua3MgPSB0aGlzLl9leHRyYWN0SW5wdXRDaHVua3MoZGV0YWlscy50YWlsLCB0YWlsQWxpZ25TdG9wc1Bvcyk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhvbGxvd3MgYWZ0ZXIgY3Vyc29yXHJcbiAgICB2YXIgbGFzdEhvbGxvd0luZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChzdGFydENoYW5nZVBvcyk7XHJcbiAgICB0aGlzLl9ob2xsb3dzID0gdGhpcy5faG9sbG93cy5maWx0ZXIoaCA9PiBoIDwgbGFzdEhvbGxvd0luZGV4KTtcclxuXHJcbiAgICB2YXIgcmVzID0gZGV0YWlscy5oZWFkO1xyXG5cclxuICAgIC8vIGluc2VydCBhdmFpbGFibGVcclxuICAgIHZhciBpbnNlcnRTdGVwcyA9IHRoaXMuX2dlbmVyYXRlSW5zZXJ0U3RlcHMocmVzLCBpbnNlcnRlZCk7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcCwgdHJlcywgb3ZlcmZsb3c7XHJcbiAgICAgIFtzdGVwLCB0aGlzLl9ob2xsb3dzXSA9IGluc2VydFN0ZXBzW2lzdGVwXTtcclxuICAgICAgW3RyZXMsIHRoaXMuX2hvbGxvd3MsIG92ZXJmbG93XSA9IHRoaXMuX2FwcGVuZFRhaWxDaHVua3Moc3RlcCwgdGFpbElucHV0Q2h1bmtzKTtcclxuICAgICAgaWYgKCFvdmVyZmxvdykge1xyXG4gICAgICAgIHJlcyA9IHRyZXM7XHJcbiAgICAgICAgY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBpbnB1dCBhdCB0aGUgZW5kIC0gYXBwZW5kIGZpeGVkXHJcbiAgICBpZiAoaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIGFwcGVuZCBmaXhlZCBhdCBlbmRcclxuICAgICAgdmFyIGFwcGVuZGVkID0gdGhpcy5fYXBwZW5kRml4ZWRFbmQocmVzKTtcclxuICAgICAgY3Vyc29yUG9zICs9IGFwcGVuZGVkLmxlbmd0aCAtIHJlcy5sZW5ndGg7XHJcbiAgICAgIHJlcyA9IGFwcGVuZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaW5zZXJ0ZWQgJiYgcmVtb3ZlZENvdW50KSB7XHJcbiAgICAgIC8vIGlmIGRlbGV0ZSBhdCByaWdodFxyXG4gICAgICAvLyBpZiAoZGV0YWlscy5vbGRTZWxlY3Rpb24uZW5kID09PSBjdXJzb3JQb3MpIHtcclxuICAgICAgLy8gICBmb3IgKDs7KytjdXJzb3JQb3MpIHtcclxuICAgICAgLy8gICAgIHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGN1cnNvclBvcyk7XHJcbiAgICAgIC8vICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGkpO1xyXG4gICAgICAvLyAgICAgaWYgKCFkZWYgfHwgZGVmLnR5cGUgIT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCkgYnJlYWs7XHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyB9XHJcblxyXG4gICAgICAvLyByZW1vdmUgaGVhZCBmaXhlZCBhbmQgaG9sbG93cyBpZiByZW1vdmVkIGF0IGVuZFxyXG4gICAgICBpZiAoY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGhhc0hvbGxvd3MgPSBmYWxzZTtcclxuICAgICAgICB2YXIgZGkgPSB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KGN1cnNvclBvcy0xKTtcclxuICAgICAgICBmb3IgKDsgZGkgPiAwOyAtLWRpKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5faXNJbnB1dChkaSkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzSG9sbG93KGRpKSkgaGFzSG9sbG93cyA9IHRydWU7XHJcbiAgICAgICAgICAgIGVsc2UgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYXNIb2xsb3dzKSByZXMgPSByZXMuc2xpY2UoMCwgZGkgKyAxKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY3Vyc29yUG9zID0gdGhpcy5fbmVhcmVzdElucHV0UG9zKGN1cnNvclBvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZGV0YWlscy5jdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcbiAgICByZXMgPSB0aGlzLl9hcHBlbmRQbGFjZWhvbGRlckVuZChyZXMpO1xyXG5cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBfZmlyZUNoYW5nZUV2ZW50cyAoKSB7XHJcbiAgICAvLyBmaXJlICdjb21wbGV0ZScgYWZ0ZXIgJ2FjY2VwdCcgZXZlbnRcclxuICAgIHN1cGVyLl9maXJlQ2hhbmdlRXZlbnRzKCk7XHJcbiAgICBpZiAodGhpcy5pc0NvbXBsZXRlKSB0aGlzLmZpcmVFdmVudChcImNvbXBsZXRlXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzQ29tcGxldGUgKCkge1xyXG4gICAgZm9yICh2YXIgZGk9MDsgOysrZGkpIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuZGVmKGRpKTtcclxuICAgICAgaWYgKCFkZWYpIGJyZWFrO1xyXG4gICAgICBpZiAodGhpcy5faXNJbnB1dChkaSkgJiYgIWRlZi5vcHRpb25hbCAmJiB0aGlzLl9pc0hvbGxvdyhkaSkpIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZEZpeGVkRW5kIChyZXMpIHtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7IDsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGksIHJlcyk7XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAodGhpcy5faXNJbnB1dChkaSkpIGJyZWFrO1xyXG4gICAgICBpZiAoZGkgPj0gcmVzLmxlbmd0aCkgcmVzICs9IGRlZi5jaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9hcHBlbmRQbGFjZWhvbGRlckVuZCAocmVzLCB0b1Bvcykge1xyXG4gICAgdmFyIHRvRGVmSW5kZXggPSB0b1BvcyAmJiB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KHRvUG9zKTtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7ICF0b0RlZkluZGV4IHx8IGRpIDwgdG9EZWZJbmRleDsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGksIHJlcyk7XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0lucHV0KGRpKSAmJiAhdGhpcy5faXNIb2xsb3coZGkpKSB7XHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5fcGxhY2Vob2xkZXIuc2hvdyA9PT0gJ2Fsd2F5cycgfHwgdG9Qb3MpIHtcclxuICAgICAgICByZXMgKz0gZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCA/XHJcbiAgICAgICAgICBkZWYuY2hhciA6XHJcbiAgICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgICAgdGhpcy5fcGxhY2Vob2xkZXIuY2hhciA6XHJcbiAgICAgICAgICAgICcnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX2NhbGNVbm1hc2tlZCAoc3RyKSB7XHJcbiAgICB2YXIgdW5tYXNrZWQgPSAnJztcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPTA7IGNpPHN0ci5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuZGVmKGRpLCBzdHIpO1xyXG5cclxuICAgICAgaWYgKCFkZWYpIGJyZWFrO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmIChkZWYudW5tYXNraW5nICYmICF0aGlzLl9pc0hvbGxvdyhkaSkgJiZcclxuICAgICAgICAodGhpcy5faXNJbnB1dChkaSkgJiYgdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXS5yZXNvbHZlKGNoLCBjaSwgc3RyKSB8fFxyXG4gICAgICAgICAgZGVmLmNoYXIgPT09IGNoKSkge1xyXG4gICAgICAgIHVubWFza2VkICs9IGNoO1xyXG4gICAgICB9XHJcbiAgICAgICsrY2k7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5tYXNrZWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fdW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuX2hvbGxvd3MubGVuZ3RoID0gMDtcclxuICAgIHZhciByZXM7XHJcbiAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IHRoaXMuX2FwcGVuZFRhaWwoJycsIHN0cik7XHJcbiAgICB0aGlzLnVwZGF0ZUVsZW1lbnQodGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKSk7XHJcblxyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IoKTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlciAoKSB7IHJldHVybiB0aGlzLl9wbGFjZWhvbGRlcjsgfVxyXG5cclxuICBzZXQgcGxhY2Vob2xkZXIgKHBoKSB7XHJcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUixcclxuICAgICAgLi4ucGhcclxuICAgIH07XHJcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHRoaXMudW5tYXNrZWRWYWx1ZSA9IHRoaXMudW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlckxhYmVsICgpIHtcclxuICAgIHJldHVybiB0aGlzLmRlZnMoKS5tYXAoZGVmID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgJycpLmpvaW4oJycpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRlZmluaXRpb25zICgpIHsgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zOyB9XHJcblxyXG4gIHNldCBkZWZpbml0aW9ucyAoZGVmcykge1xyXG4gICAgdGhpcy5faW5zdGFsbERlZmluaXRpb25zKGRlZnMpO1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB0aGlzLnVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXQgbWFzayAoKSB7IHJldHVybiB0aGlzLl9tYXNrOyB9XHJcblxyXG4gIHNldCBtYXNrIChtYXNrKSB7XHJcbiAgICB0aGlzLl9tYXNrID0gbWFzaztcclxuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgdGhpcy5kZWZpbml0aW9ucyA9IHRoaXMuZGVmaW5pdGlvbnM7XHJcbiAgfVxyXG5cclxuICBkZWZzIChzdHIpIHtcclxuICAgIHZhciBkZWZzID0gW107XHJcbiAgICBmb3IgKHZhciBpPTA7IDsrK2kpIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuZGVmKGksIHN0cik7XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuICAgICAgZGVmcy5wdXNoKGRlZik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVmcztcclxuICB9XHJcblxyXG4gIGRlZiAoaW5kZXgsIHN0cikge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NoYXJEZWZzW2luZGV4XTtcclxuICB9XHJcblxyXG4gIF9uZWFyZXN0SW5wdXRQb3MgKGN1cnNvclBvcykge1xyXG4gICAgdmFyIGN1cnNvckRlZkluZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChjdXJzb3JQb3MpO1xyXG5cclxuICAgIHZhciBsUG9zID0gY3Vyc29yRGVmSW5kZXggLSAxO1xyXG5cclxuICAgIC8vIGFsaWduIGxlZnQgdGlsbCBmaXJzdCBpbnB1dFxyXG4gICAgd2hpbGUgKGxQb3MgPj0gMCAmJiAhdGhpcy5faXNJbnB1dChsUG9zKSAmJiAhdGhpcy5faXNJbnB1dChsUG9zKzEpKSAtLWxQb3M7XHJcbiAgICBjdXJzb3JEZWZJbmRleCA9IGxQb3MgKyAxOyAgLy8gYWRqdXN0IG1heCBhdmFpbGFibGUgcG9zXHJcblxyXG4gICAgLy8gY29udGludWUgYWxpZ24gbGVmdCBhbHNvIHNraXBwaW5nIGhvbGxvd3NcclxuICAgIHdoaWxlIChsUG9zID49IDAgJiYgKCF0aGlzLl9pc0lucHV0KGxQb3MpIHx8IHRoaXMuX2lzSG9sbG93KGxQb3MpKSkgLS1sUG9zO1xyXG5cclxuICAgIHZhciByUG9zID0gbFBvcyArIDE7XHJcblxyXG4gICAgLy8gYWxpZ24gcmlnaHQgYmFjayB1bnRpbCBmaXJzdCBpbnB1dFxyXG4gICAgd2hpbGUgKHRoaXMuZGVmKHJQb3MpICYmICF0aGlzLl9pc0lucHV0KHJQb3MtMSkgJiYgIXRoaXMuX2lzSW5wdXQoclBvcykpICsrclBvcztcclxuICAgIGN1cnNvckRlZkluZGV4ID0gTWF0aC5tYXgoclBvcywgY3Vyc29yRGVmSW5kZXgpOyAgLy8gYWRqdXN0IG1heCBhdmFpbGFibGUgcG9zXHJcblxyXG4gICAgLy8gY29udGludWUgYWxpZ24gcmlnaHQgYWxzbyBza2lwcGluZyBob2xsb3dzXHJcbiAgICB3aGlsZSAoclBvcyA8IGN1cnNvckRlZkluZGV4ICYmICghdGhpcy5faXNJbnB1dChyUG9zKSB8fCAhdGhpcy5faXNIb2xsb3coclBvcykpKSArK3JQb3M7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX21hcERlZkluZGV4VG9Qb3MoclBvcyk7XHJcbiAgfVxyXG5cclxuICBfYWxpZ25DdXJzb3IgKCkge1xyXG4gICAgdGhpcy5jdXJzb3JQb3MgPSB0aGlzLl9uZWFyZXN0SW5wdXRQb3ModGhpcy5jdXJzb3JQb3MpO1xyXG4gIH1cclxufVxyXG5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyA9IHtcclxuICAnMCc6IC9cXGQvLFxyXG4gICdhJzogL1tcXHUwMDQxLVxcdTAwNUFcXHUwMDYxLVxcdTAwN0FcXHUwMEFBXFx1MDBCNVxcdTAwQkFcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZcXHUwMEY4LVxcdTAyQzFcXHUwMkM2LVxcdTAyRDFcXHUwMkUwLVxcdTAyRTRcXHUwMkVDXFx1MDJFRVxcdTAzNzAtXFx1MDM3NFxcdTAzNzZcXHUwMzc3XFx1MDM3QS1cXHUwMzdEXFx1MDM4NlxcdTAzODgtXFx1MDM4QVxcdTAzOENcXHUwMzhFLVxcdTAzQTFcXHUwM0EzLVxcdTAzRjVcXHUwM0Y3LVxcdTA0ODFcXHUwNDhBLVxcdTA1MjdcXHUwNTMxLVxcdTA1NTZcXHUwNTU5XFx1MDU2MS1cXHUwNTg3XFx1MDVEMC1cXHUwNUVBXFx1MDVGMC1cXHUwNUYyXFx1MDYyMC1cXHUwNjRBXFx1MDY2RVxcdTA2NkZcXHUwNjcxLVxcdTA2RDNcXHUwNkQ1XFx1MDZFNVxcdTA2RTZcXHUwNkVFXFx1MDZFRlxcdTA2RkEtXFx1MDZGQ1xcdTA2RkZcXHUwNzEwXFx1MDcxMi1cXHUwNzJGXFx1MDc0RC1cXHUwN0E1XFx1MDdCMVxcdTA3Q0EtXFx1MDdFQVxcdTA3RjRcXHUwN0Y1XFx1MDdGQVxcdTA4MDAtXFx1MDgxNVxcdTA4MUFcXHUwODI0XFx1MDgyOFxcdTA4NDAtXFx1MDg1OFxcdTA4QTBcXHUwOEEyLVxcdTA4QUNcXHUwOTA0LVxcdTA5MzlcXHUwOTNEXFx1MDk1MFxcdTA5NTgtXFx1MDk2MVxcdTA5NzEtXFx1MDk3N1xcdTA5NzktXFx1MDk3RlxcdTA5ODUtXFx1MDk4Q1xcdTA5OEZcXHUwOTkwXFx1MDk5My1cXHUwOUE4XFx1MDlBQS1cXHUwOUIwXFx1MDlCMlxcdTA5QjYtXFx1MDlCOVxcdTA5QkRcXHUwOUNFXFx1MDlEQ1xcdTA5RERcXHUwOURGLVxcdTA5RTFcXHUwOUYwXFx1MDlGMVxcdTBBMDUtXFx1MEEwQVxcdTBBMEZcXHUwQTEwXFx1MEExMy1cXHUwQTI4XFx1MEEyQS1cXHUwQTMwXFx1MEEzMlxcdTBBMzNcXHUwQTM1XFx1MEEzNlxcdTBBMzhcXHUwQTM5XFx1MEE1OS1cXHUwQTVDXFx1MEE1RVxcdTBBNzItXFx1MEE3NFxcdTBBODUtXFx1MEE4RFxcdTBBOEYtXFx1MEE5MVxcdTBBOTMtXFx1MEFBOFxcdTBBQUEtXFx1MEFCMFxcdTBBQjJcXHUwQUIzXFx1MEFCNS1cXHUwQUI5XFx1MEFCRFxcdTBBRDBcXHUwQUUwXFx1MEFFMVxcdTBCMDUtXFx1MEIwQ1xcdTBCMEZcXHUwQjEwXFx1MEIxMy1cXHUwQjI4XFx1MEIyQS1cXHUwQjMwXFx1MEIzMlxcdTBCMzNcXHUwQjM1LVxcdTBCMzlcXHUwQjNEXFx1MEI1Q1xcdTBCNURcXHUwQjVGLVxcdTBCNjFcXHUwQjcxXFx1MEI4M1xcdTBCODUtXFx1MEI4QVxcdTBCOEUtXFx1MEI5MFxcdTBCOTItXFx1MEI5NVxcdTBCOTlcXHUwQjlBXFx1MEI5Q1xcdTBCOUVcXHUwQjlGXFx1MEJBM1xcdTBCQTRcXHUwQkE4LVxcdTBCQUFcXHUwQkFFLVxcdTBCQjlcXHUwQkQwXFx1MEMwNS1cXHUwQzBDXFx1MEMwRS1cXHUwQzEwXFx1MEMxMi1cXHUwQzI4XFx1MEMyQS1cXHUwQzMzXFx1MEMzNS1cXHUwQzM5XFx1MEMzRFxcdTBDNThcXHUwQzU5XFx1MEM2MFxcdTBDNjFcXHUwQzg1LVxcdTBDOENcXHUwQzhFLVxcdTBDOTBcXHUwQzkyLVxcdTBDQThcXHUwQ0FBLVxcdTBDQjNcXHUwQ0I1LVxcdTBDQjlcXHUwQ0JEXFx1MENERVxcdTBDRTBcXHUwQ0UxXFx1MENGMVxcdTBDRjJcXHUwRDA1LVxcdTBEMENcXHUwRDBFLVxcdTBEMTBcXHUwRDEyLVxcdTBEM0FcXHUwRDNEXFx1MEQ0RVxcdTBENjBcXHUwRDYxXFx1MEQ3QS1cXHUwRDdGXFx1MEQ4NS1cXHUwRDk2XFx1MEQ5QS1cXHUwREIxXFx1MERCMy1cXHUwREJCXFx1MERCRFxcdTBEQzAtXFx1MERDNlxcdTBFMDEtXFx1MEUzMFxcdTBFMzJcXHUwRTMzXFx1MEU0MC1cXHUwRTQ2XFx1MEU4MVxcdTBFODJcXHUwRTg0XFx1MEU4N1xcdTBFODhcXHUwRThBXFx1MEU4RFxcdTBFOTQtXFx1MEU5N1xcdTBFOTktXFx1MEU5RlxcdTBFQTEtXFx1MEVBM1xcdTBFQTVcXHUwRUE3XFx1MEVBQVxcdTBFQUJcXHUwRUFELVxcdTBFQjBcXHUwRUIyXFx1MEVCM1xcdTBFQkRcXHUwRUMwLVxcdTBFQzRcXHUwRUM2XFx1MEVEQy1cXHUwRURGXFx1MEYwMFxcdTBGNDAtXFx1MEY0N1xcdTBGNDktXFx1MEY2Q1xcdTBGODgtXFx1MEY4Q1xcdTEwMDAtXFx1MTAyQVxcdTEwM0ZcXHUxMDUwLVxcdTEwNTVcXHUxMDVBLVxcdTEwNURcXHUxMDYxXFx1MTA2NVxcdTEwNjZcXHUxMDZFLVxcdTEwNzBcXHUxMDc1LVxcdTEwODFcXHUxMDhFXFx1MTBBMC1cXHUxMEM1XFx1MTBDN1xcdTEwQ0RcXHUxMEQwLVxcdTEwRkFcXHUxMEZDLVxcdTEyNDhcXHUxMjRBLVxcdTEyNERcXHUxMjUwLVxcdTEyNTZcXHUxMjU4XFx1MTI1QS1cXHUxMjVEXFx1MTI2MC1cXHUxMjg4XFx1MTI4QS1cXHUxMjhEXFx1MTI5MC1cXHUxMkIwXFx1MTJCMi1cXHUxMkI1XFx1MTJCOC1cXHUxMkJFXFx1MTJDMFxcdTEyQzItXFx1MTJDNVxcdTEyQzgtXFx1MTJENlxcdTEyRDgtXFx1MTMxMFxcdTEzMTItXFx1MTMxNVxcdTEzMTgtXFx1MTM1QVxcdTEzODAtXFx1MTM4RlxcdTEzQTAtXFx1MTNGNFxcdTE0MDEtXFx1MTY2Q1xcdTE2NkYtXFx1MTY3RlxcdTE2ODEtXFx1MTY5QVxcdTE2QTAtXFx1MTZFQVxcdTE3MDAtXFx1MTcwQ1xcdTE3MEUtXFx1MTcxMVxcdTE3MjAtXFx1MTczMVxcdTE3NDAtXFx1MTc1MVxcdTE3NjAtXFx1MTc2Q1xcdTE3NkUtXFx1MTc3MFxcdTE3ODAtXFx1MTdCM1xcdTE3RDdcXHUxN0RDXFx1MTgyMC1cXHUxODc3XFx1MTg4MC1cXHUxOEE4XFx1MThBQVxcdTE4QjAtXFx1MThGNVxcdTE5MDAtXFx1MTkxQ1xcdTE5NTAtXFx1MTk2RFxcdTE5NzAtXFx1MTk3NFxcdTE5ODAtXFx1MTlBQlxcdTE5QzEtXFx1MTlDN1xcdTFBMDAtXFx1MUExNlxcdTFBMjAtXFx1MUE1NFxcdTFBQTdcXHUxQjA1LVxcdTFCMzNcXHUxQjQ1LVxcdTFCNEJcXHUxQjgzLVxcdTFCQTBcXHUxQkFFXFx1MUJBRlxcdTFCQkEtXFx1MUJFNVxcdTFDMDAtXFx1MUMyM1xcdTFDNEQtXFx1MUM0RlxcdTFDNUEtXFx1MUM3RFxcdTFDRTktXFx1MUNFQ1xcdTFDRUUtXFx1MUNGMVxcdTFDRjVcXHUxQ0Y2XFx1MUQwMC1cXHUxREJGXFx1MUUwMC1cXHUxRjE1XFx1MUYxOC1cXHUxRjFEXFx1MUYyMC1cXHUxRjQ1XFx1MUY0OC1cXHUxRjREXFx1MUY1MC1cXHUxRjU3XFx1MUY1OVxcdTFGNUJcXHUxRjVEXFx1MUY1Ri1cXHUxRjdEXFx1MUY4MC1cXHUxRkI0XFx1MUZCNi1cXHUxRkJDXFx1MUZCRVxcdTFGQzItXFx1MUZDNFxcdTFGQzYtXFx1MUZDQ1xcdTFGRDAtXFx1MUZEM1xcdTFGRDYtXFx1MUZEQlxcdTFGRTAtXFx1MUZFQ1xcdTFGRjItXFx1MUZGNFxcdTFGRjYtXFx1MUZGQ1xcdTIwNzFcXHUyMDdGXFx1MjA5MC1cXHUyMDlDXFx1MjEwMlxcdTIxMDdcXHUyMTBBLVxcdTIxMTNcXHUyMTE1XFx1MjExOS1cXHUyMTFEXFx1MjEyNFxcdTIxMjZcXHUyMTI4XFx1MjEyQS1cXHUyMTJEXFx1MjEyRi1cXHUyMTM5XFx1MjEzQy1cXHUyMTNGXFx1MjE0NS1cXHUyMTQ5XFx1MjE0RVxcdTIxODNcXHUyMTg0XFx1MkMwMC1cXHUyQzJFXFx1MkMzMC1cXHUyQzVFXFx1MkM2MC1cXHUyQ0U0XFx1MkNFQi1cXHUyQ0VFXFx1MkNGMlxcdTJDRjNcXHUyRDAwLVxcdTJEMjVcXHUyRDI3XFx1MkQyRFxcdTJEMzAtXFx1MkQ2N1xcdTJENkZcXHUyRDgwLVxcdTJEOTZcXHUyREEwLVxcdTJEQTZcXHUyREE4LVxcdTJEQUVcXHUyREIwLVxcdTJEQjZcXHUyREI4LVxcdTJEQkVcXHUyREMwLVxcdTJEQzZcXHUyREM4LVxcdTJEQ0VcXHUyREQwLVxcdTJERDZcXHUyREQ4LVxcdTJEREVcXHUyRTJGXFx1MzAwNVxcdTMwMDZcXHUzMDMxLVxcdTMwMzVcXHUzMDNCXFx1MzAzQ1xcdTMwNDEtXFx1MzA5NlxcdTMwOUQtXFx1MzA5RlxcdTMwQTEtXFx1MzBGQVxcdTMwRkMtXFx1MzBGRlxcdTMxMDUtXFx1MzEyRFxcdTMxMzEtXFx1MzE4RVxcdTMxQTAtXFx1MzFCQVxcdTMxRjAtXFx1MzFGRlxcdTM0MDAtXFx1NERCNVxcdTRFMDAtXFx1OUZDQ1xcdUEwMDAtXFx1QTQ4Q1xcdUE0RDAtXFx1QTRGRFxcdUE1MDAtXFx1QTYwQ1xcdUE2MTAtXFx1QTYxRlxcdUE2MkFcXHVBNjJCXFx1QTY0MC1cXHVBNjZFXFx1QTY3Ri1cXHVBNjk3XFx1QTZBMC1cXHVBNkU1XFx1QTcxNy1cXHVBNzFGXFx1QTcyMi1cXHVBNzg4XFx1QTc4Qi1cXHVBNzhFXFx1QTc5MC1cXHVBNzkzXFx1QTdBMC1cXHVBN0FBXFx1QTdGOC1cXHVBODAxXFx1QTgwMy1cXHVBODA1XFx1QTgwNy1cXHVBODBBXFx1QTgwQy1cXHVBODIyXFx1QTg0MC1cXHVBODczXFx1QTg4Mi1cXHVBOEIzXFx1QThGMi1cXHVBOEY3XFx1QThGQlxcdUE5MEEtXFx1QTkyNVxcdUE5MzAtXFx1QTk0NlxcdUE5NjAtXFx1QTk3Q1xcdUE5ODQtXFx1QTlCMlxcdUE5Q0ZcXHVBQTAwLVxcdUFBMjhcXHVBQTQwLVxcdUFBNDJcXHVBQTQ0LVxcdUFBNEJcXHVBQTYwLVxcdUFBNzZcXHVBQTdBXFx1QUE4MC1cXHVBQUFGXFx1QUFCMVxcdUFBQjVcXHVBQUI2XFx1QUFCOS1cXHVBQUJEXFx1QUFDMFxcdUFBQzJcXHVBQURCLVxcdUFBRERcXHVBQUUwLVxcdUFBRUFcXHVBQUYyLVxcdUFBRjRcXHVBQjAxLVxcdUFCMDZcXHVBQjA5LVxcdUFCMEVcXHVBQjExLVxcdUFCMTZcXHVBQjIwLVxcdUFCMjZcXHVBQjI4LVxcdUFCMkVcXHVBQkMwLVxcdUFCRTJcXHVBQzAwLVxcdUQ3QTNcXHVEN0IwLVxcdUQ3QzZcXHVEN0NCLVxcdUQ3RkJcXHVGOTAwLVxcdUZBNkRcXHVGQTcwLVxcdUZBRDlcXHVGQjAwLVxcdUZCMDZcXHVGQjEzLVxcdUZCMTdcXHVGQjFEXFx1RkIxRi1cXHVGQjI4XFx1RkIyQS1cXHVGQjM2XFx1RkIzOC1cXHVGQjNDXFx1RkIzRVxcdUZCNDBcXHVGQjQxXFx1RkI0M1xcdUZCNDRcXHVGQjQ2LVxcdUZCQjFcXHVGQkQzLVxcdUZEM0RcXHVGRDUwLVxcdUZEOEZcXHVGRDkyLVxcdUZEQzdcXHVGREYwLVxcdUZERkJcXHVGRTcwLVxcdUZFNzRcXHVGRTc2LVxcdUZFRkNcXHVGRjIxLVxcdUZGM0FcXHVGRjQxLVxcdUZGNUFcXHVGRjY2LVxcdUZGQkVcXHVGRkMyLVxcdUZGQzdcXHVGRkNBLVxcdUZGQ0ZcXHVGRkQyLVxcdUZGRDdcXHVGRkRBLVxcdUZGRENdLywgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyMDc1MDcwXHJcbiAgJyonOiAvLi9cclxufTtcclxuUGF0dGVybk1hc2suREVGX1RZUEVTID0ge1xyXG4gIElOUFVUOiAnaW5wdXQnLFxyXG4gIEZJWEVEOiAnZml4ZWQnXHJcbn1cclxuUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUiA9IHtcclxuICBzaG93OiAnbGF6eScsXHJcbiAgY2hhcjogJ18nXHJcbn07XHJcblBhdHRlcm5NYXNrLlNUT1BfQ0hBUiA9ICdcXCcnO1xyXG5QYXR0ZXJuTWFzay5FU0NBUEVfQ0hBUiA9ICdcXFxcJztcclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcbmltcG9ydCB7ZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGlwZU1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICBzdXBlcihlbCwgb3B0cyk7XHJcblxyXG4gICAgdGhpcy5tdWx0aXBhc3MgPSBvcHRzLm11bHRpcGFzcztcclxuXHJcbiAgICB0aGlzLl9jb21waWxlZE1hc2tzID0gdGhpcy5tYXNrLm1hcChtID0+IElNYXNrLk1hc2tGYWN0b3J5KGVsLCBtKSk7XHJcbiAgfVxyXG5cclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHtcclxuICAgIHZhciByZXMgPSB0aGlzLl9waXBlKHN0ciwgZGV0YWlscyk7XHJcbiAgICBpZiAoIXRoaXMubXVsdGlwYXNzKSByZXR1cm4gcmVzO1xyXG5cclxuICAgIHZhciBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuXHJcbiAgICB2YXIgc3RlcFJlcztcclxuICAgIHZhciB0ZW1wUmVzID0gcmVzO1xyXG5cclxuICAgIHdoaWxlIChzdGVwUmVzICE9PSB0ZW1wUmVzKSB7XHJcbiAgICAgIHN0ZXBSZXMgPSB0ZW1wUmVzO1xyXG4gICAgICB0ZW1wUmVzID0gdGhpcy5fcGlwZShzdGVwUmVzLCB7XHJcbiAgICAgICAgY3Vyc29yUG9zOiBzdGVwUmVzLmxlbmd0aCxcclxuICAgICAgICBvbGRWYWx1ZTogc3RlcFJlcyxcclxuICAgICAgICBvbGRTZWxlY3Rpb246IHtcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiBzdGVwUmVzLmxlbmd0aFxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGV0YWlscy5jdXJzb3JQb3MgPSBjdXJzb3JQb3MgLSAocmVzLmxlbmd0aCAtIHN0ZXBSZXMubGVuZ3RoKTtcclxuXHJcbiAgICByZXR1cm4gc3RlcFJlcztcclxuICB9XHJcblxyXG4gIF9waXBlIChzdHIsIGRldGFpbHMpIHtcclxuICAgIHJldHVybiB0aGlzLl9jb21waWxlZE1hc2tzLnJlZHVjZSgocywgbSkgPT4ge1xyXG4gICAgICB2YXIgZCA9IGV4dGVuZERldGFpbHNBZGp1c3RtZW50cyhzLCBkZXRhaWxzKTtcclxuICAgICAgdmFyIHJlcyA9IG0ucmVzb2x2ZShzLCBkKTtcclxuICAgICAgZGV0YWlscy5jdXJzb3JQb3MgPSBkLmN1cnNvclBvcztcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0sIHN0cik7XHJcbiAgfVxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLmJpbmRFdmVudHMoKTtcclxuICAgIHRoaXMuX2NvbXBpbGVkTWFza3MuZm9yRWFjaChtID0+IHtcclxuICAgICAgbS5iaW5kRXZlbnRzKCk7XHJcbiAgICAgIC8vIGRpc2FibGUgYmFzZW1hc2sgZXZlbnRzIGZvciBjaGlsZCBtYXNrc1xyXG4gICAgICBCYXNlTWFzay5wcm90b3R5cGUudW5iaW5kRXZlbnRzLmFwcGx5KG0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB1bmJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIudW5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLl9jb21waWxlZE1hc2tzLmZvckVhY2gobSA9PiBtLnVuYmluZEV2ZW50cygpKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtpc1N0cmluZ30gZnJvbSAnLi91dGlscyc7XHJcblxyXG5pbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9tYXNrcy9iYXNlJztcclxuaW1wb3J0IFJlZ0V4cE1hc2sgZnJvbSAnLi9tYXNrcy9yZWdleHAnO1xyXG5pbXBvcnQgRnVuY01hc2sgZnJvbSAnLi9tYXNrcy9mdW5jJztcclxuaW1wb3J0IFBhdHRlcm5NYXNrIGZyb20gJy4vbWFza3MvcGF0dGVybic7XHJcbmltcG9ydCBQaXBlTWFzayBmcm9tICcuL21hc2tzL3BpcGUnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmZ1bmN0aW9uIElNYXNrIChlbCwgb3B0cz17fSkge1xyXG4gIHZhciBtYXNrID0gSU1hc2suTWFza0ZhY3RvcnkoZWwsIG9wdHMpO1xyXG4gIG1hc2suYmluZEV2ZW50cygpO1xyXG4gIC8vIHJlZnJlc2hcclxuICBtYXNrLnJhd1ZhbHVlID0gZWwudmFsdWU7XHJcbiAgcmV0dXJuIG1hc2s7XHJcbn1cclxuXHJcbklNYXNrLk1hc2tGYWN0b3J5ID0gZnVuY3Rpb24gKGVsLCBvcHRzKSB7XHJcbiAgdmFyIG1hc2sgPSBvcHRzLm1hc2s7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBCYXNlTWFzaykgcmV0dXJuIG1hc2s7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBuZXcgUmVnRXhwTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIG5ldyBQaXBlTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKGlzU3RyaW5nKG1hc2spKSByZXR1cm4gbmV3IFBhdHRlcm5NYXNrKGVsLCBvcHRzKTtcclxuICBpZiAobWFzay5wcm90b3R5cGUgaW5zdGFuY2VvZiBCYXNlTWFzaykgcmV0dXJuIG5ldyBtYXNrKGVsLCBvcHRzKTtcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSByZXR1cm4gbmV3IEZ1bmNNYXNrKGVsLCBvcHRzKTtcclxuICByZXR1cm4gbmV3IEJhc2VNYXNrKGVsLCBvcHRzKTtcclxufVxyXG5JTWFzay5CYXNlTWFzayA9IEJhc2VNYXNrO1xyXG5JTWFzay5GdW5jTWFzayA9IEZ1bmNNYXNrO1xyXG5JTWFzay5SZWdFeHBNYXNrID0gUmVnRXhwTWFzaztcclxuSU1hc2suUGF0dGVybk1hc2sgPSBQYXR0ZXJuTWFzaztcclxud2luZG93LklNYXNrID0gSU1hc2s7XHJcbiJdLCJuYW1lcyI6WyJpc1N0cmluZyIsInN0ciIsIlN0cmluZyIsImNvbmZvcm0iLCJyZXMiLCJmYWxsYmFjayIsImV4dGVuZERldGFpbHNBZGp1c3RtZW50cyIsImRldGFpbHMiLCJjdXJzb3JQb3MiLCJvbGRTZWxlY3Rpb24iLCJvbGRWYWx1ZSIsInN0YXJ0Q2hhbmdlUG9zIiwiTWF0aCIsIm1pbiIsInN0YXJ0IiwiaW5zZXJ0ZWRDb3VudCIsInJlbW92ZWRDb3VudCIsIm1heCIsImVuZCIsImxlbmd0aCIsImhlYWQiLCJzdWJzdHJpbmciLCJ0YWlsIiwiaW5zZXJ0ZWQiLCJzdWJzdHIiLCJyZW1vdmVkIiwiQmFzZU1hc2siLCJlbCIsIm9wdHMiLCJtYXNrIiwiX2xpc3RlbmVycyIsIl9yZWZyZXNoaW5nQ291bnQiLCJfcmF3VmFsdWUiLCJfdW5tYXNrZWRWYWx1ZSIsInNhdmVTZWxlY3Rpb24iLCJiaW5kIiwiX29uSW5wdXQiLCJfb25Ecm9wIiwiZXYiLCJoYW5kbGVyIiwicHVzaCIsImhJbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImxpc3RlbmVycyIsImZvckVhY2giLCJsIiwiaW5wdXRWYWx1ZSIsIl9zZWxlY3Rpb24iLCJyYXdWYWx1ZSIsInVubWFza2VkVmFsdWUiLCJyZXNvbHZlIiwidXBkYXRlRWxlbWVudCIsInZhbHVlIiwid2FybiIsInNlbGVjdGlvblN0YXJ0IiwidW5iaW5kRXZlbnRzIiwiX2NhbGNVbm1hc2tlZCIsImlzQ2hhbmdlZCIsInVwZGF0ZUN1cnNvciIsIl9maXJlQ2hhbmdlRXZlbnRzIiwiZmlyZUV2ZW50IiwiX2RlbGF5VXBkYXRlQ3Vyc29yIiwiX2Fib3J0VXBkYXRlQ3Vyc29yIiwiX2NoYW5naW5nQ3Vyc29yUG9zIiwiX2N1cnNvckNoYW5naW5nIiwic2V0VGltZW91dCIsInByb2Nlc3NJbnB1dCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2VsZWN0aW9uRW5kIiwicG9zIiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50Iiwic2V0U2VsZWN0aW9uUmFuZ2UiLCJSZWdFeHBNYXNrIiwidGVzdCIsIkZ1bmNNYXNrIiwiUGF0dGVybk1hc2siLCJfaG9sbG93cyIsInBsYWNlaG9sZGVyIiwiZGVmaW5pdGlvbnMiLCJERUZJTklUSU9OUyIsIl9hbGlnbkN1cnNvciIsIl9hbGlnbkN1cnNvckZyaWVuZGx5IiwiX2luaXRpYWxpemVkIiwiX2RlZmluaXRpb25zIiwiX2NoYXJEZWZzIiwiX2FsaWduU3RvcHMiLCJwYXR0ZXJuIiwidW5tYXNraW5nQmxvY2siLCJvcHRpb25hbEJsb2NrIiwiaSIsImNoIiwidHlwZSIsIkRFRl9UWVBFUyIsIklOUFVUIiwiRklYRUQiLCJ1bm1hc2tpbmciLCJvcHRpb25hbCIsIlNUT1BfQ0hBUiIsIkVTQ0FQRV9DSEFSIiwiX2J1aWxkUmVzb2x2ZXJzIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiTWFza0ZhY3RvcnkiLCJza2lwVW5yZXNvbHZlZElucHV0IiwicGxhY2Vob2xkZXJCdWZmZXIiLCJob2xsb3dzIiwic2xpY2UiLCJvdmVyZmxvdyIsImNpIiwiZGkiLCJfbWFwUG9zVG9EZWZJbmRleCIsIl9pc0hvbGxvdyIsImRlZiIsInJlc29sdmVyIiwiY2hhciIsImNocmVzIiwiaXNSZXNvbHZlZCIsIl9wbGFjZWhvbGRlciIsImNodW5rcyIsImlucHV0IiwiX2FwcGVuZFRhaWwiLCJjaHVuazIiLCJzdG9wMiIsIl9hcHBlbmRQbGFjZWhvbGRlckVuZCIsImZyb21Qb3MiLCJ0b1BvcyIsInRvRGVmSW5kZXgiLCJfaXNIaWRkZW5Ib2xsb3ciLCJfaXNJbnB1dCIsInN0b3BzIiwic2kiLCJzIiwiczIiLCJfZXh0cmFjdElucHV0IiwiZGVmSW5kZXgiLCJmaWx0ZXIiLCJoIiwiX2hvbGxvd3NCZWZvcmUiLCJoaSIsImluc2VydFN0ZXBzIiwidGFpbFBvcyIsInRhaWxEZWZJbmRleCIsInRhaWxBbGlnblN0b3BzUG9zIiwibWFwIiwiX21hcERlZkluZGV4VG9Qb3MiLCJ0YWlsSW5wdXRDaHVua3MiLCJfZXh0cmFjdElucHV0Q2h1bmtzIiwibGFzdEhvbGxvd0luZGV4IiwiX2dlbmVyYXRlSW5zZXJ0U3RlcHMiLCJpc3RlcCIsInN0ZXAiLCJ0cmVzIiwiX2FwcGVuZFRhaWxDaHVua3MiLCJhcHBlbmRlZCIsIl9hcHBlbmRGaXhlZEVuZCIsImhhc0hvbGxvd3MiLCJfbmVhcmVzdElucHV0UG9zIiwiaXNDb21wbGV0ZSIsInNob3ciLCJ1bm1hc2tlZCIsImRlZnMiLCJpbmRleCIsImN1cnNvckRlZkluZGV4IiwibFBvcyIsInJQb3MiLCJwaCIsIkRFRkFVTFRfUExBQ0VIT0xERVIiLCJqb2luIiwiX2luc3RhbGxEZWZpbml0aW9ucyIsIl9tYXNrIiwiUGlwZU1hc2siLCJtdWx0aXBhc3MiLCJfY29tcGlsZWRNYXNrcyIsIm0iLCJfcGlwZSIsInN0ZXBSZXMiLCJ0ZW1wUmVzIiwicmVkdWNlIiwiZCIsImJpbmRFdmVudHMiLCJwcm90b3R5cGUiLCJhcHBseSIsIlJlZ0V4cCIsIkFycmF5IiwiRnVuY3Rpb24iLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxTQUFTQSxRQUFULENBQW1CQyxHQUFuQixFQUF3QjtTQUNmLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxlQUFlQyxNQUFqRDs7O0FBR0YsQUFDQSxTQUFTQyxPQUFULENBQWtCQyxHQUFsQixFQUF1QkgsR0FBdkIsRUFBeUM7TUFBYkksUUFBYSx1RUFBSixFQUFJOztTQUNoQ0wsU0FBU0ksR0FBVCxJQUNMQSxHQURLLEdBRUxBLE1BQ0VILEdBREYsR0FFRUksUUFKSjs7O0FBT0YsQUFDQSxTQUFTQyx3QkFBVCxDQUFrQ0wsR0FBbEMsRUFBdUNNLE9BQXZDLEVBQWdEO01BQzFDQyxZQUFZRCxRQUFRQyxTQUF4QjtNQUNJQyxlQUFl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