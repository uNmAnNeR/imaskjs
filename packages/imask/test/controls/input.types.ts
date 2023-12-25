import type InputMask from '../../src/controls/input';
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
import { type MaskedEnumOptions } from '../../src/masked/enum';
import { type MaskedDateOptions } from '../../src/masked/date';
import { type MaskedRangeOptions } from '../../src/masked/range';

class MyMasked extends Masked {
  declare overwrite?: boolean | 'shift' | undefined;
  declare eager?: boolean | 'remove' | 'append' | undefined;
  declare skipInvalid?: boolean | undefined;
}

type cases = [
  Check<Equal<Parameters<InputMask<{ mask: DateConstructor }>['updateOptions']>, [Partial<MaskedDateOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: ArrayConstructor }>['updateOptions']>, [Partial<MaskedDynamicOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: () => boolean }>['updateOptions']>, [Partial<MaskedFunctionOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: NumberConstructor }>['updateOptions']>, [Partial<MaskedNumberOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: string }>['updateOptions']>, [Partial<MaskedPatternOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: RegExp }>['updateOptions']>, [Partial<MaskedRegExpOptions>]>>,

  Check<Equal<Parameters<InputMask<{ mask: MaskedDate }>['updateOptions']>, [Partial<MaskedDateOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: MaskedDynamic }>['updateOptions']>, [Partial<MaskedDynamicOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: MaskedEnum }>['updateOptions']>, [Partial<MaskedEnumOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: MaskedFunction }>['updateOptions']>, [Partial<MaskedFunctionOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: MaskedNumber }>['updateOptions']>, [Partial<MaskedNumberOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: MaskedPattern }>['updateOptions']>, [Partial<MaskedPatternOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: MaskedRange }>['updateOptions']>, [Partial<MaskedRangeOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: MaskedRegExp }>['updateOptions']>, [Partial<MaskedRegExpOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: MyMasked }>['updateOptions']>, [Partial<Record<string, any>>]>>,

  Check<Equal<Parameters<InputMask<MaskedDate>['updateOptions']>, [Partial<MaskedDateOptions>]>>,
  Check<Equal<Parameters<InputMask<MaskedDynamic>['updateOptions']>, [Partial<MaskedDynamicOptions>]>>,
  Check<Equal<Parameters<InputMask<MaskedEnum>['updateOptions']>, [Partial<MaskedEnumOptions>]>>,
  Check<Equal<Parameters<InputMask<MaskedFunction>['updateOptions']>, [Partial<MaskedFunctionOptions>]>>,
  Check<Equal<Parameters<InputMask<MaskedNumber>['updateOptions']>, [Partial<MaskedNumberOptions>]>>,
  Check<Equal<Parameters<InputMask<MaskedPattern>['updateOptions']>, [Partial<MaskedPatternOptions>]>>,
  Check<Equal<Parameters<InputMask<MaskedRange>['updateOptions']>, [Partial<MaskedRangeOptions>]>>,
  Check<Equal<Parameters<InputMask<MaskedRegExp>['updateOptions']>, [Partial<MaskedRegExpOptions>]>>,
  Check<Equal<Parameters<InputMask<MyMasked>['updateOptions']>, [Partial<Record<string, any>>]>>,

  Check<Equal<Parameters<InputMask<{ mask: typeof MaskedDate }>['updateOptions']>, [Partial<MaskedDateOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: typeof MaskedDynamic }>['updateOptions']>, [Partial<MaskedDynamicOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: typeof MaskedEnum, enum: string[] }>['updateOptions']>, [Partial<MaskedEnumOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: typeof MaskedFunction }>['updateOptions']>, [Partial<MaskedFunctionOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: typeof MaskedNumber }>['updateOptions']>, [Partial<MaskedNumberOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: typeof MaskedPattern }>['updateOptions']>, [Partial<MaskedPatternOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: typeof MaskedRange, from: number, to: number }>['updateOptions']>, [Partial<MaskedRangeOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: typeof MaskedRegExp }>['updateOptions']>, [Partial<MaskedRegExpOptions>]>>,
  Check<Equal<Parameters<InputMask<{ mask: typeof MyMasked }>['updateOptions']>, [Partial<Record<string, any>>]>>,
];
