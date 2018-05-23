import React from 'react';
import {IMaskMixin} from 'react-imask';
import NativeMaskElement from './native-mask-element';


export
function IMaskNativeMixin(ComposedComponent) {
  const MaskedComponent = class extends React.Component {
    render () {
      const {inputRef, ...props} = this.props;

      if (this._value != null) props.value = this._value;
      if (this._selection != null){
        let selection = {...this._selection};
        // check if selection range less than text length, otherwise it fails
        if (this._value != null) {
          selection.start = Math.min(selection.start, this._value.length);
          selection.end = Math.min(selection.end, this._value.length);
        }
        props.selection = selection;
      }

      return React.createElement(ComposedComponent, {
        ...this.wrapHandlers(props),
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
