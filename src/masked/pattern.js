import {conform, DIRECTION, indexInDirection, refreshValueOnSet} from '../core/utils';
import Masked from './base';
import PatternDefinition from './pattern/definition';


export default
class MaskedPattern extends Masked {
  constructor (opts) {
    const {definitions, placeholder} = opts;
    super(opts);
    delete this.isInitialized;

    this.placeholder = placeholder;
    this.definitions = definitions;

    this.isInitialized = true;
  }

  get placeholder () {
    return this._placeholder;
  }

  @refreshValueOnSet
  set placeholder (ph) {
    this._placeholder = {
      ...MaskedPattern.DEFAULT_PLACEHOLDER,
      ...ph
    };
  }

  get definitions () {
    return this._definitions;
  }

  @refreshValueOnSet
  set definitions (defs) {
    defs = {
      ...PatternDefinition.DEFAULTS,
      ...defs
    };

    this._definitions = defs;
    this._updateMask();
  }

  get mask () {
    return this._mask;
  }

  @refreshValueOnSet
  set mask (mask) {
    this._mask = mask;
    this._updateMask();
  }

  _updateMask () {
    const defs = this._definitions;
    this._charDefs = [];

    const pattern = this.mask;
    if (!pattern || !defs) return;

    let unmaskingBlock = false;
    let optionalBlock = false;
    let stopAlign = false;
    for (let i=0; i<pattern.length; ++i) {
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
        // TODO validation
        if (!char) break;
        type = PatternDefinition.TYPES.FIXED;
      }

      this._charDefs.push(new PatternDefinition({
        char,
        type,
        optional,
        stopAlign,
        mask: unmasking &&
          (type === PatternDefinition.TYPES.INPUT ?
            defs[char] :
            (m => m.value === char))
      }));

      stopAlign = false;
    }
  }

  clone () {
    const m = new MaskedPattern(this);
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
      if (def.mask && !def.isHollow) unmasked += ch;
      ++ci;
    }

    return unmasked;
  }

  _appendTail (tail) {
    return (!tail || this.appendChunks(tail)) && this._appendPlaceholder();
  }

  append (str, soft) {
    const oldValueLength = this.value.length;

    for (let ci=0, di=this.mapPosToDefIndex(this.value.length); ci < str.length;) {
      const ch = str[ci];
      const def = this._charDefs[di];

      // check overflow
      if (!def) return false;

      // reset
      def.isHollow = false;

      let resolved, skipped;
      let chres = conform(def.resolve(ch), ch);

      if (def.type === PatternDefinition.TYPES.INPUT) {
        if (chres) {
          const m = this.clone();
          this._value += chres;
          if (!this._validate()) {
            chres = '';
            Object.assign(this, m);
          }
        }

        resolved = !!chres;
        skipped = !chres && !def.optional;

        // if ok - next di
        if (!chres) {
          if (!def.optional && !soft) {
            this._value += this.placeholder.char;
            skipped = false;
          }
          if (!skipped) def.isHollow = true;
        }
      } else {
        this._value += def.char;
        resolved = chres && (def.mask || soft);
      }

      if (!skipped) ++di;
      if (resolved || skipped) ++ci;
    }

    return this.value.length - oldValueLength;
  }

  appendChunks (chunks, soft) {
    for (let ci=0; ci < chunks.length; ++ci) {
      const [fromDefIndex, input] = chunks[ci];
      if (fromDefIndex != null) this._appendPlaceholder(fromDefIndex);
      if (this.append(input, soft) === false) return false;
    }
    return true;
  }

  _extractTail (fromPos, toPos) {
    return this.extractInputChunks(fromPos, toPos);
  }

  extractInput (fromPos=0, toPos=this.value.length) {
    // TODO fromPos === toPos
    const str = this.value;
    let input = '';

    const toDefIndex = this.mapPosToDefIndex(toPos);
    for (let ci=fromPos, di=this.mapPosToDefIndex(fromPos); ci<toPos && di < toDefIndex; ++di) {
      const ch = str[ci];
      const def = this._charDefs[di];

      if (!def) break;
      if (def.isHiddenHollow) continue;

      if (def.isInput && !def.isHollow) input += ch;
      ++ci;
    }
    return input;
  }

  extractInputChunks (fromPos=0, toPos=this.value.length) {
    // TODO fromPos === toPos
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
    const maxDefIndex = toDefIndex || this._charDefs.length;
    for (let di=this.mapPosToDefIndex(this.value.length); di < maxDefIndex; ++di) {
      const def = this._charDefs[di];
      if (def.isInput) def.isHollow = true;

      if (this.placeholder.show === 'always' || toDefIndex) {
        this._value += !def.isInput ?
          def.char :
          !def.optional ?
            this.placeholder.char :
            '';
      }
    }
  }

  clear (from=0, to=this.value.length) {
    this._value = this.value.slice(0, from) + this.value.slice(to);
    const fromDefIndex = this.mapPosToDefIndex(from);
    const toDefIndex = this.mapPosToDefIndex(to);
    this._charDefs
      .slice(fromDefIndex, toDefIndex)
      .forEach(d => d.reset());
  }

   nearestInputPos (cursorPos, direction=DIRECTION.LEFT) {
    if (!direction) return cursorPos;

    const initialDefIndex = this.mapPosToDefIndex(cursorPos);
    let di = initialDefIndex;

    let firstInputIndex,
        firstFilledInputIndex,
        firstVisibleHollowIndex,
        nextdi;

    // search forward
    for (nextdi = indexInDirection(di, direction); 0 <= nextdi && nextdi < this._charDefs.length; di += direction, nextdi += direction) {
      const nextDef = this._charDefs[nextdi];
      if (firstInputIndex == null && nextDef.isInput) firstInputIndex = di;
      if (firstVisibleHollowIndex == null && nextDef.isHollow && !nextDef.isHiddenHollow) firstVisibleHollowIndex = di;
      if (nextDef.isInput && !nextDef.isHollow) {
        firstFilledInputIndex = di;
        break;
      }
    }

    if (direction === DIRECTION.LEFT || firstInputIndex == null) {
      // search backwards
      direction = -direction;
      let overflow = false;

      // find hollows only before initial pos
      for (nextdi = indexInDirection(di, direction);
        0 <= nextdi && nextdi < this._charDefs.length;
        di += direction, nextdi += direction)
      {
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
}

MaskedPattern.DEFAULT_PLACEHOLDER = {
  show: 'lazy',
  char: '_'
};
MaskedPattern.STOP_CHAR = '`';
MaskedPattern.ESCAPE_CHAR = '\\';
MaskedPattern.Definition = PatternDefinition;
