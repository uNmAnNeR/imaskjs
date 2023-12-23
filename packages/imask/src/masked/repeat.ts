import ChangeDetails from '../core/change-details';
import IMask from '../core/holder';
import { type AppendFlags } from './base';
import createMask, { type FactoryArg, normalizeOpts, type ExtendFactoryArgOptions, type UpdateOpts, type FactoryReturnMasked } from './factory';
import MaskedPattern, { type MaskedPatternOptions, type MaskedPatternState } from './pattern';
import type PatternBlock from './pattern/block';


type RepeatBlockExtraOptions<M extends FactoryArg> = Partial<Pick<RepeatBlock<M>, 'repeat'>>;

export
type RepeatBlockOptions<M extends FactoryArg> = ExtendFactoryArgOptions<RepeatBlockExtraOptions<M>>;


/** Pattern mask */
export default
class RepeatBlock<M extends FactoryArg> extends MaskedPattern {
  declare block: FactoryReturnMasked<M> & { repeat?: number };
  declare repeat: number;

  constructor (opts: RepeatBlockOptions<M>) {
    super(opts as MaskedPatternOptions);
  }

  override updateOptions (opts: UpdateOpts<RepeatBlockOptions<M>>) {
    super.updateOptions(opts as MaskedPatternOptions);
  }

  override _update (opts: UpdateOpts<M> & RepeatBlockExtraOptions<M>) {
    const { repeat, ...block } = normalizeOpts(opts) as any; // TODO type
    this.block = createMask(Object.assign({}, this.block, block));
    this.repeat = repeat ?? this.block.repeat ?? this.repeat ?? Infinity;

    super._update({
      mask: 'm'.repeat(Math.max(this.repeat == Infinity ? (this._blocks?.length || 1) : this.repeat, 1)),
      blocks: { m: this.block },
      eager: this.block.eager,
      overwrite: this.block.overwrite,
      skipInvalid: this.block.skipInvalid,
      lazy: (this.block as MaskedPattern).lazy,
      placeholderChar: (this.block as MaskedPattern).placeholderChar,
      displayChar: (this.block as MaskedPattern).displayChar,
    });
  }

  _allocateBlock (bi: number): PatternBlock | undefined {
    if (bi < this._blocks.length) return this._blocks[bi];
    if (this.repeat === Infinity || this._blocks.length < this.repeat) {
      this._blocks.push(createMask({ mask: this.block }));
      this.mask += 'm';
      return this._blocks[this._blocks.length - 1];
    }
  }

  override _appendCharRaw (ch: string, flags: AppendFlags<MaskedPatternState>={}): ChangeDetails {
    const blockIter = this._mapPosToBlock(this.displayValue.length);
    const details = new ChangeDetails();
    if (!blockIter) return details;

    for (
      let bi=blockIter.index, block, allocated;
      // try to get a block or
      // try to allocate a new block if not allocated already
      (block = this._blocks[bi] ?? (allocated = !allocated && this._allocateBlock(bi)));
      ++bi
    ) {
      const blockDetails = block._appendChar(ch, { ...flags, _beforeTailState: flags._beforeTailState?._blocks?.[bi] });

      if (blockDetails.skip && allocated) {
        // remove the last allocated block and break
        this._blocks.pop();
        this.mask = this.mask.slice(1);
        break;
      }

      details.aggregate(blockDetails);

      if (blockDetails.skip || blockDetails.rawInserted) break; // go next char
    }

    return details;
  }

  _trimEmptyTail (fromPos: number=0, toPos?: number): void {
    if (this.repeat !== Infinity) return;

    const firstBlockIndex = Math.max(this._mapPosToBlock(fromPos)?.index || 0, 1);
    let blockIndex;
    if (toPos != null) blockIndex = this._mapPosToBlock(toPos)?.index;
    if (blockIndex == null) blockIndex = this._blocks.length - 1;

    for (; firstBlockIndex <= blockIndex; --blockIndex) {
      if (this._blocks[blockIndex].unmaskedValue) break;
      this._blocks.splice(blockIndex, 1);
      this.mask = this.mask.slice(1);
    }
  }

  override remove (fromPos: number=0, toPos: number=this.displayValue.length): ChangeDetails {
    const removeDetails = super.remove(fromPos, toPos);
    this._trimEmptyTail(fromPos, toPos);
    return removeDetails;
  }

  override totalInputPositions (fromPos: number=0, toPos?: number): number {
    if (toPos == null && this.repeat === Infinity) return Infinity;
    return super.totalInputPositions(fromPos, toPos);
  }

  override get state (): MaskedPatternState {
    return super.state;
  }

  override set state (state: MaskedPatternState) {
    this._blocks.length = state._blocks.length;
    this.mask = this.mask.slice(0, this._blocks.length);
    super.state = state;
  }
}


IMask.RepeatBlock = RepeatBlock;
