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

var DIRECTION = {
  NONE: 0,
  LEFT: -1,
  RIGHT: 1
};

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

  return _extends({}, details, {
    startChangePos: startChangePos,
    head: str.substring(0, startChangePos),
    tail: str.substring(startChangePos + insertedCount),
    inserted: str.substr(startChangePos, insertedCount),
    removed: oldValue.substr(startChangePos, removedCount),
    removeDirection: removedCount && (oldSelection.end === cursorPos || insertedCount ? DIRECTION.RIGHT : DIRECTION.LEFT)
  });
}

function indexInDirection(pos, direction) {
  if (direction === DIRECTION.LEFT) --pos;
  return pos;
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
      // if remove at left - adjust start change pos
      if (details.removeDirection === DIRECTION.LEFT) res = res.slice(0, this._nearestInputPos(startChangePos));

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

      res = this._appendPlaceholderEnd(res);
      details.cursorPos = this._nearestInputPos(cursorPos, details.removeDirection);

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
      var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DIRECTION.LEFT;

      if (!direction) return cursorPos;

      var initialDefIndex = this._mapPosToDefIndex(cursorPos);
      var di = initialDefIndex;

      var firstInputIndex, firstFilledInputIndex, firstVisibleHollowIndex, nextdi;

      // search forward
      for (nextdi = indexInDirection(di, direction); this.def(nextdi); di += direction, nextdi += direction) {
        if (firstInputIndex == null && this._isInput(nextdi)) firstInputIndex = di;
        if (firstVisibleHollowIndex == null && this._isHollow(nextdi) && !this._isHiddenHollow(nextdi)) firstVisibleHollowIndex = di;
        if (this._isInput(nextdi) && !this._isHollow(nextdi)) {
          firstFilledInputIndex = di;
          break;
        }
      }

      if (direction === DIRECTION.LEFT || firstInputIndex == null) {
        // search backwards
        direction = -direction;
        var overflow = false;

        // find hollows only before initial pos
        for (nextdi = indexInDirection(di, direction); this.def(nextdi); di += direction, nextdi += direction) {
          if (this._isInput(nextdi)) {
            firstInputIndex = di;
            if (this._isHollow(nextdi) && !this._isHiddenHollow(nextdi)) break;
          }

          // if hollow not found before start position - set `overflow`
          // and try to find just any input
          if (di === initialDefIndex) overflow = true;

          // first input found
          if (overflow && firstInputIndex != null) break;
        }

        // process overflow
        overflow = overflow || !this.def(nextdi);
        if (overflow && firstInputIndex != null) di = firstInputIndex;
      } else if (firstFilledInputIndex == null) {
        // adjust index if delete at right and filled input not found at right
        di = firstVisibleHollowIndex != null ? firstVisibleHollowIndex : firstInputIndex;
      }

      return this._mapDefIndexToPos(di);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvcGlwZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL2ltYXNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydFxyXG5mdW5jdGlvbiBpc1N0cmluZyAoc3RyKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnIHx8IHN0ciBpbnN0YW5jZW9mIFN0cmluZztcclxufVxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGNvbmZvcm0gKHJlcywgc3RyLCBmYWxsYmFjaz0nJykge1xyXG4gIHJldHVybiBpc1N0cmluZyhyZXMpID9cclxuICAgIHJlcyA6XHJcbiAgICByZXMgP1xyXG4gICAgICBzdHIgOlxyXG4gICAgICBmYWxsYmFjaztcclxufVxyXG5cclxuZXhwb3J0XHJcbnZhciBESVJFQ1RJT04gPSB7XHJcbiAgTk9ORTogMCxcclxuICBMRUZUOiAtMSxcclxuICBSSUdIVDogMVxyXG59XHJcblxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGV4dGVuZERldGFpbHNBZGp1c3RtZW50cyhzdHIsIGRldGFpbHMpIHtcclxuICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgdmFyIG9sZFNlbGVjdGlvbiA9IGRldGFpbHMub2xkU2VsZWN0aW9uO1xyXG4gIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcblxyXG4gIHZhciBzdGFydENoYW5nZVBvcyA9IE1hdGgubWluKGN1cnNvclBvcywgb2xkU2VsZWN0aW9uLnN0YXJ0KTtcclxuICB2YXIgaW5zZXJ0ZWRDb3VudCA9IGN1cnNvclBvcyAtIHN0YXJ0Q2hhbmdlUG9zO1xyXG4gIC8vIE1hdGgubWF4IGZvciBvcHBvc2l0ZSBvcGVyYXRpb25cclxuICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgIC8vIGZvciBEZWxldGVcclxuICAgIG9sZFZhbHVlLmxlbmd0aCAtIHN0ci5sZW5ndGgsIDApO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgLi4uZGV0YWlscyxcclxuICAgIHN0YXJ0Q2hhbmdlUG9zLFxyXG4gICAgaGVhZDogc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyksXHJcbiAgICB0YWlsOiBzdHIuc3Vic3RyaW5nKHN0YXJ0Q2hhbmdlUG9zICsgaW5zZXJ0ZWRDb3VudCksXHJcbiAgICBpbnNlcnRlZDogc3RyLnN1YnN0cihzdGFydENoYW5nZVBvcywgaW5zZXJ0ZWRDb3VudCksXHJcbiAgICByZW1vdmVkOiBvbGRWYWx1ZS5zdWJzdHIoc3RhcnRDaGFuZ2VQb3MsIHJlbW92ZWRDb3VudCksXHJcbiAgICByZW1vdmVEaXJlY3Rpb246IHJlbW92ZWRDb3VudCAmJlxyXG4gICAgICAoKG9sZFNlbGVjdGlvbi5lbmQgPT09IGN1cnNvclBvcyB8fCBpbnNlcnRlZENvdW50KSA/XHJcbiAgICAgICAgRElSRUNUSU9OLlJJR0hUIDpcclxuICAgICAgICBESVJFQ1RJT04uTEVGVClcclxuICB9O1xyXG59XHJcblxyXG5cclxuZXhwb3J0XHJcbmZ1bmN0aW9uIGluZGV4SW5EaXJlY3Rpb24gKHBvcywgZGlyZWN0aW9uKSB7XHJcbiAgaWYgKGRpcmVjdGlvbiA9PT0gRElSRUNUSU9OLkxFRlQpIC0tcG9zO1xyXG4gIHJldHVybiBwb3M7XHJcbn1cclxuIiwiaW1wb3J0IHtjb25mb3JtLCBleHRlbmREZXRhaWxzQWRqdXN0bWVudHN9IGZyb20gJy4uL3V0aWxzJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICB0aGlzLmVsID0gZWw7XHJcbiAgICB0aGlzLm1hc2sgPSBvcHRzLm1hc2s7XHJcblxyXG4gICAgdGhpcy5fbGlzdGVuZXJzID0ge307XHJcbiAgICB0aGlzLl9yZWZyZXNoaW5nQ291bnQgPSAwO1xyXG4gICAgdGhpcy5fcmF3VmFsdWUgPSBcIlwiO1xyXG4gICAgdGhpcy5fdW5tYXNrZWRWYWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgdGhpcy5zYXZlU2VsZWN0aW9uID0gdGhpcy5zYXZlU2VsZWN0aW9uLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9vbklucHV0ID0gdGhpcy5fb25JbnB1dC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fb25Ecm9wID0gdGhpcy5fb25Ecm9wLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBvbiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgdGhpcy5fbGlzdGVuZXJzW2V2XSA9IFtdO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzW2V2XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBvZmYgKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHJldHVybjtcclxuICAgIGlmICghaGFuZGxlcikge1xyXG4gICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2XTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGhJbmRleCA9IHRoaXMuX2xpc3RlbmVyc1tldl0uaW5kZXhPZihoYW5kbGVyKTtcclxuICAgIGlmIChoSW5kZXggPj0gMCkgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShoSW5kZXgsIDEpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBnZXQgcmF3VmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Jhd1ZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0IHJhd1ZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMucHJvY2Vzc0lucHV0KHN0ciwge1xyXG4gICAgICBjdXJzb3JQb3M6IHN0ci5sZW5ndGgsXHJcbiAgICAgIG9sZFZhbHVlOiB0aGlzLnJhd1ZhbHVlLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHtcclxuICAgICAgICBzdGFydDogMCxcclxuICAgICAgICBlbmQ6IHRoaXMucmF3VmFsdWUubGVuZ3RoXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHVubWFza2VkVmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3VubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgdW5tYXNrZWRWYWx1ZSAodmFsdWUpIHtcclxuICAgIHRoaXMucmF3VmFsdWUgPSB2YWx1ZTtcclxuICB9XHJcblxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVNlbGVjdGlvbik7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dCk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVNlbGVjdGlvbik7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dCk7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgZmlyZUV2ZW50IChldikge1xyXG4gICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1tldl0gfHwgW107XHJcbiAgICBsaXN0ZW5lcnMuZm9yRWFjaChsID0+IGwoKSk7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzSW5wdXQgKGlucHV0VmFsdWUsIGRldGFpbHMpIHtcclxuICAgIGRldGFpbHMgPSB7XHJcbiAgICAgIGN1cnNvclBvczogdGhpcy5jdXJzb3JQb3MsXHJcbiAgICAgIG9sZFNlbGVjdGlvbjogdGhpcy5fc2VsZWN0aW9uLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5yYXdWYWx1ZSxcclxuICAgICAgb2xkVW5tYXNrZWRWYWx1ZTogdGhpcy51bm1hc2tlZFZhbHVlLFxyXG4gICAgICAuLi5kZXRhaWxzXHJcbiAgICB9O1xyXG5cclxuICAgIGRldGFpbHMgPSBleHRlbmREZXRhaWxzQWRqdXN0bWVudHMoaW5wdXRWYWx1ZSwgZGV0YWlscyk7XHJcblxyXG4gICAgdmFyIHJlcyA9IGNvbmZvcm0odGhpcy5yZXNvbHZlKGlucHV0VmFsdWUsIGRldGFpbHMpLFxyXG4gICAgICBpbnB1dFZhbHVlLFxyXG4gICAgICB0aGlzLnJhd1ZhbHVlKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUVsZW1lbnQocmVzLCBkZXRhaWxzLmN1cnNvclBvcyk7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcblxyXG4gIGdldCBzZWxlY3Rpb25TdGFydCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY3Vyc29yQ2hhbmdpbmcgP1xyXG4gICAgICB0aGlzLl9jaGFuZ2luZ0N1cnNvclBvcyA6XHJcblxyXG4gICAgICB0aGlzLmVsLnNlbGVjdGlvblN0YXJ0O1xyXG4gIH1cclxuXHJcbiAgZ2V0IGN1cnNvclBvcyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY3Vyc29yQ2hhbmdpbmcgP1xyXG4gICAgICB0aGlzLl9jaGFuZ2luZ0N1cnNvclBvcyA6XHJcblxyXG4gICAgICB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuICB9XHJcblxyXG4gIHNldCBjdXJzb3JQb3MgKHBvcykge1xyXG4gICAgaWYgKHRoaXMuZWwgIT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLmVsLnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zKTtcclxuICAgIHRoaXMuc2F2ZVNlbGVjdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgc2F2ZVNlbGVjdGlvbiAoZXYpIHtcclxuICAgIGlmICh0aGlzLnJhd1ZhbHVlICE9PSB0aGlzLmVsLnZhbHVlKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihcIlVuY29udHJvbGxlZCBpbnB1dCBjaGFuZ2UsIHJlZnJlc2ggbWFzayBtYW51YWxseSFcIik7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9zZWxlY3Rpb24gPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNlbGVjdGlvblN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuY3Vyc29yUG9zXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZGVzdHJveSAoKSB7XHJcbiAgICB0aGlzLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVFbGVtZW50ICh2YWx1ZSwgY3Vyc29yUG9zKSB7XHJcbiAgICB2YXIgdW5tYXNrZWRWYWx1ZSA9IHRoaXMuX2NhbGNVbm1hc2tlZCh2YWx1ZSk7XHJcbiAgICB2YXIgaXNDaGFuZ2VkID0gKHRoaXMudW5tYXNrZWRWYWx1ZSAhPT0gdW5tYXNrZWRWYWx1ZSB8fFxyXG4gICAgICB0aGlzLnJhd1ZhbHVlICE9PSB2YWx1ZSk7XHJcblxyXG4gICAgdGhpcy5fdW5tYXNrZWRWYWx1ZSA9IHVubWFza2VkVmFsdWU7XHJcbiAgICB0aGlzLl9yYXdWYWx1ZSA9IHZhbHVlO1xyXG5cclxuICAgIGlmICh0aGlzLmVsLnZhbHVlICE9PSB2YWx1ZSkgdGhpcy5lbC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgdGhpcy51cGRhdGVDdXJzb3IoY3Vyc29yUG9zKTtcclxuXHJcbiAgICBpZiAoaXNDaGFuZ2VkKSB0aGlzLl9maXJlQ2hhbmdlRXZlbnRzKCk7XHJcbiAgfVxyXG5cclxuICBfZmlyZUNoYW5nZUV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLmZpcmVFdmVudChcImFjY2VwdFwiKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZUN1cnNvciAoY3Vyc29yUG9zKSB7XHJcbiAgICBpZiAoY3Vyc29yUG9zID09IG51bGwpIHJldHVybjtcclxuICAgIHRoaXMuY3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG5cclxuICAgIC8vIGFsc28gcXVldWUgY2hhbmdlIGN1cnNvciBmb3IgbW9iaWxlIGJyb3dzZXJzXHJcbiAgICB0aGlzLl9kZWxheVVwZGF0ZUN1cnNvcihjdXJzb3JQb3MpO1xyXG4gIH1cclxuXHJcbiAgX2RlbGF5VXBkYXRlQ3Vyc29yIChjdXJzb3JQb3MpIHtcclxuICAgIHRoaXMuX2Fib3J0VXBkYXRlQ3Vyc29yKCk7XHJcbiAgICB0aGlzLl9jaGFuZ2luZ0N1cnNvclBvcyA9IGN1cnNvclBvcztcclxuICAgIHRoaXMuX2N1cnNvckNoYW5naW5nID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuX2Fib3J0VXBkYXRlQ3Vyc29yKCk7XHJcbiAgICAgIHRoaXMuY3Vyc29yUG9zID0gdGhpcy5fY2hhbmdpbmdDdXJzb3JQb3M7XHJcbiAgICB9LCAxMCk7XHJcbiAgfVxyXG5cclxuICBfYWJvcnRVcGRhdGVDdXJzb3IoKSB7XHJcbiAgICBpZiAodGhpcy5fY3Vyc29yQ2hhbmdpbmcpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2N1cnNvckNoYW5naW5nKTtcclxuICAgICAgZGVsZXRlIHRoaXMuX2N1cnNvckNoYW5naW5nO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX29uSW5wdXQgKGV2KSB7XHJcbiAgICB0aGlzLl9hYm9ydFVwZGF0ZUN1cnNvcigpO1xyXG4gICAgdGhpcy5wcm9jZXNzSW5wdXQodGhpcy5lbC52YWx1ZSk7XHJcbiAgfVxyXG5cclxuICBfb25Ecm9wIChldikge1xyXG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLy8gb3ZlcnJpZGVcclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHsgcmV0dXJuIHN0cjsgfVxyXG5cclxuICBfY2FsY1VubWFza2VkICh2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBSZWdFeHBNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIHJlc29sdmUgKHN0cikge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzay50ZXN0KHN0cik7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIEZ1bmNNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIHJlc29sdmUgKC4uLmFyZ3MpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2soLi4uYXJncyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybSwgZXh0ZW5kRGV0YWlsc0FkanVzdG1lbnRzLCBpbmRleEluRGlyZWN0aW9uLCBESVJFQ1RJT059IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGF0dGVybk1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICBzdXBlcihlbCwgb3B0cyk7XHJcblxyXG4gICAgdGhpcy5faG9sbG93cyA9IFtdO1xyXG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IG9wdHMucGxhY2Vob2xkZXI7XHJcbiAgICB0aGlzLmRlZmluaXRpb25zID0ge1xyXG4gICAgICAuLi5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyxcclxuICAgICAgLi4ub3B0cy5kZWZpbml0aW9uc1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvciA9IHRoaXMuX2FsaWduQ3Vyc29yLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5ID0gdGhpcy5fYWxpZ25DdXJzb3JGcmllbmRseS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIF9hbGlnbkN1cnNvckZyaWVuZGx5ICgpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGlvblN0YXJ0ICE9PSB0aGlzLmN1cnNvclBvcykgcmV0dXJuO1xyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IoKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgX2luc3RhbGxEZWZpbml0aW9ucyAoZGVmaW5pdGlvbnMpIHtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmaW5pdGlvbnM7XHJcbiAgICB0aGlzLl9jaGFyRGVmcyA9IFtdO1xyXG4gICAgdGhpcy5fYWxpZ25TdG9wcyA9IFtdO1xyXG5cclxuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5tYXNrO1xyXG4gICAgaWYgKCFwYXR0ZXJuIHx8ICFkZWZpbml0aW9ucykgcmV0dXJuO1xyXG5cclxuICAgIHZhciB1bm1hc2tpbmdCbG9jayA9IGZhbHNlO1xyXG4gICAgdmFyIG9wdGlvbmFsQmxvY2sgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgIHZhciB0eXBlID0gIXVubWFza2luZ0Jsb2NrICYmIGNoIGluIGRlZmluaXRpb25zID9cclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgOlxyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgdmFyIHVubWFza2luZyA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCB8fCB1bm1hc2tpbmdCbG9jaztcclxuICAgICAgdmFyIG9wdGlvbmFsID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIG9wdGlvbmFsQmxvY2s7XHJcblxyXG4gICAgICBpZiAoY2ggPT09IFBhdHRlcm5NYXNrLlNUT1BfQ0hBUikge1xyXG4gICAgICAgIHRoaXMuX2FsaWduU3RvcHMucHVzaCh0aGlzLl9jaGFyRGVmcy5sZW5ndGgpO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICd7JyB8fCBjaCA9PT0gJ30nKSB7XHJcbiAgICAgICAgdW5tYXNraW5nQmxvY2sgPSAhdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1snIHx8IGNoID09PSAnXScpIHtcclxuICAgICAgICBvcHRpb25hbEJsb2NrID0gIW9wdGlvbmFsQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gUGF0dGVybk1hc2suRVNDQVBFX0NIQVIpIHtcclxuICAgICAgICArK2k7XHJcbiAgICAgICAgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICAgIC8vIFRPRE8gdmFsaWRhdGlvblxyXG4gICAgICAgIGlmICghY2gpIGJyZWFrO1xyXG4gICAgICAgIHR5cGUgPSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2NoYXJEZWZzLnB1c2goe1xyXG4gICAgICAgIGNoYXI6IGNoLFxyXG4gICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgb3B0aW9uYWw6IG9wdGlvbmFsLFxyXG4gICAgICAgIHVubWFza2luZzogdW5tYXNraW5nXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2J1aWxkUmVzb2x2ZXJzKCk7XHJcbiAgfVxyXG5cclxuICBfYnVpbGRSZXNvbHZlcnMgKCkge1xyXG4gICAgdGhpcy5fcmVzb2x2ZXJzID0ge307XHJcbiAgICBmb3IgKHZhciBkZWZLZXkgaW4gdGhpcy5kZWZpbml0aW9ucykge1xyXG4gICAgICB0aGlzLl9yZXNvbHZlcnNbZGVmS2V5XSA9IElNYXNrLk1hc2tGYWN0b3J5KHRoaXMuZWwsIHtcclxuICAgICAgICBtYXNrOiB0aGlzLmRlZmluaXRpb25zW2RlZktleV1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBfYXBwZW5kVGFpbCAoc3RyLCB0YWlsLCBza2lwVW5yZXNvbHZlZElucHV0PXRydWUpIHtcclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGhvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLnNsaWNlKCk7XHJcbiAgICB2YXIgb3ZlcmZsb3cgPSBmYWxzZTtcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHN0ci5sZW5ndGgpOyBjaSA8IHRhaWwubGVuZ3RoOykge1xyXG4gICAgICBpZiAodGhpcy5faXNIb2xsb3coZGkpKSB7XHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBvdGhlciBjYXNlc1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBjaCA9IHRhaWxbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGksIHN0ciArIHBsYWNlaG9sZGVyQnVmZmVyKTtcclxuXHJcbiAgICAgIC8vIGZhaWxlZFxyXG4gICAgICBpZiAoIWRlZikge1xyXG4gICAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIHZhciBjaHJlcyA9IHJlc29sdmVyLnJlc29sdmUoY2gsIGRpLCBzdHIgKyBwbGFjZWhvbGRlckJ1ZmZlcikgfHwgJyc7XHJcbiAgICAgICAgdmFyIGlzUmVzb2x2ZWQgPSAhIWNocmVzO1xyXG5cclxuICAgICAgICAvLyBpZiBvayAtIG5leHQgZGlcclxuICAgICAgICBpZiAoY2hyZXMpIHtcclxuICAgICAgICAgIGNocmVzID0gY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAoIWRlZi5vcHRpb25hbCAmJiBza2lwVW5yZXNvbHZlZElucHV0KSBjaHJlcyA9IHRoaXMuX3BsYWNlaG9sZGVyLmNoYXI7XHJcbiAgICAgICAgICAvLyBUT0RPIHNlZW1zIGNoZWNrIGlzIHVzZWxlc3NcclxuICAgICAgICAgIGlmIChob2xsb3dzLmluZGV4T2YoZGkpIDwgMCkgaG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgc3RyICs9IHBsYWNlaG9sZGVyQnVmZmVyICsgY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNocmVzIHx8IGRlZi5vcHRpb25hbCB8fCAhc2tpcFVucmVzb2x2ZWRJbnB1dCkgKytkaTtcclxuICAgICAgICBpZiAoaXNSZXNvbHZlZCB8fCAhZGVmLm9wdGlvbmFsICYmICFza2lwVW5yZXNvbHZlZElucHV0KSArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG5cclxuICAgICAgICBpZiAoY2ggPT09IGRlZi5jaGFyICYmIChkZWYudW5tYXNraW5nIHx8ICFza2lwVW5yZXNvbHZlZElucHV0KSkgKytjaTtcclxuICAgICAgICArK2RpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtzdHIsIGhvbGxvd3MsIG92ZXJmbG93XTtcclxuICB9XHJcblxyXG4gIF9hcHBlbmRUYWlsQ2h1bmtzIChzdHIsIGNodW5rcywgc2tpcFVucmVzb2x2ZWRJbnB1dCkge1xyXG4gICAgdmFyIG92ZXJmbG93ID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBjaT0wOyBjaSA8IGNodW5rcy5sZW5ndGg7ICsrY2kpIHtcclxuICAgICAgdmFyIFssIGlucHV0XSA9IGNodW5rc1tjaV07XHJcbiAgICAgIFtzdHIsIHRoaXMuX2hvbGxvd3MsIG92ZXJmbG93XSA9IHRoaXMuX2FwcGVuZFRhaWwoc3RyLCBpbnB1dCwgc2tpcFVucmVzb2x2ZWRJbnB1dCk7XHJcbiAgICAgIGlmIChvdmVyZmxvdykgYnJlYWs7XHJcblxyXG4gICAgICAvLyBub3QgbGFzdCAtIGFwcGVuZCBwbGFjZWhvbGRlciBiZXR3ZWVuIHN0b3BzXHJcbiAgICAgIHZhciBjaHVuazIgPSBjaHVua3NbY2krMV1cclxuICAgICAgdmFyIHN0b3AyID0gY2h1bmsyICYmIGNodW5rMlswXTtcclxuICAgICAgaWYgKHN0b3AyKSBzdHIgPSB0aGlzLl9hcHBlbmRQbGFjZWhvbGRlckVuZChzdHIsIHN0b3AyKTtcclxuICAgIH1cclxuICAgIHJldHVybiBbc3RyLCB0aGlzLl9ob2xsb3dzLCBvdmVyZmxvd107XHJcbiAgfVxyXG5cclxuICBfZXh0cmFjdElucHV0IChzdHIsIGZyb21Qb3M9MCwgdG9Qb3MpIHtcclxuICAgIHZhciBpbnB1dCA9ICcnO1xyXG5cclxuICAgIHZhciB0b0RlZkluZGV4ID0gdG9Qb3MgJiYgdGhpcy5fbWFwUG9zVG9EZWZJbmRleCh0b1Bvcyk7XHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGZyb21Qb3MpOyBjaTxzdHIubGVuZ3RoICYmICghdG9EZWZJbmRleCB8fCBkaSA8IHRvRGVmSW5kZXgpOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLmRlZihkaSwgc3RyKTtcclxuXHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGRpKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNJbnB1dChkaSkgJiYgIXRoaXMuX2lzSG9sbG93KGRpKSkgaW5wdXQgKz0gY2g7XHJcbiAgICAgICsrY2k7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBfZXh0cmFjdElucHV0Q2h1bmtzIChzdHIsIHN0b3BzKSB7XHJcbiAgICB2YXIgY2h1bmtzID0gW107XHJcbiAgICBmb3IgKHZhciBzaT0wOyBzaTxzdG9wcy5sZW5ndGggJiYgc3RyOyArK3NpKSB7XHJcbiAgICAgIHZhciBzID0gc3RvcHNbc2ldO1xyXG4gICAgICB2YXIgczIgPSBzdG9wc1tzaSsxXTtcclxuICAgICAgY2h1bmtzLnB1c2goW3MsIHRoaXMuX2V4dHJhY3RJbnB1dChzdHIsIHMsIHMyKV0pO1xyXG4gICAgICBpZiAoczIpIHN0ciA9IHN0ci5zbGljZShzMiAtIHMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNodW5rcztcclxuICB9XHJcblxyXG4gIF9pc0hvbGxvdyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGVmSW5kZXgpID49IDA7XHJcbiAgfVxyXG5cclxuICBfaXNIaWRkZW5Ib2xsb3cgKGRlZkluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5faXNIb2xsb3coZGVmSW5kZXgpICYmIHRoaXMuZGVmKGRlZkluZGV4KSAmJiB0aGlzLmRlZihkZWZJbmRleCkub3B0aW9uYWw7XHJcbiAgfVxyXG5cclxuICBfaXNJbnB1dCAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLmRlZihkZWZJbmRleCkgJiYgdGhpcy5kZWYoZGVmSW5kZXgpLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVDtcclxuICB9XHJcblxyXG4gIF9ob2xsb3dzQmVmb3JlIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGRlZkluZGV4ICYmIHRoaXMuX2lzSGlkZGVuSG9sbG93KGgpKTtcclxuICB9XHJcblxyXG4gIF9tYXBEZWZJbmRleFRvUG9zIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIGRlZkluZGV4IC0gdGhpcy5faG9sbG93c0JlZm9yZShkZWZJbmRleCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX21hcFBvc1RvRGVmSW5kZXggKHBvcykge1xyXG4gICAgdmFyIGRlZkluZGV4ID0gcG9zO1xyXG4gICAgZm9yICh2YXIgaGk9MDsgaGk8dGhpcy5faG9sbG93cy5sZW5ndGg7ICsraGkpIHtcclxuICAgICAgdmFyIGggPSB0aGlzLl9ob2xsb3dzW2hpXTtcclxuICAgICAgaWYgKGggPj0gZGVmSW5kZXgpIGJyZWFrO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coaCkpICsrZGVmSW5kZXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVmSW5kZXg7XHJcbiAgfVxyXG5cclxuICBfZ2VuZXJhdGVJbnNlcnRTdGVwcyAoaGVhZCwgaW5zZXJ0ZWQpIHtcclxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHNhdmUgaG9sbG93IGR1cmluZyBnZW5lcmF0aW9uXHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3M7XHJcblxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW1toZWFkLCBob2xsb3dzLnNsaWNlKCldXTtcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wOyBjaTxpbnNlcnRlZC5sZW5ndGggJiYgIW92ZXJmbG93OyArK2NpKSB7XHJcbiAgICAgIHZhciBjaCA9IGluc2VydGVkW2NpXTtcclxuICAgICAgdmFyIFtyZXMsIGhvbGxvd3MsIG92ZXJmbG93XSA9IHRoaXMuX2FwcGVuZFRhaWwoaGVhZCwgY2gsIGZhbHNlKTtcclxuICAgICAgdGhpcy5faG9sbG93cyA9IGhvbGxvd3M7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cgJiYgcmVzICE9PSBoZWFkKSB7XHJcbiAgICAgICAgaW5zZXJ0U3RlcHMucHVzaChbcmVzLCBob2xsb3dzXSk7XHJcbiAgICAgICAgaGVhZCA9IHJlcztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHBvcCBob2xsb3dzIGJhY2tcclxuICAgIHRoaXMuX2hvbGxvd3MgPSBob2xsb3dzO1xyXG5cclxuICAgIHJldHVybiBpbnNlcnRTdGVwcztcclxuICB9XHJcblxyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykge1xyXG4gICAgdmFyIGN1cnNvclBvcyA9IGRldGFpbHMuY3Vyc29yUG9zO1xyXG4gICAgdmFyIHN0YXJ0Q2hhbmdlUG9zID0gZGV0YWlscy5zdGFydENoYW5nZVBvcztcclxuICAgIHZhciBpbnNlcnRlZCA9IGRldGFpbHMuaW5zZXJ0ZWQ7XHJcbiAgICB2YXIgcmVtb3ZlZENvdW50ID0gZGV0YWlscy5yZW1vdmVkLmxlbmd0aDtcclxuICAgIHZhciB0YWlsUG9zID0gc3RhcnRDaGFuZ2VQb3MgKyByZW1vdmVkQ291bnQ7XHJcbiAgICB2YXIgdGFpbERlZkluZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleCh0YWlsUG9zKTtcclxuICAgIHZhciB0YWlsQWxpZ25TdG9wc1BvcyA9IFtcclxuICAgICAgdGFpbFBvcyxcclxuICAgICAgLi4udGhpcy5fYWxpZ25TdG9wc1xyXG4gICAgICAgIC5maWx0ZXIocyA9PiBzID49IHRhaWxEZWZJbmRleClcclxuICAgICAgICAubWFwKHMgPT4gdGhpcy5fbWFwRGVmSW5kZXhUb1BvcyhzKSlcclxuICAgIF07XHJcbiAgICB2YXIgdGFpbElucHV0Q2h1bmtzID0gdGhpcy5fZXh0cmFjdElucHV0Q2h1bmtzKGRldGFpbHMudGFpbCwgdGFpbEFsaWduU3RvcHNQb3MpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBob2xsb3dzIGFmdGVyIGN1cnNvclxyXG4gICAgdmFyIGxhc3RIb2xsb3dJbmRleCA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgoc3RhcnRDaGFuZ2VQb3MpO1xyXG4gICAgdGhpcy5faG9sbG93cyA9IHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGxhc3RIb2xsb3dJbmRleCk7XHJcblxyXG4gICAgdmFyIHJlcyA9IGRldGFpbHMuaGVhZDtcclxuICAgIC8vIGlmIHJlbW92ZSBhdCBsZWZ0IC0gYWRqdXN0IHN0YXJ0IGNoYW5nZSBwb3NcclxuICAgIGlmIChkZXRhaWxzLnJlbW92ZURpcmVjdGlvbiA9PT0gRElSRUNUSU9OLkxFRlQpIHJlcyA9IHJlcy5zbGljZSgwLCB0aGlzLl9uZWFyZXN0SW5wdXRQb3Moc3RhcnRDaGFuZ2VQb3MpKTtcclxuXHJcbiAgICAvLyBpbnNlcnQgYXZhaWxhYmxlXHJcbiAgICB2YXIgaW5zZXJ0U3RlcHMgPSB0aGlzLl9nZW5lcmF0ZUluc2VydFN0ZXBzKHJlcywgaW5zZXJ0ZWQpO1xyXG4gICAgZm9yICh2YXIgaXN0ZXA9aW5zZXJ0U3RlcHMubGVuZ3RoLTE7IGlzdGVwID49IDA7IC0taXN0ZXApIHtcclxuICAgICAgdmFyIHN0ZXAsIHRyZXMsIG92ZXJmbG93O1xyXG4gICAgICBbc3RlcCwgdGhpcy5faG9sbG93c10gPSBpbnNlcnRTdGVwc1tpc3RlcF07XHJcbiAgICAgIFt0cmVzLCB0aGlzLl9ob2xsb3dzLCBvdmVyZmxvd10gPSB0aGlzLl9hcHBlbmRUYWlsQ2h1bmtzKHN0ZXAsIHRhaWxJbnB1dENodW5rcyk7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cpIHtcclxuICAgICAgICByZXMgPSB0cmVzO1xyXG4gICAgICAgIGN1cnNvclBvcyA9IHN0ZXAubGVuZ3RoO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzID0gdGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKTtcclxuICAgIGRldGFpbHMuY3Vyc29yUG9zID0gdGhpcy5fbmVhcmVzdElucHV0UG9zKGN1cnNvclBvcywgZGV0YWlscy5yZW1vdmVEaXJlY3Rpb24pO1xyXG5cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBfZmlyZUNoYW5nZUV2ZW50cyAoKSB7XHJcbiAgICAvLyBmaXJlICdjb21wbGV0ZScgYWZ0ZXIgJ2FjY2VwdCcgZXZlbnRcclxuICAgIHN1cGVyLl9maXJlQ2hhbmdlRXZlbnRzKCk7XHJcbiAgICBpZiAodGhpcy5pc0NvbXBsZXRlKSB0aGlzLmZpcmVFdmVudChcImNvbXBsZXRlXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzQ29tcGxldGUgKCkge1xyXG4gICAgZm9yICh2YXIgZGk9MDsgOysrZGkpIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuZGVmKGRpKTtcclxuICAgICAgaWYgKCFkZWYpIGJyZWFrO1xyXG4gICAgICBpZiAodGhpcy5faXNJbnB1dChkaSkgJiYgIWRlZi5vcHRpb25hbCAmJiB0aGlzLl9pc0hvbGxvdyhkaSkpIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgX2FwcGVuZEZpeGVkRW5kIChyZXMpIHtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7IDsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGksIHJlcyk7XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAodGhpcy5faXNJbnB1dChkaSkpIGJyZWFrO1xyXG4gICAgICBpZiAoZGkgPj0gcmVzLmxlbmd0aCkgcmVzICs9IGRlZi5jaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9hcHBlbmRQbGFjZWhvbGRlckVuZCAocmVzLCB0b1Bvcykge1xyXG4gICAgdmFyIHRvRGVmSW5kZXggPSB0b1BvcyAmJiB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KHRvUG9zKTtcclxuICAgIGZvciAodmFyIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgocmVzLmxlbmd0aCk7ICF0b0RlZkluZGV4IHx8IGRpIDwgdG9EZWZJbmRleDsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5kZWYoZGksIHJlcyk7XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0lucHV0KGRpKSAmJiAhdGhpcy5faXNIb2xsb3coZGkpKSB7XHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5fcGxhY2Vob2xkZXIuc2hvdyA9PT0gJ2Fsd2F5cycgfHwgdG9Qb3MpIHtcclxuICAgICAgICByZXMgKz0gZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRCA/XHJcbiAgICAgICAgICBkZWYuY2hhciA6XHJcbiAgICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgICAgdGhpcy5fcGxhY2Vob2xkZXIuY2hhciA6XHJcbiAgICAgICAgICAgICcnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX2NhbGNVbm1hc2tlZCAoc3RyKSB7XHJcbiAgICB2YXIgdW5tYXNrZWQgPSAnJztcclxuICAgIGZvciAodmFyIGNpPTAsIGRpPTA7IGNpPHN0ci5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuZGVmKGRpLCBzdHIpO1xyXG5cclxuICAgICAgaWYgKCFkZWYpIGJyZWFrO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmIChkZWYudW5tYXNraW5nICYmICF0aGlzLl9pc0hvbGxvdyhkaSkgJiZcclxuICAgICAgICAodGhpcy5faXNJbnB1dChkaSkgJiYgdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXS5yZXNvbHZlKGNoLCBjaSwgc3RyKSB8fFxyXG4gICAgICAgICAgZGVmLmNoYXIgPT09IGNoKSkge1xyXG4gICAgICAgIHVubWFza2VkICs9IGNoO1xyXG4gICAgICB9XHJcbiAgICAgICsrY2k7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5tYXNrZWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fdW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuX2hvbGxvd3MubGVuZ3RoID0gMDtcclxuICAgIHZhciByZXM7XHJcbiAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IHRoaXMuX2FwcGVuZFRhaWwoJycsIHN0cik7XHJcbiAgICB0aGlzLnVwZGF0ZUVsZW1lbnQodGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKSk7XHJcblxyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IoKTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlciAoKSB7IHJldHVybiB0aGlzLl9wbGFjZWhvbGRlcjsgfVxyXG5cclxuICBzZXQgcGxhY2Vob2xkZXIgKHBoKSB7XHJcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUixcclxuICAgICAgLi4ucGhcclxuICAgIH07XHJcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHRoaXMudW5tYXNrZWRWYWx1ZSA9IHRoaXMudW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlckxhYmVsICgpIHtcclxuICAgIHJldHVybiB0aGlzLmRlZnMoKS5tYXAoZGVmID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgJycpLmpvaW4oJycpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRlZmluaXRpb25zICgpIHsgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zOyB9XHJcblxyXG4gIHNldCBkZWZpbml0aW9ucyAoZGVmcykge1xyXG4gICAgdGhpcy5faW5zdGFsbERlZmluaXRpb25zKGRlZnMpO1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB0aGlzLnVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXQgbWFzayAoKSB7IHJldHVybiB0aGlzLl9tYXNrOyB9XHJcblxyXG4gIHNldCBtYXNrIChtYXNrKSB7XHJcbiAgICB0aGlzLl9tYXNrID0gbWFzaztcclxuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgdGhpcy5kZWZpbml0aW9ucyA9IHRoaXMuZGVmaW5pdGlvbnM7XHJcbiAgfVxyXG5cclxuICBkZWZzIChzdHIpIHtcclxuICAgIHZhciBkZWZzID0gW107XHJcbiAgICBmb3IgKHZhciBpPTA7IDsrK2kpIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuZGVmKGksIHN0cik7XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuICAgICAgZGVmcy5wdXNoKGRlZik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGVmcztcclxuICB9XHJcblxyXG4gIGRlZiAoaW5kZXgsIHN0cikge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NoYXJEZWZzW2luZGV4XTtcclxuICB9XHJcblxyXG4gIF9uZWFyZXN0SW5wdXRQb3MgKGN1cnNvclBvcywgZGlyZWN0aW9uPURJUkVDVElPTi5MRUZUKSB7XHJcbiAgICBpZiAoIWRpcmVjdGlvbikgcmV0dXJuIGN1cnNvclBvcztcclxuXHJcbiAgICB2YXIgaW5pdGlhbERlZkluZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleChjdXJzb3JQb3MpO1xyXG4gICAgdmFyIGRpID0gaW5pdGlhbERlZkluZGV4O1xyXG5cclxuICAgIHZhciBmaXJzdElucHV0SW5kZXgsXHJcbiAgICAgICAgZmlyc3RGaWxsZWRJbnB1dEluZGV4LFxyXG4gICAgICAgIGZpcnN0VmlzaWJsZUhvbGxvd0luZGV4LFxyXG4gICAgICAgIG5leHRkaTtcclxuXHJcbiAgICAvLyBzZWFyY2ggZm9yd2FyZFxyXG4gICAgZm9yIChuZXh0ZGkgPSBpbmRleEluRGlyZWN0aW9uKGRpLCBkaXJlY3Rpb24pOyB0aGlzLmRlZihuZXh0ZGkpOyBkaSArPSBkaXJlY3Rpb24sIG5leHRkaSArPSBkaXJlY3Rpb24pIHtcclxuICAgICAgaWYgKGZpcnN0SW5wdXRJbmRleCA9PSBudWxsICYmIHRoaXMuX2lzSW5wdXQobmV4dGRpKSkgZmlyc3RJbnB1dEluZGV4ID0gZGk7XHJcbiAgICAgIGlmIChmaXJzdFZpc2libGVIb2xsb3dJbmRleCA9PSBudWxsICYmIHRoaXMuX2lzSG9sbG93KG5leHRkaSkgJiYgIXRoaXMuX2lzSGlkZGVuSG9sbG93KG5leHRkaSkpIGZpcnN0VmlzaWJsZUhvbGxvd0luZGV4ID0gZGk7XHJcbiAgICAgIGlmICh0aGlzLl9pc0lucHV0KG5leHRkaSkgJiYgIXRoaXMuX2lzSG9sbG93KG5leHRkaSkpIHtcclxuICAgICAgICBmaXJzdEZpbGxlZElucHV0SW5kZXggPSBkaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChkaXJlY3Rpb24gPT09IERJUkVDVElPTi5MRUZUIHx8IGZpcnN0SW5wdXRJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgIC8vIHNlYXJjaCBiYWNrd2FyZHNcclxuICAgICAgZGlyZWN0aW9uID0gLWRpcmVjdGlvbjtcclxuICAgICAgdmFyIG92ZXJmbG93ID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBmaW5kIGhvbGxvd3Mgb25seSBiZWZvcmUgaW5pdGlhbCBwb3NcclxuICAgICAgZm9yIChuZXh0ZGkgPSBpbmRleEluRGlyZWN0aW9uKGRpLCBkaXJlY3Rpb24pOyB0aGlzLmRlZihuZXh0ZGkpOyBkaSArPSBkaXJlY3Rpb24sIG5leHRkaSArPSBkaXJlY3Rpb24pIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbnB1dChuZXh0ZGkpKSB7XHJcbiAgICAgICAgICBmaXJzdElucHV0SW5kZXggPSBkaTtcclxuICAgICAgICAgIGlmICh0aGlzLl9pc0hvbGxvdyhuZXh0ZGkpICYmICF0aGlzLl9pc0hpZGRlbkhvbGxvdyhuZXh0ZGkpKSBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIGhvbGxvdyBub3QgZm91bmQgYmVmb3JlIHN0YXJ0IHBvc2l0aW9uIC0gc2V0IGBvdmVyZmxvd2BcclxuICAgICAgICAvLyBhbmQgdHJ5IHRvIGZpbmQganVzdCBhbnkgaW5wdXRcclxuICAgICAgICBpZiAoZGkgPT09IGluaXRpYWxEZWZJbmRleCkgb3ZlcmZsb3cgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBmaXJzdCBpbnB1dCBmb3VuZFxyXG4gICAgICAgIGlmIChvdmVyZmxvdyAmJiBmaXJzdElucHV0SW5kZXggIT0gbnVsbCkgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHByb2Nlc3Mgb3ZlcmZsb3dcclxuICAgICAgb3ZlcmZsb3cgPSBvdmVyZmxvdyB8fCAhdGhpcy5kZWYobmV4dGRpKTtcclxuICAgICAgaWYgKG92ZXJmbG93ICYmIGZpcnN0SW5wdXRJbmRleCAhPSBudWxsKSBkaSA9IGZpcnN0SW5wdXRJbmRleDtcclxuICAgIH0gZWxzZSBpZiAoZmlyc3RGaWxsZWRJbnB1dEluZGV4ID09IG51bGwpIHtcclxuICAgICAgLy8gYWRqdXN0IGluZGV4IGlmIGRlbGV0ZSBhdCByaWdodCBhbmQgZmlsbGVkIGlucHV0IG5vdCBmb3VuZCBhdCByaWdodFxyXG4gICAgICBkaSA9IGZpcnN0VmlzaWJsZUhvbGxvd0luZGV4ICE9IG51bGwgP1xyXG4gICAgICAgIGZpcnN0VmlzaWJsZUhvbGxvd0luZGV4IDpcclxuICAgICAgICBmaXJzdElucHV0SW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX21hcERlZkluZGV4VG9Qb3MoZGkpO1xyXG4gIH1cclxuXHJcbiAgX2FsaWduQ3Vyc29yICgpIHtcclxuICAgIHRoaXMuY3Vyc29yUG9zID0gdGhpcy5fbmVhcmVzdElucHV0UG9zKHRoaXMuY3Vyc29yUG9zKTtcclxuICB9XHJcbn1cclxuUGF0dGVybk1hc2suREVGSU5JVElPTlMgPSB7XHJcbiAgJzAnOiAvXFxkLyxcclxuICAnYSc6IC9bXFx1MDA0MS1cXHUwMDVBXFx1MDA2MS1cXHUwMDdBXFx1MDBBQVxcdTAwQjVcXHUwMEJBXFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XFx1MDBGOC1cXHUwMkMxXFx1MDJDNi1cXHUwMkQxXFx1MDJFMC1cXHUwMkU0XFx1MDJFQ1xcdTAyRUVcXHUwMzcwLVxcdTAzNzRcXHUwMzc2XFx1MDM3N1xcdTAzN0EtXFx1MDM3RFxcdTAzODZcXHUwMzg4LVxcdTAzOEFcXHUwMzhDXFx1MDM4RS1cXHUwM0ExXFx1MDNBMy1cXHUwM0Y1XFx1MDNGNy1cXHUwNDgxXFx1MDQ4QS1cXHUwNTI3XFx1MDUzMS1cXHUwNTU2XFx1MDU1OVxcdTA1NjEtXFx1MDU4N1xcdTA1RDAtXFx1MDVFQVxcdTA1RjAtXFx1MDVGMlxcdTA2MjAtXFx1MDY0QVxcdTA2NkVcXHUwNjZGXFx1MDY3MS1cXHUwNkQzXFx1MDZENVxcdTA2RTVcXHUwNkU2XFx1MDZFRVxcdTA2RUZcXHUwNkZBLVxcdTA2RkNcXHUwNkZGXFx1MDcxMFxcdTA3MTItXFx1MDcyRlxcdTA3NEQtXFx1MDdBNVxcdTA3QjFcXHUwN0NBLVxcdTA3RUFcXHUwN0Y0XFx1MDdGNVxcdTA3RkFcXHUwODAwLVxcdTA4MTVcXHUwODFBXFx1MDgyNFxcdTA4MjhcXHUwODQwLVxcdTA4NThcXHUwOEEwXFx1MDhBMi1cXHUwOEFDXFx1MDkwNC1cXHUwOTM5XFx1MDkzRFxcdTA5NTBcXHUwOTU4LVxcdTA5NjFcXHUwOTcxLVxcdTA5NzdcXHUwOTc5LVxcdTA5N0ZcXHUwOTg1LVxcdTA5OENcXHUwOThGXFx1MDk5MFxcdTA5OTMtXFx1MDlBOFxcdTA5QUEtXFx1MDlCMFxcdTA5QjJcXHUwOUI2LVxcdTA5QjlcXHUwOUJEXFx1MDlDRVxcdTA5RENcXHUwOUREXFx1MDlERi1cXHUwOUUxXFx1MDlGMFxcdTA5RjFcXHUwQTA1LVxcdTBBMEFcXHUwQTBGXFx1MEExMFxcdTBBMTMtXFx1MEEyOFxcdTBBMkEtXFx1MEEzMFxcdTBBMzJcXHUwQTMzXFx1MEEzNVxcdTBBMzZcXHUwQTM4XFx1MEEzOVxcdTBBNTktXFx1MEE1Q1xcdTBBNUVcXHUwQTcyLVxcdTBBNzRcXHUwQTg1LVxcdTBBOERcXHUwQThGLVxcdTBBOTFcXHUwQTkzLVxcdTBBQThcXHUwQUFBLVxcdTBBQjBcXHUwQUIyXFx1MEFCM1xcdTBBQjUtXFx1MEFCOVxcdTBBQkRcXHUwQUQwXFx1MEFFMFxcdTBBRTFcXHUwQjA1LVxcdTBCMENcXHUwQjBGXFx1MEIxMFxcdTBCMTMtXFx1MEIyOFxcdTBCMkEtXFx1MEIzMFxcdTBCMzJcXHUwQjMzXFx1MEIzNS1cXHUwQjM5XFx1MEIzRFxcdTBCNUNcXHUwQjVEXFx1MEI1Ri1cXHUwQjYxXFx1MEI3MVxcdTBCODNcXHUwQjg1LVxcdTBCOEFcXHUwQjhFLVxcdTBCOTBcXHUwQjkyLVxcdTBCOTVcXHUwQjk5XFx1MEI5QVxcdTBCOUNcXHUwQjlFXFx1MEI5RlxcdTBCQTNcXHUwQkE0XFx1MEJBOC1cXHUwQkFBXFx1MEJBRS1cXHUwQkI5XFx1MEJEMFxcdTBDMDUtXFx1MEMwQ1xcdTBDMEUtXFx1MEMxMFxcdTBDMTItXFx1MEMyOFxcdTBDMkEtXFx1MEMzM1xcdTBDMzUtXFx1MEMzOVxcdTBDM0RcXHUwQzU4XFx1MEM1OVxcdTBDNjBcXHUwQzYxXFx1MEM4NS1cXHUwQzhDXFx1MEM4RS1cXHUwQzkwXFx1MEM5Mi1cXHUwQ0E4XFx1MENBQS1cXHUwQ0IzXFx1MENCNS1cXHUwQ0I5XFx1MENCRFxcdTBDREVcXHUwQ0UwXFx1MENFMVxcdTBDRjFcXHUwQ0YyXFx1MEQwNS1cXHUwRDBDXFx1MEQwRS1cXHUwRDEwXFx1MEQxMi1cXHUwRDNBXFx1MEQzRFxcdTBENEVcXHUwRDYwXFx1MEQ2MVxcdTBEN0EtXFx1MEQ3RlxcdTBEODUtXFx1MEQ5NlxcdTBEOUEtXFx1MERCMVxcdTBEQjMtXFx1MERCQlxcdTBEQkRcXHUwREMwLVxcdTBEQzZcXHUwRTAxLVxcdTBFMzBcXHUwRTMyXFx1MEUzM1xcdTBFNDAtXFx1MEU0NlxcdTBFODFcXHUwRTgyXFx1MEU4NFxcdTBFODdcXHUwRTg4XFx1MEU4QVxcdTBFOERcXHUwRTk0LVxcdTBFOTdcXHUwRTk5LVxcdTBFOUZcXHUwRUExLVxcdTBFQTNcXHUwRUE1XFx1MEVBN1xcdTBFQUFcXHUwRUFCXFx1MEVBRC1cXHUwRUIwXFx1MEVCMlxcdTBFQjNcXHUwRUJEXFx1MEVDMC1cXHUwRUM0XFx1MEVDNlxcdTBFREMtXFx1MEVERlxcdTBGMDBcXHUwRjQwLVxcdTBGNDdcXHUwRjQ5LVxcdTBGNkNcXHUwRjg4LVxcdTBGOENcXHUxMDAwLVxcdTEwMkFcXHUxMDNGXFx1MTA1MC1cXHUxMDU1XFx1MTA1QS1cXHUxMDVEXFx1MTA2MVxcdTEwNjVcXHUxMDY2XFx1MTA2RS1cXHUxMDcwXFx1MTA3NS1cXHUxMDgxXFx1MTA4RVxcdTEwQTAtXFx1MTBDNVxcdTEwQzdcXHUxMENEXFx1MTBEMC1cXHUxMEZBXFx1MTBGQy1cXHUxMjQ4XFx1MTI0QS1cXHUxMjREXFx1MTI1MC1cXHUxMjU2XFx1MTI1OFxcdTEyNUEtXFx1MTI1RFxcdTEyNjAtXFx1MTI4OFxcdTEyOEEtXFx1MTI4RFxcdTEyOTAtXFx1MTJCMFxcdTEyQjItXFx1MTJCNVxcdTEyQjgtXFx1MTJCRVxcdTEyQzBcXHUxMkMyLVxcdTEyQzVcXHUxMkM4LVxcdTEyRDZcXHUxMkQ4LVxcdTEzMTBcXHUxMzEyLVxcdTEzMTVcXHUxMzE4LVxcdTEzNUFcXHUxMzgwLVxcdTEzOEZcXHUxM0EwLVxcdTEzRjRcXHUxNDAxLVxcdTE2NkNcXHUxNjZGLVxcdTE2N0ZcXHUxNjgxLVxcdTE2OUFcXHUxNkEwLVxcdTE2RUFcXHUxNzAwLVxcdTE3MENcXHUxNzBFLVxcdTE3MTFcXHUxNzIwLVxcdTE3MzFcXHUxNzQwLVxcdTE3NTFcXHUxNzYwLVxcdTE3NkNcXHUxNzZFLVxcdTE3NzBcXHUxNzgwLVxcdTE3QjNcXHUxN0Q3XFx1MTdEQ1xcdTE4MjAtXFx1MTg3N1xcdTE4ODAtXFx1MThBOFxcdTE4QUFcXHUxOEIwLVxcdTE4RjVcXHUxOTAwLVxcdTE5MUNcXHUxOTUwLVxcdTE5NkRcXHUxOTcwLVxcdTE5NzRcXHUxOTgwLVxcdTE5QUJcXHUxOUMxLVxcdTE5QzdcXHUxQTAwLVxcdTFBMTZcXHUxQTIwLVxcdTFBNTRcXHUxQUE3XFx1MUIwNS1cXHUxQjMzXFx1MUI0NS1cXHUxQjRCXFx1MUI4My1cXHUxQkEwXFx1MUJBRVxcdTFCQUZcXHUxQkJBLVxcdTFCRTVcXHUxQzAwLVxcdTFDMjNcXHUxQzRELVxcdTFDNEZcXHUxQzVBLVxcdTFDN0RcXHUxQ0U5LVxcdTFDRUNcXHUxQ0VFLVxcdTFDRjFcXHUxQ0Y1XFx1MUNGNlxcdTFEMDAtXFx1MURCRlxcdTFFMDAtXFx1MUYxNVxcdTFGMTgtXFx1MUYxRFxcdTFGMjAtXFx1MUY0NVxcdTFGNDgtXFx1MUY0RFxcdTFGNTAtXFx1MUY1N1xcdTFGNTlcXHUxRjVCXFx1MUY1RFxcdTFGNUYtXFx1MUY3RFxcdTFGODAtXFx1MUZCNFxcdTFGQjYtXFx1MUZCQ1xcdTFGQkVcXHUxRkMyLVxcdTFGQzRcXHUxRkM2LVxcdTFGQ0NcXHUxRkQwLVxcdTFGRDNcXHUxRkQ2LVxcdTFGREJcXHUxRkUwLVxcdTFGRUNcXHUxRkYyLVxcdTFGRjRcXHUxRkY2LVxcdTFGRkNcXHUyMDcxXFx1MjA3RlxcdTIwOTAtXFx1MjA5Q1xcdTIxMDJcXHUyMTA3XFx1MjEwQS1cXHUyMTEzXFx1MjExNVxcdTIxMTktXFx1MjExRFxcdTIxMjRcXHUyMTI2XFx1MjEyOFxcdTIxMkEtXFx1MjEyRFxcdTIxMkYtXFx1MjEzOVxcdTIxM0MtXFx1MjEzRlxcdTIxNDUtXFx1MjE0OVxcdTIxNEVcXHUyMTgzXFx1MjE4NFxcdTJDMDAtXFx1MkMyRVxcdTJDMzAtXFx1MkM1RVxcdTJDNjAtXFx1MkNFNFxcdTJDRUItXFx1MkNFRVxcdTJDRjJcXHUyQ0YzXFx1MkQwMC1cXHUyRDI1XFx1MkQyN1xcdTJEMkRcXHUyRDMwLVxcdTJENjdcXHUyRDZGXFx1MkQ4MC1cXHUyRDk2XFx1MkRBMC1cXHUyREE2XFx1MkRBOC1cXHUyREFFXFx1MkRCMC1cXHUyREI2XFx1MkRCOC1cXHUyREJFXFx1MkRDMC1cXHUyREM2XFx1MkRDOC1cXHUyRENFXFx1MkREMC1cXHUyREQ2XFx1MkREOC1cXHUyRERFXFx1MkUyRlxcdTMwMDVcXHUzMDA2XFx1MzAzMS1cXHUzMDM1XFx1MzAzQlxcdTMwM0NcXHUzMDQxLVxcdTMwOTZcXHUzMDlELVxcdTMwOUZcXHUzMEExLVxcdTMwRkFcXHUzMEZDLVxcdTMwRkZcXHUzMTA1LVxcdTMxMkRcXHUzMTMxLVxcdTMxOEVcXHUzMUEwLVxcdTMxQkFcXHUzMUYwLVxcdTMxRkZcXHUzNDAwLVxcdTREQjVcXHU0RTAwLVxcdTlGQ0NcXHVBMDAwLVxcdUE0OENcXHVBNEQwLVxcdUE0RkRcXHVBNTAwLVxcdUE2MENcXHVBNjEwLVxcdUE2MUZcXHVBNjJBXFx1QTYyQlxcdUE2NDAtXFx1QTY2RVxcdUE2N0YtXFx1QTY5N1xcdUE2QTAtXFx1QTZFNVxcdUE3MTctXFx1QTcxRlxcdUE3MjItXFx1QTc4OFxcdUE3OEItXFx1QTc4RVxcdUE3OTAtXFx1QTc5M1xcdUE3QTAtXFx1QTdBQVxcdUE3RjgtXFx1QTgwMVxcdUE4MDMtXFx1QTgwNVxcdUE4MDctXFx1QTgwQVxcdUE4MEMtXFx1QTgyMlxcdUE4NDAtXFx1QTg3M1xcdUE4ODItXFx1QThCM1xcdUE4RjItXFx1QThGN1xcdUE4RkJcXHVBOTBBLVxcdUE5MjVcXHVBOTMwLVxcdUE5NDZcXHVBOTYwLVxcdUE5N0NcXHVBOTg0LVxcdUE5QjJcXHVBOUNGXFx1QUEwMC1cXHVBQTI4XFx1QUE0MC1cXHVBQTQyXFx1QUE0NC1cXHVBQTRCXFx1QUE2MC1cXHVBQTc2XFx1QUE3QVxcdUFBODAtXFx1QUFBRlxcdUFBQjFcXHVBQUI1XFx1QUFCNlxcdUFBQjktXFx1QUFCRFxcdUFBQzBcXHVBQUMyXFx1QUFEQi1cXHVBQUREXFx1QUFFMC1cXHVBQUVBXFx1QUFGMi1cXHVBQUY0XFx1QUIwMS1cXHVBQjA2XFx1QUIwOS1cXHVBQjBFXFx1QUIxMS1cXHVBQjE2XFx1QUIyMC1cXHVBQjI2XFx1QUIyOC1cXHVBQjJFXFx1QUJDMC1cXHVBQkUyXFx1QUMwMC1cXHVEN0EzXFx1RDdCMC1cXHVEN0M2XFx1RDdDQi1cXHVEN0ZCXFx1RjkwMC1cXHVGQTZEXFx1RkE3MC1cXHVGQUQ5XFx1RkIwMC1cXHVGQjA2XFx1RkIxMy1cXHVGQjE3XFx1RkIxRFxcdUZCMUYtXFx1RkIyOFxcdUZCMkEtXFx1RkIzNlxcdUZCMzgtXFx1RkIzQ1xcdUZCM0VcXHVGQjQwXFx1RkI0MVxcdUZCNDNcXHVGQjQ0XFx1RkI0Ni1cXHVGQkIxXFx1RkJEMy1cXHVGRDNEXFx1RkQ1MC1cXHVGRDhGXFx1RkQ5Mi1cXHVGREM3XFx1RkRGMC1cXHVGREZCXFx1RkU3MC1cXHVGRTc0XFx1RkU3Ni1cXHVGRUZDXFx1RkYyMS1cXHVGRjNBXFx1RkY0MS1cXHVGRjVBXFx1RkY2Ni1cXHVGRkJFXFx1RkZDMi1cXHVGRkM3XFx1RkZDQS1cXHVGRkNGXFx1RkZEMi1cXHVGRkQ3XFx1RkZEQS1cXHVGRkRDXS8sICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjA3NTA3MFxyXG4gICcqJzogLy4vXHJcbn07XHJcblBhdHRlcm5NYXNrLkRFRl9UWVBFUyA9IHtcclxuICBJTlBVVDogJ2lucHV0JyxcclxuICBGSVhFRDogJ2ZpeGVkJ1xyXG59XHJcblBhdHRlcm5NYXNrLkRFRkFVTFRfUExBQ0VIT0xERVIgPSB7XHJcbiAgc2hvdzogJ2xhenknLFxyXG4gIGNoYXI6ICdfJ1xyXG59O1xyXG5QYXR0ZXJuTWFzay5TVE9QX0NIQVIgPSAnXFwnJztcclxuUGF0dGVybk1hc2suRVNDQVBFX0NIQVIgPSAnXFxcXCc7XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5pbXBvcnQge2V4dGVuZERldGFpbHNBZGp1c3RtZW50c30gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIFBpcGVNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgc3VwZXIoZWwsIG9wdHMpO1xyXG5cclxuICAgIHRoaXMubXVsdGlwYXNzID0gb3B0cy5tdWx0aXBhc3M7XHJcblxyXG4gICAgdGhpcy5fY29tcGlsZWRNYXNrcyA9IHRoaXMubWFzay5tYXAobSA9PiBJTWFzay5NYXNrRmFjdG9yeShlbCwgbSkpO1xyXG4gIH1cclxuXHJcbiAgcmVzb2x2ZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICB2YXIgcmVzID0gdGhpcy5fcGlwZShzdHIsIGRldGFpbHMpO1xyXG4gICAgaWYgKCF0aGlzLm11bHRpcGFzcykgcmV0dXJuIHJlcztcclxuXHJcbiAgICB2YXIgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcblxyXG4gICAgdmFyIHN0ZXBSZXM7XHJcbiAgICB2YXIgdGVtcFJlcyA9IHJlcztcclxuXHJcbiAgICB3aGlsZSAoc3RlcFJlcyAhPT0gdGVtcFJlcykge1xyXG4gICAgICBzdGVwUmVzID0gdGVtcFJlcztcclxuICAgICAgdGVtcFJlcyA9IHRoaXMuX3BpcGUoc3RlcFJlcywge1xyXG4gICAgICAgIGN1cnNvclBvczogc3RlcFJlcy5sZW5ndGgsXHJcbiAgICAgICAgb2xkVmFsdWU6IHN0ZXBSZXMsXHJcbiAgICAgICAgb2xkU2VsZWN0aW9uOiB7XHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogc3RlcFJlcy5sZW5ndGhcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGRldGFpbHMuY3Vyc29yUG9zID0gY3Vyc29yUG9zIC0gKHJlcy5sZW5ndGggLSBzdGVwUmVzLmxlbmd0aCk7XHJcblxyXG4gICAgcmV0dXJuIHN0ZXBSZXM7XHJcbiAgfVxyXG5cclxuICBfcGlwZSAoc3RyLCBkZXRhaWxzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29tcGlsZWRNYXNrcy5yZWR1Y2UoKHMsIG0pID0+IHtcclxuICAgICAgdmFyIGQgPSBleHRlbmREZXRhaWxzQWRqdXN0bWVudHMocywgZGV0YWlscyk7XHJcbiAgICAgIHZhciByZXMgPSBtLnJlc29sdmUocywgZCk7XHJcbiAgICAgIGRldGFpbHMuY3Vyc29yUG9zID0gZC5jdXJzb3JQb3M7XHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9LCBzdHIpO1xyXG4gIH1cclxuXHJcbiAgYmluZEV2ZW50cyAoKSB7XHJcbiAgICBzdXBlci5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLl9jb21waWxlZE1hc2tzLmZvckVhY2gobSA9PiB7XHJcbiAgICAgIG0uYmluZEV2ZW50cygpO1xyXG4gICAgICAvLyBkaXNhYmxlIGJhc2VtYXNrIGV2ZW50cyBmb3IgY2hpbGQgbWFza3NcclxuICAgICAgQmFzZU1hc2sucHJvdG90eXBlLnVuYmluZEV2ZW50cy5hcHBseShtKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5fY29tcGlsZWRNYXNrcy5mb3JFYWNoKG0gPT4gbS51bmJpbmRFdmVudHMoKSk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7aXNTdHJpbmd9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vbWFza3MvYmFzZSc7XHJcbmltcG9ydCBSZWdFeHBNYXNrIGZyb20gJy4vbWFza3MvcmVnZXhwJztcclxuaW1wb3J0IEZ1bmNNYXNrIGZyb20gJy4vbWFza3MvZnVuYyc7XHJcbmltcG9ydCBQYXR0ZXJuTWFzayBmcm9tICcuL21hc2tzL3BhdHRlcm4nO1xyXG5pbXBvcnQgUGlwZU1hc2sgZnJvbSAnLi9tYXNrcy9waXBlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5mdW5jdGlvbiBJTWFzayAoZWwsIG9wdHM9e30pIHtcclxuICB2YXIgbWFzayA9IElNYXNrLk1hc2tGYWN0b3J5KGVsLCBvcHRzKTtcclxuICBtYXNrLmJpbmRFdmVudHMoKTtcclxuICAvLyByZWZyZXNoXHJcbiAgbWFzay5yYXdWYWx1ZSA9IGVsLnZhbHVlO1xyXG4gIHJldHVybiBtYXNrO1xyXG59XHJcblxyXG5JTWFzay5NYXNrRmFjdG9yeSA9IGZ1bmN0aW9uIChlbCwgb3B0cykge1xyXG4gIHZhciBtYXNrID0gb3B0cy5tYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgQmFzZU1hc2spIHJldHVybiBtYXNrO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gbmV3IFJlZ0V4cE1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChtYXNrIGluc3RhbmNlb2YgQXJyYXkpIHJldHVybiBuZXcgUGlwZU1hc2soZWwsIG9wdHMpO1xyXG4gIGlmIChpc1N0cmluZyhtYXNrKSkgcmV0dXJuIG5ldyBQYXR0ZXJuTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKG1hc2sucHJvdG90eXBlIGluc3RhbmNlb2YgQmFzZU1hc2spIHJldHVybiBuZXcgbWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBGdW5jdGlvbikgcmV0dXJuIG5ldyBGdW5jTWFzayhlbCwgb3B0cyk7XHJcbiAgcmV0dXJuIG5ldyBCYXNlTWFzayhlbCwgb3B0cyk7XHJcbn1cclxuSU1hc2suQmFzZU1hc2sgPSBCYXNlTWFzaztcclxuSU1hc2suRnVuY01hc2sgPSBGdW5jTWFzaztcclxuSU1hc2suUmVnRXhwTWFzayA9IFJlZ0V4cE1hc2s7XHJcbklNYXNrLlBhdHRlcm5NYXNrID0gUGF0dGVybk1hc2s7XHJcbndpbmRvdy5JTWFzayA9IElNYXNrO1xyXG4iXSwibmFtZXMiOlsiaXNTdHJpbmciLCJzdHIiLCJTdHJpbmciLCJjb25mb3JtIiwicmVzIiwiZmFsbGJhY2siLCJESVJFQ1RJT04iLCJleHRlbmREZXRhaWxzQWRqdXN0bWVudHMiLCJkZXRhaWxzIiwiY3Vyc29yUG9zIiwib2xkU2VsZWN0aW9uIiwib2xkVmFsdWUiLCJzdGFydENoYW5nZVBvcyIsIk1hdGgiLCJtaW4iLCJzdGFydCIsImluc2VydGVkQ291bnQiLCJyZW1vdmVkQ291bnQiLCJtYXgiLCJlbmQiLCJsZW5ndGgiLCJzdWJzdHJpbmciLCJzdWJzdHIiLCJSSUdIVCIsIkxFRlQiLCJpbmRleEluRGlyZWN0aW9uIiwicG9zIiwiZGlyZWN0aW9uIiwiQmFzZU1hc2siLCJlbCIsIm9wdHMiLCJtYXNrIiwiX2xpc3RlbmVycyIsIl9yZWZyZXNoaW5nQ291bnQiLCJfcmF3VmFsdWUiLCJfdW5tYXNrZWRWYWx1ZSIsInNhdmVTZWxlY3Rpb24iLCJiaW5kIiwiX29uSW5wdXQiLCJfb25Ecm9wIiwiZXYiLCJoYW5kbGVyIiwicHVzaCIsImhJbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImxpc3RlbmVycyIsImZvckVhY2giLCJsIiwiaW5wdXRWYWx1ZSIsIl9zZWxlY3Rpb24iLCJyYXdWYWx1ZSIsInVubWFza2VkVmFsdWUiLCJyZXNvbHZlIiwidXBkYXRlRWxlbWVudCIsInZhbHVlIiwid2FybiIsInNlbGVjdGlvblN0YXJ0IiwidW5iaW5kRXZlbnRzIiwiX2NhbGNVbm1hc2tlZCIsImlzQ2hhbmdlZCIsInVwZGF0ZUN1cnNvciIsIl9maXJlQ2hhbmdlRXZlbnRzIiwiZmlyZUV2ZW50IiwiX2RlbGF5VXBkYXRlQ3Vyc29yIiwiX2Fib3J0VXBkYXRlQ3Vyc29yIiwiX2NoYW5naW5nQ3Vyc29yUG9zIiwiX2N1cnNvckNoYW5naW5nIiwic2V0VGltZW91dCIsInByb2Nlc3NJbnB1dCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2VsZWN0aW9uRW5kIiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50Iiwic2V0U2VsZWN0aW9uUmFuZ2UiLCJSZWdFeHBNYXNrIiwidGVzdCIsIkZ1bmNNYXNrIiwiUGF0dGVybk1hc2siLCJfaG9sbG93cyIsInBsYWNlaG9sZGVyIiwiZGVmaW5pdGlvbnMiLCJERUZJTklUSU9OUyIsIl9hbGlnbkN1cnNvciIsIl9hbGlnbkN1cnNvckZyaWVuZGx5IiwiX2luaXRpYWxpemVkIiwiX2RlZmluaXRpb25zIiwiX2NoYXJEZWZzIiwiX2FsaWduU3RvcHMiLCJwYXR0ZXJuIiwidW5tYXNraW5nQmxvY2siLCJvcHRpb25hbEJsb2NrIiwiaSIsImNoIiwidHlwZSIsIkRFRl9UWVBFUyIsIklOUFVUIiwiRklYRUQiLCJ1bm1hc2tpbmciLCJvcHRpb25hbCIsIlNUT1BfQ0hBUiIsIkVTQ0FQRV9DSEFSIiwiX2J1aWxkUmVzb2x2ZXJzIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiTWFza0ZhY3RvcnkiLCJ0YWlsIiwic2tpcFVucmVzb2x2ZWRJbnB1dCIsInBsYWNlaG9sZGVyQnVmZmVyIiwiaG9sbG93cyIsInNsaWNlIiwib3ZlcmZsb3ciLCJjaSIsImRpIiwiX21hcFBvc1RvRGVmSW5kZXgiLCJfaXNIb2xsb3ciLCJkZWYiLCJyZXNvbHZlciIsImNoYXIiLCJjaHJlcyIsImlzUmVzb2x2ZWQiLCJfcGxhY2Vob2xkZXIiLCJjaHVua3MiLCJpbnB1dCIsIl9hcHBlbmRUYWlsIiwiY2h1bmsyIiwic3RvcDIiLCJfYXBwZW5kUGxhY2Vob2xkZXJFbmQiLCJmcm9tUG9zIiwidG9Qb3MiLCJ0b0RlZkluZGV4IiwiX2lzSGlkZGVuSG9sbG93IiwiX2lzSW5wdXQiLCJzdG9wcyIsInNpIiwicyIsInMyIiwiX2V4dHJhY3RJbnB1dCIsImRlZkluZGV4IiwiZmlsdGVyIiwiaCIsIl9ob2xsb3dzQmVmb3JlIiwiaGkiLCJoZWFkIiwiaW5zZXJ0ZWQiLCJpbnNlcnRTdGVwcyIsInJlbW92ZWQiLCJ0YWlsUG9zIiwidGFpbERlZkluZGV4IiwidGFpbEFsaWduU3RvcHNQb3MiLCJtYXAiLCJfbWFwRGVmSW5kZXhUb1BvcyIsInRhaWxJbnB1dENodW5rcyIsIl9leHRyYWN0SW5wdXRDaHVua3MiLCJsYXN0SG9sbG93SW5kZXgiLCJyZW1vdmVEaXJlY3Rpb24iLCJfbmVhcmVzdElucHV0UG9zIiwiX2dlbmVyYXRlSW5zZXJ0U3RlcHMiLCJpc3RlcCIsInN0ZXAiLCJ0cmVzIiwiX2FwcGVuZFRhaWxDaHVua3MiLCJpc0NvbXBsZXRlIiwic2hvdyIsInVubWFza2VkIiwiZGVmcyIsImluZGV4IiwiaW5pdGlhbERlZkluZGV4IiwiZmlyc3RJbnB1dEluZGV4IiwiZmlyc3RGaWxsZWRJbnB1dEluZGV4IiwiZmlyc3RWaXNpYmxlSG9sbG93SW5kZXgiLCJuZXh0ZGkiLCJwaCIsIkRFRkFVTFRfUExBQ0VIT0xERVIiLCJqb2luIiwiX2luc3RhbGxEZWZpbml0aW9ucyIsIl9tYXNrIiwiUGlwZU1hc2siLCJtdWx0aXBhc3MiLCJfY29tcGlsZWRNYXNrcyIsIm0iLCJfcGlwZSIsInN0ZXBSZXMiLCJ0ZW1wUmVzIiwicmVkdWNlIiwiZCIsImJpbmRFdmVudHMiLCJwcm90b3R5cGUiLCJhcHBseSIsIlJlZ0V4cCIsIkFycmF5IiwiRnVuY3Rpb24iLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxTQUFTQSxRQUFULENBQW1CQyxHQUFuQixFQUF3QjtTQUNmLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxlQUFlQyxNQUFqRDs7O0FBR0YsQUFDQSxTQUFTQyxPQUFULENBQWtCQyxHQUFsQixFQUF1QkgsR0FBdkIsRUFBeUM7TUFBYkksUUFBYSx1RUFBSixFQUFJOztTQUNoQ0wsU0FBU0ksR0FBVCxJQUNMQSxHQURLLEdBRUxBLE1BQ0VILEdBREYsR0FFRUksUUFKSjs7O0FBT0YsQUFDQSxJQUFJQyxZQUFZO1FBQ1IsQ0FEUTtRQUVSLENBQUMsQ0FGTztTQUdQO0NBSFQ7O0FBT0EsQUFDQSxTQUFTQyx3QkFBVCxDQUFrQ04sR0FBbEMsRUFBdUNPLE9BQXZDLEVBQWdEO01BQzFDQyxZQUFZRCxRQUFRQyxTQUF4QjtNQUNJQyxlQUFlRixRQUFRRSxZQUEzQjtNQUNJQyxXQUFXSCxRQUFRRyxRQUF2Qjs7TUFFSUMsaUJBQWlCQyxLQUFLQyxHQUFMLENBQVNMLFNBQVQsRUFBb0JDLGFBQWFLLEtBQWpDLENBQXJCO01BQ0lDLGdCQUFnQlAsWUFBWUcsY0FBaEM7O01BRUlLLGVBQWVKLEtBQUtLLEdBQUwsQ0FBVVIsYUFBYVMsR0FBYixHQUFtQlAsY0FB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