import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IMaskPipe } from './imask.pipe';
import { IMaskDirectiveModule } from './directive.module';

@NgModule({
  imports: [CommonModule, IMaskDirectiveModule],
  declarations: [IMaskPipe],
  exports: [IMaskPipe, IMaskDirectiveModule]
})
export class IMaskModule {}
