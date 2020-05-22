import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { IMaskModule } from 'angular-imask';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IMaskModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
