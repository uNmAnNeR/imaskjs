import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMASK_FACTORY } from 'angular-imask';
import { IMaskModule } from 'angular-imask';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IMaskModule],
  template: `
    <input
      [formControl]="control"
      [imask]="mask"
      unmask="typed"
      (accept)="onAccept()"
      (complete)="onComplete()"
    />
  `,
  styles: []
})
export class AppComponent {
  control = new FormControl<number>(12.3);
  mask = {
    mask: Number,
    scale: 2,
    signed: true,
    thousandsSeparator: '.',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ',',
  };

  onAccept() {
    console.log('on accept')
  }
  onComplete() {
    console.log('on complete');
  }
}
