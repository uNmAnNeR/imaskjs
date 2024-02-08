import ChangeDetails from '../core/change-details';
import IMask from '../core/holder';
import { type AppendFlags } from './base';
import createMask, { type FactoryArg, normalizeOpts, type ExtendFactoryArgOptions, type UpdateOpts } from './factory';
import MaskedPattern, { type BlockExtraOptions, type MaskedPatternOptions, type MaskedPatternState } from './pattern';
import type PatternBlock from './pattern/block';


export
type RepeatBlockExtraOptions = Pick<BlockExtraOptions, 'repeat'>;

export
type RepeatBlockOptions = ExtendFactoryArgOptions<RepeatBlockExtraOptions>;


/** Pattern mask */
export default
class RepeatBlock<M extends FactoryArg> extends MaskedPattern {
  declare _blockOpts: M & { repeat?: number };
  declare repeat: Required<RepeatBlockExtraOptions>['repeat'];


  get repeatFrom (): number {
    return (
      Array.isArray(this.repeat) ? this.repeat[0] :
      this.repeat === Infinity ? 0 : this.repeat
    ) ?? 0;
  }

  get repeatTo (): number {
    return (Array.isArray(this.repeat) ? this.repeat[1] : this.repeat) ?? Infinity;
  }

  constructor (opts: RepeatBlockOptions) {
    super(opts as MaskedPatternOptions);
  }

  override updateOptions (opts: UpdateOpts<RepeatBlockOptions>) {
    super.updateOptions(opts as MaskedPatternOptions);
  }

  override _update (opts: UpdateOpts<M> & RepeatBlockExtraOptions) {
    const { repeat, ...blockOpts } = normalizeOpts(opts) as any; // TODO type
    this._blockOpts = Object.assign({}, this._blockOpts, blockOpts);
    const block = createMask(this._blockOpts);
    this.repeat = repeat ?? (block as any).repeat ?? this.repeat ?? Infinity; // TODO type

    super._update({
      mask: 'm'.repeat(Math.max(this.repeatTo === Infinity && this._blocks?.length || 0, this.repeatFrom)),
      blocks: { m: block },
      eager: block.eager,
      overwrite: block.overwrite,
      skipInvalid: block.skipInvalid,
      lazy: (block as MaskedPattern).lazy,
      placeholderChar: (block as MaskedPattern).placeholderChar,
      displayChar: (block as MaskedPattern).displayChar,
    });
  }

  _allocateBlock (bi: number): PatternBlock | undefined {
    if (bi < this._blocks.length) return this._blocks[bi];
    if (this.repeatTo === Infinity || this._blocks.length < this.repeatTo) {
      this._blocks.push(createMask(this._blockOpts));
      this.mask += 'm';
      return this._blocks[this._blocks.length - 1];
    }
  }

  override _appendCharRaw (ch: string, flags: AppendFlags<MaskedPatternState>={}): ChangeDetails {
    const details = new ChangeDetails();

    for (
      let bi=this._mapPosToBlock(this.displayValue.length)?.index ?? Math.max(this._blocks.length - 1, 0), block, allocated;
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

      if (blockDetails.consumed) break; // go next char
    }

    return details;
  }

  _trimEmptyTail (fromPos: number=0, toPos?: number): void {
    const firstBlockIndex = Math.max(this._mapPosToBlock(fromPos)?.index || 0, this.repeatFrom, 0);
    let lastBlockIndex;
    if (toPos != null) lastBlockIndex = this._mapPosToBlock(toPos)?.index;
    if (lastBlockIndex == null) lastBlockIndex = this._blocks.length - 1;

    let removeCount = 0;
    for (let blockIndex = lastBlockIndex; firstBlockIndex <= blockIndex; --blockIndex, ++removeCount) {
      if (this._blocks[blockIndex].unmaskedValue) break;
    }

    if (removeCount) {
      this._blocks.splice(lastBlockIndex - removeCount + 1, removeCount);
      this.mask = this.mask.slice(removeCount);
    }
  }

  override reset () {
    super.reset();
    this._trimEmptyTail();
  }

  override remove (fromPos: number=0, toPos: number=this.displayValue.length): ChangeDetails {
    const removeDetails = super.remove(fromPos, toPos);
    this._trimEmptyTail(fromPos, toPos);
    return removeDetails;
  }

  override totalInputPositions (fromPos: number=0, toPos?: number): number {
    if (toPos == null && this.repeatTo === Infinity) return Infinity;
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
