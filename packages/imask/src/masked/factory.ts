import { isString, pick, isObject } from '../core/utils';
import type Masked from './base';
import { type MaskedOptions } from './base';
import IMask from '../core/holder';

import type MaskedRegExp from './regexp';
import type MaskedPattern from './pattern';
import type MaskedFunction from './function';
import type MaskedDate from './date';
import type MaskedNumber from './number';
import type MaskedDynamic from './dynamic';
import type MaskedRange from './range';
import type MaskedEnum from './enum';

import { type MaskedEnumOptions } from './enum';
import { type MaskedRangeOptions } from './range';
import { type MaskedDynamicOptions } from './dynamic';
import { type MaskedPatternOptions } from './pattern';
import { type MaskedNumberOptions } from './number';
import { type MaskedRegExpOptions } from './regexp';
import { type MaskedFunctionOptions } from './function';
import { type MaskedDateOptions } from './date';

type MaskedDateFactoryOptions = Omit<MaskedDateOptions, 'mask'> & { mask: DateConstructor };


type MaskedConstructor =
  | typeof MaskedDate
  | typeof MaskedNumber
  | typeof MaskedEnum
  | typeof MaskedRange
  | typeof MaskedRegExp
  | typeof MaskedFunction
  | typeof MaskedPattern
  | typeof MaskedDynamic
  | typeof MaskedRegExp
;

export type AnyMaskedOptions =
  | MaskedDateFactoryOptions
  | MaskedNumberOptions
  | MaskedPatternOptions
  | MaskedDynamicOptions
  | MaskedEnumOptions
  | MaskedRangeOptions
  | MaskedRegExpOptions
  | MaskedFunctionOptions
  | MaskedOptions<Masked>
  | { mask: MaskedConstructor }
;

export type AnyMask =
  | MaskedDateFactoryOptions['mask']
  | MaskedNumberOptions['mask']
  | MaskedPatternOptions['mask']
  | MaskedDynamicOptions['mask']
  | MaskedRegExpOptions['mask']
  | MaskedFunctionOptions['mask']
  | Masked
  | MaskedConstructor
;

export
type FactoryStaticOpts =
  | MaskedDateFactoryOptions
  | MaskedNumberOptions
  | MaskedPatternOptions
  | MaskedDynamicOptions
  | MaskedRegExpOptions
  | MaskedFunctionOptions
;

export
type FactoryStaticReturnMasked<Opts extends FactoryStaticOpts> =
  Opts extends MaskedDateFactoryOptions
  ? MaskedDate
  : Opts extends MaskedNumberOptions
  ? MaskedNumber
  : Opts extends MaskedEnumOptions
  ? MaskedEnum
  : Opts extends MaskedRangeOptions
  ? MaskedRange
  : Opts extends MaskedPatternOptions
  ? MaskedPattern
  : Opts extends MaskedDynamicOptions
  ? MaskedDynamic
  : Opts extends MaskedRegExpOptions
  ? MaskedRegExp
  : Opts extends MaskedFunctionOptions
  ? MaskedFunction
  : never
;


export
type FactoryInstanceOpts = MaskedOptions & { mask: Masked };

export
type FactoryInstanceReturnMasked<Opts extends FactoryInstanceOpts> = Opts extends { mask: infer Masked } ? Masked : never;

export
type DeduceMaskedFromOpts<Opts extends FactoryStaticOpts> =
  Opts extends MaskedPatternOptions
  ? MaskedPattern
  : Opts extends MaskedDateFactoryOptions
  ? MaskedDate
  : Opts extends MaskedNumberOptions
  ? MaskedNumber
  : Opts extends MaskedRegExpOptions
  ? MaskedRegExp
  : Opts extends MaskedFunctionOptions
  ? MaskedFunction
  : Opts extends MaskedDynamicOptions
  ? MaskedDynamic
  : Opts extends FactoryInstanceOpts
  ? FactoryInstanceReturnMasked<Opts>
  : never

export
type FactoryConstructorOpts = MaskedOptions & { mask:
  | typeof Masked
  | typeof MaskedDate
  | typeof MaskedNumber
  | typeof MaskedEnum
  | typeof MaskedRange
  | typeof MaskedRegExp
  | typeof MaskedFunction
  | typeof MaskedPattern
  | typeof MaskedDynamic
  | typeof MaskedRegExp
};
 
