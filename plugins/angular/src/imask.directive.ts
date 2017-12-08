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

  @Input() imask;
  @Input() unmask?: boolean;
  @Output() accept: EventEmitter<string>;
  @Output() complete: EventEmitter<string>;

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2) {
    this._onTouched = () => {};
    this._onChange = () => {};
    this.accept = new EventEmitter();
    this.complete = new EventEmitter();
  }


  get maskValue () {
    if (!this.maskRef) return this.elementRef.nativeElement.value;

    return this.unmask ? this.maskRef.unmaskedValue : this.maskRef.value;
  }

  set maskValue (value) {
    if (this.maskRef) {
      if (this.unmask) this.maskRef.unmaskedValue = value;
      else this.maskRef.value = value;
    } else {
      this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
    }
  }

  ngAfterViewInit() {
    if (!this.imask) return;

    this.initMask();
  }

  ngOnChanges(changes) {
    if (!changes.imask) return;

    if (this.imask) {
      if (this.maskRef) this.maskRef.updateOptions(this.imask);
      else this.initMask();
    } else {
      this.ngOnDestroy();
    }
  }

  ngOnDestroy() {
    if (this.maskRef) {
      this.maskRef.destroy();
      delete this.maskRef;
    }
  }

  writeValue(value: any) {
    value = value == null ? '' : value;

    if (this.maskRef) this.maskValue = value;
    else this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
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
    this.maskRef = new IMask(this.elementRef.nativeElement, this.imask)
      .on('accept', this._onAccept.bind(this))
      .on('complete', this._onComplete.bind(this));
  }

  setDisabledState (isDisabled: boolean) {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled)
  }

  registerOnChange(fn: (value: any) => any): void { this._onChange = fn; }
  registerOnTouched(fn: () => any): void { this._onTouched = fn; }
  @HostListener('blur') onBlur() { this._onTouched(); }
}
