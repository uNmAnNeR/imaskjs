import {conform} from '../utils';
import PatternDefinition from './pattern-definition';
import Masked from './masked';


export default
class PatternMasked extends Masked {
  constructor (opts) {
    var {definitions, placeholder} = opts;
    super(opts);

    this.placeholder = placeholder;
    this.definitions = definitions;
  }

  get placeholder () { return this._placeholder; }

  set placeholder (ph) {
    this._placeholder = {
      ...PatternMasked.DEFAULT_PLACEHOLDER,
      ...ph
    };
  }

  get definitions () {
    return this._definitions;
  }

  set definitions (defs) {
    defs = {
      ...PatternDefinition.DEFAULTS,
      ...defs
    };

    this._definitions = defs;
    this._charDefs = [];
    this._alignStops = [];

    var pattern = this.mask;
    if (!pattern || !defs) return;

    var unmaskingBlock = false;
    var optionalBlock = false;
    for (var i=0; i<pattern.length; ++i) {
      var char = pattern[i];
      var type = !unmaskingBlock && char in defs ?
        PatternDefinition.TYPES.INPUT :
        PatternDefinition.TYPES.FIXED;
      var unmasking = type === PatternDefinition.TYPES.INPUT || unmaskingBlock;
      var optional = type === PatternDefinition.TYPES.INPUT && optionalBlock;

      if (char === PatternMasked.STOP_CHAR) {
        this._alignStops.push(this._charDefs.length);
        continue;
      }

      if (char === '{' || char === '}') {
        unmaskingBlock = !unmaskingBlock;
        continue;
      }

      if (char === '[' || char === ']') {
        optionalBlock = !optionalBlock;
        continue;
      }

      if (char === PatternMasked.ESCAPE_CHAR) {
        ++i;
        char = pattern[i];
        // TODO validation
        if (!char) break;
        type = PatternDefinition.TYPES.FIXED;
      }

      this._charDefs.push(new PatternDefinition({
        char,
        type,
        optional,
        mask: unmasking &&
          (type === PatternDefinition.TYPES.INPUT ?
            defs[char] :
            (ch => ch === char))
      }));
    }
  }

  get mask () {
    return this._mask;
  }

  set mask (mask) {
    this._mask = mask;
    if (this.value) this.definitions = this.definitions;
  }

  clone () {
    var m = new PatternMasked(this);
    m._value = this.value.slice();
    m._charDefs.forEach((d, i) => Object.assign(d, this._charDefs[i]));
    return m;
  }

  reset () {
    super.reset();
    this._charDefs.forEach(d => {delete d.isHollow;});
  }

  get isComplete () {
    return !this._charDefs.some(d =>
      d.isInput && !d.optional && d.isHollow);
  }

  hiddenHollowsBefore (defIndex) {
    return this._charDefs
      .slice(0, defIndex)
      .filter(d => d.isHiddenHollow)
      .length;
  }

  mapDefIndexToPos (defIndex) {
    return defIndex - this.hiddenHollowsBefore(defIndex);
  }

  mapPosToDefIndex (pos) {
    var defIndex = pos;
    for (var di=0; di<this._charDefs.length; ++di) {
      var def = this._charDefs[di];
      if (di >= defIndex) break;
      if (def.isHiddenHollow) ++defIndex;
    }
    return defIndex;
  }

  _unmask () {
    var str = this.value;
    var unmasked = '';
    for (var ci=0, di=0; ci<str.length; ++di) {
      var ch = str[ci];
      var def = this.def(di, str);

      if (!def) break;
      if (this.isHiddenHollow(di)) continue;

      if (def.unmasking && !def.isHollow &&
        (this.isInput(di) && this._resolvers[def.char].resolve(ch, ci, str) ||
          def.char === ch)) {
        unmasked += ch;
      }
      ++ci;
    }
    return unmasked;
  }

  _appendTail (tail) {
    return this.appendChunks(tail);
  }

