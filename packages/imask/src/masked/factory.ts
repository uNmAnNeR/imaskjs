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
type AllFactoryStaticOpts =
  & MaskedDateFactoryOptions
  & MaskedNumberOptions
  & MaskedPatternOptions
  & MaskedDynamicOptions
  & MaskedRegExpOptions
  & MaskedFunctionOptions
  & MaskedEnumOptions
  & MaskedRangeOptions
;

export
type FactoryStaticReturnMasked<Opts extends FactoryStaticOpts> =
  Opts extends MaskedDateFactoryOptions ? MaskedDate :
  Opts extends MaskedNumberOptions ? MaskedNumber :
  Opts extends MaskedPatternOptions ? MaskedPattern :
  Opts extends MaskedDynamicOptions ? MaskedDynamic :
  Opts extends MaskedRegExpOptions ? MaskedRegExp :
  Opts extends MaskedFunctionOptions ? MaskedFunction :
  never
;

export
type FactoryStaticMaskReturnMasked<Mask extends FactoryStaticOpts['mask']> =
  Mask extends MaskedDateFactoryOptions['mask'] ? MaskedDate :
  Mask extends MaskedNumberOptions['mask'] ? MaskedNumber :
  Mask extends MaskedPatternOptions['mask'] ? MaskedPattern :
  Mask extends MaskedDynamicOptions['mask'] ? MaskedDynamic :
  Mask extends MaskedRegExpOptions['mask'] ? MaskedRegExp :
  Mask extends MaskedFunctionOptions['mask'] ? MaskedFunction :
  never
;


export
type FactoryInstanceOpts =
  | { mask: MaskedDate } & Omit<MaskedDateFactoryOptions, 'mask'>
  | { mask: MaskedNumber } & Omit<MaskedNumberOptions, 'mask'>
  | { mask: MaskedEnum } & Omit<MaskedEnumOptions, 'mask'>
  | { mask: MaskedRange } & Omit<MaskedRangeOptions, 'mask'>
  | { mask: MaskedRegExp } & Omit<MaskedRegExpOptions, 'mask'>
  | { mask: MaskedFunction } & Omit<MaskedFunctionOptions, 'mask'>
  | { mask: MaskedPattern } & Omit<MaskedPatternOptions, 'mask'>
  | { mask: MaskedDynamic } & Omit<MaskedDynamicOptions, 'mask'>
  | { mask: Masked } & Omit<MaskedOptions, 'mask'>
;

export
type FactoryInstanceReturnMasked<Opts extends FactoryInstanceOpts> = Opts extends { mask: infer M } ? M : never;

export
type FactoryConstructorOpts =
  | { mask: typeof MaskedDate } & Omit<MaskedDateFactoryOptions, 'mask'>
  | { mask: typeof MaskedNumber } & Omit<MaskedNumberOptions, 'mask'>
  | { mask: typeof MaskedEnum } & Omit<MaskedEnumOptions, 'mask'>
  | { mask: typeof MaskedRange } & Omit<MaskedRangeOptions, 'mask'>
  | { mask: typeof MaskedRegExp } & Omit<MaskedRegExpOptions, 'mask'>
  | { mask: typeof MaskedFunction } & Omit<MaskedFunctionOptions, 'mask'>
  | { mask: typeof MaskedPattern } & Omit<MaskedPatternOptions, 'mask'>
  | { mask: typeof MaskedDynamic } & Omit<MaskedDynamicOptions, 'mask'>
  | { mask: typeof Masked } & Omit<MaskedOptions, 'mask'>
;
 
