import type { default as _InputMask, InputMaskElement as _InputMaskElement } from '../controls/input';
import type { default as _Masked } from '../masked/base';
import type { default as _MaskedPattern } from '../masked/pattern';
import type { default as _RepeatBlock } from '../masked/repeat';
import type { default as _MaskedDate } from '../masked/date';
import type { default as _MaskedDynamic } from '../masked/dynamic';
import type { default as _MaskedEnum } from '../masked/enum';
import type { default as _MaskedRange } from '../masked/range';
import type { default as _MaskedNumber } from '../masked/number';
import type { default as _MaskedFunction } from '../masked/function';
import type { default as _MaskedRegExp } from '../masked/regexp';
import type {
  default as _createMask,
  FactoryArg,
} from '../masked/factory';
import type { default as _ChangeDetails } from './change-details';

import type { default as _MaskElement } from '../controls/mask-element';
import type { default as _HTMLMaskElement } from '../controls/html-mask-element';
import type { default as _HTMLContenteditableMaskElement } from '../controls/html-contenteditable-mask-element';
import type {
  createPipe as _createPipe,
  pipe as _pipe,
  PIPE_TYPE as _PIPE_TYPE
} from '../masked/pipe';


/** Applies mask on element */
function IMask<Opts extends FactoryArg> (el: _InputMaskElement, opts: Opts): _InputMask<Opts> {
  // currently available only for input-like elements
  return new IMask.InputMask(el, opts);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace IMask {
  export let InputMask: typeof _InputMask;
  export let createMask: typeof _createMask;
  export let Masked: typeof _Masked;
  export let MaskedPattern: typeof _MaskedPattern;
  export let RepeatBlock: typeof _RepeatBlock;
  export let MaskedDate: typeof _MaskedDate;
  export let MaskedDynamic: typeof _MaskedDynamic;
  export let MaskedEnum: typeof _MaskedEnum;
  export let MaskedRange: typeof _MaskedRange;
  export let MaskedNumber: typeof _MaskedNumber;
  export let MaskedFunction: typeof _MaskedFunction;
  export let MaskedRegExp: typeof _MaskedRegExp;
  export let ChangeDetails: typeof _ChangeDetails;
  export let MaskElement: typeof _MaskElement;
  export let HTMLMaskElement: typeof _HTMLMaskElement;
  export let HTMLContenteditableMaskElement: typeof _HTMLContenteditableMaskElement;
  export let createPipe: typeof _createPipe;
  export let pipe: typeof _pipe;
  export let PIPE_TYPE: typeof _PIPE_TYPE;
}

export default IMask;
