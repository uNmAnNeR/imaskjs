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

  BaseMask.prototype.on = function on(ev, handler) {
    if (!this._listeners[ev]) this._listeners[ev] = [];
    this._listeners[ev].push(handler);
    return this;
  };

  BaseMask.prototype.off = function off(ev, handler) {
    if (!this._listeners[ev]) return;
    if (!handler) {
      delete this._listeners[ev];
      return;
    }
    var hIndex = this._listeners[ev].indexOf(handler);
    if (hIndex >= 0) this._listeners.splice(hIndex, 1);
    return this;
  };

  BaseMask.prototype.bindEvents = function bindEvents() {
    this.el.addEventListener('keydown', this.saveSelection);
    this.el.addEventListener('input', this._onInput);
    this.el.addEventListener('drop', this._onDrop);
  };

  BaseMask.prototype.unbindEvents = function unbindEvents() {
    this.el.removeEventListener('keydown', this.saveSelection);
    this.el.removeEventListener('input', this._onInput);
    this.el.removeEventListener('drop', this._onDrop);
  };

  BaseMask.prototype.fireEvent = function fireEvent(ev) {
    var listeners = this._listeners[ev] || [];
    listeners.forEach(function (l) {
      return l();
    });
  };

  BaseMask.prototype.processInput = function processInput(inputValue, details) {
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
  };

  BaseMask.prototype.saveSelection = function saveSelection(ev) {
    if (this.rawValue !== this.el.value) {
      console.warn("Uncontrolled input change, refresh mask manually!");
    }
    this._selection = {
      start: this.selectionStart,
      end: this.cursorPos
    };
  };

  BaseMask.prototype.destroy = function destroy() {
    this.unbindEvents();
    this._listeners.length = 0;
  };

  BaseMask.prototype.updateElement = function updateElement(value, cursorPos) {
    var unmaskedValue = this._calcUnmasked(value);
    var isChanged = this.unmaskedValue !== unmaskedValue || this.rawValue !== value;

    this._unmaskedValue = unmaskedValue;
    this._rawValue = value;

    if (this.el.value !== value) this.el.value = value;
    this.updateCursor(cursorPos);

    if (isChanged) this._fireChangeEvents();
  };

  BaseMask.prototype._fireChangeEvents = function _fireChangeEvents() {
    this.fireEvent("accept");
  };

  BaseMask.prototype.updateCursor = function updateCursor(cursorPos) {
    if (cursorPos == null) return;
    this.cursorPos = cursorPos;

    // also queue change cursor for mobile browsers
    this._delayUpdateCursor(cursorPos);
  };

  BaseMask.prototype._delayUpdateCursor = function _delayUpdateCursor(cursorPos) {
    var _this = this;

    this._abortUpdateCursor();
    this._changingCursorPos = cursorPos;
    this._cursorChanging = setTimeout(function () {
      _this._abortUpdateCursor();
      _this.cursorPos = _this._changingCursorPos;
    }, 10);
  };

  BaseMask.prototype._abortUpdateCursor = function _abortUpdateCursor() {
    if (this._cursorChanging) {
      clearTimeout(this._cursorChanging);
      delete this._cursorChanging;
    }
  };

  BaseMask.prototype._onInput = function _onInput(ev) {
    this._abortUpdateCursor();
    this.processInput(this.el.value);
  };

  BaseMask.prototype._onDrop = function _onDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  };

  // override


  BaseMask.prototype.resolve = function resolve(str, details) {
    return str;
  };

  BaseMask.prototype._calcUnmasked = function _calcUnmasked(value) {
    return value;
  };

  createClass(BaseMask, [{
    key: "rawValue",
    get: function get$$1() {
      return this._rawValue;
    },
    set: function set$$1(str) {
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
    get: function get$$1() {
      return this._unmaskedValue;
    },
    set: function set$$1(value) {
      this.rawValue = value;
    }
  }, {
    key: "selectionStart",
    get: function get$$1() {
      return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
    }
  }, {
    key: "cursorPos",
    get: function get$$1() {
      return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
    },
    set: function set$$1(pos) {
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
    return possibleConstructorReturn(this, _BaseMask.apply(this, arguments));
  }

  RegExpMask.prototype.resolve = function resolve(str) {
    return this.mask.test(str);
  };

  return RegExpMask;
}(BaseMask);

var FuncMask = function (_BaseMask) {
  inherits(FuncMask, _BaseMask);

  function FuncMask() {
    classCallCheck(this, FuncMask);
    return possibleConstructorReturn(this, _BaseMask.apply(this, arguments));
  }

  FuncMask.prototype.resolve = function resolve() {
    return this.mask.apply(this, arguments);
  };

  return FuncMask;
}(BaseMask);

var PatternMask = function (_BaseMask) {
  inherits(PatternMask, _BaseMask);

  function PatternMask(el, opts) {
    classCallCheck(this, PatternMask);

    var _this = possibleConstructorReturn(this, _BaseMask.call(this, el, opts));

    _this._hollows = [];
    _this.placeholder = opts.placeholder;
    _this.definitions = _extends({}, PatternMask.DEFINITIONS, opts.definitions);

    _this._alignCursor = _this._alignCursor.bind(_this);
    _this._alignCursorFriendly = _this._alignCursorFriendly.bind(_this);

    _this._initialized = true;
    return _this;
  }

  PatternMask.prototype._alignCursorFriendly = function _alignCursorFriendly() {
    if (this.selectionStart !== this.cursorPos) return;
    this._alignCursor();
  };

  PatternMask.prototype.bindEvents = function bindEvents() {
    _BaseMask.prototype.bindEvents.call(this);
    this.el.addEventListener('click', this._alignCursorFriendly);
  };

  PatternMask.prototype.unbindEvents = function unbindEvents() {
    _BaseMask.prototype.unbindEvents.call(this);
    this.el.removeEventListener('click', this._alignCursorFriendly);
  };

  PatternMask.prototype._installDefinitions = function _installDefinitions(definitions) {
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
  };

  PatternMask.prototype._buildResolvers = function _buildResolvers() {
    this._resolvers = {};
    for (var defKey in this.definitions) {
      this._resolvers[defKey] = IMask.MaskFactory(this.el, {
        mask: this.definitions[defKey]
      });
    }
  };

  PatternMask.prototype._appendTail = function _appendTail(str, tail) {
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

      var resolved, skipped;
      if (def.type === PatternMask.DEF_TYPES.INPUT) {
        var resolver = this._resolvers[def.char];
        var chres = resolver.resolve(ch, di, str + placeholderBuffer) || '';
        resolved = !!chres;
        skipped = !chres && !def.optional;

        // if ok - next di
        if (chres) {
          chres = conform(chres, ch);
        } else {
          if (!def.optional && skipUnresolvedInput) {
            chres = this._placeholder.char;
            skipped = false;
          }
          if (!skipped) hollows.push(di);
        }

        if (chres) {
          str += placeholderBuffer + conform(chres, ch);
          placeholderBuffer = '';
        }
      } else {
        placeholderBuffer += def.char;
        resolved = ch === def.char && (def.unmasking || !skipUnresolvedInput);
      }

      if (!skipped) ++di;
      if (resolved || skipped) ++ci;
    }

    return [str, hollows, overflow];
  };

  PatternMask.prototype._appendTailChunks = function _appendTailChunks(str, chunks, skipUnresolvedInput) {
    var overflow = false;
    for (var ci = 0; ci < chunks.length; ++ci) {
      var _chunks$ci = chunks[ci],
          input = _chunks$ci[1];

      var _appendTail2 = this._appendTail(str, input, skipUnresolvedInput);

      str = _appendTail2[0];
      this._hollows = _appendTail2[1];
      overflow = _appendTail2[2];

      if (overflow) break;

      // not last - append placeholder between stops
      var chunk2 = chunks[ci + 1];
      var stop2 = chunk2 && chunk2[0];
      if (stop2) str = this._appendPlaceholderEnd(str, stop2);
    }
    return [str, this._hollows, overflow];
  };

  PatternMask.prototype._extractInput = function _extractInput(str) {
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
  };

  PatternMask.prototype._extractInputChunks = function _extractInputChunks(str, stops) {
    var chunks = [];
    for (var si = 0; si < stops.length && str; ++si) {
      var s = stops[si];
      var s2 = stops[si + 1];
      chunks.push([s, this._extractInput(str, s, s2)]);
      if (s2) str = str.slice(s2 - s);
    }
    return chunks;
  };

  PatternMask.prototype._isHollow = function _isHollow(defIndex) {
    return this._hollows.indexOf(defIndex) >= 0;
  };

  PatternMask.prototype._isHiddenHollow = function _isHiddenHollow(defIndex) {
    return this._isHollow(defIndex) && this.def(defIndex) && this.def(defIndex).optional;
  };

  PatternMask.prototype._isInput = function _isInput(defIndex) {
    return this.def(defIndex) && this.def(defIndex).type === PatternMask.DEF_TYPES.INPUT;
  };

  PatternMask.prototype._hiddenHollowsBefore = function _hiddenHollowsBefore(defIndex) {
    var _this2 = this;

    return this._hollows.filter(function (h) {
      return h < defIndex && _this2._isHiddenHollow(h);
    });
  };

  PatternMask.prototype._mapDefIndexToPos = function _mapDefIndexToPos(defIndex) {
    return defIndex - this._hiddenHollowsBefore(defIndex).length;
  };

  PatternMask.prototype._mapPosToDefIndex = function _mapPosToDefIndex(pos) {
    var defIndex = pos;
    for (var hi = 0; hi < this._hollows.length; ++hi) {
      var h = this._hollows[hi];
      if (h >= defIndex) break;
      if (this._isHiddenHollow(h)) ++defIndex;
    }
    return defIndex;
  };

  PatternMask.prototype._generateInsertSteps = function _generateInsertSteps(head, inserted) {
    var overflow = false;

    // save hollow during generation
    var hollows = this._hollows;

    var insertSteps = [[head, hollows.slice()]];

    for (var ci = 0; ci < inserted.length && !overflow; ++ci) {
      var ch = inserted[ci];

      var _appendTail3 = this._appendTail(head, ch, false),
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
  };

  PatternMask.prototype.resolve = function resolve(str, details) {
    var _this3 = this;

    var cursorPos = details.cursorPos;
    var startChangePos = details.startChangePos;
    var inserted = details.inserted;
    var removedCount = details.removed.length;
    var tailPos = startChangePos + removedCount;
    var tailDefIndex = this._mapPosToDefIndex(tailPos);
    var tailAlignStopsPos = [tailPos].concat(this._alignStops.filter(function (s) {
      return s >= tailDefIndex;
    }).map(function (s) {
      return _this3._mapDefIndexToPos(s);
    }));
    var tailInputChunks = this._extractInputChunks(details.tail, tailAlignStopsPos);

    // remove hollows after cursor
    var lastHollowIndex = this._mapPosToDefIndex(startChangePos);
    this._hollows = this._hollows.filter(function (h) {
      return h < lastHollowIndex;
    });

    var res = details.head;
    // if remove at left - adjust start change pos to trim holes and fixed at the end
    if (details.removeDirection === DIRECTION.LEFT) res = res.slice(0, this._nearestInputPos(startChangePos));

    // insert available
    var insertSteps = this._generateInsertSteps(res, inserted);
    for (var istep = insertSteps.length - 1; istep >= 0; --istep) {
      var step, tres, overflow;
      var _insertSteps$istep = insertSteps[istep];
      step = _insertSteps$istep[0];
      this._hollows = _insertSteps$istep[1];

      var _appendTailChunks2 = this._appendTailChunks(step, tailInputChunks);

      tres = _appendTailChunks2[0];
      this._hollows = _appendTailChunks2[1];
      overflow = _appendTailChunks2[2];

      if (!overflow) {
        res = tres;
        cursorPos = step.length;
        break;
      }
    }

    res = this._appendPlaceholderEnd(res);
    details.cursorPos = this._nearestInputPos(cursorPos, details.removeDirection);

    return res;
  };

  PatternMask.prototype._fireChangeEvents = function _fireChangeEvents() {
    // fire 'complete' after 'accept' event
    _BaseMask.prototype._fireChangeEvents.call(this);
    if (this.isComplete) this.fireEvent("complete");
  };

  PatternMask.prototype._appendFixedEnd = function _appendFixedEnd(res) {
    for (var di = this._mapPosToDefIndex(res.length);; ++di) {
      var def = this.def(di, res);
      if (!def) break;

      if (this._isHiddenHollow(di)) continue;
      if (this._isInput(di)) break;
      if (di >= res.length) res += def.char;
    }
    return res;
  };

  PatternMask.prototype._appendPlaceholderEnd = function _appendPlaceholderEnd(res, toPos) {
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
  };

  PatternMask.prototype._calcUnmasked = function _calcUnmasked(str) {
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
  };

  PatternMask.prototype.defs = function defs(str) {
    var defs = [];
    for (var i = 0;; ++i) {
      var def = this.def(i, str);
      if (!def) break;
      defs.push(def);
    }
    return defs;
  };

  PatternMask.prototype.def = function def(index, str) {
    return this._charDefs[index];
  };

  PatternMask.prototype._refreshValue = function _refreshValue() {
    if (this._initialized) this.unmaskedValue = this.unmaskedValue;
  };

  PatternMask.prototype._nearestInputPos = function _nearestInputPos(cursorPos) {
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
  };

  PatternMask.prototype._alignCursor = function _alignCursor() {
    this.cursorPos = this._nearestInputPos(this.cursorPos);
  };

  createClass(PatternMask, [{
    key: 'isComplete',
    get: function get$$1() {
      for (var di = 0;; ++di) {
        var def = this.def(di);
        if (!def) break;
        if (this._isInput(di) && !def.optional && this._isHollow(di)) return false;
      }
      return true;
    }
  }, {
    key: 'unmaskedValue',
    get: function get$$1() {
      return this._unmaskedValue;
    },
    set: function set$$1(str) {
      this._hollows.length = 0;
      var res;

      var _appendTail4 = this._appendTail('', str);

      res = _appendTail4[0];
      this._hollows = _appendTail4[1];

      this.updateElement(this._appendPlaceholderEnd(res));

      this._alignCursor();
    }
  }, {
    key: 'placeholder',
    get: function get$$1() {
      return this._placeholder;
    },
    set: function set$$1(ph) {
      this._placeholder = _extends({}, PatternMask.DEFAULT_PLACEHOLDER, ph);
      this._refreshValue();
    }
  }, {
    key: 'placeholderLabel',
    get: function get$$1() {
      var _this4 = this;

      return this.defs().map(function (def) {
        return def.type === PatternMask.DEF_TYPES.FIXED ? def.char : !def.optional ? _this4._placeholder.char : '';
      }).join('');
    }
  }, {
    key: 'definitions',
    get: function get$$1() {
      return this._definitions;
    },
    set: function set$$1(defs) {
      this._installDefinitions(defs);
      this._refreshValue();
    }
  }, {
    key: 'mask',
    get: function get$$1() {
      return this._mask;
    },
    set: function set$$1(mask) {
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

    var _this = possibleConstructorReturn(this, _BaseMask.call(this, el, opts));

    _this.multipass = opts.multipass;

    _this._compiledMasks = _this.mask.map(function (m) {
      return IMask.MaskFactory(el, m);
    });
    return _this;
  }

  PipeMask.prototype.resolve = function resolve(str, details) {
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
  };

  PipeMask.prototype._pipe = function _pipe(str, details) {
    return this._compiledMasks.reduce(function (s, m) {
      var d = extendDetailsAdjustments(s, details);
      var res = m.resolve(s, d);
      details.cursorPos = d.cursorPos;
      return res;
    }, str);
  };

  PipeMask.prototype.bindEvents = function bindEvents() {
    _BaseMask.prototype.bindEvents.call(this);
    this._compiledMasks.forEach(function (m) {
      m.bindEvents();
      // disable basemask events for child masks
      BaseMask.prototype.unbindEvents.apply(m);
    });
  };

  PipeMask.prototype.unbindEvents = function unbindEvents() {
    _BaseMask.prototype.unbindEvents.call(this);
    this._compiledMasks.forEach(function (m) {
      return m.unbindEvents();
    });
  };

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

export default IMask$1;
//# sourceMappingURL=imask.es.js.map
