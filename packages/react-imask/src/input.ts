import React from 'react';
import IMaskMixin, { IMaskInputProps } from './mixin';


const IMaskInputClass = IMaskMixin(({ inputRef, ...props }) =>
  React.createElement('input', {
    ...props,
    ref: inputRef,
  })
);

const IMaskInputFn = <
  Props extends IMaskInputProps<HTMLInputElement>,
>(
  props: Props,
  ref: React.Ref<React.ComponentType<Props>>
) =>
  React.createElement(IMaskInputClass as any, { ...props, ref })  // TODO fix no idea
;

const IMaskInput = React.forwardRef(IMaskInputFn as <
  Props extends IMaskInputProps<HTMLInputElement>,
>(
  props: Props & { ref?: React.Ref<React.ComponentType<Props>> }
) => React.ReactElement<Props>);


export default IMaskInput;
