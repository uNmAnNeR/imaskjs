import createMask from './factory';
import IMask from '../core/holder.js';


/** Mask pipe source and destination types */
export
const PIPE_TYPE = {
  MASKED: 'value',
  UNMASKED: 'unmaskedValue',
  TYPED: 'typedValue',
};

/** Creates new pipe function depending on mask type, source and destination options */
export
function createPipe (mask, from=PIPE_TYPE.MASKED, to=PIPE_TYPE.MASKED) {
  const masked = createMask(mask);
  return (value) => masked.runIsolated(m => {
    m[from] = value;
    return m[to];
  });
}

/** Pipes value through mask depending on mask type, source and destination options */
export
function pipe (value, ...pipeArgs) {
  return createPipe(...pipeArgs)(value);
}


IMask.PIPE_TYPE = PIPE_TYPE;
IMask.createPipe = createPipe;
IMask.pipe = pipe;