export
type FactoryConstructorReturnMasked<Opts extends FactoryConstructorOpts> =
  Opts extends { mask: typeof MaskedDate } ? MaskedDate :
  Opts extends { mask: typeof MaskedNumber } ? MaskedNumber :
  Opts extends { mask: typeof MaskedEnum } ? MaskedEnum :
  Opts extends { mask: typeof MaskedRange } ? MaskedRange :
  Opts extends { mask: typeof MaskedRegExp } ? MaskedRegExp :
  Opts extends { mask: typeof MaskedFunction } ? MaskedFunction :
  Opts extends { mask: typeof MaskedPattern } ? MaskedPattern :
  Opts extends { mask: typeof MaskedDynamic } ? MaskedDynamic :
  Masked
;

export
type FactoryOpts = FactoryConstructorOpts | FactoryInstanceOpts | FactoryStaticOpts;

export
type FactoryArg = Masked | FactoryOpts | FactoryStaticOpts['mask'];

export
type ExtendFactoryArgOptions<Opts extends { [key: string]: any }> =
  Masked | FactoryOpts & Opts | FactoryStaticOpts['mask']
;

export
type UpdateStaticOpts<Opts extends FactoryStaticOpts> =
  Opts extends MaskedEnumOptions ? MaskedEnumOptions :
  Opts extends MaskedRangeOptions ? MaskedRangeOptions :
  Opts extends MaskedDynamicOptions ? MaskedDynamicOptions :
  Opts extends MaskedPatternOptions ? MaskedPatternOptions :
  Opts extends MaskedDateOptions ? MaskedDateOptions :
  Opts extends MaskedNumberOptions ? MaskedNumberOptions :
  Opts extends MaskedRegExpOptions ? MaskedRegExpOptions :
  Opts extends MaskedFunctionOptions ? MaskedFunctionOptions :
  never
;

type AnyOpts = Record<string, any>;

export
type UpdateInstanceOpts<M extends Masked> =
  M extends MaskedRegExp ? MaskedRegExpOptions :
  M extends MaskedFunction ? MaskedFunctionOptions :
  M extends MaskedDate ? MaskedDateOptions :
  M extends MaskedNumber ? MaskedNumberOptions :
  M extends MaskedDynamic ? MaskedDynamicOptions :
  M extends MaskedRange ? MaskedRangeOptions :
  M extends MaskedEnum ? MaskedEnumOptions :
  M extends MaskedPattern ? MaskedPatternOptions :
  AnyOpts
;

export
type UpdateConstructorOpts<M extends FactoryConstructorOpts> =
  M extends { mask: typeof MaskedDate } ? MaskedDateOptions :
  M extends { mask: typeof MaskedNumber } ? MaskedNumberOptions :
  M extends { mask: typeof MaskedEnum } ? MaskedEnumOptions :
  M extends { mask: typeof MaskedRange } ? MaskedRangeOptions :
  M extends { mask: typeof MaskedRegExp } ? MaskedRegExpOptions :
  M extends { mask: typeof MaskedFunction } ? MaskedFunctionOptions :
  M extends { mask: typeof MaskedPattern } ? MaskedPatternOptions :
  M extends { mask: typeof MaskedDynamic } ? MaskedDynamicOptions :
  AnyOpts
;

export
type UpdateStaticMaskOpts<M extends FactoryStaticOpts['mask']> =
  M extends MaskedDateFactoryOptions['mask'] ? MaskedDateOptions :
  M extends MaskedNumberOptions['mask'] ? MaskedNumberOptions :
  M extends MaskedPatternOptions['mask'] ? MaskedPatternOptions :
  M extends MaskedDynamicOptions['mask'] ? MaskedDynamicOptions :
  M extends MaskedRegExpOptions['mask'] ? MaskedRegExpOptions :
  M extends MaskedFunctionOptions['mask'] ? MaskedFunctionOptions :
  never
;

export
type UpdateOpts<Opts extends FactoryArg> = Partial<
  Opts extends Masked ? UpdateInstanceOpts<Opts> :
  Opts extends FactoryStaticOpts['mask'] ? UpdateStaticMaskOpts<Opts> :
  Opts extends FactoryStaticOpts ? UpdateStaticOpts<Opts> :
  Opts extends FactoryInstanceOpts ? UpdateInstanceOpts<Opts['mask']> :
  Opts extends FactoryConstructorOpts ? UpdateConstructorOpts<Opts> :
  AnyOpts
