import React from 'react';
import {IMaskMixin} from 'react-imask';
import NativeMaskElement from './native-mask-element';


export
function IMaskNativeMixin(ComposedComponent) {
  const MaskedComponent = class extends React.Component {
    render () {
      const {inputRef, ...props} = this.props;

      return React.createElement(ComposedComponent, {
        ...wrapProps(props),
        inputRef: input => {
          this.element = new NativeMaskElement(input, this);
          return inputRef(this.element);
        },
      });
    }

    wrapProps (props) {
      // TODO
      return Object.assign(props, this.element.maskProps);
    }
  };

  const nestedComponentName = ComposedComponent.displayName || ComposedComponent.name || 'Component';
  MaskedComponent.displayName = `IMaskNative(${nestedComponentName})`;

  return IMaskMixin(MaskedComponent);
}