export
type FactoryConstructorReturnMasked<Opts extends FactoryConstructorOpts> =
  Opts extends { mask: typeof MaskedDate } ?
  MaskedDate :
  Opts extends { mask: typeof MaskedNumber } ?
  MaskedNumber :
  Opts extends { mask: typeof MaskedEnum } ?
  MaskedEnum :
  Opts extends { mask: typeof MaskedRange } ?
  MaskedRange :
  Opts extends { mask: typeof MaskedRegExp } ?
  MaskedRegExp :
  Opts extends { mask: typeof MaskedFunction } ?
  MaskedFunction :
  Opts extends { mask: typeof MaskedPattern } ?
  MaskedPattern :
  Opts extends { mask: typeof MaskedDynamic } ?
  MaskedDynamic :
  Opts extends { mask: typeof MaskedRegExp } ?
  MaskedRegExp :
  Masked
;

export
type FactoryOpts = FactoryConstructorOpts | FactoryInstanceOpts | FactoryStaticOpts;

export
type FactoryArg = Masked | FactoryOpts;

export
type FactoryReturnMasked<Opts extends FactoryArg> =
  Opts extends Masked
  ? Opts
  : Opts extends FactoryConstructorOpts
  ? FactoryConstructorReturnMasked<Opts>
  : Opts extends FactoryInstanceOpts
  ? FactoryInstanceReturnMasked<Opts>
  : Opts extends FactoryStaticOpts
  ? FactoryStaticReturnMasked<Opts>
  : never;


export
type DeduceMasked<Opts> =
  Opts extends Masked
  ? Opts
  : Opts extends FactoryStaticOpts
    ? DeduceMaskedFromOpts<Opts>
    : never;


export
type DeduceMaskedClass<Mask> =
  Mask extends Masked
    ? typeof Masked
    : Mask extends string
      ? typeof IMask.MaskedPattern
      : Mask extends DateConstructor
      ? typeof IMask.MaskedDate
      : Mask extends Date
      ? typeof IMask.MaskedDate
      : Mask extends NumberConstructor
      ? typeof IMask.MaskedNumber
      : Mask extends RegExp
      ? typeof IMask.MaskedRegExp
      : Mask extends Array<any>
      ? typeof IMask.MaskedDynamic
      : Mask extends ArrayConstructor
      ? typeof IMask.MaskedDynamic
      : Mask extends Function
      ? typeof IMask.MaskedFunction
      : never;

export
type MaskedTypedValue<Mask> = Mask extends NumberConstructor
  ? number
  : Mask extends DateConstructor
  ? Date
  : string;


export
type AllMaskedOptions =
  & MaskedDateFactoryOptions
  & MaskedNumberOptions
  & MaskedPatternOptions
  & MaskedDynamicOptions
  & MaskedEnumOptions
  & MaskedRangeOptions
  & MaskedDynamicOptions
  & MaskedRegExpOptions
  & MaskedFunctionOptions
  & FactoryInstanceOpts
  & FactoryConstructorOpts
;



