import React from 'react';
import IMaskMixin from 'react-imask/esm/mixin';
import NativeMaskElement from './native-mask-element';


export default
function IMaskNativeMixin(ComposedComponent) {
  const MaskedComponent = class extends React.Component {
    constructor (...args) {
      super(...args);
      this.state = {};
    }

    render () {
      const {inputRef, ...props} = this.props;

      return React.createElement(ComposedComponent, {
        ...this.wrapHandlers(props),
        ...this.state,
        inputRef: input => inputRef(new NativeMaskElement(input, this)),
      });
    }

    wrapHandlers (props) {
      const maskHandlers = this.state && this.state.maskHandlers;
      if (!maskHandlers) return props;

      // we dont wont to override user event handlers
      // so, queue them after mask handlers
      return Object.keys(maskHandlers)
        .reduce((props, event) => {
          const userHandler = props[event];

          props[event] = (...args) => {
            maskHandlers[event](...args);
            if (userHandler) userHandler(...args);
          };

          return props;
        }, {...props});
    }
  };

  const nestedComponentName = ComposedComponent.displayName || ComposedComponent.name || 'Component';
  MaskedComponent.displayName = `IMaskNative(${nestedComponentName})`;

  return IMaskMixin(MaskedComponent);
}
