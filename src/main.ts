import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { appConfig } from './app/app.config';
import { App } from './app/app';



bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideZoneChangeDetection()
  ]
}).catch(console.error);

