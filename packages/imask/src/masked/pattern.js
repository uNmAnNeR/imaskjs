// @flow
import {DIRECTION, indexInDirection, type Direction} from '../core/utils.js';
import ChangeDetails from '../core/change-details.js';
import Masked, {type AppendFlags, type ExtractFlags, type MaskedOptions} from './base.js';
import {DEFAULT_DEFINITIONS, PatternInputDefinition, PatternFixedDefinition, type Definitions} from './pattern/definition.js';
// import PatternGroup, {type PatternGroupTemplate} from './pattern/group.js';
import {ChunksTailDetails, type TailInputChunk} from './pattern/chunk-tail-details.js';
import {type TailDetails} from '../core/tail-details.js';
import {type PatternBlock} from './pattern/block.js';
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
  _stops: Array<number>;

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
    this._stops = [];

    let pattern = this.mask;
    if (!pattern || !defs) return;

    let unmaskingBlock = false;
    let optionalBlock = false;

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
          this._blocks.push(createMask(group));
          i += gName.length - 1;
          continue;
        }
      }

      let char = pattern[i];
      let isInput = char in defs;

      if (char === MaskedPattern.STOP_CHAR) {
        this._stops.push(this._blocks.length);
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
      // TODO pass default lazy and placeholderChar
      if (isInput) {
        def = new PatternInputDefinition(this, {
          mask: defs[char],
          isOptional: optionalBlock,
        });
      } else {
        def = new PatternFixedDefinition({
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
  clone () {
    const m = new MaskedPattern(this);
    m._value = this.value;
    // TODO block should implement clone/assing?
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

  /**
    @override
  */
  doCommit () {
    this._blocks.forEach(b => b.doCommit());
    // TODO??? is it ok to update it manually?
    this._value = this._blocks.reduce((str, b) => str += b.value, '');
    super.doCommit();
  }

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
  _appendChar (ch: string, flags: AppendFlags={}): ChangeDetails {
    const blockData = this._mapPosToBlock(this.value.length);
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

      // group
      //  overflow - can not resolve
      //  inserted - all inserted
      //  rawInserted - input from `ch`
      // input
      //  overflow - can not resolve
      //  inserted - all inserted (char or placeholder)
      //  rawInserted - input from `ch`
      // fixed
      //  overflow - can not resolve
      //  inserted - char
      //  rawInserted - input from `ch`

      if (blockDetails.overflow) {
        blockDetails.overflow = false;
        details.aggregate(blockDetails);
        if (!block.value) {
          break;
        }
      } else {
        details.aggregate(blockDetails);
        if (blockDetails.rawInserted) break;
      }

      // if (!blockDetails.overflow) {
      //   details.aggregate(blockDetails);
      //   if (blockDetails.rawInserted) break;
      // } else {
      //   if (block.value && !flags.input && !this.lazy) {
      //     // can skip;
      //     blockDetails.overflow = false;
      //     details.aggregate(blockDetails);
      //   } else {
      //     break;
      //   }
      // }

//      if (!blockDetails.overflow || blockDetails.rawInserted) {
//        details.aggregate(blockDetails);
//        if (blockDetails.rawInserted) break;
//      } /* else if (!flags.input && !block.rawInserted) {
//        details.overflow = true;
//        break;
//      } */ else if (!block.value && !this.lazy) {
//        break;
//      }
    }

    return details;
  }

  /** Appends chunks splitted by stop chars */
  _appendChunks (chunks: Array<TailInputChunk>, ...args: *) {
    const details = new ChangeDetails();

    for (let ci=0; ci < chunks.length; ++ci) {
      const {stop, value} = chunks[ci];
      if (Array.isArray(stop)) {
        // TODO
      } else {
        if (stop != null && this._stops.indexOf(stop) >= 0) details.aggregate(this._appendPlaceholder(stop));
        if (details.aggregate(this._append(value, ...args)).overflow) break;
      }
    };

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

    let input = '';

    this._forEachBlocksInRange(fromPos, toPos, (b, _, fromPos, toPos) => {
      input += b.extractInput(fromPos, toPos, flags);
    });

    return input;
  }

  /** Extracts chunks from input splitted by stop chars */
  _extractInputChunks (fromPos: number=0, toPos: number=this.value.length): Array<TailInputChunk> {
    if (fromPos === toPos) return [];

    const chunks = [];
    this._forEachBlocksInRange(fromPos, toPos, (b, bi, fromPos, toPos) => {
      const lastChunk = chunks[chunks.length-1];
      const blockChunk = b._extractTail(fromPos, toPos);

      if (blockChunk instanceof ChunksTailDetails) {
        // TODO
      } else {
        if (this._stops.indexOf(bi) >= 0) blockChunk.stop = bi;
        // skip chunk if emplty
        if (blockChunk.stop == null && !blockChunk.value) return;
        // add new chunk
        if (!lastChunk || blockChunk.stop != null) return chunks.push(blockChunk);
        // or update previous one
        else lastChunk.value += blockChunk.value;
      }
    });

    return chunks;
  }

  /** Appends placeholder depending on laziness */
  _appendPlaceholder (toBlockIndex: ?number): ChangeDetails {
    // TODO nested block index
    const details = new ChangeDetails();
    if (this.lazy && toBlockIndex == null) return details;

    const startBlockData = this._mapPosToBlock(this.value.length);
    if (!startBlockData) return details;

    const startBlockIndex = startBlockData && startBlockData.index;
    const endBlockIndex = toBlockIndex || this._blocks.length;

    this._blocks.slice(startBlockIndex, endBlockIndex)
      .filter(b => typeof b._appendPlaceholder === 'function')
      .forEach(b => {
        const bDetails = b._appendPlaceholder();
        this._value += bDetails.inserted;
        details.aggregate(bDetails);
      });

    return details;
  }

  _mapPosToBlock (pos: number): ?{index: number, offset: number} {
    let accVal = '';
    for (let bi=0; bi<this._blocks.length; ++bi) {
      const block = this._blocks[bi];
      const blockStartPos = accVal.length;

      accVal += block.value;

      if (pos <= accVal.length) {
        return {
          index: bi,
          offset: pos - blockStartPos,
          blockStartPos
        };
      }
    }
  }

  _blockStartPos (blockIndex) {
    return this._blocks
      .slice(0, blockIndex)
      .reduce((pos, b) => pos += b.value.length, 0);
  }

  _forEachBlocksInRange (fromPos: number, toPos: ?number, fn: (block: Block, blockIndex: number, fromPos?: number, toPos?: number) => void) {
    const fromBlock = this._mapPosToBlock(fromPos);

    if (fromBlock) {
      const toBlock = toPos ? this._mapPosToBlock(toPos) : {index: this._blocks.length-1};
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
    this._forEachBlocksInRange(fromPos, toPos, (b, _, fromPos, toPos) => {
      b.remove(fromPos, toPos);
    });

    return super.remove(fromPos, toPos);
  }

  _acceptBlockPos (blockData, direction) {

  }

  _nextBlock (blockData, direction) {
    const block = this._blocks[blockData.index];
    const nextBlockIndex = blockData.index + (direction === DIRECTION.LEFT ? -1 : 1);
    const nextBlock = this._blocks[nextBlockIndex];

    if (!nextBlock) return;

    return {
      index: nextBlockIndex,
      block: nextBlock,
      blockStartPos: blockData.blockStartPos + nextBlock.value,
      offset: direction === DIRECTION.LEFT ? nextBlock.value : 0,
    }
  }

  /**
    @override
  */
  nearestInputPos (cursorPos: number, direction: Direction=DIRECTION.NONE): number {
    let beginBlockData = this._mapPosToBlock(cursorPos) || {index: 0, offset: 0, blockStartPos: 0};
    let beginBlockStartPos = beginBlockData.blockStartPos;
    let beginBlockOffset = beginBlockData.offset;
    let beginBlockIndex = beginBlockData.index;
    let beginBlock = this._blocks[beginBlockIndex];

    if (!beginBlock) return cursorPos;

    let inputPos = cursorPos;

    let cursorAtRight = beginBlockOffset === beginBlock.value.length;
    let cursorAtLeft = beginBlockOffset === 0;

    if (!cursorAtLeft && !cursorAtRight) return beginBlockStartPos + beginBlockOffset;

    const searchBlockIndex = cursorAtRight ? beginBlockIndex + 1 : beginBlockIndex;

    if (direction === DIRECTION.NONE) {
      for (let bi=searchBlockIndex; bi < this._blocks.length; ++bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(0, DIRECTION.NONE);
        if (blockInputPos !== block.value.length) {
          return this._blockStartPos(bi) + blockInputPos;
        }
      }

      for (let bi=Math.min(searchBlockIndex, this._blocks.length-1); bi >= 0; --bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(block.value.length, DIRECTION.LEFT);
        if (blockInputPos !== 0) {
          return this._blockStartPos(bi) + blockInputPos;
        }
      }

      return 0;
    }

    if (direction === DIRECTION.LEFT) {
      let filledBlockIndex;
      for (let bi=searchBlockIndex; bi < this._blocks.length; ++bi) {
        if (this._blocks[bi].value) {
          filledBlockIndex = bi;
          break;
        }
      }

      if (filledBlockIndex != null) {
        const filledBlock = this._blocks[filledBlockIndex];
        const blockInputPos = filledBlock.nearestInputPos(0, DIRECTION.RIGHT);
        if (filledBlock.value.length && blockInputPos !== filledBlock.value.length) {
          return this._blockStartPos(filledBlockIndex) + blockInputPos;
        }
      }

      let firstFilledBlockIndex;
      for (let bi=Math.min(searchBlockIndex, this._blocks.length-1); bi >= 0; --bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(block.value.length, DIRECTION.LEFT);
        if (blockInputPos !== 0) {
          if (blockInputPos !== block.value.length) {
            return this._blockStartPos(bi) + blockInputPos;
          } else {
            firstFilledBlockIndex = bi;
            break;
          }
        }
      }

      for (let bi=firstFilledBlockIndex != null ? firstFilledBlockIndex + 1 : 0; bi < this._blocks.length; ++bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(0, DIRECTION.NONE);
        if (blockInputPos !== block.value.length) {
          return this._blockStartPos(bi) + blockInputPos;
        }
      }

      return firstFilledBlockIndex != null ?
        this._blockStartPos(firstFilledBlockIndex) + this._blocks[firstFilledBlockIndex].value.length :
        this.value.length;
    }

    if (direction === DIRECTION.RIGHT) {
      let firstInputBlockAlignedPos;

      for (let bi=searchBlockIndex; bi < this._blocks.length; ++bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(0, DIRECTION.NONE);
        if (blockInputPos !== block.value.length) {
          firstInputBlockAlignedPos = this._blockStartPos(bi) + blockInputPos;
          break;
        }
      }

      if (firstInputBlockAlignedPos != null) {
        for (let bi=firstInputBlockAlignedPos; bi < this._blocks.length; ++bi) {
          const block = this._blocks[bi];
          const blockInputPos = block.nearestInputPos(0, DIRECTION.RIGHT);
          if (blockInputPos !== block.value.length) {
            return this._blockStartPos(bi) + blockInputPos;
          }
        }
        return firstInputBlockAlignedPos;
      }

      for (let bi=Math.min(searchBlockIndex, this._blocks.length-1); bi >= 0; --bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(block.value.length, DIRECTION.LEFT);
        if (blockInputPos !== 0) {
          const alignedPos = this._blockStartPos(bi) + blockInputPos;
          if (alignedPos >= cursorPos) return alignedPos;
          break;
        }
      }

      return cursorPos;
    }

    // FOR ALL:
    //  cursor is INSIDE first block (not at bounds)

    // FOR LEFT:
    // <-
    //  any|first not empty is not-len-aligned
    //  not-0-aligned|any
    // ->
    //  any|not-len-aligned or end

    // FOR RIGHT:
    // ->
    //  any|not-len-aligned and filled
    //  any|not-len-aligned
    // <-
    //  not-0-aligned or start|any

    // FOR NONE:
    // ->
    //  any|input


    // if (direction === DIRECTION.LEFT && cursorAtRight) {
    //   const leftBlockIndex = blockData && blockData.index;
    //   const rightBlockIndex = leftBlockIndex != null ?
    //   let blockPos = blockData ? blockPos + 1 : 0;
    //   let blockOffset = blockData ? blockData.offset : 0;
    //   let blockValue = blockData ? this._blocks[blockData.index].value : '';
    //   let inputPos = cursorPos;
    // }

    // if (!blockData && direction !== DIRECTION.RIGHT) return inputPos;

    // for (let bi=blockData.index; bi >= 0; --bi) {
    //   const block = this._blocks[bi];
    //   blockOffset = blockOffset != null ? blockOffset : block.value.length;

    //   const blockInputPos = block.nearestInputPos(blockOffset, direction);
    //   if (bi === 0 || blockInputPos > 0) {
    //     inputPos = blockPos + blockInputPos;
    //     break;
    //   }

    //   blockPos -= block.value.length;
    //   blockOffset = null;
    // }

    // return inputPos;


    let blockData = this._mapPosToBlock(cursorPos);
    const initialDefIndex = blockData ? blockData.index+1 : 0;
    const initialDef = this._blocks[initialDefIndex];
    let di = initialDefIndex;

    let firstInputIndex,
        firstFilledInputIndex,
        firstVisibleHollowIndex,
        nextdi;

    // check if chars at right is acceptable for LEFT and NONE directions
    if (direction !== DIRECTION.RIGHT &&
      (initialDef && isInput(initialDef) ||
        // in none direction latest position is acceptable also
        direction === DIRECTION.NONE && cursorPos === this.value.length)) {
      firstInputIndex = initialDefIndex;
      if (initialDef && initialDef.value) firstFilledInputIndex = initialDefIndex;
    }

    if ((firstFilledInputIndex == null && direction == DIRECTION.LEFT) || firstInputIndex == null) {
      // search forward
      for (
        nextdi = indexInDirection(di, step);
        0 <= nextdi && nextdi < this._charDefs.length;
        di += step, nextdi += step
      ) {
        const nextDef = this._charDefs[nextdi][DEF_KEY];
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
    if (direction === DIRECTION.LEFT && di === 0 && this.lazy && !this.extractInput() &&
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
        const nextDef = this._charDefs[nextdi][DEF_KEY];
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
MaskedPattern.InputDefinition = PatternInputDefinition;
MaskedPattern.FixedDefinition = PatternFixedDefinition;
// MaskedPattern.Group = PatternGroup;

function isInput (block: Block) {
  if (!block) return false;

  const value = block.value;
  return !value || block.nearestInputPos(0, DIRECTION.NONE) !== value.length;
}
