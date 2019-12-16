// @flow
import type { TailDetails, AppendTail } from '../../core/tail-details.js';
import ChangeDetails from '../../core/change-details.js';
import { isString } from '../../core/utils.js';
import ContinuousTailDetails from '../../core/continuous-tail-details.js';
import IMask from '../../core/holder.js';


type ChunksTailState = {
  chunks: $PropertyType<ChunksTailDetails, 'chunks'>,
  from: $PropertyType<ChunksTailDetails, 'from'>,
  stop?: $PropertyType<ChunksTailDetails, 'stop'>,
  blockIndex?: $PropertyType<ChunksTailDetails, 'blockIndex'>,
};

export default
class ChunksTailDetails implements TailDetails {
  chunks: Array<TailDetails>;
  from: number;
  stop: ?number;
  /** */
  blockIndex: ?number;

  constructor (chunks?: Array<TailDetails>=[], from?: number=0) {
    this.chunks = chunks;
    this.from = from;
  }

  toString (): string {
    return this.chunks.map(String).join('');
  }

  // $FlowFixMe no ideas
  extend (tailChunk: string | TailDetails): void {
    if (!String(tailChunk)) return;
    if (isString(tailChunk)) tailChunk = new ContinuousTailDetails(String(tailChunk));

    const lastChunk = this.chunks[this.chunks.length-1];
    const extendLast = lastChunk &&
      // if stops are same or tail has no stop
      (lastChunk.stop === tailChunk.stop || tailChunk.stop == null) &&
      // if tail chunk goes just after last chunk
      tailChunk.from === (lastChunk.from + lastChunk.toString().length);

    if (tailChunk instanceof ContinuousTailDetails) {
      // check the ability to extend previous chunk
      if (extendLast) {
        // extend previous chunk
        lastChunk.extend(tailChunk.toString());
      } else {
        // append new chunk
        this.chunks.push(tailChunk);
      }
    } else if (tailChunk instanceof ChunksTailDetails) {
      if (tailChunk.stop == null) {
        // unwrap floating chunks to parent, keeping `from` pos
        let firstTailChunk;
        while (tailChunk.chunks.length && tailChunk.chunks[0].stop == null) {
          firstTailChunk = tailChunk.chunks.shift();
          firstTailChunk.from += tailChunk.from;
          this.extend(firstTailChunk);
        }
      }

      // if tail chunk still has value
      if (tailChunk.toString()) {
        // if chunks contains stops, then popup stop to container
        tailChunk.stop = tailChunk.blockIndex;
        this.chunks.push(tailChunk);
      }
    }
  }

  appendTo (masked: AppendTail): ChangeDetails {
    // $FlowFixMe
    if (!(masked instanceof IMask.MaskedPattern)) {
      const tail = new ContinuousTailDetails(this.toString());
      return tail.appendTo(masked);
    }

    const details = new ChangeDetails();

    for (let ci=0; ci < this.chunks.length && !details.skip; ++ci) {
      const chunk = this.chunks[ci];

      const lastBlockIter = masked._mapPosToBlock(masked.value.length);
      const stop = chunk.stop;
      let chunkBlock;
      if (stop &&
        // if block not found or stop is behind lastBlock
        (!lastBlockIter || lastBlockIter.index <= stop)
      ) {
        if (
          chunk instanceof ChunksTailDetails ||
          // for continuous block also check if stop is exist
          masked._stops.indexOf(stop) >= 0
        ) {
          details.aggregate(masked._appendPlaceholder(stop));
        }
        chunkBlock = chunk instanceof ChunksTailDetails && masked._blocks[stop];
      }

      if (chunkBlock) {
        const tailDetails = chunkBlock.appendTail(chunk);
        tailDetails.skip = false; // always ignore skip, it will be set on last
        details.aggregate(tailDetails);
        masked._value += tailDetails.inserted;

        // get not inserted chars
        const remainChars = chunk.toString().slice(tailDetails.rawInserted.length);
        if (remainChars) details.aggregate(masked.append(remainChars, { tail: true }));
      } else {
        details.aggregate(masked.append(chunk.toString(), { tail: true }));
      }
    };

    return details;
  }

  get state (): ChunksTailState {
    return {
      chunks: this.chunks.map(c => c.state),
      from: this.from,
      stop: this.stop,
      blockIndex: this.blockIndex,
    };
  }

  set state (state: ChunksTailState) {
    const { chunks, ...props } = state;
    Object.assign(this, props);
    this.chunks = chunks.map(cstate => {
      const chunk = "chunks" in cstate ?
        new ChunksTailDetails() :
        new ContinuousTailDetails();
      // $FlowFixMe already checked above
      chunk.state = cstate;
      return chunk;
    });
  }

  shiftBefore (pos: number): string {
    if (this.from >= pos || !this.chunks.length) return '';

    const chunkShiftPos = pos - this.from;
    let ci=0;
    while (ci < this.chunks.length) {
      const chunk = this.chunks[ci];
      const shiftChar = chunk.shiftBefore(chunkShiftPos);

      if (chunk.toString()) {
        // chunk still contains value
        // but not shifted - means no more available chars to shift
        if (!shiftChar) break;
        ++ci;
      } else {
        // clean if chunk has no value
        this.chunks.splice(ci, 1);
      }

      if (shiftChar) return shiftChar;
    }

    return '';
  }
}
