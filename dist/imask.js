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
      this._oldRawValue = this.rawValue;
      this._oldUnmaskedValue = this.unmaskedValue;
      this._oldSelection = {
        start: this.selectionStart,
        end: this.cursorPos
      };
    }
  }, {
    key: '_changeState',
    value: function _changeState(details) {
      var _this = this;

      details = _extends({
        cursorPos: !this._cursorChanging ? this.cursorPos : this._oldSelection.end,
        oldSelection: this._oldSelection,
        oldValue: this._oldRawValue,
        oldUnmaskedValue: this._oldUnmaskedValue
      }, details);

      var inputValue = this.rawValue;
      var res = inputValue;
      res = conform(this.resolve(res, details), res, this._oldRawValue);

      if (res !== inputValue) {
        this.el.value = res;
        this.cursorPos = details.cursorPos;
        // also queue change cursor for some browsers
        if (this._cursorChanging) clearTimeout(this._cursorChanging);
        this._cursorChanging = setTimeout(function () {
          _this.cursorPos = details.cursorPos;
          delete _this._cursorChanging;
        }, 0);
      }

      this._onChangeState();

      return res;
    }
  }, {
    key: '_onChangeState',
    value: function _onChangeState() {
      this._fireChangeEvents();
      this.saveState();
    }
  }, {
    key: '_fireChangeEvents',
    value: function _fireChangeEvents() {
      if (this._isChanged) this.fireEvent("accept");
    }
  }, {
    key: 'processInput',
    value: function processInput(ev) {
      if (!this._isChanged) return;
      this._changeState();
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
    key: '_isChanged',
    get: function get() {
      return this.rawValue !== this._oldRawValue || this.unmaskedValue !== this._oldUnmaskedValue;
    }
  }, {
    key: 'rawValue',
    get: function get() {
      return this.el.value;
    },
    set: function set(str) {
      this.el.value = str;
      this._changeState({
        cursorPos: str.length,
        oldSelection: {
          start: 0,
          end: str.length
        },
        oldValue: str
      });
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
    key: '_fireChangeEvents',
    value: function _fireChangeEvents() {
      // fire 'complete' after 'accept' event
      get$1(PatternMask.prototype.__proto__ || Object.getPrototypeOf(PatternMask.prototype), '_fireChangeEvents', this).call(this);
      if (this._isChanged && this.isComplete) this.fireEvent("complete");
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
      var _this3 = this;

      return !this._charDefs.filter(function (def, di) {
        return def.type === PatternMask.DEF_TYPES.INPUT && !def.optional && _this3._isHollow(di);
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
      this._hollows.length = 0;
      var res;

      var _appendTail4 = this._appendTail('', str);

      var _appendTail5 = slicedToArray(_appendTail4, 2);

      res = _appendTail5[0];
      this._hollows = _appendTail5[1];

      this.el.value = this._appendPlaceholderEnd(res);

      this._onChangeState();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvaW1hc2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0XHJcbmZ1bmN0aW9uIGlzU3RyaW5nIChzdHIpIHtcclxuICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gY29uZm9ybSAocmVzLCBzdHIsIGZhbGxiYWNrPScnKSB7XHJcbiAgcmV0dXJuIGlzU3RyaW5nKHJlcykgP1xyXG4gICAgcmVzIDpcclxuICAgIHJlcyA/XHJcbiAgICAgIHN0ciA6XHJcbiAgICAgIGZhbGxiYWNrO1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIEJhc2VNYXNrIHtcclxuICBjb25zdHJ1Y3RvciAoZWwsIG9wdHMpIHtcclxuICAgIHRoaXMuZWwgPSBlbDtcclxuICAgIHRoaXMubWFzayA9IG9wdHMubWFzaztcclxuXHJcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcclxuICAgIHRoaXMuX3JlZnJlc2hpbmdDb3VudCA9IDA7XHJcblxyXG4gICAgdGhpcy5zYXZlU3RhdGUgPSB0aGlzLnNhdmVTdGF0ZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5wcm9jZXNzSW5wdXQgPSB0aGlzLnByb2Nlc3NJbnB1dC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fb25Ecm9wID0gdGhpcy5fb25Ecm9wLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBiaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVN0YXRlKTtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLnByb2Nlc3NJbnB1dCk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc2F2ZVN0YXRlKTtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLnByb2Nlc3NJbnB1dCk7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xyXG4gIH1cclxuXHJcbiAgZGVzdHJveSAoKSB7XHJcbiAgICB0aGlzLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICBnZXQgc2VsZWN0aW9uU3RhcnQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgfVxyXG5cclxuICBnZXQgY3Vyc29yUG9zICgpIHtcclxuICAgIHJldHVybiB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuICB9XHJcblxyXG4gIHNldCBjdXJzb3JQb3MgKHBvcykge1xyXG4gICAgdGhpcy5lbC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgfVxyXG5cclxuICBzYXZlU3RhdGUgKGV2KSB7XHJcbiAgICB0aGlzLl9vbGRSYXdWYWx1ZSA9IHRoaXMucmF3VmFsdWU7XHJcbiAgICB0aGlzLl9vbGRVbm1hc2tlZFZhbHVlID0gdGhpcy51bm1hc2tlZFZhbHVlO1xyXG4gICAgdGhpcy5fb2xkU2VsZWN0aW9uID0ge1xyXG4gICAgICBzdGFydDogdGhpcy5zZWxlY3Rpb25TdGFydCxcclxuICAgICAgZW5kOiB0aGlzLmN1cnNvclBvc1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2NoYW5nZVN0YXRlIChkZXRhaWxzKSB7XHJcbiAgICBkZXRhaWxzID0ge1xyXG4gICAgICBjdXJzb3JQb3M6ICF0aGlzLl9jdXJzb3JDaGFuZ2luZyA/XHJcbiAgICAgICAgdGhpcy5jdXJzb3JQb3MgOlxyXG4gICAgICAgIHRoaXMuX29sZFNlbGVjdGlvbi5lbmQsXHJcbiAgICAgIG9sZFNlbGVjdGlvbjogdGhpcy5fb2xkU2VsZWN0aW9uLFxyXG4gICAgICBvbGRWYWx1ZTogdGhpcy5fb2xkUmF3VmFsdWUsXHJcbiAgICAgIG9sZFVubWFza2VkVmFsdWU6IHRoaXMuX29sZFVubWFza2VkVmFsdWUsXHJcbiAgICAgIC4uLmRldGFpbHNcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGlucHV0VmFsdWUgPSB0aGlzLnJhd1ZhbHVlO1xyXG4gICAgdmFyIHJlcyA9IGlucHV0VmFsdWU7XHJcbiAgICByZXMgPSBjb25mb3JtKHRoaXMucmVzb2x2ZShyZXMsIGRldGFpbHMpLFxyXG4gICAgICByZXMsXHJcbiAgICAgIHRoaXMuX29sZFJhd1ZhbHVlKTtcclxuXHJcbiAgICBpZiAocmVzICE9PSBpbnB1dFZhbHVlKSB7XHJcbiAgICAgIHRoaXMuZWwudmFsdWUgPSByZXM7XHJcbiAgICAgIHRoaXMuY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgICAgIC8vIGFsc28gcXVldWUgY2hhbmdlIGN1cnNvciBmb3Igc29tZSBicm93c2Vyc1xyXG4gICAgICBpZiAodGhpcy5fY3Vyc29yQ2hhbmdpbmcpIGNsZWFyVGltZW91dCh0aGlzLl9jdXJzb3JDaGFuZ2luZyk7XHJcbiAgICAgIHRoaXMuX2N1cnNvckNoYW5naW5nID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICAgICAgICBkZWxldGUgdGhpcy5fY3Vyc29yQ2hhbmdpbmc7XHJcbiAgICAgIH0sIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX29uQ2hhbmdlU3RhdGUoKTtcclxuXHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgX29uQ2hhbmdlU3RhdGUgKCkge1xyXG4gICAgdGhpcy5fZmlyZUNoYW5nZUV2ZW50cygpO1xyXG4gICAgdGhpcy5zYXZlU3RhdGUoKTtcclxuICB9XHJcblxyXG4gIGdldCBfaXNDaGFuZ2VkICgpIHtcclxuICAgIHJldHVybiAodGhpcy5yYXdWYWx1ZSAhPT0gdGhpcy5fb2xkUmF3VmFsdWUgfHxcclxuICAgICAgdGhpcy51bm1hc2tlZFZhbHVlICE9PSB0aGlzLl9vbGRVbm1hc2tlZFZhbHVlKTtcclxuICB9XHJcblxyXG4gIF9maXJlQ2hhbmdlRXZlbnRzICgpIHtcclxuICAgIGlmICh0aGlzLl9pc0NoYW5nZWQpIHRoaXMuZmlyZUV2ZW50KFwiYWNjZXB0XCIpO1xyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0lucHV0IChldikge1xyXG4gICAgaWYgKCF0aGlzLl9pc0NoYW5nZWQpIHJldHVybjtcclxuICAgIHRoaXMuX2NoYW5nZVN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICBvbiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgdGhpcy5fbGlzdGVuZXJzW2V2XSA9IFtdO1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzW2V2XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBvZmYgKGV2LCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1tldl0pIHJldHVybjtcclxuICAgIGlmICghaGFuZGxlcikge1xyXG4gICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2XTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGhJbmRleCA9IHRoaXMuX2xpc3RlbmVyc1tldl0uaW5kZXhPZihoYW5kbGVyKTtcclxuICAgIGlmIChoSW5kZXggPj0gMCkgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShoSW5kZXgsIDEpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBmaXJlRXZlbnQgKGV2KSB7XHJcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzW2V2XSB8fCBbXTtcclxuICAgIGxpc3RlbmVycy5mb3JFYWNoKGwgPT4gbCgpKTtcclxuICB9XHJcblxyXG4gIC8vIG92ZXJyaWRlIHRoaXNcclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHsgcmV0dXJuIHN0cjsgfVxyXG5cclxuICBnZXQgcmF3VmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWwudmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgcmF3VmFsdWUgKHN0cikge1xyXG4gICAgdGhpcy5lbC52YWx1ZSA9IHN0cjtcclxuICAgIHRoaXMuX2NoYW5nZVN0YXRlKHtcclxuICAgICAgY3Vyc29yUG9zOiBzdHIubGVuZ3RoLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHtcclxuICAgICAgICBzdGFydDogMCxcclxuICAgICAgICBlbmQ6IHN0ci5sZW5ndGhcclxuICAgICAgfSxcclxuICAgICAgb2xkVmFsdWU6IHN0clxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yYXdWYWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlICh2YWx1ZSkge1xyXG4gICAgdGhpcy5yYXdWYWx1ZSA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgX29uRHJvcCAoZXYpIHtcclxuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUmVnRXhwTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlIChzdHIpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2sudGVzdChzdHIpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBGdW5jTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlICguLi5hcmdzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXNrKC4uLmFyZ3MpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge2NvbmZvcm19IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vYmFzZSc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUGF0dGVybk1hc2sgZXh0ZW5kcyBCYXNlTWFzayB7XHJcbiAgY29uc3RydWN0b3IgKGVsLCBvcHRzKSB7XHJcbiAgICBzdXBlcihlbCwgb3B0cyk7XHJcblxyXG4gICAgdGhpcy5faG9sbG93cyA9IFtdO1xyXG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IG9wdHMucGxhY2Vob2xkZXI7XHJcbiAgICB0aGlzLmRlZmluaXRpb25zID0ge1xyXG4gICAgICAuLi5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyxcclxuICAgICAgLi4ub3B0cy5kZWZpbml0aW9uc1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvciA9IHRoaXMuX2FsaWduQ3Vyc29yLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9hbGlnbkN1cnNvckZyaWVuZGx5ID0gdGhpcy5fYWxpZ25DdXJzb3JGcmllbmRseS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIF9hbGlnbkN1cnNvckZyaWVuZGx5ICgpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGlvblN0YXJ0ICE9PSB0aGlzLmN1cnNvclBvcykgcmV0dXJuO1xyXG4gICAgdGhpcy5fYWxpZ25DdXJzb3IoKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLnVuYmluZEV2ZW50cygpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2FsaWduQ3Vyc29yRnJpZW5kbHkpO1xyXG4gIH1cclxuXHJcbiAgX2luc3RhbGxEZWZpbml0aW9ucyAoZGVmaW5pdGlvbnMpIHtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmaW5pdGlvbnM7XHJcbiAgICB0aGlzLl9jaGFyRGVmcyA9IFtdO1xyXG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLm1hc2s7XHJcblxyXG4gICAgaWYgKCFwYXR0ZXJuIHx8ICFkZWZpbml0aW9ucykgcmV0dXJuO1xyXG5cclxuICAgIHZhciB1bm1hc2tpbmdCbG9jayA9IGZhbHNlO1xyXG4gICAgdmFyIG9wdGlvbmFsQmxvY2sgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGk9MDsgaTxwYXR0ZXJuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjaCA9IHBhdHRlcm5baV07XHJcbiAgICAgIHZhciB0eXBlID0gIXVubWFza2luZ0Jsb2NrICYmIGNoIGluIGRlZmluaXRpb25zID9cclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgOlxyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgdmFyIHVubWFza2luZyA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCB8fCB1bm1hc2tpbmdCbG9jaztcclxuICAgICAgdmFyIG9wdGlvbmFsID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIG9wdGlvbmFsQmxvY2s7XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICd7JyB8fCBjaCA9PT0gJ30nKSB7XHJcbiAgICAgICAgdW5tYXNraW5nQmxvY2sgPSAhdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1snIHx8IGNoID09PSAnXScpIHtcclxuICAgICAgICBvcHRpb25hbEJsb2NrID0gIW9wdGlvbmFsQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1xcXFwnKSB7XHJcbiAgICAgICAgKytpO1xyXG4gICAgICAgIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgICAvLyBUT0RPIHZhbGlkYXRpb25cclxuICAgICAgICBpZiAoIWNoKSBicmVhaztcclxuICAgICAgICB0eXBlID0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jaGFyRGVmcy5wdXNoKHtcclxuICAgICAgICBjaGFyOiBjaCxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcclxuICAgICAgICB1bm1hc2tpbmc6IHVubWFza2luZ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG4gIH1cclxuXHJcbiAgX2J1aWxkUmVzb2x2ZXJzICgpIHtcclxuICAgIHRoaXMuX3Jlc29sdmVycyA9IHt9O1xyXG4gICAgZm9yICh2YXIgZGVmS2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgdGhpcy5fcmVzb2x2ZXJzW2RlZktleV0gPSBJTWFzay5NYXNrRmFjdG9yeSh0aGlzLmVsLCB7XHJcbiAgICAgICAgbWFzazogdGhpcy5kZWZpbml0aW9uc1tkZWZLZXldXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2FwcGVuZFRhaWwgKHN0ciwgdGFpbCkge1xyXG4gICAgdmFyIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuICAgIHZhciBvdmVyZmxvdyA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoc3RyLmxlbmd0aCk7IGNpIDwgdGFpbC5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gdGFpbFtjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICAvLyBmYWlsZWRcclxuICAgICAgaWYgKCFkZWYpIHtcclxuICAgICAgICBvdmVyZmxvdyA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSB7XHJcbiAgICAgICAgdmFyIHJlc29sdmVyID0gdGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXTtcclxuICAgICAgICB2YXIgY2hyZXMgPSByZXNvbHZlci5yZXNvbHZlKGNoLCBkaSwgc3RyKSB8fCAnJztcclxuICAgICAgICBpZiAoY2hyZXMpIHtcclxuICAgICAgICAgIGNocmVzID0gY29uZm9ybShjaHJlcywgY2gpO1xyXG4gICAgICAgICAgKytjaTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKCFkZWYub3B0aW9uYWwpIGNocmVzID0gdGhpcy5fcGxhY2Vob2xkZXIuY2hhcjtcclxuICAgICAgICAgIGhvbGxvd3MucHVzaChkaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0ciArPSBwbGFjZWhvbGRlckJ1ZmZlciArIGNocmVzO1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyID0gJyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgKz0gZGVmLmNoYXI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3N0ciwgaG9sbG93cywgb3ZlcmZsb3ddO1xyXG4gIH1cclxuXHJcbiAgX2V4dHJhY3RJbnB1dCAoc3RyLCBmcm9tUG9zPTApIHtcclxuICAgIHZhciBpbnB1dCA9ICcnO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoZnJvbVBvcyk7IGNpPHN0ci5sZW5ndGggJiYgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmICF0aGlzLl9pc0hvbGxvdyhkaSkpIGlucHV0ICs9IGNoO1xyXG4gICAgICArK2NpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlucHV0O1xyXG4gIH1cclxuXHJcbiAgX2lzSG9sbG93IChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkZWZJbmRleCkgPj0gMDtcclxuICB9XHJcblxyXG4gIF9pc0hpZGRlbkhvbGxvdyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9pc0hvbGxvdyhkZWZJbmRleCkgJiZcclxuICAgICAgdGhpcy5fY2hhckRlZnNbZGVmSW5kZXhdICYmIHRoaXMuX2NoYXJEZWZzW2RlZkluZGV4XS5vcHRpb25hbDtcclxuICB9XHJcblxyXG4gIF9ob2xsb3dzQmVmb3JlIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGRlZkluZGV4ICYmIHRoaXMuX2lzSGlkZGVuSG9sbG93KGgpKTtcclxuICB9XHJcblxyXG4gIF9tYXBEZWZJbmRleFRvUG9zIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIGRlZkluZGV4IC0gdGhpcy5faG9sbG93c0JlZm9yZShkZWZJbmRleCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX21hcFBvc1RvRGVmSW5kZXggKHBvcykge1xyXG4gICAgdmFyIGxhc3RIb2xsb3dJbmRleCA9IHBvcztcclxuICAgIC8vIGV4dGVuZCBjb250aWd1b3VzXHJcbiAgICB3aGlsZSAodGhpcy5faXNIaWRkZW5Ib2xsb3cobGFzdEhvbGxvd0luZGV4LTEpKSArK2xhc3RIb2xsb3dJbmRleDtcclxuXHJcbiAgICByZXR1cm4gcG9zICsgdGhpcy5faG9sbG93c0JlZm9yZShsYXN0SG9sbG93SW5kZXgpLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIF9nZW5lcmF0ZUluc2VydFN0ZXBzIChoZWFkLCBpbnNlcnRlZCkge1xyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW1tyZXMsIGhvbGxvd3Muc2xpY2UoKV1dO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoaGVhZC5sZW5ndGgpOyBjaTxpbnNlcnRlZC5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIHZhciBjaCA9IGluc2VydGVkW2NpXTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIHZhciBjaHJlcyA9IHJlc29sdmVyLnJlc29sdmUoY2gsIGNpLCByZXMpIHx8ICcnO1xyXG4gICAgICAgIC8vIGlmIG9rIC0gbmV4dCBkaVxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgcmVzICs9IHBsYWNlaG9sZGVyQnVmZmVyICsgY29uZm9ybShjaHJlcywgY2gpOyBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgaW5zZXJ0U3RlcHMucHVzaChbcmVzLCBob2xsb3dzLnNsaWNlKCldKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRlZi5vcHRpb25hbCkge1xyXG4gICAgICAgICAgaWYgKGhvbGxvd3MuaW5kZXhPZihkaSkgPCAwKSBob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2hyZXMgfHwgZGVmLm9wdGlvbmFsKSArK2RpO1xyXG4gICAgICAgIGlmIChjaHJlcyB8fCAhZGVmLm9wdGlvbmFsKSArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG5cclxuICAgICAgICBpZiAoY2ggPT09IGRlZi5jaGFyKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaW5zZXJ0U3RlcHM7XHJcbiAgfVxyXG5cclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHtcclxuICAgIHZhciBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICAgIHZhciBvbGRTZWxlY3Rpb24gPSBkZXRhaWxzLm9sZFNlbGVjdGlvbjtcclxuICAgIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcbiAgICB2YXIgc3RhcnRDaGFuZ2VQb3MgPSBNYXRoLm1pbihjdXJzb3JQb3MsIG9sZFNlbGVjdGlvbi5zdGFydCk7XHJcbiAgICAvLyBNYXRoLm1heCBmb3Igb3Bwb3NpdGUgb3BlcmF0aW9uXHJcbiAgICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgICAgLy8gZm9yIERlbGV0ZVxyXG4gICAgICBvbGRWYWx1ZS5sZW5ndGggLSBzdHIubGVuZ3RoLCAwKTtcclxuICAgIHZhciBpbnNlcnRlZENvdW50ID0gY3Vyc29yUG9zIC0gc3RhcnRDaGFuZ2VQb3M7XHJcblxyXG5cclxuICAgIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyk7XHJcbiAgICB2YXIgdGFpbCA9IHN0ci5zdWJzdHJpbmcoc3RhcnRDaGFuZ2VQb3MgKyBpbnNlcnRlZENvdW50KTtcclxuICAgIHZhciBpbnNlcnRlZCA9IHN0ci5zdWJzdHIoc3RhcnRDaGFuZ2VQb3MsIGluc2VydGVkQ291bnQpO1xyXG5cclxuICAgIHZhciB0YWlsSW5wdXQgPSB0aGlzLl9leHRyYWN0SW5wdXQodGFpbCwgc3RhcnRDaGFuZ2VQb3MgKyByZW1vdmVkQ291bnQpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBob2xsb3dzIGFmdGVyIGN1cnNvclxyXG4gICAgdmFyIGxhc3RIb2xsb3dJbmRleCA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgoc3RhcnRDaGFuZ2VQb3MpO1xyXG4gICAgdGhpcy5faG9sbG93cyA9IHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGxhc3RIb2xsb3dJbmRleCk7XHJcblxyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcblxyXG4gICAgLy8gaW5zZXJ0IGF2YWlsYWJsZVxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gdGhpcy5fZ2VuZXJhdGVJbnNlcnRTdGVwcyhoZWFkLCBpbnNlcnRlZCk7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcDtcclxuICAgICAgW3N0ZXAsIHRoaXMuX2hvbGxvd3NdID0gaW5zZXJ0U3RlcHNbaXN0ZXBdO1xyXG4gICAgICB2YXIgW3RyZXMsIHRob2xsb3dzLCBvdmVyZmxvd10gPSB0aGlzLl9hcHBlbmRUYWlsKHN0ZXAsIHRhaWxJbnB1dCk7XHJcbiAgICAgIGlmICghb3ZlcmZsb3cpIHtcclxuICAgICAgICBbcmVzLCB0aGlzLl9ob2xsb3dzXSA9IFt0cmVzLCB0aG9sbG93c107XHJcbiAgICAgICAgY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBpbnB1dCBhdCB0aGUgZW5kIC0gYXBwZW5kIGZpeGVkXHJcbiAgICBpZiAoaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIGFwcGVuZCBmaXhlZCBhdCBlbmRcclxuICAgICAgdmFyIGFwcGVuZGVkID0gdGhpcy5fYXBwZW5kRml4ZWRFbmQocmVzKTtcclxuICAgICAgY3Vyc29yUG9zICs9IGFwcGVuZGVkLmxlbmd0aCAtIHJlcy5sZW5ndGg7XHJcbiAgICAgIHJlcyA9IGFwcGVuZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSBoZWFkIGZpeGVkIGFuZCBob2xsb3dzIGlmIHJlbW92ZWQgYXQgZW5kXHJcbiAgICBpZiAoIWluc2VydGVkICYmIGN1cnNvclBvcyA9PT0gcmVzLmxlbmd0aCkge1xyXG4gICAgICB2YXIgZGkgPSB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KGN1cnNvclBvcy0xKTtcclxuICAgICAgdmFyIGhhc0hvbGxvd3MgPSBmYWxzZTtcclxuICAgICAgZm9yICg7IGRpID4gMDsgLS1kaSkge1xyXG4gICAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9pc0hvbGxvdyhkaSkpIGhhc0hvbGxvd3MgPSB0cnVlO1xyXG4gICAgICAgICAgZWxzZSBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGhhc0hvbGxvd3MpIHJlcyA9IHJlcy5zbGljZSgwLCBkaSArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFwcGVuZCBwbGFjZWhvbGRlclxyXG4gICAgcmVzID0gdGhpcy5fYXBwZW5kUGxhY2Vob2xkZXJFbmQocmVzKTtcclxuICAgIGRldGFpbHMuY3Vyc29yUG9zID0gY3Vyc29yUG9zO1xyXG5cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBfZmlyZUNoYW5nZUV2ZW50cyAoKSB7XHJcbiAgICAvLyBmaXJlICdjb21wbGV0ZScgYWZ0ZXIgJ2FjY2VwdCcgZXZlbnRcclxuICAgIHN1cGVyLl9maXJlQ2hhbmdlRXZlbnRzKCk7XHJcbiAgICBpZiAodGhpcy5faXNDaGFuZ2VkICYmIHRoaXMuaXNDb21wbGV0ZSkgdGhpcy5maXJlRXZlbnQoXCJjb21wbGV0ZVwiKTtcclxuICB9XHJcblxyXG4gIGdldCBpc0NvbXBsZXRlICgpIHtcclxuICAgIHJldHVybiAhdGhpcy5fY2hhckRlZnMuZmlsdGVyKChkZWYsIGRpKSA9PlxyXG4gICAgICBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmICFkZWYub3B0aW9uYWwgJiZcclxuICAgICAgdGhpcy5faXNIb2xsb3coZGkpKS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICBfYXBwZW5kRml4ZWRFbmQgKHJlcykge1xyXG4gICAgZm9yICh2YXIgZGk9dGhpcy5fbWFwUG9zVG9EZWZJbmRleChyZXMubGVuZ3RoKTs7ICsrZGkpIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgaWYgKCFkZWYpIGJyZWFrO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGRpKSkgY29udGludWU7XHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUKSBicmVhaztcclxuICAgICAgaWYgKGRpID49IHJlcy5sZW5ndGgpIHJlcyArPSBkZWYuY2hhcjtcclxuICAgIH1cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBfYXBwZW5kUGxhY2Vob2xkZXJFbmQgKHJlcykge1xyXG4gICAgZm9yICh2YXIgZGk9dGhpcy5fbWFwUG9zVG9EZWZJbmRleChyZXMubGVuZ3RoKTsgZGk8dGhpcy5fY2hhckRlZnMubGVuZ3RoOyArK2RpKSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmICF0aGlzLl9pc0hvbGxvdyhkaSkpIHtcclxuICAgICAgICB0aGlzLl9ob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLl9wbGFjZWhvbGRlci5zaG93ID09PSAnYWx3YXlzJykge1xyXG4gICAgICAgIHJlcyArPSBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEID9cclxuICAgICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAgICFkZWYub3B0aW9uYWwgP1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZWhvbGRlci5jaGFyIDpcclxuICAgICAgICAgICAgJyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICB2YXIgc3RyID0gdGhpcy5yYXdWYWx1ZTtcclxuICAgIHZhciB1bm1hc2tlZCA9ICcnO1xyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9MDsgY2k8c3RyLmxlbmd0aCAmJiBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaWYgKGRlZi51bm1hc2tpbmcgJiYgIXRoaXMuX2lzSG9sbG93KGRpKSAmJlxyXG4gICAgICAgIChkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIHRoaXMuX3Jlc29sdmVyc1tkZWYuY2hhcl0ucmVzb2x2ZShjaCwgY2ksIHN0cikgfHxcclxuICAgICAgICAgIGRlZi5jaGFyID09PSBjaCkpIHtcclxuICAgICAgICB1bm1hc2tlZCArPSBjaDtcclxuICAgICAgfVxyXG4gICAgICArK2NpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVubWFza2VkO1xyXG4gIH1cclxuXHJcbiAgc2V0IHVubWFza2VkVmFsdWUgKHN0cikge1xyXG4gICAgdGhpcy5faG9sbG93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIHJlcztcclxuICAgIFtyZXMsIHRoaXMuX2hvbGxvd3NdID0gdGhpcy5fYXBwZW5kVGFpbCgnJywgc3RyKTtcclxuICAgIHRoaXMuZWwudmFsdWUgPSB0aGlzLl9hcHBlbmRQbGFjZWhvbGRlckVuZChyZXMpO1xyXG5cclxuICAgIHRoaXMuX29uQ2hhbmdlU3RhdGUoKTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlciAoKSB7IHJldHVybiB0aGlzLl9wbGFjZWhvbGRlcjsgfVxyXG5cclxuICBzZXQgcGxhY2Vob2xkZXIgKHBoKSB7XHJcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUixcclxuICAgICAgLi4ucGhcclxuICAgIH07XHJcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHRoaXMudW5tYXNrZWRWYWx1ZSA9IHRoaXMudW5tYXNrZWRWYWx1ZTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlckxhYmVsICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGFyRGVmcy5tYXAoZGVmID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgJycpLmpvaW4oJycpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRlZmluaXRpb25zICgpIHsgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zOyB9XHJcblxyXG4gIHNldCBkZWZpbml0aW9ucyAoZGVmcykge1xyXG4gICAgdGhpcy5faW5zdGFsbERlZmluaXRpb25zKGRlZnMpO1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB0aGlzLnVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXQgbWFzayAoKSB7IHJldHVybiB0aGlzLl9tYXNrOyB9XHJcblxyXG4gIHNldCBtYXNrIChtYXNrKSB7XHJcbiAgICB0aGlzLl9tYXNrID0gbWFzaztcclxuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgdGhpcy5kZWZpbml0aW9ucyA9IHRoaXMuZGVmaW5pdGlvbnM7XHJcbiAgfVxyXG5cclxuICBfYWxpZ25DdXJzb3IgKCkge1xyXG4gICAgdmFyIGN1cnNvckRlZkluZGV4ID0gdGhpcy5fbWFwUG9zVG9EZWZJbmRleCh0aGlzLmN1cnNvclBvcyk7XHJcbiAgICBmb3IgKHZhciByUG9zID0gY3Vyc29yRGVmSW5kZXg7IHJQb3MgPj0gMDsgLS1yUG9zKSB7XHJcbiAgICAgIHZhciByRGVmID0gdGhpcy5fY2hhckRlZnNbclBvc107XHJcbiAgICAgIHZhciBsUG9zID0gclBvcy0xO1xyXG4gICAgICB2YXIgbERlZiA9IHRoaXMuX2NoYXJEZWZzW2xQb3NdO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3cobFBvcykpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaWYgKCghckRlZiB8fCByRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9pc0hvbGxvdyhyUG9zKSAmJiAhdGhpcy5faXNIaWRkZW5Ib2xsb3coclBvcykpICYmXHJcbiAgICAgICAgIXRoaXMuX2lzSG9sbG93KGxQb3MpKSB7XHJcbiAgICAgICAgY3Vyc29yRGVmSW5kZXggPSByUG9zO1xyXG4gICAgICAgIGlmICghbERlZiB8fCBsRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY3Vyc29yUG9zID0gdGhpcy5fbWFwRGVmSW5kZXhUb1BvcyhjdXJzb3JEZWZJbmRleCk7XHJcbiAgfVxyXG59XHJcblBhdHRlcm5NYXNrLkRFRklOSVRJT05TID0ge1xyXG4gICcwJzogL1xcZC8sXHJcbiAgJ2EnOiAvW1xcdTAwNDEtXFx1MDA1QVxcdTAwNjEtXFx1MDA3QVxcdTAwQUFcXHUwMEI1XFx1MDBCQVxcdTAwQzAtXFx1MDBENlxcdTAwRDgtXFx1MDBGNlxcdTAwRjgtXFx1MDJDMVxcdTAyQzYtXFx1MDJEMVxcdTAyRTAtXFx1MDJFNFxcdTAyRUNcXHUwMkVFXFx1MDM3MC1cXHUwMzc0XFx1MDM3NlxcdTAzNzdcXHUwMzdBLVxcdTAzN0RcXHUwMzg2XFx1MDM4OC1cXHUwMzhBXFx1MDM4Q1xcdTAzOEUtXFx1MDNBMVxcdTAzQTMtXFx1MDNGNVxcdTAzRjctXFx1MDQ4MVxcdTA0OEEtXFx1MDUyN1xcdTA1MzEtXFx1MDU1NlxcdTA1NTlcXHUwNTYxLVxcdTA1ODdcXHUwNUQwLVxcdTA1RUFcXHUwNUYwLVxcdTA1RjJcXHUwNjIwLVxcdTA2NEFcXHUwNjZFXFx1MDY2RlxcdTA2NzEtXFx1MDZEM1xcdTA2RDVcXHUwNkU1XFx1MDZFNlxcdTA2RUVcXHUwNkVGXFx1MDZGQS1cXHUwNkZDXFx1MDZGRlxcdTA3MTBcXHUwNzEyLVxcdTA3MkZcXHUwNzRELVxcdTA3QTVcXHUwN0IxXFx1MDdDQS1cXHUwN0VBXFx1MDdGNFxcdTA3RjVcXHUwN0ZBXFx1MDgwMC1cXHUwODE1XFx1MDgxQVxcdTA4MjRcXHUwODI4XFx1MDg0MC1cXHUwODU4XFx1MDhBMFxcdTA4QTItXFx1MDhBQ1xcdTA5MDQtXFx1MDkzOVxcdTA5M0RcXHUwOTUwXFx1MDk1OC1cXHUwOTYxXFx1MDk3MS1cXHUwOTc3XFx1MDk3OS1cXHUwOTdGXFx1MDk4NS1cXHUwOThDXFx1MDk4RlxcdTA5OTBcXHUwOTkzLVxcdTA5QThcXHUwOUFBLVxcdTA5QjBcXHUwOUIyXFx1MDlCNi1cXHUwOUI5XFx1MDlCRFxcdTA5Q0VcXHUwOURDXFx1MDlERFxcdTA5REYtXFx1MDlFMVxcdTA5RjBcXHUwOUYxXFx1MEEwNS1cXHUwQTBBXFx1MEEwRlxcdTBBMTBcXHUwQTEzLVxcdTBBMjhcXHUwQTJBLVxcdTBBMzBcXHUwQTMyXFx1MEEzM1xcdTBBMzVcXHUwQTM2XFx1MEEzOFxcdTBBMzlcXHUwQTU5LVxcdTBBNUNcXHUwQTVFXFx1MEE3Mi1cXHUwQTc0XFx1MEE4NS1cXHUwQThEXFx1MEE4Ri1cXHUwQTkxXFx1MEE5My1cXHUwQUE4XFx1MEFBQS1cXHUwQUIwXFx1MEFCMlxcdTBBQjNcXHUwQUI1LVxcdTBBQjlcXHUwQUJEXFx1MEFEMFxcdTBBRTBcXHUwQUUxXFx1MEIwNS1cXHUwQjBDXFx1MEIwRlxcdTBCMTBcXHUwQjEzLVxcdTBCMjhcXHUwQjJBLVxcdTBCMzBcXHUwQjMyXFx1MEIzM1xcdTBCMzUtXFx1MEIzOVxcdTBCM0RcXHUwQjVDXFx1MEI1RFxcdTBCNUYtXFx1MEI2MVxcdTBCNzFcXHUwQjgzXFx1MEI4NS1cXHUwQjhBXFx1MEI4RS1cXHUwQjkwXFx1MEI5Mi1cXHUwQjk1XFx1MEI5OVxcdTBCOUFcXHUwQjlDXFx1MEI5RVxcdTBCOUZcXHUwQkEzXFx1MEJBNFxcdTBCQTgtXFx1MEJBQVxcdTBCQUUtXFx1MEJCOVxcdTBCRDBcXHUwQzA1LVxcdTBDMENcXHUwQzBFLVxcdTBDMTBcXHUwQzEyLVxcdTBDMjhcXHUwQzJBLVxcdTBDMzNcXHUwQzM1LVxcdTBDMzlcXHUwQzNEXFx1MEM1OFxcdTBDNTlcXHUwQzYwXFx1MEM2MVxcdTBDODUtXFx1MEM4Q1xcdTBDOEUtXFx1MEM5MFxcdTBDOTItXFx1MENBOFxcdTBDQUEtXFx1MENCM1xcdTBDQjUtXFx1MENCOVxcdTBDQkRcXHUwQ0RFXFx1MENFMFxcdTBDRTFcXHUwQ0YxXFx1MENGMlxcdTBEMDUtXFx1MEQwQ1xcdTBEMEUtXFx1MEQxMFxcdTBEMTItXFx1MEQzQVxcdTBEM0RcXHUwRDRFXFx1MEQ2MFxcdTBENjFcXHUwRDdBLVxcdTBEN0ZcXHUwRDg1LVxcdTBEOTZcXHUwRDlBLVxcdTBEQjFcXHUwREIzLVxcdTBEQkJcXHUwREJEXFx1MERDMC1cXHUwREM2XFx1MEUwMS1cXHUwRTMwXFx1MEUzMlxcdTBFMzNcXHUwRTQwLVxcdTBFNDZcXHUwRTgxXFx1MEU4MlxcdTBFODRcXHUwRTg3XFx1MEU4OFxcdTBFOEFcXHUwRThEXFx1MEU5NC1cXHUwRTk3XFx1MEU5OS1cXHUwRTlGXFx1MEVBMS1cXHUwRUEzXFx1MEVBNVxcdTBFQTdcXHUwRUFBXFx1MEVBQlxcdTBFQUQtXFx1MEVCMFxcdTBFQjJcXHUwRUIzXFx1MEVCRFxcdTBFQzAtXFx1MEVDNFxcdTBFQzZcXHUwRURDLVxcdTBFREZcXHUwRjAwXFx1MEY0MC1cXHUwRjQ3XFx1MEY0OS1cXHUwRjZDXFx1MEY4OC1cXHUwRjhDXFx1MTAwMC1cXHUxMDJBXFx1MTAzRlxcdTEwNTAtXFx1MTA1NVxcdTEwNUEtXFx1MTA1RFxcdTEwNjFcXHUxMDY1XFx1MTA2NlxcdTEwNkUtXFx1MTA3MFxcdTEwNzUtXFx1MTA4MVxcdTEwOEVcXHUxMEEwLVxcdTEwQzVcXHUxMEM3XFx1MTBDRFxcdTEwRDAtXFx1MTBGQVxcdTEwRkMtXFx1MTI0OFxcdTEyNEEtXFx1MTI0RFxcdTEyNTAtXFx1MTI1NlxcdTEyNThcXHUxMjVBLVxcdTEyNURcXHUxMjYwLVxcdTEyODhcXHUxMjhBLVxcdTEyOERcXHUxMjkwLVxcdTEyQjBcXHUxMkIyLVxcdTEyQjVcXHUxMkI4LVxcdTEyQkVcXHUxMkMwXFx1MTJDMi1cXHUxMkM1XFx1MTJDOC1cXHUxMkQ2XFx1MTJEOC1cXHUxMzEwXFx1MTMxMi1cXHUxMzE1XFx1MTMxOC1cXHUxMzVBXFx1MTM4MC1cXHUxMzhGXFx1MTNBMC1cXHUxM0Y0XFx1MTQwMS1cXHUxNjZDXFx1MTY2Ri1cXHUxNjdGXFx1MTY4MS1cXHUxNjlBXFx1MTZBMC1cXHUxNkVBXFx1MTcwMC1cXHUxNzBDXFx1MTcwRS1cXHUxNzExXFx1MTcyMC1cXHUxNzMxXFx1MTc0MC1cXHUxNzUxXFx1MTc2MC1cXHUxNzZDXFx1MTc2RS1cXHUxNzcwXFx1MTc4MC1cXHUxN0IzXFx1MTdEN1xcdTE3RENcXHUxODIwLVxcdTE4NzdcXHUxODgwLVxcdTE4QThcXHUxOEFBXFx1MThCMC1cXHUxOEY1XFx1MTkwMC1cXHUxOTFDXFx1MTk1MC1cXHUxOTZEXFx1MTk3MC1cXHUxOTc0XFx1MTk4MC1cXHUxOUFCXFx1MTlDMS1cXHUxOUM3XFx1MUEwMC1cXHUxQTE2XFx1MUEyMC1cXHUxQTU0XFx1MUFBN1xcdTFCMDUtXFx1MUIzM1xcdTFCNDUtXFx1MUI0QlxcdTFCODMtXFx1MUJBMFxcdTFCQUVcXHUxQkFGXFx1MUJCQS1cXHUxQkU1XFx1MUMwMC1cXHUxQzIzXFx1MUM0RC1cXHUxQzRGXFx1MUM1QS1cXHUxQzdEXFx1MUNFOS1cXHUxQ0VDXFx1MUNFRS1cXHUxQ0YxXFx1MUNGNVxcdTFDRjZcXHUxRDAwLVxcdTFEQkZcXHUxRTAwLVxcdTFGMTVcXHUxRjE4LVxcdTFGMURcXHUxRjIwLVxcdTFGNDVcXHUxRjQ4LVxcdTFGNERcXHUxRjUwLVxcdTFGNTdcXHUxRjU5XFx1MUY1QlxcdTFGNURcXHUxRjVGLVxcdTFGN0RcXHUxRjgwLVxcdTFGQjRcXHUxRkI2LVxcdTFGQkNcXHUxRkJFXFx1MUZDMi1cXHUxRkM0XFx1MUZDNi1cXHUxRkNDXFx1MUZEMC1cXHUxRkQzXFx1MUZENi1cXHUxRkRCXFx1MUZFMC1cXHUxRkVDXFx1MUZGMi1cXHUxRkY0XFx1MUZGNi1cXHUxRkZDXFx1MjA3MVxcdTIwN0ZcXHUyMDkwLVxcdTIwOUNcXHUyMTAyXFx1MjEwN1xcdTIxMEEtXFx1MjExM1xcdTIxMTVcXHUyMTE5LVxcdTIxMURcXHUyMTI0XFx1MjEyNlxcdTIxMjhcXHUyMTJBLVxcdTIxMkRcXHUyMTJGLVxcdTIxMzlcXHUyMTNDLVxcdTIxM0ZcXHUyMTQ1LVxcdTIxNDlcXHUyMTRFXFx1MjE4M1xcdTIxODRcXHUyQzAwLVxcdTJDMkVcXHUyQzMwLVxcdTJDNUVcXHUyQzYwLVxcdTJDRTRcXHUyQ0VCLVxcdTJDRUVcXHUyQ0YyXFx1MkNGM1xcdTJEMDAtXFx1MkQyNVxcdTJEMjdcXHUyRDJEXFx1MkQzMC1cXHUyRDY3XFx1MkQ2RlxcdTJEODAtXFx1MkQ5NlxcdTJEQTAtXFx1MkRBNlxcdTJEQTgtXFx1MkRBRVxcdTJEQjAtXFx1MkRCNlxcdTJEQjgtXFx1MkRCRVxcdTJEQzAtXFx1MkRDNlxcdTJEQzgtXFx1MkRDRVxcdTJERDAtXFx1MkRENlxcdTJERDgtXFx1MkRERVxcdTJFMkZcXHUzMDA1XFx1MzAwNlxcdTMwMzEtXFx1MzAzNVxcdTMwM0JcXHUzMDNDXFx1MzA0MS1cXHUzMDk2XFx1MzA5RC1cXHUzMDlGXFx1MzBBMS1cXHUzMEZBXFx1MzBGQy1cXHUzMEZGXFx1MzEwNS1cXHUzMTJEXFx1MzEzMS1cXHUzMThFXFx1MzFBMC1cXHUzMUJBXFx1MzFGMC1cXHUzMUZGXFx1MzQwMC1cXHU0REI1XFx1NEUwMC1cXHU5RkNDXFx1QTAwMC1cXHVBNDhDXFx1QTREMC1cXHVBNEZEXFx1QTUwMC1cXHVBNjBDXFx1QTYxMC1cXHVBNjFGXFx1QTYyQVxcdUE2MkJcXHVBNjQwLVxcdUE2NkVcXHVBNjdGLVxcdUE2OTdcXHVBNkEwLVxcdUE2RTVcXHVBNzE3LVxcdUE3MUZcXHVBNzIyLVxcdUE3ODhcXHVBNzhCLVxcdUE3OEVcXHVBNzkwLVxcdUE3OTNcXHVBN0EwLVxcdUE3QUFcXHVBN0Y4LVxcdUE4MDFcXHVBODAzLVxcdUE4MDVcXHVBODA3LVxcdUE4MEFcXHVBODBDLVxcdUE4MjJcXHVBODQwLVxcdUE4NzNcXHVBODgyLVxcdUE4QjNcXHVBOEYyLVxcdUE4RjdcXHVBOEZCXFx1QTkwQS1cXHVBOTI1XFx1QTkzMC1cXHVBOTQ2XFx1QTk2MC1cXHVBOTdDXFx1QTk4NC1cXHVBOUIyXFx1QTlDRlxcdUFBMDAtXFx1QUEyOFxcdUFBNDAtXFx1QUE0MlxcdUFBNDQtXFx1QUE0QlxcdUFBNjAtXFx1QUE3NlxcdUFBN0FcXHVBQTgwLVxcdUFBQUZcXHVBQUIxXFx1QUFCNVxcdUFBQjZcXHVBQUI5LVxcdUFBQkRcXHVBQUMwXFx1QUFDMlxcdUFBREItXFx1QUFERFxcdUFBRTAtXFx1QUFFQVxcdUFBRjItXFx1QUFGNFxcdUFCMDEtXFx1QUIwNlxcdUFCMDktXFx1QUIwRVxcdUFCMTEtXFx1QUIxNlxcdUFCMjAtXFx1QUIyNlxcdUFCMjgtXFx1QUIyRVxcdUFCQzAtXFx1QUJFMlxcdUFDMDAtXFx1RDdBM1xcdUQ3QjAtXFx1RDdDNlxcdUQ3Q0ItXFx1RDdGQlxcdUY5MDAtXFx1RkE2RFxcdUZBNzAtXFx1RkFEOVxcdUZCMDAtXFx1RkIwNlxcdUZCMTMtXFx1RkIxN1xcdUZCMURcXHVGQjFGLVxcdUZCMjhcXHVGQjJBLVxcdUZCMzZcXHVGQjM4LVxcdUZCM0NcXHVGQjNFXFx1RkI0MFxcdUZCNDFcXHVGQjQzXFx1RkI0NFxcdUZCNDYtXFx1RkJCMVxcdUZCRDMtXFx1RkQzRFxcdUZENTAtXFx1RkQ4RlxcdUZEOTItXFx1RkRDN1xcdUZERjAtXFx1RkRGQlxcdUZFNzAtXFx1RkU3NFxcdUZFNzYtXFx1RkVGQ1xcdUZGMjEtXFx1RkYzQVxcdUZGNDEtXFx1RkY1QVxcdUZGNjYtXFx1RkZCRVxcdUZGQzItXFx1RkZDN1xcdUZGQ0EtXFx1RkZDRlxcdUZGRDItXFx1RkZEN1xcdUZGREEtXFx1RkZEQ10vLCAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjIwNzUwNzBcclxuICAnKic6IC8uL1xyXG59O1xyXG5QYXR0ZXJuTWFzay5ERUZfVFlQRVMgPSB7XHJcbiAgSU5QVVQ6ICdpbnB1dCcsXHJcbiAgRklYRUQ6ICdmaXhlZCdcclxufVxyXG5QYXR0ZXJuTWFzay5ERUZBVUxUX1BMQUNFSE9MREVSID0ge1xyXG4gIHNob3c6ICdsYXp5JyxcclxuICBjaGFyOiAnXydcclxufTtcclxuIiwiaW1wb3J0IHtpc1N0cmluZ30gZnJvbSAnLi91dGlscyc7XHJcblxyXG5pbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9tYXNrcy9iYXNlJztcclxuaW1wb3J0IFJlZ0V4cE1hc2sgZnJvbSAnLi9tYXNrcy9yZWdleHAnO1xyXG5pbXBvcnQgRnVuY01hc2sgZnJvbSAnLi9tYXNrcy9mdW5jJztcclxuaW1wb3J0IFBhdHRlcm5NYXNrIGZyb20gJy4vbWFza3MvcGF0dGVybic7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuZnVuY3Rpb24gSU1hc2sgKGVsLCBvcHRzPXt9KSB7XHJcbiAgdmFyIG1hc2sgPSBJTWFzay5NYXNrRmFjdG9yeShlbCwgb3B0cyk7XHJcbiAgbWFzay5iaW5kRXZlbnRzKCk7XHJcbiAgLy8gcmVmcmVzaFxyXG4gIG1hc2sucmF3VmFsdWUgPSBlbC52YWx1ZTtcclxuICByZXR1cm4gbWFzaztcclxufVxyXG5cclxuSU1hc2suTWFza0ZhY3RvcnkgPSBmdW5jdGlvbiAoZWwsIG9wdHMpIHtcclxuICB2YXIgbWFzayA9IG9wdHMubWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEJhc2VNYXNrKSByZXR1cm4gbWFzaztcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIG5ldyBSZWdFeHBNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAobWFzayBpbnN0YW5jZW9mIEZ1bmN0aW9uKSByZXR1cm4gbmV3IEZ1bmNNYXNrKGVsLCBvcHRzKTtcclxuICBpZiAoaXNTdHJpbmcobWFzaykpIHJldHVybiBuZXcgUGF0dGVybk1hc2soZWwsIG9wdHMpO1xyXG4gIHJldHVybiBuZXcgQmFzZU1hc2soZWwsIG9wdHMpO1xyXG59XHJcbklNYXNrLkJhc2VNYXNrID0gQmFzZU1hc2s7XHJcbklNYXNrLkZ1bmNNYXNrID0gRnVuY01hc2s7XHJcbklNYXNrLlJlZ0V4cE1hc2sgPSBSZWdFeHBNYXNrO1xyXG5JTWFzay5QYXR0ZXJuTWFzayA9IFBhdHRlcm5NYXNrO1xyXG53aW5kb3cuSU1hc2sgPSBJTWFzaztcclxuIl0sIm5hbWVzIjpbImlzU3RyaW5nIiwic3RyIiwiU3RyaW5nIiwiY29uZm9ybSIsInJlcyIsImZhbGxiYWNrIiwiQmFzZU1hc2siLCJlbCIsIm9wdHMiLCJtYXNrIiwiX2xpc3RlbmVycyIsIl9yZWZyZXNoaW5nQ291bnQiLCJzYXZlU3RhdGUiLCJiaW5kIiwicHJvY2Vzc0lucHV0IiwiX29uRHJvcCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidW5iaW5kRXZlbnRzIiwibGVuZ3RoIiwiZXYiLCJfb2xkUmF3VmFsdWUiLCJyYXdWYWx1ZSIsIl9vbGRVbm1hc2tlZFZhbHVlIiwidW5tYXNrZWRWYWx1ZSIsIl9vbGRTZWxlY3Rpb24iLCJzZWxlY3Rpb25TdGFydCIsImN1cnNvclBvcyIsImRldGFpbHMiLCJfY3Vyc29yQ2hhbmdpbmciLCJlbmQiLCJpbnB1dFZhbHVlIiwicmVzb2x2ZSIsInZhbHVlIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsIl9vbkNoYW5nZVN0YXRlIiwiX2ZpcmVDaGFuZ2VFdmVudHMiLCJfaXNDaGFuZ2VkIiwiZmlyZUV2ZW50IiwiX2NoYW5nZVN0YXRlIiwiaGFuZGxlciIsInB1c2giLCJoSW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwibGlzdGVuZXJzIiwiZm9yRWFjaCIsImwiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInNlbGVjdGlvbkVuZCIsInBvcyIsInNldFNlbGVjdGlvblJhbmdlIiwiUmVnRXhwTWFzayIsInRlc3QiLCJGdW5jTWFzayIsIlBhdHRlcm5NYXNrIiwiX2hvbGxvd3MiLCJwbGFjZWhvbGRlciIsImRlZmluaXRpb25zIiwiREVGSU5JVElPTlMiLCJfYWxpZ25DdXJzb3IiLCJfYWxpZ25DdXJzb3JGcmllbmRseSIsIl9pbml0aWFsaXplZCIsIl9kZWZpbml0aW9ucyIsIl9jaGFyRGVmcyIsInBhdHRlcm4iLCJ1bm1hc2tpbmdCbG9jayIsIm9wdGlvbmFsQmxvY2siLCJpIiwiY2giLCJ0eXBlIiwiREVGX1RZUEVTIiwiSU5QVVQiLCJGSVhFRCIsInVubWFza2luZyIsIm9wdGlvbmFsIiwiX2J1aWxkUmVzb2x2ZXJzIiwiX3Jlc29sdmVycyIsImRlZktleSIsIklNYXNrIiwiTWFza0ZhY3RvcnkiLCJ0YWlsIiwicGxhY2Vob2xkZXJCdWZmZXIiLCJob2xsb3dzIiwic2xpY2UiLCJvdmVyZmxvdyIsImNpIiwiZGkiLCJfbWFwUG9zVG9EZWZJbmRleCIsImRlZiIsInJlc29sdmVyIiwiY2hhciIsImNocmVzIiwiX3BsYWNlaG9sZGVyIiwiZnJvbVBvcyIsImlucHV0IiwiX2lzSGlkZGVuSG9sbG93IiwiX2lzSG9sbG93IiwiZGVmSW5kZXgiLCJmaWx0ZXIiLCJoIiwiX2hvbGxvd3NCZWZvcmUiLCJsYXN0SG9sbG93SW5kZXgiLCJoZWFkIiwiaW5zZXJ0ZWQiLCJpbnNlcnRTdGVwcyIsIm9sZFNlbGVjdGlvbiIsIm9sZFZhbHVlIiwic3RhcnRDaGFuZ2VQb3MiLCJNYXRoIiwibWluIiwic3RhcnQiLCJyZW1vdmVkQ291bnQiLCJtYXgiLCJpbnNlcnRlZENvdW50Iiwic3Vic3RyaW5nIiwic3Vic3RyIiwidGFpbElucHV0IiwiX2V4dHJhY3RJbnB1dCIsIl9nZW5lcmF0ZUluc2VydFN0ZXBzIiwiaXN0ZXAiLCJzdGVwIiwiX2FwcGVuZFRhaWwiLCJ0cmVzIiwidGhvbGxvd3MiLCJhcHBlbmRlZCIsIl9hcHBlbmRGaXhlZEVuZCIsImhhc0hvbGxvd3MiLCJfYXBwZW5kUGxhY2Vob2xkZXJFbmQiLCJpc0NvbXBsZXRlIiwic2hvdyIsImN1cnNvckRlZkluZGV4IiwiclBvcyIsInJEZWYiLCJsUG9zIiwibERlZiIsIl9tYXBEZWZJbmRleFRvUG9zIiwidW5tYXNrZWQiLCJwaCIsIkRFRkFVTFRfUExBQ0VIT0xERVIiLCJtYXAiLCJqb2luIiwiZGVmcyIsIl9pbnN0YWxsRGVmaW5pdGlvbnMiLCJfbWFzayIsImJpbmRFdmVudHMiLCJSZWdFeHAiLCJGdW5jdGlvbiIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsU0FBU0EsUUFBVCxDQUFtQkMsR0FBbkIsRUFBd0I7U0FDZixPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsZUFBZUMsTUFBakQ7OztBQUdGLEFBQ0EsU0FBU0MsT0FBVCxDQUFrQkMsR0FBbEIsRUFBdUJILEdBQXZCLEVBQXlDO01BQWJJLFFBQWEsdUVBQUosRUFBSTs7U0FDaENMLFNBQVNJLEdBQVQsSUFDTEEsR0FESyxHQUVMQSxNQUNFSCxHQURGLEdBRUVJLFFBSko7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ0hJQztvQkFDU0MsRUFBYixFQUFpQkMsSUFBakIsRUFBdUI7OztTQUNoQkQsRUFBTCxHQUFVQSxFQUFWO1NBQ0tFLElBQUwsR0FBWUQsS0FBS0MsSUFBakI7O1NBRUtDLFVBQUwsR0FBa0IsRUFBbEI7U0FDS0MsZ0JBQUwsR0FBd0IsQ0FBeEI7O1NBRUtDLFNBQUwsR0FBaUIsS0FBS0EsU0FBTCxDQUFlQyxJQUFmLENBQW9CLElBQXBCLENBQWpCO1NBQ0tDLFlBQUwsR0FBb0IsS0FBS0EsWUFBTCxDQUFrQkQsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBcEI7U0FDS0UsT0FBTCxHQUFl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