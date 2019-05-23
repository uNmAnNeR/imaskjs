import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IMaskDirective } from './imask.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [IMaskDirective],
  exports: [IMaskDirective],
})
export class IMaskModule {}
