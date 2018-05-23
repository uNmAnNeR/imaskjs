import {MaskElement} from 'imask';


export default
class NativeMaskElement extends MaskElement {
	constructor (input, component) {
    super();
		this.input = input;
		this.component = component;
	}

  get value () {
    return this.component._value || '';
  }

  set value (value) {
    this.component._value = value;
  }

  get _selection () {
    return this.component._selection || {};
  }

  get _unsafeSelectionStart () {
    return this._selection.start;
  }

  get _unsafeSelectionEnd () {
    return this._selection.end;
  }

  _unsafeSelect (start, end) {
    this.component._selection = {start, end};
  }

  isActive () {
    return this.input.isFocused();
  }

  bindEvents (handlers) {
    const nativeHandlers = Object.keys(handlers)
      .filter(event => NativeMaskElement.EVENTS_MAP[event])
      .reduce((nativeHandlers, event) => {
        const nativeEvent = NativeMaskElement.EVENTS_MAP[event];
        const internalHandler = handlers[event];
        let handler = internalHandler;

        // TODO rewrite
        if (event === 'selectionChange') {
          handler = (e) => {
            const {nativeEvent: {selection}} = e;
            this.component._selection = selection;

            // if waiting to handle input
            if (this._cachedValue != null) {
              this.value = this._cachedValue;
              // call input handler
              this.component.state.maskHandlers['onChangeText'](this._cachedValue);
              delete this._cachedValue;
            }
            internalHandler(e);

            // redraw
            this.component.forceUpdate();
          }
        } else if (event === 'input') {
          handler = (text) => {
            // on ios onSelectionChange event fires after onChangeText,
            // so need to set flag _inputDelayed and wait for onChangeText event
            // on which handler will be called again
            // TODO test it on android
            if (this._cachedValue) internalHandler(this._cachedValue);
            else this._cachedValue = text;
          }
        }

        nativeHandlers[nativeEvent] = handler;

        return nativeHandlers;
      }, {});

    this.component.setState({
      ...this.component.state,
      maskHandlers: nativeHandlers,
    })
  }

  unbindEvents () {
    const state = {...this.component.state};
    delete state.maskHandlers;

    this.component.setState(state);
  }
}
NativeMaskElement.EVENTS_MAP = {
  selectionChange: 'onSelectionChange',
  input: 'onChangeText',
  focus: 'onFocus',
  commit: 'onBlur',
};
