import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import localeEsPE from '@angular/common/locales/es-PE';
import localePEExtra from '@angular/common/locales/extra/es-PE';

import { registerLocaleData } from '@angular/common';

const bootstrap = () => bootstrapApplication(AppComponent, config);
registerLocaleData(localeEsPE,'es-PE', localePEExtra);

export default bootstrap;
