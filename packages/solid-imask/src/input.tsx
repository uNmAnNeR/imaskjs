/* eslint-disable @typescript-eslint/no-namespace */
import { JSX } from 'solid-js/jsx-runtime';
import { createEffect, onCleanup, splitProps } from 'solid-js';
import IMask, { type InputMask, type FactoryArg } from 'imask';


// TODO can `directive` be reused here?
// TODO personally hate JSX in libs but seems no way out for solid

const createMaskedInput =
<
  Opts extends FactoryArg,
  Value = {
    typedValue: InputMask<Opts>['typedValue'];
    value: InputMask<Opts>['value'];
    unmaskedValue: InputMask<Opts>['unmaskedValue'];
  }
>(
  mask: Opts
) =>
(
  props: Omit<
    JSX.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'onChange' | 'onchange'
  > & {
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
    value?: InputMask<Opts>['value'];
    unmaskedValue?: InputMask<Opts>['unmaskedValue'];
  }
) => {
  const [maskProps, inputProps] = splitProps(props, [
    'ref',
    'onAccept',
    'onComplete',
    'value',
    'unmaskedValue',
  ]);
  let m: InputMask<Opts>;

  createEffect(() => {
    if (m && maskProps.unmaskedValue) {
      m.unmaskedValue = maskProps.unmaskedValue;
    }
  });

  createEffect(() => {
    if (m && maskProps.value) {
      m.value = maskProps.value;
    }
  });

  onCleanup(() => {
    m.destroy();
  });

  return (
    <input
      {...inputProps}
      ref={(el) => {
        m = IMask(el, mask);
        m.on('complete', (e?: InputEvent) => {
          maskProps.onComplete &&
            maskProps.onComplete(
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
          maskProps.onAccept &&
            maskProps.onAccept(
              {
                typedValue: m.typedValue,
                value: m.value,
                unmaskedValue: m.unmaskedValue,
              } as unknown as Value,
              m,
              e
            );
        });
        maskProps.ref && (maskProps.ref as any)(el);
      }}
      type='string'
    ></input>
  );
};


export default createMaskedInput;
