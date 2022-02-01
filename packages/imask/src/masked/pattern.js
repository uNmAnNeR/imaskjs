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
import './regexp.js';  // support for default definitions which are regexp's


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
          // $FlowFixMe no ideas
          const maskedBlock = createMask({
            parent: this,
            lazy: this.lazy,
            eager: this.eager,
            placeholderChar: this.placeholderChar,
            overwrite: this.overwrite,
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
          eager: this.eager,
          placeholderChar: this.placeholderChar,
          mask: defs[char],
          isOptional: optionalBlock,
        }) :
        new PatternFixedDefinition({
          char,
          eager: this.eager,
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
  get isFilled (): boolean {
    return this._blocks.every(b => b.isFilled);
  }

  get isFixed (): boolean {
    return this._blocks.every(b => b.isFixed);
  }

  get isOptional (): boolean {
    return this._blocks.every(b => b.isOptional);
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
  appendTail (tail: string | String | TailDetails): ChangeDetails {
    return super.appendTail(tail).aggregate(this._appendPlaceholder());
  }

  /**
    @override
  */
  _appendEager (): ChangeDetails {
    const details = new ChangeDetails();

    let startBlockIndex = this._mapPosToBlock(this.value.length)?.index;
    if (startBlockIndex == null) return details;

    // TODO test if it works for nested pattern masks
    if (this._blocks[startBlockIndex].isFilled) ++startBlockIndex;

    for (let bi=startBlockIndex; bi<this._blocks.length; ++bi) {
      const d = this._blocks[bi]._appendEager();
      if (!d.inserted) break;

      details.aggregate(d);
    }

    return details;
  }

  /**
    @override
  */
  _appendCharRaw (ch: string, flags: AppendFlags={}): ChangeDetails {
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

      const caret = new BlockCaret(this, cursorPos);

      if (caret.pushRightBeforeInput() && caret.pos === cursorPos) return caret.pos;
      const s = caret.popState();

      if (caret.pushLeftBeforeInput()) return caret.pos;
      caret.state = s;
      if (caret.ok) return caret.pos;

      // // check if first block at left is input
      // if (searchBlockIndex > 0) {
      //   const blockIndexAtLeft = searchBlockIndex-1;
      //   const blockAtLeft = this._blocks[blockIndexAtLeft];
      //   const blockInputPos = blockAtLeft.nearestInputPos(0, DIRECTION.NONE);
      //   // is input
      //   if (!blockAtLeft.value.length || blockInputPos !== blockAtLeft.value.length) {
      //     return this._blockStartPos(searchBlockIndex);
      //   }
      // }

      // // ->
      // let firstInputAtRight = searchBlockIndex;
      // for (let bi=firstInputAtRight; bi < this._blocks.length; ++bi) {
      //   const blockAtRight = this._blocks[bi];
      //   const blockInputPos = blockAtRight.nearestInputPos(0, DIRECTION.NONE);
      //   if (!blockAtRight.value.length || blockInputPos !== blockAtRight.value.length) {
      //     return this._blockStartPos(bi) + blockInputPos;
      //   }
      // }

      // // <-
      // // find first non-fixed symbol
      // for (let bi=searchBlockIndex-1; bi >= 0; --bi) {
      //   const block = this._blocks[bi];
      //   const blockInputPos = block.nearestInputPos(0, DIRECTION.NONE);
      //   // is input
      //   if (!block.value.length || blockInputPos !== block.value.length) {
      //     return this._blockStartPos(bi) + block.value.length;
      //   }
      // }

      return cursorPos;
    }

    if (direction === DIRECTION.LEFT || direction === DIRECTION.FORCE_LEFT) {
      const caret = new BlockCaret(this, cursorPos);

      // try to break fast when *|a
      if (direction === DIRECTION.LEFT) {
        caret.pushRightBeforeFilled();
        if (caret.ok && caret.pos === cursorPos) return cursorPos;
        caret.popState();
      }

      // forward flow
      caret.pushLeftBeforeInput();
      caret.pushLeftBeforeRequired();
      caret.pushLeftBeforeFilled();

      // backward flow
      if (direction === DIRECTION.LEFT) {
        caret.pushRightBeforeInput();
        caret.pushRightBeforeRequired();
        if (caret.ok && caret.pos <= cursorPos) return caret.pos;
        caret.popState();
        if (caret.ok && caret.pos <= cursorPos) return caret.pos;
        caret.popState();
      }
      if (caret.ok) return caret.pos;
      if (direction === DIRECTION.FORCE_LEFT) return 0;

      caret.popState();
      if (caret.ok) return caret.pos;

      caret.popState();
      if (caret.ok) return caret.pos;

      caret.popState();
      if (
        caret.pushRightBeforeInput() &&
        // HACK for lazy if has aligned left inside fixed and has came to the start - use start position
        (!this.lazy || this.extractInput())
      ) return caret.pos;

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


type BlockCaretState = { offset: number, index: number, ok: boolean };
class BlockCaret {
  masked: MaskedPattern;
  offset: number;
  index: number;
  ok: boolean;
  _log: BlockCaretState[];

  constructor (masked: MaskedPattern, pos: number) {
    this.masked = masked;
    this._log = [];

    const { offset, index } = masked._mapPosToBlock(pos) || {index: 0, offset: 0};
    this.offset = offset;
    this.index = index;
    this.ok = true;
  }

  get block (): PatternBlock {
    return this.masked._blocks[this.index];
  }

  get pos (): number {
    return this.masked._blockStartPos(this.index) + this.offset;
  }

  get state (): BlockCaretState {
    return { index: this.index, offset: this.offset, ok: this.ok };
  }

  set state (s: BlockCaretState) {
    Object.assign(this, s);
  }

  pushState () {
    this._log.push(this.state);
  }

  popState (): BlockCaretState {
    const s = this._log.pop();
    this.state = s;
    return s;
  }

  boundBlock () {
    if (this.block) return;
    this.index = Math.max(0, Math.min(this.index, this.masked._blocks.length-1));
    this.offset = 0;
  }

  pushLeftBeforeFilled (): boolean {
    this.pushState();
    this.boundBlock();
    for (; 0<=this.index; --this.index, this.offset=this.block?.value.length || 0) {
      if (this.block.isFixed || !this.block.value) continue;

      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_LEFT);
      if (this.offset !== 0) return this.ok = true;
    }

    return this.ok = false;
  }

  pushLeftBeforeInput (): boolean {
    // cases:
    // filled input: 00|
    // optional empty input: 00[]|
    // nested block: XX<[]>|
    this.pushState();
    this.boundBlock();
    for (; 0<=this.index; --this.index, this.offset=0) {
      if (this.block.isFixed) continue;

      this.offset = this.block.nearestInputPos(this.block.value.length, DIRECTION.LEFT);
      return this.ok = true;
    }

    return this.ok = false;

    // // cases:
    // // filled input: 00|
    // // optional empty input: 00[]|
    // // nested block: XX<[]>|
    // this.pushState();
    // this.boundBlock();
    // for (; 0<=this.index; --this.index, this.offset=this.block?.value.length || 0) {
    //   if (!this.block.value) return this.ok = true;

    //   this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
    //   if (
    //     this.offset !== 0 ||
    //     // TODO find better way to find possible inputs
    //     !this.block.value
    //   ) return this.ok = true;

    //   // TODO find better way to find possible inputs
    //   const pos = this.block.nearestInputPos(0, DIRECTION.NONE);
    //   if (pos !== this.block.value.length) {
    //     this.offset = pos;
    //     return this.ok = true;
    //   }
    // }

    // return this.ok = false;
  }

  pushLeftBeforeRequired (): boolean {
    this.pushState();
    this.boundBlock();
    for (; 0<=this.index; --this.index, this.offset=0) {
      if (this.block.isFixed || this.block.isOptional) continue;

      this.offset = this.block.nearestInputPos(this.block.value.length, DIRECTION.LEFT);
      return this.ok = true;
    }

    return this.ok = false;
  }

  pushRightBeforeFilled (): boolean {
    this.pushState();
    this.boundBlock();
    for (; this.index<this.masked._blocks.length; ++this.index, this.offset=0) {
      if (this.block.isFixed || !this.block.value) continue;

      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_RIGHT);
      if (this.offset !== this.block.value.length) return this.ok = true;
    }

    return this.ok = false;
  }

  pushRightBeforeInput (): boolean {
    this.pushState();
    this.boundBlock();

    for (; this.index<this.masked._blocks.length; ++this.index, this.offset=0) {
      if (this.block.isFixed) continue;

      // const o = this.offset;
      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
      // HACK cases like (STILL DOES NOT WORK FOR NESTED)
      // aa|X
      // aa<X|[]>X_    - this will not work
      // if (o && o === this.offset && this.block instanceof PatternInputDefinition) continue;
      return this.ok = true;
    }

    return this.ok = false;
  }

  pushRightBeforeRequired (): boolean {
    this.pushState();
    this.boundBlock();

    for (; this.index<this.masked._blocks.length; ++this.index, this.offset=0) {
      if (this.block.isFixed || this.block.isOptional) continue;

      // this.offset = this.block.nearestInputPos(this.offset, DIRECTION.RIGHT);
      // TODO check |[*]XX_
      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
      return this.ok = true;
    }

    return this.ok = false;
  }

  pushRight (): boolean {
    this.pushState();
    for (this.boundBlock(); this.index<this.masked._blocks.length; ++this.index, this.offset=0) {
      if (this.block.value && this.offset < this.block.value.length) {
        this.offset += 1;
        return this.ok = true;
      }
    }
    return this.ok = false;
  }
}


IMask.MaskedPattern = MaskedPattern;
