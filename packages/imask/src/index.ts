import IMask from './imask';
export { default as HTMLContenteditableMaskElement } from './controls/html-contenteditable-mask-element';
export { default as HTMLInputMaskElement, type InputElement } from './controls/html-input-mask-element';
export { default as HTMLMaskElement } from './controls/html-mask-element';
export { default as InputMask, type InputMaskElement } from './controls/input';
export { default as MaskElement } from './controls/mask-element';
export { default as ChangeDetails, type ChangeDetailsOptions } from './core/change-details';
export { type AppendTail, type TailDetails } from './core/tail-details';
export { DIRECTION, forceDirection, type Direction, type Selection } from './core/utils';
export { default as Masked, type AppendFlags, type ExtractFlags, type MaskedOptions, type MaskedState } from './masked/base';
export { default as MaskedDate, type DateMaskType, type MaskedDateOptions } from './masked/date';
export { default as MaskedDynamic, type DynamicMaskType, type MaskedDynamicOptions, type MaskedDynamicState } from './masked/dynamic';
export { default as MaskedEnum, type MaskedEnumOptions } from './masked/enum';
export {
  default as createMask,
  normalizeOpts,
  type AllFactoryStaticOpts,
  type FactoryArg,
  type FactoryConstructorOpts,
  type FactoryConstructorReturnMasked,
  type FactoryInstanceOpts,
  type FactoryInstanceReturnMasked,
  type FactoryOpts,
  type FactoryReturnMasked,
  type FactoryStaticOpts,
  type FactoryStaticReturnMasked,
  type NormalizedOpts,
  type UpdateOpts,
} from './masked/factory';
export { default as MaskedFunction, type MaskedFunctionOptions } from './masked/function';
export { default as MaskedNumber, type MaskedNumberOptions } from './masked/number';
export { default as MaskedPattern, type BlockPosData, type Definitions, type MaskedPatternOptions, type MaskedPatternState } from './masked/pattern';
export { type default as PatternBlock } from './masked/pattern/block';
export { default as ChunksTailDetails, type ChunksTailState } from './masked/pattern/chunk-tail-details';
export { default as PatternFixedDefinition, type PatternFixedDefinitionOptions } from './masked/pattern/fixed-definition';
export { default as PatternInputDefinition, type PatternInputDefinitionOptions, type PatternInputDefinitionState } from './masked/pattern/input-definition';
export { createPipe, pipe, PIPE_TYPE } from './masked/pipe';
export { default as MaskedRange, type MaskedRangeOptions } from './masked/range';
export { default as MaskedRegExp, type MaskedRegExpOptions } from './masked/regexp';
export { default as RepeatBlock, type RepeatBlockOptions } from './masked/repeat';

try { (globalThis as any).IMask = IMask; } catch {}
export default IMask;
