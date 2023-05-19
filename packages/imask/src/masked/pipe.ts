import createMask, { type FactoryArg } from './factory';
import IMask from '../core/holder';


// TODO use enum?
/** Mask pipe source and destination types */
export
const PIPE_TYPE = {
  MASKED: 'value',
  UNMASKED: 'unmaskedValue',
  TYPED: 'typedValue',
} as const;

type ValueOf<T> = T[keyof T];

/** Creates new pipe function depending on mask type, source and destination options */
export
function createPipe<Opts extends FactoryArg> (
  mask: Opts,
  from: ValueOf<typeof PIPE_TYPE>=PIPE_TYPE.MASKED,
  to: ValueOf<typeof PIPE_TYPE>=PIPE_TYPE.MASKED
) {
  const masked = createMask(mask);
  return (value: any) => masked.runIsolated(m => {
    m[from] = value;
    return m[to];
  });
}

/** Pipes value through mask depending on mask type, source and destination options */
export
function pipe<Opts extends FactoryArg> (value: any, mask: Opts, from?: ValueOf<typeof PIPE_TYPE>, to?: ValueOf<typeof PIPE_TYPE>) {
  return createPipe(mask, from, to)(value);
}


IMask.PIPE_TYPE = PIPE_TYPE;
IMask.createPipe = createPipe;
IMask.pipe = pipe;
