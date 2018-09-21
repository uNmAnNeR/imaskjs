import {
  Directive, ElementRef, Input, Output, forwardRef, Provider, Renderer2,
  HostListener, EventEmitter, OnDestroy, OnChanges, AfterViewInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import IMask from 'imask';


export const MASKEDINPUT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => IMaskDirective),
  multi: true
};

@Directive({
  selector: '[imask]',
  providers: [MASKEDINPUT_VALUE_ACCESSOR]
})
export class IMaskDirective implements ControlValueAccessor, AfterViewInit, OnDestroy, OnChanges {
  maskRef: any;
  _onTouched: any;
  _onChange: any;
  private viewInitialized;
  private childrenNativeElement: any;

  @Input() imask;
  @Input() unmask?: boolean|'typed';
  @Output() accept: EventEmitter<any>;
  @Output() complete: EventEmitter<any>;

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2) {
    // init here to support AOT
    this._onTouched = () => {};
    this._onChange = () => {};
    this.accept = new EventEmitter();
    this.complete = new EventEmitter();
    this.viewInitialized = false;
  }


  get maskValue () {
    if (!this.maskRef) return this.childrenNativeElement.value;

    if (this.unmask === 'typed') return this.maskRef.typedValue;
    if (this.unmask) return this.maskRef.unmaskedValue;
    return this.maskRef.value;
  }

  set maskValue (value) {
    if (this.maskRef) {
      if (this.unmask === 'typed') this.maskRef.typedValue = value;
      else if (this.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
    } else {
      this.renderer.setProperty(this.childrenNativeElement, 'value', value);
    }
  }

  ngAfterViewInit() {
    if (!this.imask) return;

    this.childrenNativeElement = this.elementRef.nativeElement.children[0];

    this.initMask();
    this.viewInitialized = true;
  }

  ngOnChanges(changes) {
    if (!changes.imask || !this.viewInitialized) return;

    if (this.imask) {
      if (this.maskRef) this.maskRef.updateOptions(this.imask);
      else this.initMask();
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

  writeValue(value: any) {
    value = value == null ? '' : value;

    if (this.maskRef) this.maskValue = value;
    else this.renderer.setProperty(this.childrenNativeElement, 'value', value);
  }

  _onAccept () {
    this._onChange(this.maskValue);
    this._onTouched();
    this.accept.emit(this.maskValue);
  }

  _onComplete () {
    this.complete.emit(this.maskValue);
  }

  private initMask () {
    this.maskRef = new IMask(this.childrenNativeElement, this.imask)
      .on('accept', this._onAccept.bind(this))
      .on('complete', this._onComplete.bind(this));
  }

  setDisabledState (isDisabled: boolean) {
    this.renderer.setProperty(this.childrenNativeElement, 'disabled', isDisabled)
  }

  registerOnChange(fn: (value: any) => any): void { this._onChange = fn; }
  registerOnTouched(fn: () => any): void { this._onTouched = fn; }
  @HostListener('blur') onBlur() { this._onTouched(); }
}
