/* eslint-disable @typescript-eslint/no-namespace */
import { JSX } from 'solid-js/jsx-runtime';
import { createEffect } from 'solid-js';
import IMask, { type InputMask, type FactoryArg } from 'imask';

interface SolidMaskedDirectiveInterface<
  Opts extends FactoryArg,
  Value = {
    typedValue: InputMask<Opts>['typedValue'];
    value: InputMask<Opts>['value'];
    unmaskedValue: InputMask<Opts>['unmaskedValue'];
  }
> {
  mask: Opts;
  onAccept?: (
    value: Value,
    maskRef: InputMask<Opts>,
    e?: InputEvent
  ) => void;
  onComplete?: (
    value: Value,
    maskRef: InputMask<Opts>,
    e?: InputEvent
  ) => void;
  value?: () => InputMask<Opts>['value'];
  unmaskedValue?: () => InputMask<Opts>['unmaskedValue'];
}

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      masked: SolidMaskedDirectiveInterface<FactoryArg>;
    }
  }
}

const masked = <
  Opts extends FactoryArg,
  Value = {
    typedValue: InputMask<Opts>['typedValue'];
    value: InputMask<Opts>['value'];
    unmaskedValue: InputMask<Opts>['unmaskedValue'];
  }
>(
  el: HTMLElement,
  props: () => {
    mask: Opts;
    onAccept?: (
      value: Value,
      maskRef: InputMask<Opts>,
      e?: InputEvent
    ) => void;
    onComplete?: (
      value: Value,
      maskRef: InputMask<Opts>,
      e?: InputEvent
    ) => void;
    value?: () => InputMask<Opts>['value'];
    unmaskedValue?: () => InputMask<Opts>['unmaskedValue'];
  }
) => {
  const { mask, onAccept, onComplete, value, unmaskedValue } = props();
  const m = IMask(el, mask);

  createEffect(() => {
    if (m && unmaskedValue) {
      m.unmaskedValue = unmaskedValue();
    }
  });

  createEffect(() => {
    if (m && value) {
      m.value = value();
    }
  });

  m.on('complete', (e?: InputEvent) => {
    onComplete &&
      onComplete(
        {
          typedValue: m.typedValue,
          value: m.value,
          unmaskedValue: m.unmaskedValue,
        } as unknown as Value,
        m,
        e
      );
  });
  m.on('accept', (e?: InputEvent) => {
    onAccept &&
      onAccept(
        {
          typedValue: m.typedValue,
          value: m.value,
          unmaskedValue: m.unmaskedValue,
        } as unknown as Value,
        m,
        e
      );
  });
};

export default masked;
