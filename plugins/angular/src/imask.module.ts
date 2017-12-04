import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {IMaskDirective} from './imask.directive';


@NgModule({
  imports: [CommonModule],
  declarations: [IMaskDirective],
  exports: [IMaskDirective]
})
export class IMaskModule {}
