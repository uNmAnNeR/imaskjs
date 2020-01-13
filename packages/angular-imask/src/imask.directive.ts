import {
  Directive, ElementRef, Input, Output, forwardRef, Provider, Renderer2,
  EventEmitter, OnDestroy, OnChanges, AfterViewInit,
  Optional, Inject, SimpleChanges,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';
// TODO import only types when ts 3.8 released or when move IMask to ts
import IMask from 'imask';


function _isAndroid(): boolean {
  const userAgent = getDOM() ? getDOM().getUserAgent() : '';
  return /android (\d+)/.test(userAgent.toLowerCase());
}


export const MASKEDINPUT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => IMaskDirective),
  multi: true
};

const DEFAULT_IMASK_ELEMENT = (elementRef: any) => elementRef.nativeElement;
@Directive({
  selector: '[imask]',
  host: {
    '(input)': '_handleInput($event.target.value)',
    '(blur)': 'onTouched()',
    '(compositionstart)': '_compositionStart()',
    '(compositionend)': '_compositionEnd($event.target.value)'
  },
  providers: [MASKEDINPUT_VALUE_ACCESSOR]
})
export class IMaskDirective<Opts extends IMask.AnyMaskedOptions> implements ControlValueAccessor, AfterViewInit, OnDestroy, OnChanges {
  maskRef?: IMask.InputMask<Opts>;
  onTouched: any;
  onChange: any;
  private _viewInitialized: boolean;
  private _composing: boolean;
  private _writingValue: any;
  private _writing: boolean;

  @Input() imask?: Opts;
  @Input() unmask?: boolean|'typed';
  @Input() imaskElement: (elementRef: ElementRef, directiveRef: any) => IMask.MaskElement;
  @Output() accept: EventEmitter<any>;
  @Output() complete: EventEmitter<any>;

  constructor(private _elementRef: ElementRef,
              private _renderer: Renderer2,
              @Optional() @Inject(COMPOSITION_BUFFER_MODE) private _compositionMode: boolean) {
    // init here to support AOT (TODO may be will work with ng-packgr - need to check)
    this.onTouched = () => {};
    this.onChange = () => {};
    this.imaskElement = DEFAULT_IMASK_ELEMENT;
    this.accept = new EventEmitter();
    this.complete = new EventEmitter();
    this._viewInitialized = false;
    this._composing = false;
    this._writing = false;

    if (this._compositionMode == null) {
      this._compositionMode = !_isAndroid();
    }
  }

  get element () {
    return this.imaskElement(this._elementRef, this);
  }

  get maskValue (): any {
    if (!this.maskRef) return this.element.value;

    if (this.unmask === 'typed') return this.maskRef.typedValue;
    if (this.unmask) return this.maskRef.unmaskedValue;
    return this.maskRef.value;
  }

  set maskValue (value: any) {
    if (this.maskRef) {
      if (this.unmask === 'typed') this.maskRef.typedValue = value;
      else if (this.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
    } else {
      this._renderer.setProperty(this.element, 'value', value);
    }
  }

  ngAfterViewInit() {
    if (this.imask) this.initMask();

    this._viewInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.elementRef && !this.imaskElement) this.imaskElement = DEFAULT_IMASK_ELEMENT;

    if (!changes.imask || !this._viewInitialized) return;

    if (this.imask) {
      if (this.maskRef) this.maskRef.updateOptions(this.imask);
      else {
        this.initMask();
        this.onChange(this.maskValue);
      }
    } else {
      this.destroyMask();
    }
  }

  destroyMask () {
    if (this.maskRef) {
      this.maskRef.destroy();
      delete this.maskRef;
    }
  }

  ngOnDestroy () {
    this.destroyMask();
    this.accept.complete();
    this.complete.complete();
  }

  beginWrite (value: any): void {
    this._writing = true;
    this._writingValue = value;
  }

  endWrite (): any {
    this._writing = false;
    return this._writingValue;
  }

  writeValue(value: any) {
    value = value == null ? '' : value;

    if (this.maskRef) {
      this.beginWrite(value);

      if (this.maskValue !== value ||
        // handle cases like Number('') === 0,
        // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
        (typeof value !== 'string' && this.maskRef.value === '') &&
          !this.maskRef.el.isActive
      ) {
        this.maskValue = value;
      }
    } else {
      this._renderer.setProperty(this.element, 'value', value);
    }
  }

  _onAccept () {
    const value = this.maskValue;
    // if value was not changed during writing don't fire events
    // for details see https://github.com/uNmAnNeR/imaskjs/issues/136
    if (this._writing && value === this.endWrite()) return;
    this.onChange(value);
    this.accept.emit(value);
  }

  _onComplete () {
    this.complete.emit(this.maskValue);
  }

  private initMask () {
    this.maskRef = IMask(this.element, this.imask as Opts)
      .on('accept', this._onAccept.bind(this))
      .on('complete', this._onComplete.bind(this));
  }

  setDisabledState (isDisabled: boolean) {
    this._renderer.setProperty(this.element, 'disabled', isDisabled)
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn }
  registerOnTouched(fn: () => void): void { this.onTouched = fn }

  _handleInput(value: any): void {
    // if mask is attached all input goes throw mask
    if (this.maskRef) return;

    if (!this._compositionMode || (this._compositionMode && !this._composing)) {
      this.onChange(value);
    }
  }

  _compositionStart(): void { this._composing = true; }

  _compositionEnd(value: any): void {
    this._composing = false;
    this._compositionMode && this._handleInput(value);
  }
}
