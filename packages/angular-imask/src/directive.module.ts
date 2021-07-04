import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IMaskDirective } from './imask.directive';
import { IMaskFactory } from './imask-factory';
import { DefaultImaskFactory } from './default-imask-factory';


@NgModule({
  imports: [CommonModule],
  declarations: [IMaskDirective],
  providers: [{provide: IMaskFactory, useClass: DefaultImaskFactory}],
  exports: [IMaskDirective]
})
export class IMaskDirectiveModule {}
