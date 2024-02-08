import type { TailDetails, AppendTail } from '../../core/tail-details';
import ChangeDetails from '../../core/change-details';
import { isString } from '../../core/utils';
import ContinuousTailDetails from '../../core/continuous-tail-details';
import IMask from '../../core/holder';
import type MaskedPattern from '../pattern';


export
type ChunksTailState = Pick<ChunksTailDetails,
  | 'from'
  | 'stop'
  | 'blockIndex'
> & { chunks: Array<TailDetails['state']> };

export default
class ChunksTailDetails implements TailDetails {
  declare chunks: Array<TailDetails>;
  declare from: number;
  declare stop?: number;
  /** */
  declare blockIndex?: number;

  constructor (chunks: Array<TailDetails>=[], from: number=0) {
    this.chunks = chunks;
    this.from = from;
  }

  toString (): string {
    return this.chunks.map(String).join('');
  }

  extend (tailChunk: string | String | TailDetails): void {
    if (!String(tailChunk)) return;
    tailChunk = (isString(tailChunk) ? new ContinuousTailDetails(String(tailChunk)) : tailChunk) as TailDetails;

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
          firstTailChunk = tailChunk.chunks.shift() as TailDetails;  // not possible to be `undefined` because length was checked above
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

  appendTo (masked: AppendTail | MaskedPattern): ChangeDetails {
    if (!(masked instanceof IMask.MaskedPattern)) {
      const tail = new ContinuousTailDetails(this.toString());
      return tail.appendTo(masked);
    }

    const details = new ChangeDetails();

    for (let ci=0; ci < this.chunks.length; ++ci) {
      const chunk = this.chunks[ci];

      const lastBlockIter = masked._mapPosToBlock(masked.displayValue.length);
      const stop = chunk.stop;
      let chunkBlock;
      if (stop != null &&
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
        details.aggregate(tailDetails);

        // get not inserted chars
        const remainChars = chunk.toString().slice(tailDetails.rawInserted.length);
        if (remainChars) details.aggregate(masked.append(remainChars, { tail: true }));
      } else {
        details.aggregate(masked.append(chunk.toString(), { tail: true }));
      }
    }

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
      chunk.state = cstate;
      return chunk;
    });
  }

  unshift (beforePos?: number): string {
    if (!this.chunks.length || (beforePos != null && this.from >= beforePos)) return '';

    const chunkShiftPos = beforePos != null ? beforePos - this.from : beforePos;
    let ci=0;
    while (ci < this.chunks.length) {
      const chunk = this.chunks[ci];
      const shiftChar = chunk.unshift(chunkShiftPos);

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

  shift (): string {
    if (!this.chunks.length) return '';

    let ci=this.chunks.length-1;
    while (0 <= ci) {
      const chunk = this.chunks[ci];
      const shiftChar = chunk.shift();

      if (chunk.toString()) {
        // chunk still contains value
        // but not shifted - means no more available chars to shift
        if (!shiftChar) break;
        --ci;
      } else {
        // clean if chunk has no value
        this.chunks.splice(ci, 1);
      }

      if (shiftChar) return shiftChar;
    }

    return '';
  }
}
