import ChangeDetails from '../core/change-details';
import IMask from '../core/holder';
import { type AppendFlags } from './base';
import createMask, { type FactoryArg, normalizeOpts, type ExtendFactoryArgOptions, type UpdateOpts } from './factory';
import MaskedPattern, { type MaskedPatternOptions, type MaskedPatternState } from './pattern';
import type PatternBlock from './pattern/block';


export
type RepeatBlockOptions<M extends FactoryArg> = ExtendFactoryArgOptions<Partial<Pick<RepeatBlock<M>, 'repeat'>>>;

export
type BlockPosData = {
  index: number,
  offset: number,
};

/** Pattern mask */
export default
class RepeatBlock<M extends FactoryArg> extends MaskedPattern {
  declare block: M;
  declare repeat: number;

  constructor (opts: RepeatBlockOptions<M>) {
    super(opts as MaskedPatternOptions);
  }

  override updateOptions (opts: UpdateOpts<RepeatBlockOptions<M>>) {
    super.updateOptions(opts as MaskedPatternOptions);
  }

  override _update (opts: UpdateOpts<RepeatBlockOptions<M>>) {
    const { repeat, ...block } = normalizeOpts(opts as any); // TODO
    if (repeat != null) this.repeat = repeat;
    this.block = Object.assign({}, this.block, block);
    super._update({
      mask: 'm'.repeat(Math.max(repeat == Infinity ? (this._blocks?.length || 1) : this.repeat, 1)),
      blocks: { m: block },
      lazy: block.lazy,
      eager: block.eager,
      placeholderChar: block.placeholderChar,
      displayChar: block.displayChar,
      overwrite: block.overwrite,
      skipInvalid: block.skipInvalid,
    });
  }

  _allocateBlock (bi: number): PatternBlock | undefined {
    if (bi < this._blocks.length) return this._blocks[bi];
    if (this.repeat === Infinity || this._blocks.length < this.repeat) {
      this._blocks.push(createMask({
        lazy: this.lazy,
        eager: this.eager,
        placeholderChar: this.placeholderChar,
        displayChar: this.displayChar,
        overwrite: this.overwrite,
        ...normalizeOpts(this.block),
        parent: this,
      }));
      this.mask += 'm';
      return this._blocks[this._blocks.length - 1];
    }
  }

  _appendCharRaw (ch: string, flags: AppendFlags<MaskedPatternState>={}): ChangeDetails {
    const blockIter = this._mapPosToBlock(this.displayValue.length);
    const details = new ChangeDetails();
    if (!blockIter) return details;

    // TODO create add new block if possible
    for (let bi=blockIter.index, block; (block = this._allocateBlock(bi)); ++bi) {
      const blockDetails = block._appendChar(ch, { ...flags, _beforeTailState: flags._beforeTailState?._blocks?.[bi] });

      const skip = blockDetails.skip;
      details.aggregate(blockDetails);

      if (skip || blockDetails.rawInserted) break; // go next char
    }

    return details;
  }

  remove (fromPos: number=0, toPos: number=this.displayValue.length): ChangeDetails {
    const removeDetails = super.remove(fromPos, toPos);

    if (this.repeat === Infinity) {
      const firstBlockIndex = Math.max(this._mapPosToBlock(fromPos)?.index || 0, 1);
      let blockIndex = this._mapPosToBlock(toPos)?.index || this._blocks.length - 1;

      for (; firstBlockIndex <= blockIndex; --blockIndex) {
        if (this._blocks[blockIndex].unmaskedValue) break;
        this._blocks.splice(blockIndex, 1);
        this.mask = this.mask.slice(1);
      }
    }

    return removeDetails;
  }

  totalInputPositions (fromPos: number=0, toPos: number=this.displayValue.length): number {
    if (this.repeat === Infinity) return Infinity;
    return super.totalInputPositions(fromPos, toPos);
  }
}


IMask.RepeatBlock = RepeatBlock;
