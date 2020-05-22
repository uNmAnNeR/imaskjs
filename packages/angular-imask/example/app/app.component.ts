import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
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
  title = 'example';
  onAccept() {
    console.log('on accept')
  }
  onComplete() {
    console.log('on complete');
  }
}
