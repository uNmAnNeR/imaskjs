import createMask from './factory';


export
const PIPE_TYPE = {
  MASKED: 'value',
  UNMASKED: 'unmaskedValue',
  TYPED: 'typedValue',
};

export
function createPipe (mask, from=PIPE_TYPE.MASKED, to=PIPE_TYPE.MASKED) {
  const masked = createMask(mask);
  return (value) => masked.runIsolated(m => {
    m[from] = value;
    return m[to];
  });
}

export
function pipe (value, ...pipeArgs) {
  return createPipe(...pipeArgs)(value);
}
