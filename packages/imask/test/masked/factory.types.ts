import { type FactoryReturnMasked, type NormalizedOpts, type FactoryConstructorOpts } from '../../src/masked/factory';
import { type Check, type Equal } from '../types';

import Masked from '../../src/masked/base';
import type MaskedDate from '../../src/masked/date';
import type MaskedDynamic from '../../src/masked/dynamic';
import type MaskedEnum from '../../src/masked/enum';
import type MaskedFunction from '../../src/masked/function';
import type MaskedNumber from '../../src/masked/number';
import type MaskedPattern from '../../src/masked/pattern';
import type MaskedRange from '../../src/masked/range';
import type MaskedRegExp from '../../src/masked/regexp';

import { type MaskedDynamicOptions } from '../../src/masked/dynamic';
import { type MaskedFunctionOptions } from '../../src/masked/function';
import { type MaskedNumberOptions } from '../../src/masked/number';
import { type MaskedPatternOptions } from '../../src/masked/pattern';
import { type MaskedRegExpOptions } from '../../src/masked/regexp';

class MyMasked extends Masked {
  declare overwrite?: boolean | 'shift' | undefined;
  declare eager?: boolean | 'remove' | 'append' | undefined;
  declare skipInvalid?: boolean | undefined;
}


type cases = [
  Check<Equal<FactoryReturnMasked<{ mask: MaskedRegExp }>, MaskedRegExp>>,
  Check<Equal<FactoryReturnMasked<{ mask: MaskedPattern }>, MaskedPattern>>,
  Check<Equal<FactoryReturnMasked<{ mask: MaskedFunction }>, MaskedFunction>>,
  Check<Equal<FactoryReturnMasked<{ mask: MaskedDate }>, MaskedDate>>,
  Check<Equal<FactoryReturnMasked<{ mask: MaskedNumber }>, MaskedNumber>>,
  Check<Equal<FactoryReturnMasked<{ mask: MaskedDynamic }>, MaskedDynamic>>,
  Check<Equal<FactoryReturnMasked<{ mask: MaskedRange }>, MaskedRange>>,
  Check<Equal<FactoryReturnMasked<{ mask: MaskedEnum }>, MaskedEnum>>,
  Check<Equal<FactoryReturnMasked<{ mask: MyMasked }>, MyMasked>>,

  Check<Equal<FactoryReturnMasked<{ mask: typeof MaskedRegExp }>, MaskedRegExp>>,
  Check<Equal<FactoryReturnMasked<{ mask: typeof MaskedPattern }>, MaskedPattern>>,
  Check<Equal<FactoryReturnMasked<{ mask: typeof MaskedFunction }>, MaskedFunction>>,
  Check<Equal<FactoryReturnMasked<{ mask: typeof MaskedDate }>, MaskedDate>>,
  Check<Equal<FactoryReturnMasked<{ mask: typeof MaskedNumber }>, MaskedNumber>>,
  Check<Equal<FactoryReturnMasked<{ mask: typeof MaskedDynamic }>, MaskedDynamic>>,
  Check<Equal<FactoryReturnMasked<{ mask: typeof MaskedRange }>, MaskedRange>>,
  Check<Equal<FactoryReturnMasked<{ mask: typeof MaskedEnum }>, MaskedEnum>>,

  Check<Equal<FactoryReturnMasked<MaskedRegExp>, MaskedRegExp>>,
  Check<Equal<FactoryReturnMasked<MaskedPattern>, MaskedPattern>>,
  Check<Equal<FactoryReturnMasked<MaskedFunction>, MaskedFunction>>,
  Check<Equal<FactoryReturnMasked<MaskedDate>, MaskedDate>>,
  Check<Equal<FactoryReturnMasked<MaskedNumber>, MaskedNumber>>,
  Check<Equal<FactoryReturnMasked<MaskedDynamic>, MaskedDynamic>>,
  Check<Equal<FactoryReturnMasked<MaskedRange>, MaskedRange>>,
  Check<Equal<FactoryReturnMasked<MaskedEnum>, MaskedEnum>>,

  Check<Equal<FactoryReturnMasked<MaskedRegExpOptions>, MaskedRegExp>>,
  Check<Equal<FactoryReturnMasked<MaskedPatternOptions>, MaskedPattern>>,
  Check<Equal<FactoryReturnMasked<MaskedFunctionOptions>, MaskedFunction>>,
  Check<Equal<FactoryReturnMasked<{ mask: DateConstructor }>, MaskedDate>>,
  Check<Equal<FactoryReturnMasked<MaskedNumberOptions>, MaskedNumber>>,
  Check<Equal<FactoryReturnMasked<MaskedDynamicOptions>, MaskedDynamic>>,

  Check<Equal<FactoryReturnMasked<MaskedNumberOptions>['typedValue'], number>>,

  Check<Equal<NormalizedOpts<MaskedNumberOptions>, MaskedNumberOptions>>,
  Check<NormalizedOpts<{ mask: MaskedNumber }> extends { _mask: MaskedNumber, mask: typeof MaskedNumber } ? true : false>,
  Check<NormalizedOpts<MaskedNumber> extends { _mask: MaskedNumber, mask: typeof MaskedNumber } ? true : false>,
  Check<Equal<NormalizedOpts<{ mask: typeof MaskedNumber }>, { mask: typeof MaskedNumber }>>,
  Check<Equal<NormalizedOpts<NumberConstructor>, { mask: NumberConstructor }>>,
  Check<FactoryConstructorOpts extends Partial<NormalizedOpts<FactoryConstructorOpts>> ? true : false>,
];