  append (str, skipUnresolvedInput=true) {
    var oldValueLength = this.value.length;
    for (var ci=0, di=this.mapPosToDefIndex(this.value.length); ci < str.length;) {
      var ch = str[ci];
      var def = this._charDefs[di];

      // check overflow
      if (!def) return false;

      if (def.isHollow) {
        // TODO check other cases
        ++di;
        continue;
      }

      var resolved, skipped;
      var chres = conform(def.resolve(ch), ch);
      if (def.type === PatternDefinition.TYPES.INPUT) {
        if (chres) {
          var m = this.clone();
          this.value += chres;
          if (!this._validate()) {
            chres = '';
            Object.assign(this, m);
          }
        }

        resolved = !!chres;
        skipped = !chres && !def.optional;

        // if ok - next di
        if (!chres) {
          if (!def.optional && skipUnresolvedInput) {
            this._value += this._placeholder.char;
            skipped = false;
          }
          if (!skipped) def.isHollow = true;
        }
      } else {
        this._value += def.char;
        resolved = chres && (def.mask || !skipUnresolvedInput);
      }

      if (!skipped) ++di;
      if (resolved || skipped) ++ci;
    }

    this._appendPlaceholder();
    return this.value.length - oldValueLength;
  }

  appendChunks (chunks, skipUnresolvedInput) {
    for (var ci=0; ci < chunks.length; ++ci) {
      var [, input] = chunks[ci];
      if (this.append(input, skipUnresolvedInput) === false) return false;

      // not last - append placeholder between stops
      // var chunk2 = chunks[ci+1];
      // var stop2 = chunk2 && chunk2[0];
      // if (stop2) str = this._appendPlaceholder(str, stop2);
    }
    return true;
  }

  _extractTail (fromPos, toPos) {
    return this.extractInputChunks(fromPos, toPos);
  }

  extractInput (fromPos=0, toPos=this.value.length) {
    // TODO fromPos === toPos
    var str = this.value;
    var input = '';

    var toDefIndex = this.mapPosToDefIndex(toPos);
    for (var ci=0, di=this.mapPosToDefIndex(fromPos); ci<str.length && di < toDefIndex; ++di) {
      var ch = str[ci];
      var def = this._charDefs[di];

      if (!def) break;
      if (def.isHiddenHollow) continue;

      if (def.isInput && !def.isHollow) input += ch;
      ++ci;
    }
    return input;
  }

  extractInputChunks (fromPos=0, toPos=this.value.length) {
    // TODO fromPos === toPos
    var fromDefIndex = this.mapPosToDefIndex(fromPos);
    var toDefIndex = this.mapPosToDefIndex(toPos);
    var stops = [
      fromPos,
      ...this._alignStops
        .filter(s => fromDefIndex <= s && s < toDefIndex)
        .map(s => this._mapDefIndexToPos(s)),
      toPos
    ];
    var str = this.value;
    var chunks = [];
    for (var si=0; si<stops.length && str; ++si) {
      var s = stops[si];
      var s2 = stops[si+1];
      chunks.push([s, this.extractInput(s, s2)]);
      if (s2) str = str.slice(s2 - s);
    }
    return chunks;
  }

  _appendPlaceholder (toPos) {
    var toDefIndex = this.mapPosToDefIndex(toPos);
    for (var di=this.mapPosToDefIndex(this.value.length); di < toDefIndex; ++di) {
      var def = this.def(di, this.value);
      if (!def) break;

      if (this.isInput(di) && !this.isHollow(di)) {
        def.isHollow = true;
      }
      if (this._placeholder.show === 'always' || toPos) {
        this._value += def.type === PatternDefinition.TYPES.FIXED ?
          def.char :
          !def.optional ?
            this._placeholder.char :
            '';
      }
    }
  }

  _installDefinitions () {
    for (var defKey in this.definitions) {
      this._resolvers[defKey] = IMask.MaskFactory(this.el, {
        mask: this.definitions[defKey]
      });
    }
  }

  clear (from=0, to=this.value.length) {
    this._value = this.value.slice(0, from) + this.value.slice(to);
    var fromDefIndex = this.mapPosToDefIndex(from);
    var toDefIndex = this.mapPosToDefIndex(to);
    this._charDefs.splice(fromDefIndex, toDefIndex - fromDefIndex);
  }
}

PatternMasked.DEFAULT_PLACEHOLDER = {
  show: 'lazy',
  char: '_'
};
PatternMasked.STOP_CHAR = '\'';
PatternMasked.ESCAPE_CHAR = '\\';
