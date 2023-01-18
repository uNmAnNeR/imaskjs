import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';

import { AppComponent } from './app/app.component';

enableProdMode();

bootstrapApplication(AppComponent)
  .catch(err => console.error(err));
