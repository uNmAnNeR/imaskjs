import { type FactoryReturnMasked } from '../../src/masked/factory';
import { type Check, type Equal } from '../types';

import { createPipe, pipe, PIPE_TYPE } from '../../src/masked/pipe';
import { type MaskedNumberOptions } from '../../src/masked/number';

type Arg<T extends (...args: any[]) => any> = Parameters<T>[0];

type cases = [
  Check<Equal<Arg<ReturnType<typeof createPipe<MaskedNumberOptions, 'value', 'value'>>>, string>>,
  Check<Equal<ReturnType<ReturnType<typeof createPipe<MaskedNumberOptions, 'value', 'value'>>>, string>>,

  Check<Equal<Arg<ReturnType<typeof createPipe<MaskedNumberOptions, 'typedValue', 'value'>>>, number>>,
  Check<Equal<ReturnType<ReturnType<typeof createPipe<MaskedNumberOptions, 'typedValue', 'value'>>>, string>>,

  Check<Equal<Arg<ReturnType<typeof createPipe<MaskedNumberOptions, 'value', 'typedValue'>>>, string>>,
  Check<Equal<ReturnType<ReturnType<typeof createPipe<MaskedNumberOptions, 'value', 'typedValue'>>>, number>>,

  Check<Equal<Arg<ReturnType<typeof createPipe<MaskedNumberOptions, 'typedValue', 'typedValue'>>>, number>>,
  Check<Equal<ReturnType<ReturnType<typeof createPipe<MaskedNumberOptions, 'typedValue', 'typedValue'>>>, number>>,

  Check<Equal<Arg<typeof pipe<MaskedNumberOptions, 'value', 'value'>>, string>>,
  Check<Equal<ReturnType<typeof pipe<MaskedNumberOptions, 'value', 'value'>>, string>>,

  Check<Equal<Arg<typeof pipe<MaskedNumberOptions, 'typedValue', 'value'>>, number>>,
  Check<Equal<ReturnType<typeof pipe<MaskedNumberOptions, 'typedValue', 'value'>>, string>>,

  Check<Equal<Arg<typeof pipe<MaskedNumberOptions, 'value', 'typedValue'>>, string>>,
  Check<Equal<ReturnType<typeof pipe<MaskedNumberOptions, 'value', 'typedValue'>>, number>>,

  Check<Equal<Arg<typeof pipe<MaskedNumberOptions, 'typedValue', 'typedValue'>>, number>>,
  Check<Equal<ReturnType<typeof pipe<MaskedNumberOptions, 'typedValue', 'typedValue'>>, number>>,
];
