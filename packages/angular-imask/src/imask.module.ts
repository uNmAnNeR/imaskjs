import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IMaskDirective } from './imask.directive';
import { IMaskPipe } from './imask.pipe';


@NgModule({
  imports: [CommonModule],
  declarations: [IMaskDirective, IMaskPipe],
  exports: [IMaskDirective, IMaskPipe]
})
export class IMaskModule {}
