// @flow
import {DIRECTION, indexInDirection, type Direction} from '../core/utils.js';
import ChangeDetails from '../core/change-details.js';
import Masked, {type AppendFlags, type ExtractFlags, type MaskedOptions} from './base.js';
import {DEFAULT_DEFINITIONS, PatternInputDefinition, PatternFixedDefinition, type Definitions} from './pattern/definition.js';
// import PatternGroup, {type PatternGroupTemplate} from './pattern/group.js';
import {ChunksTailDetails, type TailInputChunk} from './pattern/chunk-tail-details.js';
import {type TailDetails} from '../core/tail-details.js';
import PatternBlock from './pattern/block.js';
import createMask from './factory.js';


type MaskedPatternOptions = {
  ...MaskedOptions<string>,
  definitions: $PropertyType<MaskedPattern, 'definitions'>,
  groups: $PropertyType<MaskedPattern, 'groups'>,
  placeholderChar: $PropertyType<MaskedPattern, 'placeholderChar'>,
  lazy: $PropertyType<MaskedPattern, 'lazy'>,
};


// TODO
type Block = PatternBlock | Masked<*>;

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
  static InputDefinition: Class<PatternInputDefinition>;
  static FixedDefinition: Class<PatternFixedDefinition>;
  // static Group: Class<PatternGroup>;

  /** */
  groups: {[string]: Masked<*>};
  /** */
  definitions: Definitions;
  /** Single char for empty input */
  placeholderChar: string;
  /** Show placeholder only when needed */
  lazy: boolean;
  _blocks: Array<Block>;

  constructor (opts: any={}) {  // TODO type $Shape<MaskedPatternOptions>={} does not work
    opts.definitions = Object.assign({}, DEFAULT_DEFINITIONS, opts.definitions);
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
    this._blocks = [];

    let pattern = this.mask;
    if (!pattern || !defs) return;

    let unmaskingBlock = false;
    let optionalBlock = false;
    let isStopAlign = false;

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
          // const groupMasked = createMask(group);
          this._blocks.push(createMask(group));
          i += gName.length - 1;
          continue;
          // pattern = pattern.replace(gName, '');
        }
      }

      let char = pattern[i];
      let isInput = char in defs;

      if (char === MaskedPattern.STOP_CHAR) {
        isStopAlign = true;
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
        isInput = false;
      }

      let def;
      if (isInput) {
        def = new PatternInputDefinition(this, {
          mask: defs[char],
          isStopAlign,
          isOptional: optionalBlock,
        });
        isStopAlign = false;
      } else {
        def = new PatternFixedDefinition(this, {
          char,
          isUnmasking: unmaskingBlock,
        });
      }

      this._blocks.push(def);
    }
  }

  /**
    @override
  */
  // doValidate (...args: *) {
  //   return this._groupDefs.every(g => g.doValidate(...args)) && super.doValidate(...args);
  // }

  /**
    @override
  */
  clone () {
    const m = new MaskedPattern(this);
    m._value = this.value;
    // TODO block should implement clone/assing?
    // $FlowFixMe
    m._blocks.forEach((b, i) => {
      b.assign(this._blocks[i]);
    });
    return m;
  }

  /**
    @override
  */
  reset () {
    super.reset();
    this._blocks.forEach(b => b.reset());
  }

  /**
    @override
  */
  get isComplete (): boolean {
    return this._blocks.every(b => b.isComplete);
  }

  doCommit () {
    this._blocks.forEach(b => b.doCommit());
    // TODO??? is it ok to update it manually?
    this._value = this._blocks.reduce((str, b) => str += b.value, '');
    super.doCommit();
  }

  // /** */
  // hiddenHollowsBefore (defIndex: number): number {
  //   return this._charDefs
  //     .slice(0, defIndex)
  //     .filter(d => d[DEF_KEY].isHiddenHollow)
  //     .length;
  // }

  // /** Map definition index to cursor position */
  // mapDefIndexToPos (defIndex: number): number {
  //   return defIndex - this.hiddenHollowsBefore(defIndex);
  // }

  /** Map cursor position to definition index */
  // mapPosToDefIndex (pos: number): number {
  //   let defIndex = pos;
  //   for (let di=0; di<this._charDefs.length; ++di) {
  //     if (di >= defIndex) break;
  //     const def = this._charDefs[di][DEF_KEY];
  //     if (def.isHiddenHollow) ++defIndex;
  //   }
  //   return defIndex;
  // }

  /**
    @override
  */
  get unmaskedValue (): string {
    return this._blocks.reduce((str, b) => str += b.unmaskedValue, '');
  }

  set unmaskedValue (unmaskedValue: string) {
    super.unmaskedValue = unmaskedValue;
  }

  /**
    @override
  */
  // TODO
  // _appendTail (tail?: ChunksTailDetails | TailDetails): ChangeDetails {
  //   const details = new ChangeDetails();
  //   if (tail) {
  //     details.aggregate(tail instanceof ChunksTailDetails ?
  //       this._appendChunks(tail.chunks, {tail: true}) :
  //       super._appendTail(tail));
  //   }
  //   return details.aggregate(this._appendPlaceholder());
  // }

  /**
    @override
  */
  _appendChar (ch: string, flags: AppendFlags={}): ChangeDetails {
    const blockData = this.mapPosToBlock(this.value.length);
    const details = new ChangeDetails();

    // TODO refactor
    if (!blockData) {
      details.overflow = true;
      return details;
    }

    for (let bi=blockData.index; ; ++bi) {
      const block = this._blocks[bi];

      if (!block) {
        details.overflow = true;
        break;
      }

      const blockDetails = block._append(ch, flags);

      if (!blockDetails.overflow) {
        details.aggregate(blockDetails);
        if (blockDetails.rawInserted) break;
      } else if (!block.value) {
        break;
      }
    }

    return details;
  }

  /**
    @override
  */
  // _append (str: string, flags: AppendFlags={}): ChangeDetails {
  //   const blockData = this.mapPosToBlock(this.value.length);
  //   const details = new ChangeDetails();
  //   if (!blockData) return details;

  //   str = this.doPrepare(str, flags);

  //   for (
  //     let ci=0, bi=blockData.index;
  //     ci < str.length;
  //   ) {
  //     const ch = str[ci];
  //     const block = this._blocks[bi];

  //     if (!block) {
  //       details.overflow = true;
  //       break;
  //     }

  //     const blockDetails = block._append(ch);

  //     // TODO update value
  //     // TODO doValidate

  //     if (!blockDetails.overflow) {
  //       details.aggregate(blockDetails);
  //       if (block.value) ++ci;
  //     }

  //     if (blockDetails.overflow || !Boolean(blockDetails.inserted)) ++bi;
  //   }

  //   return details;

    // for (let ci=0, di=this.mapPosToDefIndex(this.value.length); ci < str.length;) {
    //   const ch = str[ci];
    //   const chMasked = this._charDefs[di];

    //   // check overflow
    //   if (chMasked == null) {
    //     overflow = true;
    //     break;
    //   }
    //   const def = chMasked[DEF_KEY];

    //   // reset
    //   def.isHollow = false;

    //   let resolved, skipped;
    //   let chres = chMasked.resolve(ch);

    //   if (def.type === PatternDefinition.TYPES.INPUT) {
    //     if (chres) {
    //       this._value += chres;
    //       if (!this.doValidate()) {
    //         chres = '';
    //         this._value = this.value.slice(0, -1);
    //       }
    //     }

    //     resolved = Boolean(chres);
    //     skipped = !resolved && !def.isOptional;

    //     if (!resolved) {
    //       if (skipped && !flags.input && !this.lazy) {
    //         this._value += this.placeholderChar;
    //         skipped = false;
    //       }
    //       if (!skipped) def.isHollow = true;
    //     } else {
    //       rawInserted += chres;
    //     }
    //   } else {
    //     this._value += def.char;
    //     resolved = chres && (def.isUnmasking || flags.input || flags.raw) && !flags.tail;
    //     def.isRawInput = resolved && (flags.raw || flags.input);
    //     if (def.isRawInput) rawInserted += def.char;
    //   }

    //   if (!skipped) ++di;
    //   if (resolved || skipped) ++ci;
    // }

    // return new ChangeDetails({
    //   inserted: this.value.slice(oldValueLength),
    //   rawInserted,
    //   overflow
    // });
  // }

  /** Appends chunks splitted by stop chars */
  // _appendChunks (chunks: Array<TailInputChunk>, ...args: *) {
  //   const details = new ChangeDetails();
  //   for (let ci=0; ci < chunks.length; ++ci) {
  //     const {stop, value} = chunks[ci];
  //     const fromMasked = stop != null && this._charDefs[stop];
  //     // lets double check if isStopAlign is here
  //     if (fromMasked && fromMasked[DEF_KEY].isStopAlign) details.aggregate(this._appendPlaceholder(stop));
  //     if (details.aggregate(this._append(value, ...args)).overflow) break;
  //   }
  //   return details;
  // }

  /**
    @override
  */
  // _extractTail (fromPos: number=0, toPos: number=this.value.length): ChunksTailDetails {
  //   return new ChunksTailDetails(this._extractInputChunks(fromPos, toPos));
  // }

  /**
    @override
  */
  extractInput (fromPos: number=0, toPos: number=this.value.length, flags: ExtractFlags={}): string {
    if (fromPos === toPos) return '';

    let input = '';

    this.forEachBlocksInRange(fromPos, toPos, (b, _, fromPos, toPos) => {
      input += b.extractInput(fromPos, toPos, flags);
    });

    return input;
  }

  /** Extracts chunks from input splitted by stop chars */
  // _extractInputChunks (fromPos: number=0, toPos: number=this.value.length): Array<TailInputChunk> {
  //   if (fromPos === toPos) return [];

  //   const fromDefIndex = this.mapPosToDefIndex(fromPos);
  //   const toDefIndex = this.mapPosToDefIndex(toPos);
  //   const stopDefIndices = this._charDefs
  //     .map((d, i) => [d, i])
  //     .slice(fromDefIndex, toDefIndex)
  //     .filter(([d]) => d[DEF_KEY].isStopAlign)
  //     .map(([, i]) => i);

  //   const stops = [
  //     fromDefIndex,
  //     ...stopDefIndices,
  //     toDefIndex
  //   ];

  //   return stops.map((s, i) => ({
  //     stop: stopDefIndices.indexOf(s) >= 0 ?
  //       s :
  //       null,

  //     value: this.extractInput(
  //       this.mapDefIndexToPos(s),
  //       this.mapDefIndexToPos(stops[++i]))
  //   })).filter(({stop, value}) => stop != null || value);
  // }

  /** Appends placeholder depending on laziness */
  _appendPlaceholder (toDefIndex: ?number): ChangeDetails {
    const oldValueLength = this.value.length;
    // TODO
    // const maxDefIndex = toDefIndex || this._charDefs.length;
    // for (let di=this.mapPosToDefIndex(this.value.length); di < maxDefIndex; ++di) {
    //   const def = this._charDefs[di][DEF_KEY];
    //   if (def.isInput) def.isHollow = true;

    //   if (!this.lazy || toDefIndex) {
    //     this._value += !def.isInput && def.char != null ?
    //       def.char :
    //       !def.isOptional ?
    //         this.placeholderChar :
    //         '';
    //   }
    // }
    return new ChangeDetails({
      inserted: this.value.slice(oldValueLength)
    });
  }

  mapPosToBlock (pos: number): ?{index: number, offset: number} {
    let accVal = '';
    for (let bi=0; bi<this._blocks.length; ++bi) {
      const block = this._blocks[bi];
      const blockStartPos = accVal.length;

      accVal += block.value;

      if (pos <= accVal.length) {
        return {
          index: bi,
          offset: pos - blockStartPos,
        };
      }
    }
  }

  forEachBlocksInRange (fromPos: number, toPos: ?number, fn: (block: Block, blockIndex: number, fromPos?: number, toPos?: number) => void) {
    const fromBlock = this.mapPosToBlock(fromPos);

    if (fromBlock) {
      const toBlock = toPos ? this.mapPosToBlock(toPos) : {index: this._blocks.length-1};
      // process first block
      const isSameBlock = toBlock && fromBlock.index === toBlock.index;
      const fromBlockRemoveBegin = fromBlock.offset;
      const fromBlockRemoveEnd = toBlock && isSameBlock ? toBlock.offset : undefined;
      fn(this._blocks[fromBlock.index], fromBlock.index, fromBlockRemoveBegin, fromBlockRemoveEnd);

      if (toBlock && !isSameBlock) {
        // process intermediate blocks
        for (let bi=fromBlock.index+1; bi<toBlock.index; ++bi) {
          fn(this._blocks[bi], bi);
        }

        // process last block
        fn(this._blocks[toBlock.index], toBlock.index, 0, toBlock.offset);
      }
    }
  }

  /**
    @override
  */
  remove (fromPos: number=0, toPos: ?number): ChangeDetails {
    this.forEachBlocksInRange(fromPos, toPos, (b, _, fromPos, toPos) => {
      b.remove(fromPos, toPos);
    });

    return super.remove(fromPos, toPos);
  }

  /**
    @override
  */
  // TODOOOOO
  // nearestInputPos (cursorPos: number, direction: Direction=DIRECTION.NONE): number {
    // let step = direction || DIRECTION.RIGHT;

    // const initialDefIndex = this.mapPosToDefIndex(cursorPos);
    // const initialDef = this._charDefs[initialDefIndex] && this._charDefs[initialDefIndex][DEF_KEY];
    // let di = initialDefIndex;

    // let firstInputIndex,
    //     firstFilledInputIndex,
    //     firstVisibleHollowIndex,
    //     nextdi;

    // // check if chars at right is acceptable for LEFT and NONE directions
    // if (direction !== DIRECTION.RIGHT &&
    //   (initialDef && initialDef.isInput ||
    //     // in none direction latest position is acceptable also
    //     direction === DIRECTION.NONE && cursorPos === this.value.length)) {
    //   firstInputIndex = initialDefIndex;
    //   if (initialDef && !initialDef.isHollow) firstFilledInputIndex = initialDefIndex;
    // }

    // if ((firstFilledInputIndex == null && direction == DIRECTION.LEFT) || firstInputIndex == null) {
    //   // search forward
    //   for (
    //     nextdi = indexInDirection(di, step);
    //     0 <= nextdi && nextdi < this._charDefs.length;
    //     di += step, nextdi += step
    //   ) {
    //     const nextDef = this._charDefs[nextdi][DEF_KEY];
    //     if (firstInputIndex == null && nextDef.isInput) {
    //       firstInputIndex = di;
    //       if (direction === DIRECTION.NONE) break;
    //     }
    //     if (firstVisibleHollowIndex == null && nextDef.isHollow && !nextDef.isHiddenHollow) firstVisibleHollowIndex = di;
    //     if (nextDef.isInput && !nextDef.isHollow) {
    //       firstFilledInputIndex = di;
    //       break;
    //     }
    //   }
    // }

    // // for lazy if has aligned left inside fixed and has came to the start - use start position
    // if (direction === DIRECTION.LEFT && di === 0 && this.lazy && !this.extractInput() &&
    //   (!initialDef || !initialDef.isInput)) firstInputIndex = 0;

    // if (direction === DIRECTION.LEFT || firstInputIndex == null) {
    //   // search backward
    //   step = -step;
    //   let overflow = false;

    //   // find hollows only before initial pos
    //   for (
    //     nextdi = indexInDirection(di, step);
    //     0 <= nextdi && nextdi < this._charDefs.length;
    //     di += step, nextdi += step
    //   ) {
    //     const nextDef = this._charDefs[nextdi][DEF_KEY];
    //     if (nextDef.isInput) {
    //       firstInputIndex = di;
    //       if (nextDef.isHollow && !nextDef.isHiddenHollow) break;
    //     }

    //     // if hollow not found before start position - set `overflow`
    //     // and try to find just any input
    //     if (di === initialDefIndex) overflow = true;

    //     // first input found
    //     if (overflow && firstInputIndex != null) break;
    //   }

    //   // process overflow
    //   overflow = overflow || nextdi >= this._charDefs.length;
    //   if (overflow && firstInputIndex != null) di = firstInputIndex;
    // } else if (firstFilledInputIndex == null) {
    //   // adjust index if delete at right and filled input not found at right
    //   di = firstVisibleHollowIndex != null ?
    //     firstVisibleHollowIndex :
    //     firstInputIndex;
    // }

    // return this.mapDefIndexToPos(di);
  // }

  /** Get group by name */
  // group (name: string): ?PatternGroup {
  //   return this.groupsByName(name)[0];
  // }

  /** Get all groups by name */
  // groupsByName (name: string): Array<PatternGroup> {
  //   return this._groupDefs.filter(g => g.name === name);
  // }
}
MaskedPattern.DEFAULTS = {
  lazy: true,
  placeholderChar: '_'
};
MaskedPattern.STOP_CHAR = '`';
MaskedPattern.ESCAPE_CHAR = '\\';
MaskedPattern.InputDefinition = PatternInputDefinition
MaskedPattern.FixedDefinition = PatternFixedDefinition;
// MaskedPattern.Group = PatternGroup;
