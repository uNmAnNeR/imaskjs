import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IMaskModule } from 'angular-imask';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    IMaskModule,
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
