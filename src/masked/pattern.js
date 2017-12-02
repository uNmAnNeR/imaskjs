import {conform, DIRECTION, indexInDirection} from '../core/utils.js';
import ChangeDetails from '../core/change-details.js';
import Masked from './base.js';
import PatternDefinition from './pattern/definition.js';
import PatternGroup from './pattern/group.js';


export default
class MaskedPattern extends Masked {
  constructor (opts={}) {
    opts.definitions = Object.assign({}, PatternDefinition.DEFAULTS, opts.definitions);
    super({
      ...MaskedPattern.DEFAULTS,
      ...opts
    });
  }

  _update (opts) {
    opts.definitions = Object.assign({}, this.definitions, opts.definitions);
    if (opts.placeholder) {
      console.warn("'placeholder' option is deprecated and will be removed in next release, use 'placeholderChar' and 'placeholderLazy' instead.");
      if ('char' in opts.placeholder) opts.placeholderChar = opts.placeholder.char;
      if ('lazy' in opts.placeholder) opts.placeholderLazy = opts.placeholder.lazy;
    }
    super._update(opts);
    this._updateMask();
  }

  _updateMask () {
    const defs = this.definitions;
    this._charDefs = [];
    this._groupDefs = [];

    let pattern = this.mask;
    if (!pattern || !defs) return;

    let unmaskingBlock = false;
    let optionalBlock = false;
    let stopAlign = false;

    for (let i=0; i<pattern.length; ++i) {
      if (this.groups) {
        const p = pattern.slice(i);
        const gNames = Object.keys(this.groups).filter(gName => p.indexOf(gName) === 0);
        // order by key length
        gNames.sort((a, b) => b.length - a.length);
        // use group name with max length
        const gName = gNames[0];
        if (gName) {
          const group = this.groups[gName];
          this._groupDefs.push(new PatternGroup(this, {
            name: gName,
            offset: this._charDefs.length,
            mask: group.mask,
            validate: group.validate
          }));
          pattern = pattern.replace(gName, group.mask);
        }
      }

      let char = pattern[i];
      let type = !unmaskingBlock && char in defs ?
        PatternDefinition.TYPES.INPUT :
        PatternDefinition.TYPES.FIXED;
      const unmasking = type === PatternDefinition.TYPES.INPUT || unmaskingBlock;
      const optional = type === PatternDefinition.TYPES.INPUT && optionalBlock;

      if (char === MaskedPattern.STOP_CHAR) {
        stopAlign = true;
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

      if (char === MaskedPattern.ESCAPE_CHAR) {
        ++i;
        char = pattern[i];
        if (!char) break;
        type = PatternDefinition.TYPES.FIXED;
      }

      this._charDefs.push(new PatternDefinition({
        char,
        type,
        optional,
        stopAlign,
        unmasking,
        mask: type === PatternDefinition.TYPES.INPUT ?
          defs[char] :
          (value => value === char)
      }));

      stopAlign = false;
    }
  }

  doValidate (...args) {
    return this._groupDefs.every(g => g.doValidate(...args)) && super.doValidate(...args);
  }

  clone () {
    const m = new MaskedPattern(this);
    m._value = this.value;
    m._charDefs.forEach((d, i) => Object.assign(d, this._charDefs[i]));
    m._groupDefs.forEach((d, i) => Object.assign(d, this._groupDefs[i]));
    return m;
  }

  reset () {
    super.reset();
    this._charDefs.forEach(d => {delete d.isHollow;});
  }

  get isComplete () {
    return !this._charDefs.some((d, i) =>
      d.isInput && !d.optional && (d.isHollow || !this.extractInput(i, i+1)));
  }

  hiddenHollowsBefore (defIndex) {
    return this._charDefs
      .slice(0, defIndex)
      .filter(d => d.isHiddenHollow)
      .length;
  }

  mapDefIndexToPos (defIndex) {
    if (defIndex == null) return;
    return defIndex - this.hiddenHollowsBefore(defIndex);
  }

  mapPosToDefIndex (pos) {
    if (pos == null) return;
    let defIndex = pos;
    for (let di=0; di<this._charDefs.length; ++di) {
      const def = this._charDefs[di];
      if (di >= defIndex) break;
      if (def.isHiddenHollow) ++defIndex;
    }
    return defIndex;
  }

  _unmask () {
    const str = this.value;
    let unmasked = '';

    for (let ci=0, di=0; ci<str.length && di<this._charDefs.length; ++di) {
      const ch = str[ci];
      const def = this._charDefs[di];

      if (def.isHiddenHollow) continue;
      if (def.unmasking && !def.isHollow) unmasked += ch;
      ++ci;
    }

    return unmasked;
  }

  _appendTail (tail=[]) {
    return this._appendChunks(tail, {tail: true}).aggregate(this._appendPlaceholder());
  }

  _append (str, flags={}) {
    const oldValueLength = this.value.length;
    let rawInserted = '';
    let overflow = false;

    str = this.doPrepare(str, flags);

    for (let ci=0, di=this.mapPosToDefIndex(this.value.length); ci < str.length;) {
      const ch = str[ci];
      const def = this._charDefs[di];

      // check overflow
      if (!def) {
        overflow = true;
        break;
      }

      // reset
      def.isHollow = false;

      let resolved, skipped;
      let chres = conform(def.resolve(ch), ch);

      if (def.type === PatternDefinition.TYPES.INPUT) {
        if (chres) {
          this._value += chres;
          if (!this.doValidate()) {
            chres = '';
            this._value = this.value.slice(0, -1);
          }
        }

        resolved = !!chres;
        skipped = !chres && !def.optional;

        if (!chres) {
          if (!def.optional && !flags.input) {
            this._value += this.placeholderChar;
            skipped = false;
          }
          if (!skipped) def.isHollow = true;
        } else {
          rawInserted += chres;
        }
      } else {
        this._value += def.char;
        resolved = chres && (def.unmasking || flags.input || flags.raw) && !flags.tail;
        def.isRawInput = resolved && (flags.raw || flags.input);
        if (def.isRawInput) rawInserted += def.char;
      }

      if (!skipped) ++di;
      if (resolved || skipped) ++ci;
    }

    return new ChangeDetails({
      inserted: this.value.slice(oldValueLength),
      rawInserted,
      overflow
    });
  }

  _appendChunks (chunks, ...args) {
    const details = new ChangeDetails();
    for (let ci=0; ci < chunks.length; ++ci) {
      const [fromDefIndex, input] = chunks[ci];
      if (fromDefIndex != null) details.aggregate(this._appendPlaceholder(fromDefIndex));
      if (details.aggregate(this._append(input, ...args)).overflow) break;
    }
    return details;
  }

  _extractTail (fromPos, toPos) {
    return this._extractInputChunks(fromPos, toPos);
  }

  extractInput (fromPos=0, toPos=this.value.length, flags={}) {
    if (fromPos === toPos) return '';

    const str = this.value;
    let input = '';

    const toDefIndex = this.mapPosToDefIndex(toPos);
    for (
      let ci=fromPos, di=this.mapPosToDefIndex(fromPos);
      ci<toPos && ci<str.length && di < toDefIndex;
      ++di
    ) {
      const ch = str[ci];
      const def = this._charDefs[di];

      if (!def) break;
      if (def.isHiddenHollow) continue;

      if (def.isInput && !def.isHollow ||
        flags.raw && !def.isInput && def.isRawInput) input += ch;
      ++ci;
    }
    return input;
  }

  _extractInputChunks (fromPos=0, toPos=this.value.length) {
    if (fromPos === toPos) return [];

    const fromDefIndex = this.mapPosToDefIndex(fromPos);
    const toDefIndex = this.mapPosToDefIndex(toPos);
    const stopDefIndices = this._charDefs
      .map((d, i) => [d, i])
      .slice(fromDefIndex, toDefIndex)
      .filter(([d]) => d.stopAlign)
      .map(([, i]) => i);

    const stops = [
      fromDefIndex,
      ...stopDefIndices,
      toDefIndex
    ];

    return stops.map((s, i) => [
      stopDefIndices.indexOf(s) >= 0 ?
        s :
        null,

      this.extractInput(
        this.mapDefIndexToPos(s),
        this.mapDefIndexToPos(stops[++i]))
    ]).filter(([stop, input]) => stop != null || input);
  }

  _appendPlaceholder (toDefIndex) {
    const oldValueLength = this.value.length;
    const maxDefIndex = toDefIndex || this._charDefs.length;
    for (let di=this.mapPosToDefIndex(this.value.length); di < maxDefIndex; ++di) {
      const def = this._charDefs[di];
      if (def.isInput) def.isHollow = true;

      if (!this.placeholderLazy || toDefIndex) {
        this._value += !def.isInput ?
          def.char :
          !def.optional ?
            this.placeholderChar :
            '';
      }
    }
    return new ChangeDetails({
      inserted: this.value.slice(oldValueLength)
    });
  }

  remove (from=0, count=this.value.length-from) {
    const to = from + count;
    this._value = this.value.slice(0, from) + this.value.slice(to);
    const fromDefIndex = this.mapPosToDefIndex(from);
    const toDefIndex = this.mapPosToDefIndex(to);
    this._charDefs
      .slice(fromDefIndex, toDefIndex)
      .forEach(d => d.reset());
  }

  nearestInputPos (cursorPos, direction=DIRECTION.NONE) {
    let step = direction || DIRECTION.LEFT;

    const initialDefIndex = this.mapPosToDefIndex(cursorPos);
    const initialDef = this._charDefs[initialDefIndex];
    let di = initialDefIndex;

    let firstInputIndex,
        firstFilledInputIndex,
        firstVisibleHollowIndex,
        nextdi;

    // check if chars at right is acceptable for LEFT and NONE directions
    if (direction !== DIRECTION.RIGHT && 
      (initialDef && initialDef.isInput ||
        // in none direction latest position is acceptable also
        direction === DIRECTION.NONE && cursorPos === this.value.length)) {
      firstInputIndex = initialDefIndex;
      if (initialDef && !initialDef.isHollow) firstFilledInputIndex = initialDefIndex;
    }

    if ((firstFilledInputIndex == null && direction == DIRECTION.LEFT) || firstInputIndex == null) {
      // search forward
      for (
        nextdi = indexInDirection(di, step);
        0 <= nextdi && nextdi < this._charDefs.length;
        di += step, nextdi += step
      ) {
        const nextDef = this._charDefs[nextdi];
        if (firstInputIndex == null && nextDef.isInput) firstInputIndex = di;
        if (firstVisibleHollowIndex == null && nextDef.isHollow && !nextDef.isHiddenHollow) firstVisibleHollowIndex = di;
        if (nextDef.isInput && !nextDef.isHollow) {
          firstFilledInputIndex = di;
          break;
        }
      }
    }

    // if has aligned left inside fixed and has came to the start - use start position
    if (direction === DIRECTION.LEFT && di === 0 &&
      (!initialDef || !initialDef.isInput)) firstInputIndex = 0;

    if (direction !== DIRECTION.RIGHT || firstInputIndex == null) {
      // search backward
      step = -step;
      let overflow = false;

      // find hollows only before initial pos
      for (
        nextdi = indexInDirection(di, step);
        0 <= nextdi && nextdi < this._charDefs.length;
        di += step, nextdi += step
      ) {
        const nextDef = this._charDefs[nextdi];
        if (nextDef.isInput) {
          firstInputIndex = di;
          if (nextDef.isHollow && !nextDef.isHiddenHollow) break;
        }

        // if hollow not found before start position - set `overflow`
        // and try to find just any input
        if (di === initialDefIndex) overflow = true;

        // first input found
        if (overflow && firstInputIndex != null) break;
      }

      // process overflow
      overflow = overflow || nextdi >= this._charDefs.length;
      if (overflow && firstInputIndex != null) di = firstInputIndex;
    } else if (firstFilledInputIndex == null) {
      // adjust index if delete at right and filled input not found at right
      di = firstVisibleHollowIndex != null ?
        firstVisibleHollowIndex :
        firstInputIndex;
    }

    return this.mapDefIndexToPos(di);
  }

  group (name) {
    return this.groupsByName(name)[0];
  }

  groupsByName (name) {
    return this._groupDefs.filter(g => g.name === name);
  }
}

MaskedPattern.DEFAULTS = {
  placeholderLazy: true,
  placeholderChar: '_'
};
MaskedPattern.STOP_CHAR = '`';
MaskedPattern.ESCAPE_CHAR = '\\';
MaskedPattern.Definition = PatternDefinition;
MaskedPattern.Group = PatternGroup;
