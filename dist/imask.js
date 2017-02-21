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
      this._oldValue = this.el.value;
      this._oldSelection = {
        start: this.el.selectionStart,
        end: this.el.selectionEnd
      };
    }
  }, {
    key: 'processInput',
    value: function processInput(ev) {
      var _this = this;

      var inputValue = this.el.value;

      // use selectionEnd for handle Undo
      var cursorPos = this.el.selectionEnd;
      var details = {
        oldSelection: this._oldSelection,
        cursorPos: cursorPos,
        oldValue: this._oldValue
      };

      var res = inputValue;
      res = conform(this.resolve(res, details), res, this._oldValue);

      if (res !== inputValue) {
        this.el.value = res;
        cursorPos = details.cursorPos;
      }

      // queue change cursor
      setTimeout(function () {
        return _this.el.setSelectionRange(cursorPos, cursorPos);
      }, 0);

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
      // use unmasked value if value was not changed to update with options correctly
      if (this._oldRawValue === this.el.value) this.el.value = this._oldUnmaskedValue;
      delete this._oldRawValue;
      delete this._oldUnmaskedValue;

      var str = this.el.value;
      var details = {
        cursorPos: this.el.value.length,
        startChangePos: 0,
        oldSelection: {
          start: 0,
          end: this.el.value.length
        },
        removedCount: this.el.value.length,
        insertedCount: str.length,
        oldValue: this.el.value
      };
      this.el.value = conform(this.resolve(str, details), this.el.value);
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
      return this.el.value;
    },
    set: function set(value) {
      this.startRefresh();
      this.el.value = value;
      this.endRefresh();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL3V0aWxzLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvbWFza3MvYmFzZS5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL3JlZ2V4cC5qcyIsIkM6L1Byb2plY3RzL2ltYXNranMvc3JjL21hc2tzL2Z1bmMuanMiLCJDOi9Qcm9qZWN0cy9pbWFza2pzL3NyYy9tYXNrcy9wYXR0ZXJuLmpzIiwiQzovUHJvamVjdHMvaW1hc2tqcy9zcmMvaW1hc2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0XHJcbmZ1bmN0aW9uIGlzU3RyaW5nIChzdHIpIHtcclxuICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgfHwgc3RyIGluc3RhbmNlb2YgU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnRcclxuZnVuY3Rpb24gY29uZm9ybSAocmVzLCBzdHIsIGZhbGxiYWNrPScnKSB7XHJcbiAgcmV0dXJuIGlzU3RyaW5nKHJlcykgP1xyXG4gICAgcmVzIDpcclxuICAgIHJlcyA/XHJcbiAgICAgIHN0ciA6XHJcbiAgICAgIGZhbGxiYWNrO1xyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5cclxuLy8gVE9ET1xyXG4vLyAtIGVtcHR5IHBsYWNlaG9sZGVyXHJcbi8vIC0gdmFsaWRhdGVPbmx5XHJcbi8vIC0gYWRkIGNvbW1lbnRzXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgQmFzZU1hc2sge1xyXG4gIGNvbnN0cnVjdG9yIChlbCwgb3B0cykge1xyXG4gICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgdGhpcy5tYXNrID0gb3B0cy5tYXNrO1xyXG5cclxuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xyXG4gICAgdGhpcy5fcmVmcmVzaGluZ0NvdW50ID0gMDtcclxuXHJcbiAgICB0aGlzLnNhdmVTdGF0ZSA9IHRoaXMuc2F2ZVN0YXRlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLnByb2Nlc3NJbnB1dCA9IHRoaXMucHJvY2Vzc0lucHV0LmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLl9vbkRyb3AgPSB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zYXZlU3RhdGUpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMucHJvY2Vzc0lucHV0KTtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcCk7XHJcbiAgfVxyXG5cclxuICB1bmJpbmRFdmVudHMgKCkge1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zYXZlU3RhdGUpO1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMucHJvY2Vzc0lucHV0KTtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcCk7XHJcbiAgfVxyXG5cclxuICBkZXN0cm95ICgpIHtcclxuICAgIHRoaXMudW5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcclxuICB9XHJcblxyXG4gIHNhdmVTdGF0ZSAoZXYpIHtcclxuICAgIHRoaXMuX29sZFZhbHVlID0gdGhpcy5lbC52YWx1ZTtcclxuICAgIHRoaXMuX29sZFNlbGVjdGlvbiA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuZWwuc2VsZWN0aW9uU3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5lbC5zZWxlY3Rpb25FbmRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb2Nlc3NJbnB1dCAoZXYpIHtcclxuICAgICB2YXIgaW5wdXRWYWx1ZSA9IHRoaXMuZWwudmFsdWU7XHJcblxyXG4gICAgLy8gdXNlIHNlbGVjdGlvbkVuZCBmb3IgaGFuZGxlIFVuZG9cclxuICAgIHZhciBjdXJzb3JQb3MgPSB0aGlzLmVsLnNlbGVjdGlvbkVuZDtcclxuICAgIHZhciBkZXRhaWxzID0ge1xyXG4gICAgICBvbGRTZWxlY3Rpb246IHRoaXMuX29sZFNlbGVjdGlvbixcclxuICAgICAgY3Vyc29yUG9zOiBjdXJzb3JQb3MsXHJcbiAgICAgIG9sZFZhbHVlOiB0aGlzLl9vbGRWYWx1ZVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmVzID0gaW5wdXRWYWx1ZTtcclxuICAgIHJlcyA9IGNvbmZvcm0odGhpcy5yZXNvbHZlKHJlcywgZGV0YWlscyksXHJcbiAgICAgIHJlcyxcclxuICAgICAgdGhpcy5fb2xkVmFsdWUpO1xyXG5cclxuICAgIGlmIChyZXMgIT09IGlucHV0VmFsdWUpIHtcclxuICAgICAgdGhpcy5lbC52YWx1ZSA9IHJlcztcclxuICAgICAgY3Vyc29yUG9zID0gZGV0YWlscy5jdXJzb3JQb3M7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcXVldWUgY2hhbmdlIGN1cnNvclxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmVsLnNldFNlbGVjdGlvblJhbmdlKGN1cnNvclBvcywgY3Vyc29yUG9zKSwgMCk7XHJcblxyXG4gICAgaWYgKHJlcyAhPT0gdGhpcy5fb2xkVmFsdWUpIHRoaXMuZmlyZUV2ZW50KFwiYWNjZXB0XCIpO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIG9uIChldiwgaGFuZGxlcikge1xyXG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnNbZXZdKSB0aGlzLl9saXN0ZW5lcnNbZXZdID0gW107XHJcbiAgICB0aGlzLl9saXN0ZW5lcnNbZXZdLnB1c2goaGFuZGxlcik7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIG9mZiAoZXYsIGhhbmRsZXIpIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzW2V2XSkgcmV0dXJuO1xyXG4gICAgaWYgKCFoYW5kbGVyKSB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbZXZdO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgaEluZGV4ID0gdGhpcy5fbGlzdGVuZXJzW2V2XS5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgaWYgKGhJbmRleCA+PSAwKSB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGhJbmRleCwgMSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGZpcmVFdmVudCAoZXYpIHtcclxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZdIHx8IFtdO1xyXG4gICAgbGlzdGVuZXJzLmZvckVhY2gobCA9PiBsKCkpO1xyXG4gIH1cclxuXHJcbiAgLy8gb3ZlcnJpZGUgdGhpc1xyXG4gIHJlc29sdmUgKHN0ciwgZGV0YWlscykgeyByZXR1cm4gc3RyOyB9XHJcblxyXG4gIGdldCByYXdWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbC52YWx1ZTtcclxuICB9XHJcblxyXG4gIHNldCByYXdWYWx1ZSAoc3RyKSB7XHJcbiAgICB0aGlzLnN0YXJ0UmVmcmVzaCgpO1xyXG4gICAgdGhpcy5lbC52YWx1ZSA9IHN0cjtcclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHVubWFza2VkVmFsdWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWwudmFsdWU7XHJcbiAgfVxyXG5cclxuICBzZXQgdW5tYXNrZWRWYWx1ZSAodmFsdWUpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLmVsLnZhbHVlID0gdmFsdWU7XHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIHJlZnJlc2ggKCkge1xyXG4gICAgLy8gdXNlIHVubWFza2VkIHZhbHVlIGlmIHZhbHVlIHdhcyBub3QgY2hhbmdlZCB0byB1cGRhdGUgd2l0aCBvcHRpb25zIGNvcnJlY3RseVxyXG4gICAgaWYgKHRoaXMuX29sZFJhd1ZhbHVlID09PSB0aGlzLmVsLnZhbHVlKSB0aGlzLmVsLnZhbHVlID0gdGhpcy5fb2xkVW5tYXNrZWRWYWx1ZTtcclxuICAgIGRlbGV0ZSB0aGlzLl9vbGRSYXdWYWx1ZTtcclxuICAgIGRlbGV0ZSB0aGlzLl9vbGRVbm1hc2tlZFZhbHVlO1xyXG5cclxuICAgIHZhciBzdHIgPSB0aGlzLmVsLnZhbHVlO1xyXG4gICAgdmFyIGRldGFpbHMgPSB7XHJcbiAgICAgIGN1cnNvclBvczogdGhpcy5lbC52YWx1ZS5sZW5ndGgsXHJcbiAgICAgIHN0YXJ0Q2hhbmdlUG9zOiAwLFxyXG4gICAgICBvbGRTZWxlY3Rpb246IHtcclxuICAgICAgICBzdGFydDogMCxcclxuICAgICAgICBlbmQ6IHRoaXMuZWwudmFsdWUubGVuZ3RoXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlbW92ZWRDb3VudDogdGhpcy5lbC52YWx1ZS5sZW5ndGgsXHJcbiAgICAgIGluc2VydGVkQ291bnQ6IHN0ci5sZW5ndGgsXHJcbiAgICAgIG9sZFZhbHVlOiB0aGlzLmVsLnZhbHVlXHJcbiAgICB9O1xyXG4gICAgdGhpcy5lbC52YWx1ZSA9IGNvbmZvcm0odGhpcy5yZXNvbHZlKHN0ciwgZGV0YWlscyksIHRoaXMuZWwudmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgc3RhcnRSZWZyZXNoICgpIHtcclxuICAgIC8vIHN0b3JlIHVubWFza2VkIHZhbHVlIHRvIGFwcGx5IGFmdGVyIGNoYW5nZXNcclxuICAgIGlmICghdGhpcy5fcmVmcmVzaGluZ0NvdW50KSB7XHJcbiAgICAgIHRoaXMuX29sZFVubWFza2VkVmFsdWUgPSB0aGlzLnVubWFza2VkVmFsdWU7XHJcbiAgICAgIHRoaXMuX29sZFJhd1ZhbHVlID0gdGhpcy5yYXdWYWx1ZTtcclxuICAgIH1cclxuICAgICsrdGhpcy5fcmVmcmVzaGluZ0NvdW50O1xyXG4gIH1cclxuXHJcbiAgZW5kUmVmcmVzaCAoKSB7XHJcbiAgICAtLXRoaXMuX3JlZnJlc2hpbmdDb3VudDtcclxuICAgIGlmICghdGhpcy5fcmVmcmVzaGluZ0NvdW50KSB0aGlzLnJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIF9vbkRyb3AgKGV2KSB7XHJcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBCYXNlTWFzayBmcm9tICcuL2Jhc2UnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHRcclxuY2xhc3MgUmVnRXhwTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICByZXNvbHZlIChzdHIpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2sudGVzdChzdHIpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmNsYXNzIEZ1bmNNYXNrIGV4dGVuZHMgQmFzZU1hc2sge1xyXG4gIHJlc29sdmUgKC4uLmFyZ3MpIHtcclxuICAgIHJldHVybiB0aGlzLm1hc2soLi4uYXJncyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7Y29uZm9ybX0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgQmFzZU1hc2sgZnJvbSAnLi9iYXNlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdFxyXG5jbGFzcyBQYXR0ZXJuTWFzayBleHRlbmRzIEJhc2VNYXNrIHtcclxuICBjb25zdHJ1Y3RvciAoZWwsIG9wdHMpIHtcclxuICAgIHN1cGVyKGVsLCBvcHRzKTtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcblxyXG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IG9wdHMucGxhY2Vob2xkZXI7XHJcbiAgICB0aGlzLmRlZmluaXRpb25zID0ge1xyXG4gICAgICAuLi5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyxcclxuICAgICAgLi4ub3B0cy5kZWZpbml0aW9uc1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9ob2xsb3dzID0gW107XHJcbiAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG5cclxuICAgIHRoaXMuX2FsaWduQ3Vyc29yID0gdGhpcy5fYWxpZ25DdXJzb3IuYmluZCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGJpbmRFdmVudHMgKCkge1xyXG4gICAgc3VwZXIuYmluZEV2ZW50cygpO1xyXG4gICAgWydjbGljaycsICdmb2N1cyddLmZvckVhY2goZXYgPT5cclxuICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKGV2LCB0aGlzLl9hbGlnbkN1cnNvcikpO1xyXG4gIH1cclxuXHJcbiAgdW5iaW5kRXZlbnRzICgpIHtcclxuICAgIHN1cGVyLnVuYmluZEV2ZW50cygpO1xyXG4gICAgWydjbGljaycsICdmb2N1cyddLmZvckVhY2goZXYgPT5cclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2LCB0aGlzLl9hbGlnbkN1cnNvcikpO1xyXG4gIH1cclxuXHJcbiAgX2J1aWxkUmVzb2x2ZXJzICgpIHtcclxuICAgIHRoaXMuX2NoYXJEZWZzID0gW107XHJcbiAgICB2YXIgcGF0dGVybiA9IHRoaXMubWFzaztcclxuXHJcbiAgICBpZiAoIXBhdHRlcm4gfHwgIXRoaXMuZGVmaW5pdGlvbnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgdW5tYXNraW5nQmxvY2sgPSBmYWxzZTtcclxuICAgIHZhciBvcHRpb25hbEJsb2NrID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8cGF0dGVybi5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIgY2ggPSBwYXR0ZXJuW2ldO1xyXG4gICAgICB2YXIgdHlwZSA9ICF1bm1hc2tpbmdCbG9jayAmJiBjaCBpbiB0aGlzLmRlZmluaXRpb25zID9cclxuICAgICAgICBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgOlxyXG4gICAgICAgIFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5GSVhFRDtcclxuICAgICAgdmFyIHVubWFza2luZyA9IHR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCB8fCB1bm1hc2tpbmdCbG9jaztcclxuICAgICAgdmFyIG9wdGlvbmFsID0gdHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLklOUFVUICYmIG9wdGlvbmFsQmxvY2s7XHJcblxyXG4gICAgICBpZiAoY2ggPT09ICd7JyB8fCBjaCA9PT0gJ30nKSB7XHJcbiAgICAgICAgdW5tYXNraW5nQmxvY2sgPSAhdW5tYXNraW5nQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1snIHx8IGNoID09PSAnXScpIHtcclxuICAgICAgICBvcHRpb25hbEJsb2NrID0gIW9wdGlvbmFsQmxvY2s7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjaCA9PT0gJ1xcXFwnKSB7XHJcbiAgICAgICAgKytpO1xyXG4gICAgICAgIGNoID0gcGF0dGVybltpXTtcclxuICAgICAgICAvLyBUT0RPIHZhbGlkYXRpb25cclxuICAgICAgICBpZiAoIWNoKSBicmVhaztcclxuICAgICAgICB0eXBlID0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9jaGFyRGVmcy5wdXNoKHtcclxuICAgICAgICBjaGFyOiBjaCxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcclxuICAgICAgICB1bm1hc2tpbmc6IHVubWFza2luZ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9yZXNvbHZlcnMgPSB7fTtcclxuICAgIGZvciAodmFyIGRlZktleSBpbiB0aGlzLmRlZmluaXRpb25zKSB7XHJcbiAgICAgIHRoaXMuX3Jlc29sdmVyc1tkZWZLZXldID0gSU1hc2suTWFza0ZhY3RvcnkodGhpcy5lbCwge1xyXG4gICAgICAgIG1hc2s6IHRoaXMuZGVmaW5pdGlvbnNbZGVmS2V5XVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF90cnlBcHBlbmRUYWlsIChzdHIsIHRhaWwpIHtcclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGhvbGxvd3MgPSB0aGlzLl9ob2xsb3dzLnNsaWNlKCk7XHJcblxyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9dGhpcy5fbWFwUG9zVG9EZWZJbmRleChzdHIubGVuZ3RoKTsgY2kgPCB0YWlsLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSB0YWlsW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuXHJcbiAgICAgIC8vIGZhaWxlZFxyXG4gICAgICBpZiAoIWRlZikgcmV0dXJuO1xyXG5cclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIHZhciBjaHJlcyA9IHJlc29sdmVyLnJlc29sdmUoY2gsIGRpLCBzdHIpIHx8ICcnO1xyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgY2hyZXMgPSBjb25mb3JtKGNocmVzLCBjaCk7XHJcbiAgICAgICAgICArK2NpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAoIWRlZi5vcHRpb25hbCkgY2hyZXMgPSB0aGlzLl9wbGFjZWhvbGRlci5jaGFyO1xyXG4gICAgICAgICAgaG9sbG93cy5wdXNoKGRpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RyICs9IHBsYWNlaG9sZGVyQnVmZmVyICsgY2hyZXM7XHJcbiAgICAgICAgcGxhY2Vob2xkZXJCdWZmZXIgPSAnJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwbGFjZWhvbGRlckJ1ZmZlciArPSBkZWYuY2hhcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbc3RyLCBob2xsb3dzXTtcclxuICB9XHJcblxyXG4gIF9leHRyYWN0SW5wdXQgKHN0ciwgZnJvbVBvcz0wKSB7XHJcbiAgICB2YXIgaW5wdXQgPSAnJztcclxuXHJcbiAgICBmb3IgKHZhciBjaT0wLCBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KGZyb21Qb3MpOyBjaTxzdHIubGVuZ3RoICYmIGRpPHRoaXMuX2NoYXJEZWZzLmxlbmd0aDsgKytkaSkge1xyXG4gICAgICB2YXIgY2ggPSBzdHJbY2ldO1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuSG9sbG93KGRpKSkgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJlxyXG4gICAgICAgIHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkaSkgPCAwKSBpbnB1dCArPSBjaDtcclxuICAgICAgKytjaTtcclxuICAgIH1cclxuICAgIHJldHVybiBpbnB1dDtcclxuICB9XHJcblxyXG4gIF9pc0hpZGRlbkhvbGxvdyAoZGVmSW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGVmSW5kZXgpID49IDAgJiZcclxuICAgICAgdGhpcy5fY2hhckRlZnNbZGVmSW5kZXhdICYmIHRoaXMuX2NoYXJEZWZzW2RlZkluZGV4XS5vcHRpb25hbDtcclxuICB9XHJcblxyXG4gIF9ob2xsb3dzQmVmb3JlIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGRlZkluZGV4ICYmIHRoaXMuX2lzSGlkZGVuSG9sbG93KGgpKTtcclxuICB9XHJcblxyXG4gIF9tYXBEZWZJbmRleFRvUG9zIChkZWZJbmRleCkge1xyXG4gICAgcmV0dXJuIGRlZkluZGV4IC0gdGhpcy5faG9sbG93c0JlZm9yZShkZWZJbmRleCkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgX21hcFBvc1RvRGVmSW5kZXggKHBvcykge1xyXG4gICAgdmFyIGxhc3RIb2xsb3dJbmRleCA9IHBvcztcclxuICAgIC8vIGV4dGVuZCBjb250aWd1b3VzXHJcbiAgICB3aGlsZSAodGhpcy5faXNIaWRkZW5Ib2xsb3cobGFzdEhvbGxvd0luZGV4LTEpKSArK2xhc3RIb2xsb3dJbmRleDtcclxuXHJcbiAgICByZXR1cm4gcG9zICsgdGhpcy5faG9sbG93c0JlZm9yZShsYXN0SG9sbG93SW5kZXgpLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIF9nZW5lcmF0ZUluc2VydFN0ZXBzIChoZWFkLCBpbnNlcnRlZCkge1xyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcbiAgICB2YXIgaG9sbG93cyA9IHRoaXMuX2hvbGxvd3Muc2xpY2UoKTtcclxuICAgIHZhciBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gW1tyZXMsIGhvbGxvd3Muc2xpY2UoKV1dO1xyXG5cclxuICAgIGZvciAodmFyIGNpPTAsIGRpPXRoaXMuX21hcFBvc1RvRGVmSW5kZXgoaGVhZC5sZW5ndGgpOyBjaTxpbnNlcnRlZC5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIGlmICghZGVmKSBicmVhaztcclxuXHJcbiAgICAgIHZhciBjaCA9IGluc2VydGVkW2NpXTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdO1xyXG4gICAgICAgIHZhciBjaHJlcyA9IHJlc29sdmVyLnJlc29sdmUoY2gsIGNpLCByZXMpIHx8ICcnO1xyXG4gICAgICAgIC8vIGlmIG9rIC0gbmV4dCBkaVxyXG4gICAgICAgIGlmIChjaHJlcykge1xyXG4gICAgICAgICAgcmVzICs9IHBsYWNlaG9sZGVyQnVmZmVyICsgY29uZm9ybShjaHJlcywgY2gpOyBwbGFjZWhvbGRlckJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgaW5zZXJ0U3RlcHMucHVzaChbcmVzLCBob2xsb3dzLnNsaWNlKCldKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRlZi5vcHRpb25hbCkge1xyXG4gICAgICAgICAgaWYgKGhvbGxvd3MuaW5kZXhPZihkaSkgPCAwKSBob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2hyZXMgfHwgZGVmLm9wdGlvbmFsKSArK2RpO1xyXG4gICAgICAgIGlmIChjaHJlcyB8fCAhZGVmLm9wdGlvbmFsKSArK2NpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyQnVmZmVyICs9IGRlZi5jaGFyO1xyXG5cclxuICAgICAgICBpZiAoY2ggPT09IGRlZi5jaGFyKSArK2NpO1xyXG4gICAgICAgICsrZGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaW5zZXJ0U3RlcHM7XHJcbiAgfVxyXG5cclxuICByZXNvbHZlIChzdHIsIGRldGFpbHMpIHtcclxuICAgIHZhciBjdXJzb3JQb3MgPSBkZXRhaWxzLmN1cnNvclBvcztcclxuICAgIHZhciBvbGRTZWxlY3Rpb24gPSBkZXRhaWxzLm9sZFNlbGVjdGlvbjtcclxuICAgIHZhciBvbGRWYWx1ZSA9IGRldGFpbHMub2xkVmFsdWU7XHJcbiAgICB2YXIgc3RhcnRDaGFuZ2VQb3MgPSBNYXRoLm1pbihjdXJzb3JQb3MsIG9sZFNlbGVjdGlvbi5zdGFydCk7XHJcbiAgICAvLyBNYXRoLm1heCBmb3Igb3Bwb3NpdGUgb3BlcmF0aW9uXHJcbiAgICB2YXIgcmVtb3ZlZENvdW50ID0gTWF0aC5tYXgoKG9sZFNlbGVjdGlvbi5lbmQgLSBzdGFydENoYW5nZVBvcykgfHxcclxuICAgICAgLy8gZm9yIERlbGV0ZVxyXG4gICAgICBvbGRWYWx1ZS5sZW5ndGggLSBzdHIubGVuZ3RoLCAwKTtcclxuICAgIHZhciBpbnNlcnRlZENvdW50ID0gY3Vyc29yUG9zIC0gc3RhcnRDaGFuZ2VQb3M7XHJcblxyXG5cclxuICAgIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBzdGFydENoYW5nZVBvcyk7XHJcbiAgICB2YXIgdGFpbCA9IHN0ci5zdWJzdHJpbmcoc3RhcnRDaGFuZ2VQb3MgKyBpbnNlcnRlZENvdW50KTtcclxuICAgIHZhciBpbnNlcnRlZCA9IHN0ci5zdWJzdHIoc3RhcnRDaGFuZ2VQb3MsIGluc2VydGVkQ291bnQpO1xyXG5cclxuICAgIHZhciB0YWlsSW5wdXQgPSB0aGlzLl9leHRyYWN0SW5wdXQodGFpbCwgc3RhcnRDaGFuZ2VQb3MgKyByZW1vdmVkQ291bnQpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBob2xsb3dzIGFmdGVyIGN1cnNvclxyXG4gICAgdmFyIGxhc3RIb2xsb3dJbmRleCA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgoc3RhcnRDaGFuZ2VQb3MpO1xyXG4gICAgdGhpcy5faG9sbG93cyA9IHRoaXMuX2hvbGxvd3MuZmlsdGVyKGggPT4gaCA8IGxhc3RIb2xsb3dJbmRleCk7XHJcblxyXG4gICAgdmFyIHJlcyA9IGhlYWQ7XHJcblxyXG4gICAgLy8gaW5zZXJ0IGF2YWlsYWJsZVxyXG4gICAgdmFyIGluc2VydFN0ZXBzID0gdGhpcy5fZ2VuZXJhdGVJbnNlcnRTdGVwcyhoZWFkLCBpbnNlcnRlZCk7XHJcbiAgICBmb3IgKHZhciBpc3RlcD1pbnNlcnRTdGVwcy5sZW5ndGgtMTsgaXN0ZXAgPj0gMDsgLS1pc3RlcCkge1xyXG4gICAgICB2YXIgc3RlcDtcclxuICAgICAgW3N0ZXAsIHRoaXMuX2hvbGxvd3NdID0gaW5zZXJ0U3RlcHNbaXN0ZXBdO1xyXG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fdHJ5QXBwZW5kVGFpbChzdGVwLCB0YWlsSW5wdXQpO1xyXG4gICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgW3JlcywgdGhpcy5faG9sbG93c10gPSByZXN1bHQ7XHJcbiAgICAgICAgY3Vyc29yUG9zID0gc3RlcC5sZW5ndGg7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5zZXJ0ZWQpIHtcclxuICAgICAgLy8gYXBwZW5kIGZpeGVkIGF0IGVuZFxyXG4gICAgICB2YXIgYXBwZW5kZWQgPSB0aGlzLl9hcHBlbmRGaXhlZEVuZChyZXMpO1xyXG4gICAgICBjdXJzb3JQb3MgKz0gYXBwZW5kZWQubGVuZ3RoIC0gcmVzLmxlbmd0aDtcclxuICAgICAgcmVzID0gYXBwZW5kZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIGhlYWQgZml4ZWQgYW5kIGhvbGxvd3MgaWYgcmVtb3ZlZCBhdCBlbmRcclxuICAgIGlmICghaW5zZXJ0ZWQgJiYgY3Vyc29yUG9zID09PSByZXMubGVuZ3RoKSB7XHJcbiAgICAgIHZhciBkaSA9IHRoaXMuX21hcFBvc1RvRGVmSW5kZXgoY3Vyc29yUG9zLTEpO1xyXG4gICAgICB2YXIgaGFzSG9sbG93cyA9IGZhbHNlO1xyXG4gICAgICBmb3IgKDsgZGkgPiAwOyAtLWRpKSB7XHJcbiAgICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgICBpZiAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuX2hvbGxvd3MuaW5kZXhPZihkaSkgPj0gMCkgaGFzSG9sbG93cyA9IHRydWU7XHJcbiAgICAgICAgICBlbHNlIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoaGFzSG9sbG93cykgcmVzID0gcmVzLnNsaWNlKDAsIGRpICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXBwZW5kIHBsYWNlaG9sZGVyXHJcbiAgICByZXMgPSB0aGlzLl9hcHBlbmRQbGFjZWhvbGRlckVuZChyZXMpO1xyXG4gICAgZGV0YWlscy5jdXJzb3JQb3MgPSBjdXJzb3JQb3M7XHJcblxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIHByb2Nlc3NJbnB1dCAoZXYpIHtcclxuICAgIHZhciByZXMgPSBzdXBlci5wcm9jZXNzSW5wdXQoZXYpO1xyXG4gICAgaWYgKHJlcyAhPT0gdGhpcy5fb2xkVmFsdWUgJiYgdGhpcy5pc0NvbXBsZXRlKSB0aGlzLmZpcmVFdmVudChcImNvbXBsZXRlXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzQ29tcGxldGUgKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLl9jaGFyRGVmcy5maWx0ZXIoKGRlZiwgZGkpID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgIWRlZi5vcHRpb25hbCAmJlxyXG4gICAgICB0aGlzLl9ob2xsb3dzLmluZGV4T2YoZGkpID49IDApLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIF9hcHBlbmRGaXhlZEVuZCAocmVzKSB7XHJcbiAgICBmb3IgKHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHJlcy5sZW5ndGgpOzsgKytkaSkge1xyXG4gICAgICB2YXIgZGVmID0gdGhpcy5fY2hhckRlZnNbZGldO1xyXG4gICAgICBpZiAoIWRlZikgYnJlYWs7XHJcblxyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3coZGkpKSBjb250aW51ZTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIGJyZWFrO1xyXG4gICAgICBpZiAoZGkgPj0gcmVzLmxlbmd0aCkgcmVzICs9IGRlZi5jaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIF9hcHBlbmRQbGFjZWhvbGRlckVuZCAocmVzKSB7XHJcbiAgICBmb3IgKHZhciBkaT10aGlzLl9tYXBQb3NUb0RlZkluZGV4KHJlcy5sZW5ndGgpOyBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQgJiYgdGhpcy5faG9sbG93cy5pbmRleE9mKGRpKSA8IDApIHtcclxuICAgICAgICB0aGlzLl9ob2xsb3dzLnB1c2goZGkpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLl9wbGFjZWhvbGRlci5zaG93ID09PSAnYWx3YXlzJykge1xyXG4gICAgICAgIHJlcyArPSBkZWYudHlwZSA9PT0gUGF0dGVybk1hc2suREVGX1RZUEVTLkZJWEVEID9cclxuICAgICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAgICFkZWYub3B0aW9uYWwgP1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZWhvbGRlci5jaGFyIDpcclxuICAgICAgICAgICAgJyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBnZXQgdW5tYXNrZWRWYWx1ZSAoKSB7XHJcbiAgICB2YXIgc3RyID0gdGhpcy5yYXdWYWx1ZTtcclxuICAgIHZhciB1bm1hc2tlZCA9ICcnO1xyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9MDsgY2k8c3RyLmxlbmd0aCAmJiBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7ICsrZGkpIHtcclxuICAgICAgdmFyIGNoID0gc3RyW2NpXTtcclxuICAgICAgdmFyIGRlZiA9IHRoaXMuX2NoYXJEZWZzW2RpXTtcclxuXHJcbiAgICAgIGlmICh0aGlzLl9pc0hpZGRlbkhvbGxvdyhkaSkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaWYgKGRlZi51bm1hc2tpbmcgJiYgdGhpcy5faG9sbG93cy5pbmRleE9mKGRpKSA8IDAgJiZcclxuICAgICAgICAoZGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9yZXNvbHZlcnNbZGVmLmNoYXJdLnJlc29sdmUoY2gsIGNpLCBzdHIpIHx8XHJcbiAgICAgICAgICBkZWYuY2hhciA9PT0gY2gpKSB7XHJcbiAgICAgICAgdW5tYXNrZWQgKz0gY2g7XHJcbiAgICAgIH1cclxuICAgICAgKytjaTtcclxuICAgIH1cclxuICAgIHJldHVybiB1bm1hc2tlZDtcclxuICB9XHJcblxyXG4gIHNldCB1bm1hc2tlZFZhbHVlIChzdHIpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcblxyXG4gICAgdmFyIHJlcyA9ICcnO1xyXG4gICAgZm9yICh2YXIgY2k9MCwgZGk9MDsgY2k8c3RyLmxlbmd0aCAmJiBkaTx0aGlzLl9jaGFyRGVmcy5sZW5ndGg7KSB7XHJcbiAgICAgIHZhciBkZWYgPSB0aGlzLl9jaGFyRGVmc1tkaV07XHJcbiAgICAgIHZhciBjaCA9IHN0cltjaV07XHJcblxyXG4gICAgICB2YXIgY2hyZXMgPSAnJztcclxuICAgICAgaWYgKGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIHtcclxuICAgICAgICBpZiAodGhpcy5fcmVzb2x2ZXJzW2RlZi5jaGFyXS5yZXNvbHZlKGNoLCBjaSwgcmVzKSkge1xyXG4gICAgICAgICAgY2hyZXMgPSBjaDtcclxuICAgICAgICAgICsrZGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICsrY2k7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hyZXMgPSBkZWYuY2hhcjtcclxuICAgICAgICBpZiAoZGVmLnVubWFza2luZyAmJiBkZWYuY2hhciA9PT0gY2gpICsrY2k7XHJcbiAgICAgICAgKytkaTtcclxuICAgICAgfVxyXG4gICAgICByZXMgKz0gY2hyZXM7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9ob2xsb3dzLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLnJhd1ZhbHVlID0gcmVzO1xyXG5cclxuICAgIHRoaXMuZW5kUmVmcmVzaCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHBsYWNlaG9sZGVyICgpIHsgcmV0dXJuIHRoaXMuX3BsYWNlaG9sZGVyOyB9XHJcblxyXG4gIHNldCBwbGFjZWhvbGRlciAocGgpIHtcclxuICAgIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHtcclxuICAgICAgLi4uUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUixcclxuICAgICAgLi4ucGhcclxuICAgIH07XHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGdldCBwbGFjZWhvbGRlckxhYmVsICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9jaGFyRGVmcy5tYXAoZGVmID0+XHJcbiAgICAgIGRlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuRklYRUQgP1xyXG4gICAgICAgIGRlZi5jaGFyIDpcclxuICAgICAgICAhZGVmLm9wdGlvbmFsID9cclxuICAgICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyLmNoYXIgOlxyXG4gICAgICAgICAgJycpLmpvaW4oJycpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRlZmluaXRpb25zICgpIHsgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zOyB9XHJcblxyXG4gIHNldCBkZWZpbml0aW9ucyAoZGVmcykge1xyXG4gICAgdGhpcy5zdGFydFJlZnJlc2goKTtcclxuICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmcztcclxuICAgIHRoaXMuX2J1aWxkUmVzb2x2ZXJzKCk7XHJcbiAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGdldCBtYXNrICgpIHsgcmV0dXJuIHRoaXMuX21hc2s7IH1cclxuXHJcbiAgc2V0IG1hc2sgKG1hc2spIHtcclxuICAgIHZhciBpbml0aWFsaXplZCA9IHRoaXMuX21hc2s7XHJcbiAgICBpZiAoaW5pdGlhbGl6ZWQpIHRoaXMuc3RhcnRSZWZyZXNoKCk7XHJcbiAgICB0aGlzLl9tYXNrID0gbWFzaztcclxuICAgIGlmIChpbml0aWFsaXplZCkge1xyXG4gICAgICB0aGlzLl9idWlsZFJlc29sdmVycygpO1xyXG4gICAgICB0aGlzLmVuZFJlZnJlc2goKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9hbGlnbkN1cnNvciAoKSB7XHJcbiAgICB2YXIgY3Vyc29yUG9zID0gdGhpcy5lbC5zZWxlY3Rpb25FbmQ7XHJcbiAgICB2YXIgY3Vyc29yRGVmSW5kZXggPSB0aGlzLl9tYXBQb3NUb0RlZkluZGV4KGN1cnNvclBvcyk7XHJcbiAgICBmb3IgKHZhciByUG9zID0gY3Vyc29yRGVmSW5kZXg7IHJQb3MgPj0gMDsgLS1yUG9zKSB7XHJcbiAgICAgIHZhciByRGVmID0gdGhpcy5fY2hhckRlZnNbclBvc107XHJcbiAgICAgIHZhciBsUG9zID0gclBvcy0xO1xyXG4gICAgICB2YXIgbERlZiA9IHRoaXMuX2NoYXJEZWZzW2xQb3NdO1xyXG4gICAgICBpZiAodGhpcy5faXNIaWRkZW5Ib2xsb3cobFBvcykpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaWYgKCghckRlZiB8fCByRGVmLnR5cGUgPT09IFBhdHRlcm5NYXNrLkRFRl9UWVBFUy5JTlBVVCAmJiB0aGlzLl9ob2xsb3dzLmluZGV4T2YoclBvcykgPj0gMCAmJiAhdGhpcy5faXNIaWRkZW5Ib2xsb3coclBvcykpICYmXHJcbiAgICAgICAgdGhpcy5faG9sbG93cy5pbmRleE9mKGxQb3MpIDwgMCkge1xyXG4gICAgICAgIGN1cnNvckRlZkluZGV4ID0gclBvcztcclxuICAgICAgICBpZiAoIWxEZWYgfHwgbERlZi50eXBlID09PSBQYXR0ZXJuTWFzay5ERUZfVFlQRVMuSU5QVVQpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjdXJzb3JQb3MgPSB0aGlzLl9tYXBEZWZJbmRleFRvUG9zKGN1cnNvckRlZkluZGV4KTtcclxuICAgIHRoaXMuZWwuc2V0U2VsZWN0aW9uUmFuZ2UoY3Vyc29yUG9zLCBjdXJzb3JQb3MpO1xyXG4gIH1cclxufVxyXG5QYXR0ZXJuTWFzay5ERUZJTklUSU9OUyA9IHtcclxuICAnMCc6IC9cXGQvLFxyXG4gICdhJzogL1tcXHUwMDQxLVxcdTAwNUFcXHUwMDYxLVxcdTAwN0FcXHUwMEFBXFx1MDBCNVxcdTAwQkFcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZcXHUwMEY4LVxcdTAyQzFcXHUwMkM2LVxcdTAyRDFcXHUwMkUwLVxcdTAyRTRcXHUwMkVDXFx1MDJFRVxcdTAzNzAtXFx1MDM3NFxcdTAzNzZcXHUwMzc3XFx1MDM3QS1cXHUwMzdEXFx1MDM4NlxcdTAzODgtXFx1MDM4QVxcdTAzOENcXHUwMzhFLVxcdTAzQTFcXHUwM0EzLVxcdTAzRjVcXHUwM0Y3LVxcdTA0ODFcXHUwNDhBLVxcdTA1MjdcXHUwNTMxLVxcdTA1NTZcXHUwNTU5XFx1MDU2MS1cXHUwNTg3XFx1MDVEMC1cXHUwNUVBXFx1MDVGMC1cXHUwNUYyXFx1MDYyMC1cXHUwNjRBXFx1MDY2RVxcdTA2NkZcXHUwNjcxLVxcdTA2RDNcXHUwNkQ1XFx1MDZFNVxcdTA2RTZcXHUwNkVFXFx1MDZFRlxcdTA2RkEtXFx1MDZGQ1xcdTA2RkZcXHUwNzEwXFx1MDcxMi1cXHUwNzJGXFx1MDc0RC1cXHUwN0E1XFx1MDdCMVxcdTA3Q0EtXFx1MDdFQVxcdTA3RjRcXHUwN0Y1XFx1MDdGQVxcdTA4MDAtXFx1MDgxNVxcdTA4MUFcXHUwODI0XFx1MDgyOFxcdTA4NDAtXFx1MDg1OFxcdTA4QTBcXHUwOEEyLVxcdTA4QUNcXHUwOTA0LVxcdTA5MzlcXHUwOTNEXFx1MDk1MFxcdTA5NTgtXFx1MDk2MVxcdTA5NzEtXFx1MDk3N1xcdTA5NzktXFx1MDk3RlxcdTA5ODUtXFx1MDk4Q1xcdTA5OEZcXHUwOTkwXFx1MDk5My1cXHUwOUE4XFx1MDlBQS1cXHUwOUIwXFx1MDlCMlxcdTA5QjYtXFx1MDlCOVxcdTA5QkRcXHUwOUNFXFx1MDlEQ1xcdTA5RERcXHUwOURGLVxcdTA5RTFcXHUwOUYwXFx1MDlGMVxcdTBBMDUtXFx1MEEwQVxcdTBBMEZcXHUwQTEwXFx1MEExMy1cXHUwQTI4XFx1MEEyQS1cXHUwQTMwXFx1MEEzMlxcdTBBMzNcXHUwQTM1XFx1MEEzNlxcdTBBMzhcXHUwQTM5XFx1MEE1OS1cXHUwQTVDXFx1MEE1RVxcdTBBNzItXFx1MEE3NFxcdTBBODUtXFx1MEE4RFxcdTBBOEYtXFx1MEE5MVxcdTBBOTMtXFx1MEFBOFxcdTBBQUEtXFx1MEFCMFxcdTBBQjJcXHUwQUIzXFx1MEFCNS1cXHUwQUI5XFx1MEFCRFxcdTBBRDBcXHUwQUUwXFx1MEFFMVxcdTBCMDUtXFx1MEIwQ1xcdTBCMEZcXHUwQjEwXFx1MEIxMy1cXHUwQjI4XFx1MEIyQS1cXHUwQjMwXFx1MEIzMlxcdTBCMzNcXHUwQjM1LVxcdTBCMzlcXHUwQjNEXFx1MEI1Q1xcdTBCNURcXHUwQjVGLVxcdTBCNjFcXHUwQjcxXFx1MEI4M1xcdTBCODUtXFx1MEI4QVxcdTBCOEUtXFx1MEI5MFxcdTBCOTItXFx1MEI5NVxcdTBCOTlcXHUwQjlBXFx1MEI5Q1xcdTBCOUVcXHUwQjlGXFx1MEJBM1xcdTBCQTRcXHUwQkE4LVxcdTBCQUFcXHUwQkFFLVxcdTBCQjlcXHUwQkQwXFx1MEMwNS1cXHUwQzBDXFx1MEMwRS1cXHUwQzEwXFx1MEMxMi1cXHUwQzI4XFx1MEMyQS1cXHUwQzMzXFx1MEMzNS1cXHUwQzM5XFx1MEMzRFxcdTBDNThcXHUwQzU5XFx1MEM2MFxcdTBDNjFcXHUwQzg1LVxcdTBDOENcXHUwQzhFLVxcdTBDOTBcXHUwQzkyLVxcdTBDQThcXHUwQ0FBLVxcdTBDQjNcXHUwQ0I1LVxcdTBDQjlcXHUwQ0JEXFx1MENERVxcdTBDRTBcXHUwQ0UxXFx1MENGMVxcdTBDRjJcXHUwRDA1LVxcdTBEMENcXHUwRDBFLVxcdTBEMTBcXHUwRDEyLVxcdTBEM0FcXHUwRDNEXFx1MEQ0RVxcdTBENjBcXHUwRDYxXFx1MEQ3QS1cXHUwRDdGXFx1MEQ4NS1cXHUwRDk2XFx1MEQ5QS1cXHUwREIxXFx1MERCMy1cXHUwREJCXFx1MERCRFxcdTBEQzAtXFx1MERDNlxcdTBFMDEtXFx1MEUzMFxcdTBFMzJcXHUwRTMzXFx1MEU0MC1cXHUwRTQ2XFx1MEU4MVxcdTBFODJcXHUwRTg0XFx1MEU4N1xcdTBFODhcXHUwRThBXFx1MEU4RFxcdTBFOTQtXFx1MEU5N1xcdTBFOTktXFx1MEU5RlxcdTBFQTEtXFx1MEVBM1xcdTBFQTVcXHUwRUE3XFx1MEVBQVxcdTBFQUJcXHUwRUFELVxcdTBFQjBcXHUwRUIyXFx1MEVCM1xcdTBFQkRcXHUwRUMwLVxcdTBFQzRcXHUwRUM2XFx1MEVEQy1cXHUwRURGXFx1MEYwMFxcdTBGNDAtXFx1MEY0N1xcdTBGNDktXFx1MEY2Q1xcdTBGODgtXFx1MEY4Q1xcdTEwMDAtXFx1MTAyQVxcdTEwM0ZcXHUxMDUwLVxcdTEwNTVcXHUxMDVBLVxcdTEwNURcXHUxMDYxXFx1MTA2NVxcdTEwNjZcXHUxMDZFLVxcdTEwNzBcXHUxMDc1LVxcdTEwODFcXHUxMDhFXFx1MTBBMC1cXHUxMEM1XFx1MTBDN1xcdTEwQ0RcXHUxMEQwLVxcdTEwRkFcXHUxMEZDLVxcdTEyNDhcXHUxMjRBLVxcdTEyNERcXHUxMjUwLVxcdTEyNTZcXHUxMjU4XFx1MTI1QS1cXHUxMjVEXFx1MTI2MC1cXHUxMjg4XFx1MTI4QS1cXHUxMjhEXFx1MTI5MC1cXHUxMkIwXFx1MTJCMi1cXHUxMkI1XFx1MTJCOC1cXHUxMkJFXFx1MTJDMFxcdTEyQzItXFx1MTJDNVxcdTEyQzgtXFx1MTJENlxcdTEyRDgtXFx1MTMxMFxcdTEzMTItXFx1MTMxNVxcdTEzMTgtXFx1MTM1QVxcdTEzODAtXFx1MTM4RlxcdTEzQTAtXFx1MTNGNFxcdTE0MDEtXFx1MTY2Q1xcdTE2NkYtXFx1MTY3RlxcdTE2ODEtXFx1MTY5QVxcdTE2QTAtXFx1MTZFQVxcdTE3MDAtXFx1MTcwQ1xcdTE3MEUtXFx1MTcxMVxcdTE3MjAtXFx1MTczMVxcdTE3NDAtXFx1MTc1MVxcdTE3NjAtXFx1MTc2Q1xcdTE3NkUtXFx1MTc3MFxcdTE3ODAtXFx1MTdCM1xcdTE3RDdcXHUxN0RDXFx1MTgyMC1cXHUxODc3XFx1MTg4MC1cXHUxOEE4XFx1MThBQVxcdTE4QjAtXFx1MThGNVxcdTE5MDAtXFx1MTkxQ1xcdTE5NTAtXFx1MTk2RFxcdTE5NzAtXFx1MTk3NFxcdTE5ODAtXFx1MTlBQlxcdTE5QzEtXFx1MTlDN1xcdTFBMDAtXFx1MUExNlxcdTFBMjAtXFx1MUE1NFxcdTFBQTdcXHUxQjA1LVxcdTFCMzNcXHUxQjQ1LVxcdTFCNEJcXHUxQjgzLVxcdTFCQTBcXHUxQkFFXFx1MUJBRlxcdTFCQkEtXFx1MUJFNVxcdTFDMDAtXFx1MUMyM1xcdTFDNEQtXFx1MUM0RlxcdTFDNUEtXFx1MUM3RFxcdTFDRTktXFx1MUNFQ1xcdTFDRUUtXFx1MUNGMVxcdTFDRjVcXHUxQ0Y2XFx1MUQwMC1cXHUxREJGXFx1MUUwMC1cXHUxRjE1XFx1MUYxOC1cXHUxRjFEXFx1MUYyMC1cXHUxRjQ1XFx1MUY0OC1cXHUxRjREXFx1MUY1MC1cXHUxRjU3XFx1MUY1OVxcdTFGNUJcXHUxRjVEXFx1MUY1Ri1cXHUxRjdEXFx1MUY4MC1cXHUxRkI0XFx1MUZCNi1cXHUxRkJDXFx1MUZCRVxcdTFGQzItXFx1MUZDNFxcdTFGQzYtXFx1MUZDQ1xcdTFGRDAtXFx1MUZEM1xcdTFGRDYtXFx1MUZEQlxcdTFGRTAtXFx1MUZFQ1xcdTFGRjItXFx1MUZGNFxcdTFGRjYtXFx1MUZGQ1xcdTIwNzFcXHUyMDdGXFx1MjA5MC1cXHUyMDlDXFx1MjEwMlxcdTIxMDdcXHUyMTBBLVxcdTIxMTNcXHUyMTE1XFx1MjExOS1cXHUyMTFEXFx1MjEyNFxcdTIxMjZcXHUyMTI4XFx1MjEyQS1cXHUyMTJEXFx1MjEyRi1cXHUyMTM5XFx1MjEzQy1cXHUyMTNGXFx1MjE0NS1cXHUyMTQ5XFx1MjE0RVxcdTIxODNcXHUyMTg0XFx1MkMwMC1cXHUyQzJFXFx1MkMzMC1cXHUyQzVFXFx1MkM2MC1cXHUyQ0U0XFx1MkNFQi1cXHUyQ0VFXFx1MkNGMlxcdTJDRjNcXHUyRDAwLVxcdTJEMjVcXHUyRDI3XFx1MkQyRFxcdTJEMzAtXFx1MkQ2N1xcdTJENkZcXHUyRDgwLVxcdTJEOTZcXHUyREEwLVxcdTJEQTZcXHUyREE4LVxcdTJEQUVcXHUyREIwLVxcdTJEQjZcXHUyREI4LVxcdTJEQkVcXHUyREMwLVxcdTJEQzZcXHUyREM4LVxcdTJEQ0VcXHUyREQwLVxcdTJERDZcXHUyREQ4LVxcdTJEREVcXHUyRTJGXFx1MzAwNVxcdTMwMDZcXHUzMDMxLVxcdTMwMzVcXHUzMDNCXFx1MzAzQ1xcdTMwNDEtXFx1MzA5NlxcdTMwOUQtXFx1MzA5RlxcdTMwQTEtXFx1MzBGQVxcdTMwRkMtXFx1MzBGRlxcdTMxMDUtXFx1MzEyRFxcdTMxMzEtXFx1MzE4RVxcdTMxQTAtXFx1MzFCQVxcdTMxRjAtXFx1MzFGRlxcdTM0MDAtXFx1NERCNVxcdTRFMDAtXFx1OUZDQ1xcdUEwMDAtXFx1QTQ4Q1xcdUE0RDAtXFx1QTRGRFxcdUE1MDAtXFx1QTYwQ1xcdUE2MTAtXFx1QTYxRlxcdUE2MkFcXHVBNjJCXFx1QTY0MC1cXHVBNjZFXFx1QTY3Ri1cXHVBNjk3XFx1QTZBMC1cXHVBNkU1XFx1QTcxNy1cXHVBNzFGXFx1QTcyMi1cXHVBNzg4XFx1QTc4Qi1cXHVBNzhFXFx1QTc5MC1cXHVBNzkzXFx1QTdBMC1cXHVBN0FBXFx1QTdGOC1cXHVBODAxXFx1QTgwMy1cXHVBODA1XFx1QTgwNy1cXHVBODBBXFx1QTgwQy1cXHVBODIyXFx1QTg0MC1cXHVBODczXFx1QTg4Mi1cXHVBOEIzXFx1QThGMi1cXHVBOEY3XFx1QThGQlxcdUE5MEEtXFx1QTkyNVxcdUE5MzAtXFx1QTk0NlxcdUE5NjAtXFx1QTk3Q1xcdUE5ODQtXFx1QTlCMlxcdUE5Q0ZcXHVBQTAwLVxcdUFBMjhcXHVBQTQwLVxcdUFBNDJcXHVBQTQ0LVxcdUFBNEJcXHVBQTYwLVxcdUFBNzZcXHVBQTdBXFx1QUE4MC1cXHVBQUFGXFx1QUFCMVxcdUFBQjVcXHVBQUI2XFx1QUFCOS1cXHVBQUJEXFx1QUFDMFxcdUFBQzJcXHVBQURCLVxcdUFBRERcXHVBQUUwLVxcdUFBRUFcXHVBQUYyLVxcdUFBRjRcXHVBQjAxLVxcdUFCMDZcXHVBQjA5LVxcdUFCMEVcXHVBQjExLVxcdUFCMTZcXHVBQjIwLVxcdUFCMjZcXHVBQjI4LVxcdUFCMkVcXHVBQkMwLVxcdUFCRTJcXHVBQzAwLVxcdUQ3QTNcXHVEN0IwLVxcdUQ3QzZcXHVEN0NCLVxcdUQ3RkJcXHVGOTAwLVxcdUZBNkRcXHVGQTcwLVxcdUZBRDlcXHVGQjAwLVxcdUZCMDZcXHVGQjEzLVxcdUZCMTdcXHVGQjFEXFx1RkIxRi1cXHVGQjI4XFx1RkIyQS1cXHVGQjM2XFx1RkIzOC1cXHVGQjNDXFx1RkIzRVxcdUZCNDBcXHVGQjQxXFx1RkI0M1xcdUZCNDRcXHVGQjQ2LVxcdUZCQjFcXHVGQkQzLVxcdUZEM0RcXHVGRDUwLVxcdUZEOEZcXHVGRDkyLVxcdUZEQzdcXHVGREYwLVxcdUZERkJcXHVGRTcwLVxcdUZFNzRcXHVGRTc2LVxcdUZFRkNcXHVGRjIxLVxcdUZGM0FcXHVGRjQxLVxcdUZGNUFcXHVGRjY2LVxcdUZGQkVcXHVGRkMyLVxcdUZGQzdcXHVGRkNBLVxcdUZGQ0ZcXHVGRkQyLVxcdUZGRDdcXHVGRkRBLVxcdUZGRENdLywgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyMDc1MDcwXHJcbiAgJyonOiAvLi9cclxufTtcclxuUGF0dGVybk1hc2suREVGX1RZUEVTID0ge1xyXG4gIElOUFVUOiAnaW5wdXQnLFxyXG4gIEZJWEVEOiAnZml4ZWQnXHJcbn1cclxuUGF0dGVybk1hc2suREVGQVVMVF9QTEFDRUhPTERFUiA9IHtcclxuICBzaG93OiAnbGF6eScsXHJcbiAgY2hhcjogJ18nXHJcbn07XHJcbiIsImltcG9ydCB7aXNTdHJpbmd9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuaW1wb3J0IEJhc2VNYXNrIGZyb20gJy4vbWFza3MvYmFzZSc7XHJcbmltcG9ydCBSZWdFeHBNYXNrIGZyb20gJy4vbWFza3MvcmVnZXhwJztcclxuaW1wb3J0IEZ1bmNNYXNrIGZyb20gJy4vbWFza3MvZnVuYyc7XHJcbmltcG9ydCBQYXR0ZXJuTWFzayBmcm9tICcuL21hc2tzL3BhdHRlcm4nO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0XHJcbmZ1bmN0aW9uIElNYXNrIChlbCwgb3B0cz17fSkge1xyXG4gIHZhciBtYXNrID0gSU1hc2suTWFza0ZhY3RvcnkoZWwsIG9wdHMpO1xyXG4gIG1hc2suYmluZEV2ZW50cygpO1xyXG4gIC8vIHJlZnJlc2hcclxuICBtYXNrLnJhd1ZhbHVlID0gZWwudmFsdWU7XHJcbiAgcmV0dXJuIG1hc2s7XHJcbn1cclxuXHJcbklNYXNrLk1hc2tGYWN0b3J5ID0gZnVuY3Rpb24gKGVsLCBvcHRzKSB7XHJcbiAgdmFyIG1hc2sgPSBvcHRzLm1hc2s7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBCYXNlTWFzaykgcmV0dXJuIG1hc2s7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBuZXcgUmVnRXhwTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKG1hc2sgaW5zdGFuY2VvZiBGdW5jdGlvbikgcmV0dXJuIG5ldyBGdW5jTWFzayhlbCwgb3B0cyk7XHJcbiAgaWYgKGlzU3RyaW5nKG1hc2spKSByZXR1cm4gbmV3IFBhdHRlcm5NYXNrKGVsLCBvcHRzKTtcclxuICByZXR1cm4gbmV3IEJhc2VNYXNrKGVsLCBvcHRzKTtcclxufVxyXG5JTWFzay5CYXNlTWFzayA9IEJhc2VNYXNrO1xyXG5JTWFzay5GdW5jTWFzayA9IEZ1bmNNYXNrO1xyXG5JTWFzay5SZWdFeHBNYXNrID0gUmVnRXhwTWFzaztcclxuSU1hc2suUGF0dGVybk1hc2sgPSBQYXR0ZXJuTWFzaztcclxud2luZG93LklNYXNrID0gSU1hc2s7XHJcbiJdLCJuYW1lcyI6WyJpc1N0cmluZyIsInN0ciIsIlN0cmluZyIsImNvbmZvcm0iLCJyZXMiLCJmYWxsYmFjayIsIkJhc2VNYXNrIiwiZWwiLCJvcHRzIiwibWFzayIsIl9saXN0ZW5lcnMiLCJfcmVmcmVzaGluZ0NvdW50Iiwic2F2ZVN0YXRlIiwiYmluZCIsInByb2Nlc3NJbnB1dCIsIl9vbkRyb3AiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInVuYmluZEV2ZW50cyIsImxlbmd0aCIsImV2IiwiX29sZFZhbHVlIiwidmFsdWUiLCJfb2xkU2VsZWN0aW9uIiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJpbnB1dFZhbHVlIiwiY3Vyc29yUG9zIiwiZGV0YWlscyIsInJlc29sdmUiLCJzZXRTZWxlY3Rpb25SYW5nZSIsImZpcmVFdmVudCIsImhhbmRsZXIiLCJwdXNoIiwiaEluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImxpc3RlbmVycyIsImZvckVhY2giLCJsIiwiX29sZFJhd1ZhbHVlIiwiX29sZFVubWFza2VkVmFsdWUiLCJ1bm1hc2tlZFZhbHVlIiwicmF3VmFsdWUiLCJyZWZyZXNoIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzdGFydFJlZnJlc2giLCJlbmRSZWZyZXNoIiwiUmVnRXhwTWFzayIsInRlc3QiLCJGdW5jTWFzayIsIlBhdHRlcm5NYXNrIiwicGxhY2Vob2xkZXIiLCJkZWZpbml0aW9ucyIsIkRFRklOSVRJT05TIiwiX2hvbGxvd3MiLCJfYnVpbGRSZXNvbHZlcnMiLCJfYWxpZ25DdXJzb3IiLCJfY2hhckRlZnMiLCJwYXR0ZXJuIiwidW5tYXNraW5nQmxvY2siLCJvcHRpb25hbEJsb2NrIiwiaSIsImNoIiwidHlwZSIsIkRFRl9UWVBFUyIsIklOUFVUIiwiRklYRUQiLCJ1bm1hc2tpbmciLCJvcHRpb25hbCIsIl9yZXNvbHZlcnMiLCJkZWZLZXkiLCJJTWFzayIsIk1hc2tGYWN0b3J5IiwidGFpbCIsInBsYWNlaG9sZGVyQnVmZmVyIiwiaG9sbG93cyIsInNsaWNlIiwiY2kiLCJkaSIsIl9tYXBQb3NUb0RlZkluZGV4IiwiZGVmIiwicmVzb2x2ZXIiLCJjaGFyIiwiY2hyZXMiLCJfcGxhY2Vob2xkZXIiLCJmcm9tUG9zIiwiaW5wdXQiLCJfaXNIaWRkZW5Ib2xsb3ciLCJkZWZJbmRleCIsImZpbHRlciIsImgiLCJfaG9sbG93c0JlZm9yZSIsInBvcyIsImxhc3RIb2xsb3dJbmRleCIsImhlYWQiLCJpbnNlcnRlZCIsImluc2VydFN0ZXBzIiwib2xkU2VsZWN0aW9uIiwib2xkVmFsdWUiLCJzdGFydENoYW5nZVBvcyIsIk1hdGgiLCJtaW4iLCJzdGFydCIsInJlbW92ZWRDb3VudCIsIm1heCIsImVuZCIsImluc2VydGVkQ291bnQiLCJzdWJzdHJpbmciLCJzdWJzdHIiLCJ0YWlsSW5wdXQiLCJfZXh0cmFjdElucHV0IiwiX2dlbmVyYXRlSW5zZXJ0U3RlcHMiLCJpc3RlcCIsInN0ZXAiLCJyZXN1bHQiLCJfdHJ5QXBwZW5kVGFpbCIsImFwcGVuZGVkIiwiX2FwcGVuZEZpeGVkRW5kIiwiaGFzSG9sbG93cyIsIl9hcHBlbmRQbGFjZWhvbGRlckVuZCIsImlzQ29tcGxldGUiLCJzaG93IiwiY3Vyc29yRGVmSW5kZXgiLCJyUG9zIiwickRlZiIsImxQb3MiLCJsRGVmIiwiX21hcERlZkluZGV4VG9Qb3MiLCJ1bm1hc2tlZCIsInBoIiwiREVGQVVMVF9QTEFDRUhPTERFUiIsIm1hcCIsImpvaW4iLCJfZGVmaW5pdGlvbnMiLCJkZWZzIiwiX21hc2siLCJpbml0aWFsaXplZCIsImJpbmRFdmVudHMiLCJSZWdFeHAiLCJGdW5jdGlvbiIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsU0FBU0EsUUFBVCxDQUFtQkMsR0FBbkIsRUFBd0I7U0FDZixPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsZUFBZUMsTUFBakQ7OztBQUdGLEFBQ0EsU0FBU0MsT0FBVCxDQUFrQkMsR0FBbEIsRUFBdUJILEdBQXZCLEVBQXlDO01BQWJJLFFBQWEsdUVBQUosRUFBSTs7U0FDaENMLFNBQVNJLEdBQVQsSUFDTEEsR0FESyxHQUVMQSxNQUNFSCxHQURGLEdBRUVJLFFBSko7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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