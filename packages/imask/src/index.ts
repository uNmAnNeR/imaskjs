import IMask from './imask';
export { default as InputMask } from './controls/input';

export { default as Masked } from './masked/base';
export { default as MaskedPattern } from './masked/pattern';
export { default as MaskedEnum } from './masked/enum';
export { default as MaskedRange } from './masked/range';
export { default as MaskedNumber } from './masked/number';
export { default as MaskedDate } from './masked/date';
export { default as MaskedRegExp } from './masked/regexp';
export { default as MaskedFunction } from './masked/function';
export { default as MaskedDynamic } from './masked/dynamic';
export { default as createMask } from './masked/factory';
export { default as MaskElement } from './controls/mask-element';
export { default as HTMLMaskElement } from './controls/html-mask-element';
export { default as HTMLContenteditableMaskElement } from './controls/html-contenteditable-mask-element';
export { createPipe, pipe, PIPE_TYPE } from './masked/pipe';

export { default as ChangeDetails } from './core/change-details';

try {
  (globalThis as any).IMask = IMask;
} catch(e) {}
export default IMask;
