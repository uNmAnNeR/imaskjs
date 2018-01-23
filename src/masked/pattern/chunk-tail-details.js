// @flow
import {type TailDetails} from '../../core/tail-details.js';


export
type TailInputChunk = {
  stop: ?number,
  value: string
};

export
class ChunksTailDetails implements TailDetails {
  chunks: Array<TailInputChunk>;

  constructor (chunks: Array<TailInputChunk>) {
    this.chunks = chunks;
  }

  get value (): string {
    return this.chunks.map(c => c.value).join('');
  }

  get fromPos (): ?number {
    const firstChunk = this.chunks[0];
    return firstChunk && firstChunk.stop;
  }

  get toPos (): ?number {
    const lastChunk = this.chunks[this.chunks.length - 1];
    return lastChunk && lastChunk.stop;
  }
}
