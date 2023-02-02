import { JSX } from "solid-js/jsx-runtime"
import { createEffect, splitProps } from "solid-js"
import IMask from "imask"

export const createMaskedInput = <
  Opts extends IMask.AnyMaskedOptions = IMask.AnyMaskedOptions,
  Value = {
    typedValue: IMask.InputMask<Opts>['typedValue']
    value: IMask.InputMask<Opts>['value'],
    unmaskedValue: IMask.InputMask<Opts>['unmaskedValue']
  },
>(mask: Opts) => (props: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'onchange'> & {
  onAccept?: (value: Value, maskRef: IMask.InputMask<Opts>, e?: InputEvent) => void,
  onComplete?: (value: Value, maskRef: IMask.InputMask<Opts>, e?: InputEvent) => void,
  value?: IMask.InputMask<Opts>['value'],
  unmaskedValue?: IMask.InputMask<Opts>['unmaskedValue']
}) => {
  const [local, global] = splitProps(props, ['ref', 'onAccept', 'onComplete', 'value', 'unmaskedValue'])
  let m: IMask.InputMask<Opts>;

  createEffect(() => {
    if (m && local.unmaskedValue) {
      m.unmaskedValue = local.unmaskedValue
    }
  })

  createEffect(() => {
    if (m && local.value) {
      m.value = local.value
    }
  })


  return <input {...global} ref={(el) => {
    m = IMask(el, mask);
    m.on('complete', (e?: InputEvent) => {
      local.onComplete && local.onComplete({
        typedValue: m.typedValue,
        value: m.value,
        unmaskedValue: m.unmaskedValue
      } as unknown as Value, m, e)
    });
    m.on('accept', (e?: InputEvent) => {
      local.onAccept && local.onAccept({
        typedValue: m.typedValue,
        value: m.value,
        unmaskedValue: m.unmaskedValue
      } as unknown as Value, m, e)
    });
    local.ref && (local.ref as any)(el)
  }} type="string"></input>
}

