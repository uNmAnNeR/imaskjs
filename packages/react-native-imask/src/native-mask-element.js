import MaskElement from 'imask/esm/controls/mask-element';


export default
class NativeMaskElement extends MaskElement {
	constructor (input, component) {
    super();
		this.input = input;
		this.component = component;
	}

  get value () {
    return this._syncValue != null ?
      this. _syncValue :
      this.component.state.value || '';
  }

  set value (value) {
    this._syncValue = value;

    this.component.setState(prevState => ({
      ...prevState,
      value,
    }));
  }

  get _selection () {
    return this._syncSelection ||
      this.input.props.selection ||
      {};
  }

  get _unsafeSelectionStart () {
    return this._selection.start;
  }

  get _unsafeSelectionEnd () {
    return this._selection.end;
  }

  _unsafeSelect (start, end) {
    this._syncSelection = {start, end};

    if (this._processInput) {
      setTimeout(() => this._unsafeSelect(start, end));
    } else {
      this.input.setNativeProps({selection: this._syncSelection});
    }
  }

  get isActive () {
    return this.input.isFocused();
  }

  bindEvents (handlers) {
    const nativeHandlers = Object.keys(handlers)
      .filter(event => NativeMaskElement.EVENTS_MAP[event])
      .reduce((nativeHandlers, event) => {
        const nativeEvent = NativeMaskElement.EVENTS_MAP[event];
        const internalHandler = handlers[event];
        let handler = internalHandler;

        // TODO rewrite?
        if (event === 'selectionChange') {
          handler = (e) => {
            const selection = e.nativeEvent.selection;
            this._unsafeSelect(selection.start, selection.end);

            // if waiting to handle input
            if (this._processInput) this.component.state.maskHandlers['onChangeText'](this.value);
            else internalHandler(e);

            delete this._processInput;
          }
        } else if (event === 'input') {
          handler = (text) => {
            // on ios onSelectionChange event fires after onChangeText,
            // so need to set flag _inputDelayed and wait for onChangeText event
            // on which handler will be called again
            // TODO test it on android
            if (this._processInput) {
              // console.log('HANDLE VALUE', this.value);
              return internalHandler(this.value);
            }

            // console.log('CACHE VALUE', text);
            this._processInput = true;
            this.value = text;
          }
        } else if (event === 'click' || event === 'focus') {
          handler = function handler (e) {
            // cursor is still in old position here
            // delay handler to wait for cursor is changed
            setTimeout(internalHandler, 0, e);
          }
        }

        nativeHandlers[nativeEvent] = handler;

        return nativeHandlers;
      }, {});

    this.component.setState(prevState => ({
      ...prevState,
      maskHandlers: nativeHandlers,
    }));
  }

  unbindEvents () {
    this.component.setState(prevState => {
      const {maskHandlers, ...state} = prevState;
      return state;
    });
  }
}
NativeMaskElement.EVENTS_MAP = {
  selectionChange: 'onSelectionChange',
  input: 'onChangeText',
  focus: 'onFocus',
  click: 'onTouchEnd',
  commit: 'onBlur',
};
