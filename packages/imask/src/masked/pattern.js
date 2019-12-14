// @flow
import {DIRECTION, type Direction, forceDirection} from '../core/utils.js';
import ChangeDetails from '../core/change-details.js';
import Masked, {type AppendFlags, type ExtractFlags, type MaskedOptions, type MaskedState} from './base.js';
import PatternInputDefinition, {DEFAULT_INPUT_DEFINITIONS, type Definitions} from './pattern/input-definition.js';
import PatternFixedDefinition from './pattern/fixed-definition.js';
import { type TailDetails } from '../core/tail-details.js';
import ChunksTailDetails from './pattern/chunk-tail-details.js';
import ContinuousTailDetails from '../core/continuous-tail-details.js';
import {type PatternBlock} from './pattern/block.js';
import createMask from './factory.js';
import IMask from '../core/holder.js';


type MaskedPatternOptions = {
  ...MaskedOptions<string>,
  definitions?: $PropertyType<MaskedPattern, 'definitions'>,
  blocks?: $PropertyType<MaskedPattern, 'blocks'>,
  placeholderChar?: $PropertyType<MaskedPattern, 'placeholderChar'>,
  lazy?: $PropertyType<MaskedPattern, 'lazy'>,
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
  blocks: {[string]: MaskedOptions<any>};
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
      ...opts,
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
            overwrite: this.overwrite,
            // $FlowFixMe
            ...this.blocks[bName],
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

      const def = isInput ?
        new PatternInputDefinition({
          parent: this,
          lazy: this.lazy,
          placeholderChar: this.placeholderChar,
          mask: defs[char],
          isOptional: optionalBlock,
        }) :
        new PatternFixedDefinition({
          char,
          isUnmasking: unmaskingBlock,
        });

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
  appendTail (tail: string | TailDetails): ChangeDetails {
    return super.appendTail(tail).aggregate(this._appendPlaceholder());
  }

  /**
    @override
  */
  _appendCharRaw (ch: string, flags: AppendFlags={}): ChangeDetails {
    ch = this.doPrepare(ch, flags);
    const blockIter = this._mapPosToBlock(this.value.length);
    const details = new ChangeDetails();
    if (!blockIter) return details;

    for (let bi=blockIter.index; ; ++bi) {
      const block = this._blocks[bi];
      if (!block) break;

      const blockDetails = block._appendChar(ch, flags);

      const skip = blockDetails.skip;
      details.aggregate(blockDetails);

      if (skip || blockDetails.rawInserted) break; // go next char
    }

    return details;
  }

  /**
    @override
  */
  extractTail (fromPos?: number=0, toPos?: number=this.value.length): ChunksTailDetails {
    const chunkTail = new ChunksTailDetails();
    if (fromPos === toPos) return chunkTail;

    this._forEachBlocksInRange(fromPos, toPos, (b, bi, bFromPos, bToPos) => {
      const blockChunk = b.extractTail(bFromPos, bToPos);
      blockChunk.stop = this._findStopBefore(bi);
      blockChunk.from = this._blockStartPos(bi);
      if (blockChunk instanceof ChunksTailDetails) blockChunk.blockIndex = bi;

      chunkTail.extend(blockChunk);
    });

    return chunkTail;
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

  _findStopBefore (blockIndex: number): ?number {
    let stopBefore;
    for (let si=0; si<this._stops.length; ++si) {
      const stop = this._stops[si];
      if (stop <= blockIndex) stopBefore = stop;
      else break;
    }
    return stopBefore;
  }

  /** Appends placeholder depending on laziness */
  _appendPlaceholder (toBlockIndex: ?number): ChangeDetails {
    const details = new ChangeDetails();
    if (this.lazy && toBlockIndex == null) return details;

    const startBlockIter = this._mapPosToBlock(this.value.length);
    if (!startBlockIter) return details;

    const startBlockIndex = startBlockIter.index;
    const endBlockIndex = toBlockIndex != null ? toBlockIndex : this._blocks.length;

    this._blocks.slice(startBlockIndex, endBlockIndex)
      .forEach(b => {
        if (!b.lazy || toBlockIndex != null) {
          // $FlowFixMe `_blocks` may not be present
          const args = b._blocks != null ? [b._blocks.length] : [];
          const bDetails = b._appendPlaceholder(...args);
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

  /** */
  _blockStartPos (blockIndex: number): number {
    return this._blocks
      .slice(0, blockIndex)
      .reduce((pos, b) => pos += b.value.length, 0);
  }

  /** */
  _forEachBlocksInRange (fromPos: number, toPos: number=this.value.length, fn: (block: PatternBlock, blockIndex: number, fromPos: number, toPos: number) => void) {
    const fromBlockIter = this._mapPosToBlock(fromPos);

    if (fromBlockIter) {
      const toBlockIter = this._mapPosToBlock(toPos);
      // process first block
      const isSameBlock = toBlockIter && fromBlockIter.index === toBlockIter.index;
      const fromBlockStartPos = fromBlockIter.offset;
      const fromBlockEndPos = toBlockIter && isSameBlock ?
        toBlockIter.offset :
        this._blocks[fromBlockIter.index].value.length;
      fn(this._blocks[fromBlockIter.index], fromBlockIter.index, fromBlockStartPos, fromBlockEndPos);

      if (toBlockIter && !isSameBlock) {
        // process intermediate blocks
        for (let bi=fromBlockIter.index+1; bi<toBlockIter.index; ++bi) {
          fn(this._blocks[bi], bi, 0, this._blocks[bi].value.length);
        }

        // process last block
        fn(this._blocks[toBlockIter.index], toBlockIter.index, 0, toBlockIter.offset);
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
      beginBlockCursorPos = beginBlock.nearestInputPos(beginBlockOffset, forceDirection(direction));
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
        const blockAtRight = this._blocks[bi];
        const blockInputPos = blockAtRight.nearestInputPos(0, DIRECTION.NONE);
        if (!blockAtRight.value.length || blockInputPos !== blockAtRight.value.length) {
          return this._blockStartPos(bi) + blockInputPos;
        }
      }

      // <-
      // find first non-fixed symbol
      for (let bi=searchBlockIndex-1; bi >= 0; --bi) {
        const block = this._blocks[bi];
        const blockInputPos = block.nearestInputPos(0, DIRECTION.NONE);
        // is input
        if (!block.value.length || blockInputPos !== block.value.length) {
          return this._blockStartPos(bi) + block.value.length;
        }
      }

      return cursorPos;
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
        if (!block.value || blockInputPos !== 0) firstEmptyInputBlockIndex = bi;
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

          if (blockAlignedPos > cursorPos) break;
          // if block is not lazy input
          if (blockInputPos !== block.value.length) return blockAlignedPos;
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


IMask.MaskedPattern = MaskedPattern;
