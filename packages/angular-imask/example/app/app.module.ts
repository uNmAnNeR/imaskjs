import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { IMaskDirectiveModule, IMaskFactory } from 'angular-imask';
import { NumberIMaskFactory } from './number-imask-factory';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IMaskDirectiveModule,
  ],
  providers: [
    {provide: IMaskFactory, useClass: NumberIMaskFactory} // it's optional
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