>;

export
type FactoryReturnMasked<Opts extends FactoryArg> =
  Opts extends Masked ? Opts :
  Opts extends FactoryStaticOpts['mask'] ? FactoryStaticMaskReturnMasked<Opts> :
  Opts extends FactoryConstructorOpts ? FactoryConstructorReturnMasked<Opts> :
  Opts extends FactoryInstanceOpts ? FactoryInstanceReturnMasked<Opts> :
  Opts extends FactoryStaticOpts ? FactoryStaticReturnMasked<Opts> :
  never
;


// TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754
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

/** Get Masked class by mask type */
export function maskedClass (mask: Masked | FactoryOpts['mask']): any /* TODO */ {
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

type MaskedClassOf<M extends Masked> =
  M extends MaskedDate ? typeof MaskedDate :
  M extends MaskedNumber ? typeof MaskedNumber :
  M extends MaskedEnum ? typeof MaskedEnum :
  M extends MaskedRange ? typeof MaskedRange :
  M extends MaskedRegExp ? typeof MaskedRegExp :
  M extends MaskedFunction ? typeof MaskedFunction :
  M extends MaskedPattern ? typeof MaskedPattern :
  M extends MaskedDynamic ? typeof MaskedDynamic :
  any
;


type NormalizedMaskedOpts<Opts extends Masked> = Omit<Opts, 'mask'> & {
  _mask: Opts,
  mask: MaskedClassOf<Opts>,
};

type NormalizedInstanceOpts<Opts extends FactoryInstanceOpts> =
  Omit<Opts['mask'], `_${string}` | 'mask'> &
  NormalizedMaskedOpts<Opts['mask']>
;

export
type NormalizedOpts<Opts extends FactoryArg> =
  Opts extends FactoryStaticOpts['mask'] ? { mask: Opts } :
  Opts extends Masked ? NormalizedMaskedOpts<Opts> :
  Opts extends FactoryInstanceOpts ? NormalizedInstanceOpts<Opts> :
  Opts extends FactoryStaticOpts | FactoryConstructorOpts ? Opts :
  { mask: Opts }
;

export
function normalizeOpts<Opts extends FactoryArg> (opts: Opts): NormalizedOpts<Opts> {
  if (!opts) throw new Error('Options in not defined');

  if (IMask.Masked) {
    if ((opts as any).prototype instanceof IMask.Masked) return { mask: opts } as NormalizedOpts<Opts>;

    /*
      handle cases like:
      1) opts = Masked
      2) opts = { mask: Masked, ...instanceOpts }
    */
    const { mask=undefined, ...instanceOpts } =
      opts instanceof IMask.Masked ? { mask: opts } :
      isObject(opts) && (opts as FactoryInstanceOpts).mask instanceof IMask.Masked ? (opts as FactoryInstanceOpts) : {};

    if (mask) {
      const _mask = (mask as Masked).mask;

      return {
        ...pick(mask, (_, k: string) => !k.startsWith('_')),
        mask: mask.constructor,
        _mask,
        ...instanceOpts,
      } as NormalizedOpts<Opts>;
    }
  }

  if (!isObject(opts)) return { mask: opts } as unknown as NormalizedOpts<Opts>;

  return { ...opts } as unknown as NormalizedOpts<Opts>;
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
  if (!MaskedClass) throw new Error(`Masked class is not found for provided mask ${nOpts.mask}, appropriate module needs to be imported manually before creating mask.`);

  if (nOpts.mask === MaskedClass) delete nOpts.mask;
  if ((nOpts as any)._mask) { nOpts.mask = (nOpts as any)._mask; delete (nOpts as any)._mask; }
  return new MaskedClass(nOpts);
}


IMask.createMask = createMask;
