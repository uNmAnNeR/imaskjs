import { isString } from '../core/utils';
import type Masked from './base';
import { type MaskedOptions } from './base';
import IMask from '../core/holder';

import type MaskedRegExp from './regexp';
import type MaskedPattern from './pattern';
import type MaskedFunction from './function';
import type MaskedDate from './date';
import type MaskedNumber from './number';
import type MaskedDynamic from './dynamic';

import { type MaskedEnumOptions } from './enum';
import { type MaskedRangeOptions } from './range';
import { type MaskedDynamicOptions } from './dynamic';
import { type MaskedPatternOptions } from './pattern';
import { type MaskedNumberOptions } from './number';
import { type MaskedDateOptions } from './date';
import { create } from 'domain';


export type AnyMaskedOptions =
  | MaskedDateOptions
  // | MaskedNumberOptions
  // | MaskedPatternOptions
  // | MaskedDynamicOptions
  // | MaskedEnumOptions
  // | MaskedRangeOptions
  // | MaskedOptions<RegExp, any>
  // | MaskedOptions<Function, any>
  // | MaskedOptions<typeof Masked, any>
;

export type AnyMask = AnyMaskedOptions['mask'];
export type AnyMasked<Parent extends Masked=any> = Masked<AnyMask, Parent>;

export
type DeduceMasked<Opts> =
  Opts extends AnyMasked
    ? Opts
    : Opts extends AnyMaskedOptions
      ? Opts extends MaskedPatternOptions
        ? MaskedPattern
        : Opts extends MaskedDateOptions
        ? MaskedDate
        : Opts extends MaskedNumberOptions
        ? MaskedNumber
        : Opts extends MaskedOptions<RegExp, Opts['parent']>
        ? MaskedRegExp
        : Opts extends MaskedOptions<Function, Opts['parent']>
        ? MaskedFunction
        : Opts extends MaskedDynamicOptions
        ? MaskedDynamic
        : Masked<Opts['mask']>
        : never;

export
type DeduceMaskedClass<Mask> =
  Mask extends AnyMasked
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
type DeduceMaskedOptions<Opts> =
  Opts extends AnyMasked
    ? Opts
    : Opts extends AnyMaskedOptions
      ? Opts extends MaskedPatternOptions
        ? MaskedPatternOptions
        : Opts extends MaskedDateOptions
        ? MaskedDateOptions
        : Opts extends MaskedNumberOptions
        ? MaskedNumberOptions
        : Opts extends MaskedOptions<RegExp, any>
        ? MaskedOptions<RegExp, any>
        : Opts extends MaskedOptions<Function, any>
        ? MaskedOptions<Function, any>
        : Opts extends MaskedDynamicOptions
        ? MaskedDynamicOptions
        : Record<string, any>
      : never;

export
type AllMaskedOptions =
  & MaskedDateOptions
  & MaskedNumberOptions
  & MaskedPatternOptions
  & MaskedDynamicOptions
  & MaskedEnumOptions
  & MaskedRangeOptions
  & MaskedDynamicOptions
  & MaskedOptions<RegExp, any>
  & MaskedOptions<Function, any>
  & MaskedOptions<MaskedFunction, any>
  & MaskedOptions<MaskedRegExp, any>
  & MaskedOptions<typeof Masked, any>;

/** Get Masked class by mask type */
export
function maskedClass<Mask extends AnyMask> (mask: Mask): DeduceMaskedClass<Mask> {
  if (mask == null) {
    throw new Error('mask property should be defined');
  }

  if (mask instanceof RegExp) return IMask.MaskedRegExp as DeduceMaskedClass<Mask>;
  if (isString(mask)) return IMask.MaskedPattern as DeduceMaskedClass<Mask>;
  if (mask instanceof Date || mask === Date) return IMask.MaskedDate as DeduceMaskedClass<Mask>;
  if (mask instanceof Number || typeof mask === 'number' || mask === Number) return IMask.MaskedNumber as DeduceMaskedClass<Mask>;
  if (Array.isArray(mask) || mask === Array) return IMask.MaskedDynamic as DeduceMaskedClass<Mask>;
  if (IMask.Masked && mask.prototype instanceof IMask.Masked) return mask as unknown as DeduceMaskedClass<Mask>;
  if (mask instanceof IMask.Masked) return mask.constructor as DeduceMaskedClass<Mask>;
  if (mask instanceof Function) return IMask.MaskedFunction as DeduceMaskedClass<Mask>;

  console.warn('Mask not found for mask', mask);  // eslint-disable-line no-console
  return IMask.Masked as DeduceMaskedClass<Mask>;
}

/** Creates new {@link Masked} depending on mask type */
export default
function createMask<Opts extends AnyMasked, Return=Opts> (opts: Opts): Return;
export default
function createMask<Opts extends AnyMaskedOptions, Return extends Masked<Opts['mask']>=DeduceMasked<Opts>> (opts: Opts): Return;
export default
function createMask<Opts extends (AnyMaskedOptions | AnyMasked), Return extends Masked<Opts['mask']>=DeduceMasked<Opts>> (opts: Opts): DeduceMasked<Opts> {
  if (IMask.Masked && (opts instanceof IMask.Masked)) return opts as DeduceMasked<Opts>;

  opts = {...opts};
  const mask = opts.mask;

  if (IMask.Masked && (mask instanceof IMask.Masked)) return mask as unknown as DeduceMasked<Opts>;

  const MaskedClass = maskedClass(mask);
  if (!MaskedClass) throw new Error('Masked class is not found for provided mask, appropriate module needs to be import manually before creating mask.');
  return new (MaskedClass as any)(opts) as DeduceMasked<Opts>;
}

// const v = createMask({ mask: Date });

IMask.createMask = createMask;
