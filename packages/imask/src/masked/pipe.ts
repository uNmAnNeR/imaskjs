import createMask, { type FactoryArg, type FactoryReturnMasked } from './factory';
import IMask from '../core/holder';


/** Mask pipe source and destination types */
export
const PIPE_TYPE = {
  MASKED: 'value',
  UNMASKED: 'unmaskedValue',
  TYPED: 'typedValue',
} as const;

type ValueOf<T> = T[keyof T];

type TypedValueOf<
  Opts extends FactoryArg,
  Type extends ValueOf<typeof PIPE_TYPE>
> = Type extends (typeof PIPE_TYPE.MASKED | typeof PIPE_TYPE.UNMASKED) ?
  string :
  FactoryReturnMasked<Opts>['typedValue']
;

/** Creates new pipe function depending on mask type, source and destination options */
export
function createPipe<
  Arg extends FactoryArg,
  From extends ValueOf<typeof PIPE_TYPE> = typeof PIPE_TYPE.MASKED,
  To extends ValueOf<typeof PIPE_TYPE> = typeof PIPE_TYPE.MASKED,
> (
  arg: Arg,
  from: From=PIPE_TYPE.MASKED as From,
  to: To=PIPE_TYPE.MASKED as To,
) {
  const masked = createMask(arg);
  return (value: TypedValueOf<Arg, From>) => masked.runIsolated(m => {
    m[from] = value;
    return m[to] as TypedValueOf<Arg, To>;
  });
}

/** Pipes value through mask depending on mask type, source and destination options */
export
function pipe<
  Arg extends FactoryArg,
  From extends ValueOf<typeof PIPE_TYPE> = typeof PIPE_TYPE.MASKED,
  To extends ValueOf<typeof PIPE_TYPE> = typeof PIPE_TYPE.MASKED,
> (
  value: TypedValueOf<Arg, From>,
  mask: Arg,
  from?: From,
  to?: To,
) {
  return createPipe(mask, from, to)(value);
}


IMask.PIPE_TYPE = PIPE_TYPE;
IMask.createPipe = createPipe;
IMask.pipe = pipe;
