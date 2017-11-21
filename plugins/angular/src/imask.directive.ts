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

  @Input() imask;
  @Output() onAccept = new EventEmitter();
  @Output() onComplete = new EventEmitter();

  _onTouched = () => {};
  _onChange: any = () => {};

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2) { }

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

    if (this.maskRef) this.maskRef.value = value;
    else this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
  }


  setDisabledState (isDisabled: boolean) {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled)
  }

  registerOnChange(fn: (value: any) => any): void { this._onChange = fn; }
  registerOnTouched(fn: () => any): void { this._onTouched = fn; }
  @HostListener('blur')
  onBlur() { this._onTouched(); }

  private initMask () {
    this.maskRef = new IMask(this.elementRef.nativeElement, this.imask)
      .on('accept', () => {
        try {
          this._onChange(this.maskRef.value);
          this._onTouched();
          this.onAccept.emit(this.maskRef.value);
        } catch (e) {}
      }).on('complete', () => {
        try {
          this.onComplete.emit(this.maskRef.value);
        } catch (e) {}
      });
  }
}
