// @flow
import {conform, DIRECTION, indexInDirection, type Direction} from '../core/utils.js';
import ChangeDetails from '../core/change-details.js';
import Masked, {type AppendFlags, type ExtractFlags, type MaskedOptions} from './base.js';
import PatternDefinition from './pattern/definition.js';
import PatternGroup, {type PatternGroupTemplate} from './pattern/group.js';
import {ChunksTailDetails, type TailInputChunk} from './pattern/chunk-tail-details.js';
import {type TailDetails} from '../core/tail-details.js';


type MaskedPatternOptions = {
  ...MaskedOptions<string>,
  definitions: $PropertyType<MaskedPattern, 'definitions'>,
  groups: $PropertyType<MaskedPattern, 'groups'>,
  placeholderChar: $PropertyType<MaskedPattern, 'placeholderChar'>,
  lazy: $PropertyType<MaskedPattern, 'lazy'>,
};
type InputChunk = [?number, string];


/**
  Pattern mask
  @param {Object} opts
  @param {Object} opts.groups
  @param {Object} opts.definitions
  @param {string} opts.placeholderChar
  @param {boolean} opts.lazy
*/
export default
class MaskedPattern extends Masked<string> {
  static DEFAULTS: any;
  static STOP_CHAR: string;
  static ESCAPE_CHAR: string;
  static Definition: Class<PatternDefinition>;
  static Group: Class<PatternGroup>;

  /** */
  groups: {[string]: PatternGroupTemplate};
  /** */
  definitions: {[string]: any};  // TODO mask type
  /** Single char for empty input */
  placeholderChar: string;
  /** Show placeholder only when needed */
  lazy: boolean;
  _charDefs: Array<PatternDefinition>;
  _groupDefs: Array<PatternGroup>;

  constructor (opts: any={}) {  // TODO type $Shape<MaskedPatternOptions>={} does not work
    opts.definitions = Object.assign({}, PatternDefinition.DEFAULTS, opts.definitions);
    super({
      ...MaskedPattern.DEFAULTS,
      ...opts
    });
  }

  /**
    @override
    @param {Object} opts
  */
  _update (opts: $Shape<MaskedPatternOptions>={}) {
    opts.definitions = Object.assign({}, this.definitions, opts.definitions);
    super._update(opts);
    this._rebuildMask();
  }