/** Get Masked class by mask type */
// export function maskedClass(mask: string): typeof MaskedPattern;
// export function maskedClass(mask: DateConstructor): typeof MaskedDate;
// export function maskedClass(mask: NumberConstructor): typeof MaskedNumber;
// export function maskedClass(mask: Array<any> | ArrayConstructor): typeof MaskedDynamic;
// export function maskedClass(mask: MaskedDate): typeof MaskedDate;
// export function maskedClass(mask: MaskedNumber): typeof MaskedNumber;
// export function maskedClass(mask: MaskedEnum): typeof MaskedEnum;
// export function maskedClass(mask: MaskedRange): typeof MaskedRange;
// export function maskedClass(mask: MaskedRegExp): typeof MaskedRegExp;
// export function maskedClass(mask: MaskedFunction): typeof MaskedFunction;
// export function maskedClass(mask: MaskedPattern): typeof MaskedPattern;
// export function maskedClass(mask: MaskedDynamic): typeof MaskedDynamic;
// export function maskedClass(mask: Masked): typeof Masked;
// export function maskedClass(mask: typeof Masked): typeof Masked;
// export function maskedClass(mask: typeof MaskedDate): typeof MaskedDate;
// export function maskedClass(mask: typeof MaskedNumber): typeof MaskedNumber;
// export function maskedClass(mask: typeof MaskedEnum): typeof MaskedEnum;
// export function maskedClass(mask: typeof MaskedRange): typeof MaskedRange;
// export function maskedClass(mask: typeof MaskedRegExp): typeof MaskedRegExp;
// export function maskedClass(mask: typeof MaskedFunction): typeof MaskedFunction;
// export function maskedClass(mask: typeof MaskedPattern): typeof MaskedPattern;
// export function maskedClass(mask: typeof MaskedDynamic): typeof MaskedDynamic;
// export function maskedClass<Mask extends typeof Masked> (mask: Mask): Mask;
// export function maskedClass(mask: RegExp): typeof MaskedRegExp;
// export function maskedClass(mask: (value: string, ...args: any[]) => boolean): typeof MaskedFunction;
// TODO
export function maskedClass(mask: any): any {
  if (mask == null) throw new Error('mask property should be defined');

  if (mask instanceof RegExp) return IMask.MaskedRegExp;
  if (isString(mask)) return IMask.MaskedPattern;
  if (mask === Date) return IMask.MaskedDate;
  if (mask === Number) return IMask.MaskedNumber;
  if (Array.isArray(mask) || mask === Array) return IMask.MaskedDynamic;
  if (IMask.Masked && (mask as any).prototype instanceof IMask.Masked) return mask;
  if (IMask.Masked && mask instanceof IMask.Masked) return mask.constructor;
  if (mask instanceof Function) return IMask.MaskedFunction;

  console.warn('Mask not found for mask', mask);  // eslint-disable-line no-console
  return IMask.Masked;
}

export
type NormalizedOpts = FactoryOpts & { _mask?: FactoryStaticOpts['mask'] };

export
function normalizeOpts<Opts extends FactoryArg> (opts: Opts): NormalizedOpts {
  if (!opts) throw new Error('Options in not defined');

  if (IMask.Masked) {
    if ((opts as any).prototype instanceof IMask.Masked) return { mask: opts } as NormalizedOpts;

    const { mask=undefined, ...instanceOpts } = opts instanceof IMask.Masked ? { mask: opts } :
      opts.mask instanceof IMask.Masked ? opts : {};

    if (mask) {
      const _mask = (mask as Masked).mask;

      return {
        ...pick(mask, (_, k: string) => !k.startsWith('_')),
        mask: mask.constructor,
        _mask,
        ...instanceOpts,
      } as NormalizedOpts;
    }
  }

  if (!isObject(opts)) return { mask: opts };

  return { ...opts } as NormalizedOpts;
}

// TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754

// From masked
// export default function createMask<Opts extends Masked, ReturnMasked=Opts> (opts: Opts): ReturnMasked;
// // From masked class
// export default function createMask<Opts extends MaskedOptions<typeof Masked>, ReturnMasked extends Masked=InstanceType<Opts['mask']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<typeof MaskedDate>, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<typeof MaskedNumber>, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<typeof MaskedEnum>, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<typeof MaskedRange>, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<typeof MaskedRegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<typeof MaskedFunction>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<typeof MaskedPattern>, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<typeof MaskedDynamic>, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
// // From mask opts
// export default function createMask<Opts extends MaskedOptions<Masked>, ReturnMasked=Opts extends MaskedOptions<infer M> ? M : never> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedNumberOptions, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedDateFactoryOptions, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedEnumOptions, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedRangeOptions, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedPatternOptions, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedDynamicOptions, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<RegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
// export default function createMask<Opts extends MaskedOptions<Function>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;

/** Creates new {@link Masked} depending on mask type */
export default
function createMask<Opts extends FactoryArg> (opts: Opts): FactoryReturnMasked<Opts> {
  if (IMask.Masked && (opts instanceof IMask.Masked)) return opts as FactoryReturnMasked<Opts>;
  const nOpts = normalizeOpts(opts);

  const MaskedClass = maskedClass(nOpts.mask);
  if (!MaskedClass) throw new Error('Masked class is not found for provided mask, appropriate module needs to be imported manually before creating mask.');

  if (nOpts.mask === MaskedClass) delete nOpts.mask;
  if (nOpts._mask) { nOpts.mask = nOpts._mask; delete nOpts._mask; }
  return new MaskedClass(nOpts);
}


IMask.createMask = createMask;
