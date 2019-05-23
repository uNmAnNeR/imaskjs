import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  Provider,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import {
  COMPOSITION_BUFFER_MODE,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';
import IMask from 'imask';

function _isAndroid(): boolean {
  const userAgent = getDOM() ? getDOM().getUserAgent() : '';
  return /android (\d+)/.test(userAgent.toLowerCase());
}

export const MASKED_INPUT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => IMaskDirective),
  multi: true,
};

const DEFAULT_IMASK_ELEMENT = (elementRef: ElementRef) =>
  elementRef.nativeElement;
@Directive({
  selector: '[imask]',
  providers: [MASKED_INPUT_VALUE_ACCESSOR],
})
export class IMaskDirective<Opts extends IMask.AnyMaskedOptions>
  implements ControlValueAccessor, AfterViewInit, OnDestroy, OnChanges {
  public maskRef?: IMask.InputMask<Opts>;

  @Input() public imask?: Opts;
  @Input() public unmask?: boolean | 'typed';
  @Input() public imaskElement: (
    elementRef: ElementRef,
    directiveRef: any,
  ) => IMask.MaskElement = DEFAULT_IMASK_ELEMENT;
  @Output() public accept = new EventEmitter();
  @Output() public complete = new EventEmitter();

  private _viewInitialized = false;
  private _composing = false;
  private _writingValue = false;
  private _writing = false;

  public onChange = (_value: any) => {};
  @HostListener('blur')
  public onTouched = () => {}

  public ngAfterViewInit() {
    if (this.imask) {
      this.initMask();
    }

    this._viewInitialized = true;
  }
  get element() {
    return this.imaskElement(this._elementRef, this);
  }

  get maskValue() {
    if (!this.maskRef) {
      return this.element.value;
    }

    if (this.unmask === 'typed') {
      return this.maskRef.typedValue;
    }
    if (this.unmask) {
      return this.maskRef.unmaskedValue;
    }
    return this.maskRef.value;
  }

  set maskValue(value) {
    if (this.maskRef) {
      if (this.unmask === 'typed') {
        this.maskRef.typedValue = value;
      } else if (this.unmask) {
        this.maskRef.unmaskedValue = value;
      } else {
        this.maskRef.value = value;
      }
    } else {
      this._renderer.setProperty(this.element, 'value', value);
    }
  }

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    @Optional()
    @Inject(COMPOSITION_BUFFER_MODE)
    private _compositionMode: boolean | null,
  ) {
    if (this._compositionMode === null) {
      this._compositionMode = !_isAndroid();
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.elementRef && !this.imaskElement) {
      this.imaskElement = DEFAULT_IMASK_ELEMENT;
    }

    if (!changes.imask || !this._viewInitialized) {
      return;
    }

    if (this.imask) {
      if (this.maskRef) {
        this.maskRef.updateOptions(this.imask);
      } else {
        this.initMask();
        this.onChange(this.maskValue);
      }
    } else {
      this.destroyMask();
    }
  }

  public destroyMask() {
    if (this.maskRef) {
      this.maskRef.destroy();
      delete this.maskRef;
    }
  }

  public ngOnDestroy() {
    this.destroyMask();
    this.accept.complete();
    this.complete.complete();
  }

  public beginWrite(value: any): void {
    this._writing = true;
    this._writingValue = value;
  }

  public endWrite(): any {
    this._writing = false;
    return this._writingValue;
  }

  public writeValue(value: any) {
    value = value == null ? '' : value;

    if (this.maskRef) {
      this.beginWrite(value);

      if (
        this.maskValue !== value ||
        // handle cases like Number('') === 0,
        // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
        (typeof value !== 'string' && this.maskRef.value === '')
      ) {
        this.maskValue = value;
      }
    } else {
      this._renderer.setProperty(this.element, 'value', value);
    }
  }

  public _onAccept() {
    const value = this.maskValue;
    // if value was not changed during writing don't fire events
    // for details see https://github.com/uNmAnNeR/imaskjs/issues/136
    if (this._writing && value === this.endWrite()) {
      return;
    }
    this.onChange(value);
    this.onTouched();
    this.accept.emit(value);
  }

  public _onComplete() {
    this.complete.emit(this.maskValue);
  }

  public setDisabledState(isDisabled: boolean) {
    this._renderer.setProperty(this.element, 'disabled', isDisabled);
  }

  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener('input', ['$event.target.value'])
  public _handleInput(value: any): void {
    // if mask is attached all input goes throw mask
    if (this.maskRef) {
      return;
    }

    if (!this._compositionMode || (this._compositionMode && !this._composing)) {
      this.onChange(value);
    }
  }

  @HostListener('compositionstart')
  public _compositionStart(): void {
    this._composing = true;
  }

  @HostListener('compositionend', ['$event.target.value'])
  public _compositionEnd(value: any): void {
    this._composing = false;
    if (this._compositionMode) {
      this._handleInput(value);
    }
  }

  private initMask() {
    if (!this.imask) {
      return;
    }
    this.maskRef = IMask(this.element, this.imask)
      .on('accept', this._onAccept.bind(this))
      .on('complete', this._onComplete.bind(this));
  }
}
