// @flow
import { type TailDetails } from '../../core/tail-details.js';


export
type TailInputChunk = TailDetails | ChunksTailDetails;

export
class ChunksTailDetails implements TailDetails {
  chunks: Array<TailInputChunk>;
  stop: ?number;

  constructor (chunks: Array<TailInputChunk>) {
    this.chunks = chunks;
  }

  get value (): string {
    return this.chunks.map(c => c.value).join('');
  }

  get from (): number {
    // TODO find first in array
    return 0;
  }
}
