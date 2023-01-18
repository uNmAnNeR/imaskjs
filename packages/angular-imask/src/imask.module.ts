import { NgModule } from '@angular/core';

import { IMaskPipe } from './imask.pipe';
import { IMaskDirective } from './imask.directive';

@NgModule({
  imports: [IMaskDirective, IMaskPipe],
  exports: [IMaskDirective, IMaskPipe]
})
export class IMaskModule {}
