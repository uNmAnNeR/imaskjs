import { Component } from '@angular/core';
import { IMaskDirective, IMASK_FACTORY } from 'angular-imask';
import { NumberIMaskFactory } from './number-imask-factory';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IMaskDirective],
  providers: [
    {provide: IMASK_FACTORY, useClass: NumberIMaskFactory} // it's optional
  ],
  template: `
    <input
      [imask]="{mask: '+{7}(000)000-00-00'}"
      [unmask]="true"
      (accept)="onAccept()"
      (complete)="onAccept()"
    />
  `,
  styles: []
})
export class AppComponent {
  onAccept() {
    console.log('on accept')
  }
  onComplete() {
    console.log('on complete');
  }
}
