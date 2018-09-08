// @flow
import {DIRECTION, type Direction} from '../core/utils.js';
import ChangeDetails from '../core/change-details.js';
import Masked, {type AppendFlags, type ExtractFlags, type MaskedOptions, type MaskedState} from './base.js';
import PatternInputDefinition, {DEFAULT_INPUT_DEFINITIONS, type Definitions} from './pattern/input-definition.js';
import PatternFixedDefinition from './pattern/fixed-definition.js';
import {ChunksTailDetails, type TailInputChunk} from './pattern/chunk-tail-details.js';
import {type TailDetails} from '../core/tail-details.js';
import {type PatternBlock} from './pattern/block.js';
import createMask from './factory.js';


type MaskedPatternOptions = {
  ...MaskedOptions<string>,
  definitions: $PropertyType<MaskedPattern, 'definitions'>,
  blocks: $PropertyType<MaskedPattern, 'blocks'>,
  placeholderChar: $PropertyType<MaskedPattern, 'placeholderChar'>,
  lazy: $PropertyType<MaskedPattern, 'lazy'>,
};

type MaskedPatternState = {|
  ...MaskedState,
  _blocks: Array<*>,
|};

type BlockPosData = {
  index: number,
  offset: number,
};

/**
  Pattern mask
  @param {Object} opts
  @param {Object} opts.blocks
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

  /** */
  blocks: {[string]: Masked<*>};
  /** */
  definitions: Definitions;
  /** Single char for empty input */
  placeholderChar: string;
  /** Show placeholder only when needed */
  lazy: boolean;
  _blocks: Array<PatternBlock>;
  _maskedBlocks: {[string]: Array<number>};
  _stops: Array<number>;

  constructor (opts: any={}) {  // TODO type $Shape<MaskedPatternOptions>={} does not work
    opts.definitions = Object.assign({}, DEFAULT_INPUT_DEFINITIONS, opts.definitions);
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
    this._maskedBlocks = {};

    let pattern = this.mask;
    if (!pattern || !defs) return;

    let unmaskingBlock = false;
    let optionalBlock = false;

    for (let i=0; i<pattern.length; ++i) {
      if (this.blocks) {
        const p = pattern.slice(i);
        const bNames = Object.keys(this.blocks).filter(bName => p.indexOf(bName) === 0);
        // order by key length
        bNames.sort((a, b) => b.length - a.length);
        // use block name with max length
        const bName = bNames[0];
        if (bName) {
          const maskedBlock = createMask({
            parent: this,
            lazy: this.lazy,
            placeholderChar: this.placeholderChar,
            ...this.blocks[bName]
          });

          if (maskedBlock) {
            this._blocks.push(maskedBlock);

            // store block index
            if (!this._maskedBlocks[bName]) this._maskedBlocks[bName] = [];
            this._maskedBlocks[bName].push(this._blocks.length - 1);
          }

          i += bName.length - 1;
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
      if (isInput) {
        def = new PatternInputDefinition({
          parent: this,
          lazy: this.lazy,
          placeholderChar: this.placeholderChar,
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
  get state (): MaskedPatternState {
    return {
      ...super.state,
      _blocks: this._blocks.map(b => b.state),
    };
  }

  set state (state: MaskedPatternState) {
    const {_blocks, ...maskedState} = state;
    this._blocks.forEach((b, bi) => b.state = _blocks[bi]);
    super.state = maskedState;
  }

  /**
    @override
  */
  _storeBeforeTailState () {
    this._blocks.forEach(b => {
      // $FlowFixMe _storeBeforeTailState is not exist in PatternBlock
      if (typeof b._storeBeforeTailState === 'function') {
        b._storeBeforeTailState();
      }
    });
    super._storeBeforeTailState();
  }

  /**
    @override
  */
  _restoreBeforeTailState () {
    this._blocks.forEach(b => {
      // $FlowFixMe _restoreBeforeTailState is not exist in PatternBlock
      if (typeof b._restoreBeforeTailState === 'function') {
        b._restoreBeforeTailState();
      }
    });
    super._restoreBeforeTailState();
  }

  /**
    @override
  */
  _resetBeforeTailState () {
    this._blocks.forEach(b => {
      // $FlowFixMe _resetBeforeTailState is not exist in PatternBlock
      if (typeof b._resetBeforeTailState === 'function') {
        b._resetBeforeTailState();
      }
    });
    super._resetBeforeTailState();
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
  get value (): string {
    // TODO return _value when not in change?
    return this._blocks.reduce((str, b) => str += b.value, '');
  }

  set value (value: string) {
    super.value = value;
  }

  /**
    @override
  */
  appendTail (tail?: ChunksTailDetails | TailDetails): ChangeDetails {
    const details = new ChangeDetails();
    if (tail) {
      details.aggregate(tail instanceof ChunksTailDetails ?
        this._appendTailChunks(tail.chunks, {tail: true}) :
        super.appendTail(tail));
    }
    return details.aggregate(this._appendPlaceholder());
  }

  /**
    @override
  */
  _appendCharRaw (ch: string, flags: AppendFlags={}): ChangeDetails {
    const blockData = this._mapPosToBlock(this.value.length);
    const details = new ChangeDetails();
    if (!blockData) return details;

    for (let bi=blockData.index; ; ++bi) {
      const block = this._blocks[bi];
      if (!block) break;

      const blockDetails = block._appendChar(ch, flags);

      const skip = blockDetails.skip;
      details.aggregate(blockDetails);

      if (skip || blockDetails.rawInserted) break; // go next char
    }

    return details;
  }

  /** Appends chunks splitted by stop chars */
  _appendTailChunks (chunks: Array<TailInputChunk>, ...args: *) {
    const details = new ChangeDetails();

    for (let ci=0; ci < chunks.length && !details.skip; ++ci) {
      const chunk = chunks[ci];

      const chunkBlock = chunk instanceof ChunksTailDetails && chunk.index != null && this._blocks[chunk.index];
      if (chunkBlock) {
        // $FlowFixMe we already check index above
        details.aggregate(this._appendPlaceholder(chunk.index));

        const tailDetails = chunkBlock.appendTail(chunk);
        tailDetails.skip = false; // always ignore skip, it will be set on last
        details.aggregate(tailDetails);
        this._value += tailDetails.inserted;

        // get not inserted chars
        const remainChars = chunk.value.slice(tailDetails.rawInserted.length);
        if (remainChars) details.aggregate(this.append(remainChars, {tail: true}));
      } else {
        const {stop, value} = (chunk: any);
        if (stop != null && this._stops.indexOf(stop) >= 0) details.aggregate(this._appendPlaceholder(stop));
        details.aggregate(this.append(value, {tail: true}));
      }
    };

    return details;
  }

  /**
    @override
  */
  extractTail (fromPos?: number=0, toPos?: number=this.value.length): ChunksTailDetails {
    return new ChunksTailDetails(this._extractTailChunks(fromPos, toPos));
  }

  /**
    @override
  */
  extractInput (fromPos?: number=0, toPos?: number=this.value.length, flags: ExtractFlags={}): string {
    if (fromPos === toPos) return '';

    let input = '';

    this._forEachBlocksInRange(fromPos, toPos, (b, _, fromPos, toPos) => {
      input += b.extractInput(fromPos, toPos, flags);
    });

    return input;
  }

  /** Extracts chunks from input splitted by stop chars */
  _extractTailChunks (fromPos: number=0, toPos: number=this.value.length): Array<TailInputChunk> {
    if (fromPos === toPos) return [];

    const chunks = [];
    let lastChunk;
    this._forEachBlocksInRange(fromPos, toPos, (b, bi, fromPos, toPos) => {
      const blockChunk = b.extractTail(fromPos, toPos);

      let nearestStop;
      for (let si=0; si<this._stops.length; ++si) {
        const stop = this._stops[si];
        if (stop <= bi) nearestStop = stop;
        else break;
      }

      if (blockChunk instanceof ChunksTailDetails) {
        // TODO append to lastChunk with same index
        if (nearestStop == null) {
          // try append floating chunks to existed lastChunk
          let headFloatChunksCount = blockChunk.chunks.length;
          for (let ci=0; ci< blockChunk.chunks.length; ++ci) {
            if (blockChunk.chunks[ci].stop != null) {
              headFloatChunksCount = ci;
              break;
            }
          }

          const headFloatChunks = blockChunk.chunks.splice(0, headFloatChunksCount);
          headFloatChunks
            .filter(chunk => chunk.value)
            .forEach(chunk => {
              if (lastChunk) lastChunk.value += chunk.value;
              // will flat nested chunks
              else lastChunk = ({value: chunk.value}: TailDetails);
            });
        }

        // if block chunk has stops
        if (blockChunk.chunks.length) {
          if (lastChunk) chunks.push(lastChunk);
          blockChunk.index = nearestStop;
          chunks.push(blockChunk);
          // we cant append to ChunksTailDetails, so just reset lastChunk to force adding new
          lastChunk = null;
        }
      } else {
        if (nearestStop != null) {
          // on middle chunks consider stop flag and do not consider value
          // add block even if it is empty
          if (lastChunk) chunks.push(lastChunk);
          blockChunk.stop = nearestStop;
        } else if (lastChunk) {
          lastChunk.value += blockChunk.value;
          return;
        }
        lastChunk = blockChunk;
      }
    });

    if (lastChunk && lastChunk.value) chunks.push(lastChunk);

    return chunks;
  }

  /** Appends placeholder depending on laziness */
  _appendPlaceholder (toBlockIndex: ?number): ChangeDetails {
    const details = new ChangeDetails();
    if (this.lazy && toBlockIndex == null) return details;

    const startBlockData = this._mapPosToBlock(this.value.length);
    if (!startBlockData) return details;

    const startBlockIndex = startBlockData.index;
    const endBlockIndex = toBlockIndex != null ? toBlockIndex : this._blocks.length;

    this._blocks.slice(startBlockIndex, endBlockIndex)
      .forEach(b => {
        if (typeof b._appendPlaceholder === 'function') {
          // $FlowFixMe `_blocks` may not be present
          const args = b._blocks != null ? [b._blocks.length] : [];
          const bDetails = b._appendPlaceholder.apply(b, args);
          this._value += bDetails.inserted;
          details.aggregate(bDetails);
        }
      });

    return details;
  }

  /** Finds block in pos */
  _mapPosToBlock (pos: number): ?BlockPosData {
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

  _blockStartPos (blockIndex: number): number {
    return this._blocks
      .slice(0, blockIndex)
      .reduce((pos, b) => pos += b.value.length, 0);
  }

  _forEachBlocksInRange (fromPos: number, toPos: number=this.value.length, fn: (block: PatternBlock, blockIndex: number, fromPos?: number, toPos?: number) => void) {
    const fromBlock = this._mapPosToBlock(fromPos);

    if (fromBlock) {
      const toBlock = this._mapPosToBlock(toPos);
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
  remove (fromPos: number=0, toPos: number=this.value.length): ChangeDetails {
    const removeDetails = super.remove(fromPos, toPos);
    this._forEachBlocksInRange(fromPos, toPos, (b, _, bFromPos, bToPos) => {
      removeDetails.aggregate(b.remove(bFromPos, bToPos));
    });
    return removeDetails;
  }

  /**
    @override
  */
  nearestInputPos (cursorPos: number, direction: Direction=DIRECTION.NONE): number {
    // TODO refactor - extract alignblock

    const beginBlockData = this._mapPosToBlock(cursorPos) || {index: 0, offset: 0};
    const {
      offset: beginBlockOffset,
      index: beginBlockIndex,
    } = beginBlockData;
    const beginBlock = this._blocks[beginBlockIndex];

    if (!beginBlock) return cursorPos;

    let beginBlockCursorPos = beginBlockOffset;
    // if position inside block - try to adjust it
    if (beginBlockCursorPos !== 0 && beginBlockCursorPos < beginBlock.value.length) {
      beginBlockCursorPos = beginBlock.nearestInputPos(beginBlockOffset, direction);
    }

    const cursorAtRight = beginBlockCursorPos === beginBlock.value.length;
    const cursorAtLeft = beginBlockCursorPos === 0;

    //  cursor is INSIDE first block (not at bounds)
    if (!cursorAtLeft && !cursorAtRight) return this._blockStartPos(beginBlockIndex) + beginBlockCursorPos;

    const searchBlockIndex = cursorAtRight ? beginBlockIndex + 1 : beginBlockIndex;

    if (direction === DIRECTION.NONE) {
      // NONE direction used to calculate start input position if no chars were removed
      // FOR NONE:
      // -
      // input|any
      // ->
      //  any|input
      // <-
      //  filled-input|any

      // check if first block at left is input
      if (searchBlockIndex > 0) {
        const blockIndexAtLeft = searchBlockIndex-1;
        const blockAtLeft = this._blocks[blockIndexAtLeft];
        const blockInputPos = blockAtLeft.nearestInputPos(0, DIRECTION.NONE);
        // is input
        if (!blockAtLeft.value.length || blockInputPos !== blockAtLeft.value.length) {
          return this._blockStartPos(searchBlockIndex);
        }
      }

      // ->
      let firstInputAtRight = searchBlockIndex;
      for (let bi=firstInputAtRight; bi < this._blocks.length; ++bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(0, DIRECTION.NONE);
        if (blockInputPos !== block.value.length) {
          return this._blockStartPos(bi) + blockInputPos;
        }
      }

      return this.value.length;

      // // <-
      // for (let bi=Math.min(searchBlockIndex, this._blocks.length-1); bi >= 0; --bi) {
      //   const block = this._blocks[bi];
      //   const blockInputPos = block.nearestInputPos(block.value.length, DIRECTION.LEFT);
      //   if (blockInputPos !== 0) {
      //     return this._blockStartPos(bi) + blockInputPos;
      //   }
      // }

      // return 0;
    }

    if (direction === DIRECTION.LEFT || direction === DIRECTION.FORCE_LEFT) {
      // -
      //  any|filled-input
      // <-
      //  any|first not empty is not-len-aligned
      //  not-0-aligned|any
      // ->
      //  any|not-len-aligned or end

      // check if first block at right is filled input
      let firstFilledBlockIndexAtRight;
      for (let bi=searchBlockIndex; bi < this._blocks.length; ++bi) {
        if (this._blocks[bi].value) {
          firstFilledBlockIndexAtRight = bi;
          break;
        }
      }
      if (firstFilledBlockIndexAtRight != null) {
        const filledBlock = this._blocks[firstFilledBlockIndexAtRight];
        const blockInputPos = filledBlock.nearestInputPos(0, DIRECTION.RIGHT);
        if (blockInputPos === 0 && filledBlock.unmaskedValue.length) {
          // filled block is input
          return this._blockStartPos(firstFilledBlockIndexAtRight) + blockInputPos;
        }
      }

      // <-
      // find this vars
      let firstFilledInputBlockIndex = -1;
      let firstEmptyInputBlockIndex;  // TODO consider nested empty inputs
      for (let bi=searchBlockIndex-1; bi >= 0; --bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(block.value.length, DIRECTION.FORCE_LEFT);
        if (firstEmptyInputBlockIndex == null && (!block.value || blockInputPos !== 0)) {
          firstEmptyInputBlockIndex = bi;
        }
        if (blockInputPos !== 0) {
          if (blockInputPos !== block.value.length) {
            // aligned inside block - return immediately
            return this._blockStartPos(bi) + blockInputPos;
          } else {
            // found filled
            firstFilledInputBlockIndex = bi;
            break;
          }
        }
      }

      if (direction === DIRECTION.LEFT) {
        // try find first empty input before start searching position only when not forced
        for (let bi=firstFilledInputBlockIndex+1; bi <= Math.min(searchBlockIndex, this._blocks.length-1); ++bi) {
          const block = this._blocks[bi];
          const blockInputPos = block.nearestInputPos(0, DIRECTION.NONE);
          const blockAlignedPos = this._blockStartPos(bi) + blockInputPos;
          // if block is empty and last or not lazy input
          if ((!block.value.length && blockAlignedPos === this.value.length || blockInputPos !== block.value.length) && blockAlignedPos <= cursorPos) {
            return blockAlignedPos;
          }
        }
      }

      // process overflow
      if (firstFilledInputBlockIndex >= 0) {
        return this._blockStartPos(firstFilledInputBlockIndex) + this._blocks[firstFilledInputBlockIndex].value.length;
      }

      // for lazy if has aligned left inside fixed and has came to the start - use start position
      if (
        direction === DIRECTION.FORCE_LEFT ||
        this.lazy && !this.extractInput() && !isInput(this._blocks[searchBlockIndex])
      ) {
        return 0;
      }

      if (firstEmptyInputBlockIndex != null) {
        return this._blockStartPos(firstEmptyInputBlockIndex);
      }

      // find first input
      for (let bi=searchBlockIndex; bi < this._blocks.length; ++bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(0, DIRECTION.NONE);
        // is input
        if (!block.value.length || blockInputPos !== block.value.length) {
          return this._blockStartPos(bi) + blockInputPos;
        }
      }

      return 0;
    }

    if (direction === DIRECTION.RIGHT || direction === DIRECTION.FORCE_RIGHT) {
      // ->
      //  any|not-len-aligned and filled
      //  any|not-len-aligned
      // <-
      //  not-0-aligned or start|any
      let firstInputBlockAlignedIndex: ?number;
      let firstInputBlockAlignedPos: ?number;
      for (let bi=searchBlockIndex; bi < this._blocks.length; ++bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(0, DIRECTION.NONE);
        if (blockInputPos !== block.value.length) {
          firstInputBlockAlignedPos = this._blockStartPos(bi) + blockInputPos;
          firstInputBlockAlignedIndex = bi;
          break;
        }
      }

      if (firstInputBlockAlignedIndex != null && firstInputBlockAlignedPos != null) {
        for (let bi=firstInputBlockAlignedIndex; bi < this._blocks.length; ++bi) {
          const block = this._blocks[bi];
          const blockInputPos = block.nearestInputPos(0, DIRECTION.FORCE_RIGHT);
          if (blockInputPos !== block.value.length) {
            return this._blockStartPos(bi) + blockInputPos;
          }
        }
        return direction === DIRECTION.FORCE_RIGHT ?
          this.value.length :
          firstInputBlockAlignedPos;
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
    }

    return cursorPos;
  }

  /** Get block by name */
  maskedBlock (name: string): ?PatternBlock {
    return this.maskedBlocks(name)[0];
  }

  /** Get all blocks by name */
  maskedBlocks (name: string): Array<PatternBlock> {
    const indices = this._maskedBlocks[name];
    if (!indices) return [];
    return indices.map(gi => this._blocks[gi]);
  }
}
MaskedPattern.DEFAULTS = {
  lazy: true,
  placeholderChar: '_'
};
MaskedPattern.STOP_CHAR = '`';
MaskedPattern.ESCAPE_CHAR = '\\';
MaskedPattern.InputDefinition = PatternInputDefinition;
MaskedPattern.FixedDefinition = PatternFixedDefinition;

function isInput (block: PatternBlock): boolean {
  if (!block) return false;

  const value = block.value;
  return !value || block.nearestInputPos(0, DIRECTION.NONE) !== value.length;
}