  /** */
  _rebuildMask () {
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
            validate: group.validate,
          }));
          pattern = pattern.replace(gName, group.mask);
        }
      }

      let char = pattern[i];
      let type = char in defs ?
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

  /**
    @override
  */
  doValidate (...args: *) {
    return this._groupDefs.every(g => g.doValidate(...args)) && super.doValidate(...args);
  }

  /**
    @override
  */
  clone () {
    const m = new MaskedPattern(this);
    m._value = this.value;
    // $FlowFixMe
    m._charDefs.forEach((d, i) => Object.assign(d, this._charDefs[i]));
    // $FlowFixMe
    m._groupDefs.forEach((d, i) => Object.assign(d, this._groupDefs[i]));
    return m;
  }

  /**
    @override
  */
  reset () {
    super.reset();
    this._charDefs.forEach(d => {delete d.isHollow;});
  }

  /**
    @override
  */
  get isComplete (): boolean {
    return !this._charDefs.some((d, i) =>
      d.isInput && !d.optional && (d.isHollow || !this.extractInput(i, i+1)));
  }

  /** */
  hiddenHollowsBefore (defIndex: number): number {
    return this._charDefs
      .slice(0, defIndex)
      .filter(d => d.isHiddenHollow)
      .length;
  }

  /** Map definition index to position on view */
  mapDefIndexToPos (defIndex: number): number {
    return defIndex - this.hiddenHollowsBefore(defIndex);
  }

  /** Map position on view to definition index */
  mapPosToDefIndex (pos: number): number {
    let defIndex = pos;
    for (let di=0; di<this._charDefs.length; ++di) {
      const def = this._charDefs[di];
      if (di >= defIndex) break;
      if (def.isHiddenHollow) ++defIndex;
    }
    return defIndex;
  }

  /**
    @override
  */
  get unmaskedValue (): string {
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

  set unmaskedValue (unmaskedValue: string) {
    super.unmaskedValue = unmaskedValue;
  }

  /**
    @override
  */
  _appendTail (tail?: ChunksTailDetails | TailDetails): ChangeDetails {
    const details = new ChangeDetails();
    if (tail) {
      details.aggregate(tail instanceof ChunksTailDetails ?
        this._appendChunks(tail.chunks, {tail: true}) :
        super._appendTail(tail));
    }
    return details.aggregate(this._appendPlaceholder());
  }

  /**
    @override
  */
  _append (str: string, flags: AppendFlags={}): ChangeDetails {
    const oldValueLength = this.value.length;
    let rawInserted = '';
    let overflow = false;

    str = this.doPrepare(str, flags);

    for (let ci=0, di=this.mapPosToDefIndex(this.value.length); ci < str.length;) {
      const ch = str[ci];
      const def = this._charDefs[di];

      // check overflow
      if (def == null) {
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
          if (!def.optional && !flags.input && !this.lazy) {
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

  /** Appends chunks splitted by stop chars */
  _appendChunks (chunks: Array<TailInputChunk>, ...args: *) {
    const details = new ChangeDetails();
    for (let ci=0; ci < chunks.length; ++ci) {
      const {stop, value} = chunks[ci];
      const fromDef = stop != null && this._charDefs[stop];
      // lets double check if stopAlign is here
      if (fromDef && fromDef.stopAlign) details.aggregate(this._appendPlaceholder(stop));
      if (details.aggregate(this._append(value, ...args)).overflow) break;
    }
    return details;
  }

  /**
    @override
  */
  _extractTail (fromPos: number=0, toPos: number=this.value.length): ChunksTailDetails {
    return new ChunksTailDetails(this._extractInputChunks(fromPos, toPos));
  }

  /**
    @override
  */
  extractInput (fromPos: number=0, toPos: number=this.value.length, flags: ExtractFlags={}): string {
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

  /** Extracts chunks from input splitted by stop chars */
  _extractInputChunks (fromPos: number=0, toPos: number=this.value.length): Array<TailInputChunk> {
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

    return stops.map((s, i) => ({
      stop: stopDefIndices.indexOf(s) >= 0 ?
        s :
        null,

      value: this.extractInput(
        this.mapDefIndexToPos(s),
        this.mapDefIndexToPos(stops[++i]))
    })).filter(({stop, value}) => stop != null || value);
  }

  /** Appends placeholder depending on laziness */
  _appendPlaceholder (toDefIndex: ?number): ChangeDetails {
    const oldValueLength = this.value.length;
    const maxDefIndex = toDefIndex || this._charDefs.length;
    for (let di=this.mapPosToDefIndex(this.value.length); di < maxDefIndex; ++di) {
      const def = this._charDefs[di];
      if (def.isInput) def.isHollow = true;

      if (!this.lazy || toDefIndex) {
        this._value += !def.isInput && def.char != null ?
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

  /**
    @override
  */
  remove (from: number=0, count: number=this.value.length-from): ChangeDetails {
    const fromDefIndex = this.mapPosToDefIndex(from);
    const toDefIndex = this.mapPosToDefIndex(from + count);
    this._charDefs
      .slice(fromDefIndex, toDefIndex)
      .forEach(d => d.reset());

    return super.remove(from, count);
  }

  /**
    @override
  */
  nearestInputPos (cursorPos: number, direction: Direction=DIRECTION.NONE) {
    let step = direction || DIRECTION.RIGHT;

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
        if (firstInputIndex == null && nextDef.isInput) {
          firstInputIndex = di;
          if (direction === DIRECTION.NONE) break;
        }
        if (firstVisibleHollowIndex == null && nextDef.isHollow && !nextDef.isHiddenHollow) firstVisibleHollowIndex = di;
        if (nextDef.isInput && !nextDef.isHollow) {
          firstFilledInputIndex = di;
          break;
        }
      }
    }

    // for lazy if has aligned left inside fixed and has came to the start - use start position
    if (direction === DIRECTION.LEFT && di === 0 && this.lazy &&
      (!initialDef || !initialDef.isInput)) firstInputIndex = 0;

    if (direction === DIRECTION.LEFT || firstInputIndex == null) {
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

  /** Get group by name */
  group (name: string): ?PatternGroup {
    return this.groupsByName(name)[0];
  }

  /** Get all groups by name */
  groupsByName (name: string): Array<PatternGroup> {
    return this._groupDefs.filter(g => g.name === name);
  }
}
MaskedPattern.DEFAULTS = {
  lazy: true,
  placeholderChar: '_'
};
MaskedPattern.STOP_CHAR = '`';
MaskedPattern.ESCAPE_CHAR = '\\';
MaskedPattern.Definition = PatternDefinition;
MaskedPattern.Group = PatternGroup;
