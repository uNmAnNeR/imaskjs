import React from 'react';
import IMaskMixin, { IMaskInputProps } from './mixin';


const IMaskInputClass = IMaskMixin(({ inputRef, ...props }) =>
  React.createElement('input', {
    ...props,
    ref: inputRef,
  })
);

const IMaskInputFn = <
  Opts extends IMaskInputProps<HTMLInputElement>,
>(
  props: Opts,
  ref: any, // otherwise throws TS2590
) =>
  // TODO type
  React.createElement(IMaskInputClass as unknown as React.ComponentType<IMaskInputProps<HTMLInputElement, Opts>>, { ...props, ref })
;

const IMaskInput = React.forwardRef(IMaskInputFn as <
  Opts extends IMaskInputProps<HTMLInputElement>,
>(
  props: Opts & { ref?: React.Ref<React.ComponentType<IMaskInputProps<HTMLInputElement, Opts>>> }
) => React.ReactElement<IMaskInputProps<HTMLInputElement, Opts>>);


export default IMaskInput;
