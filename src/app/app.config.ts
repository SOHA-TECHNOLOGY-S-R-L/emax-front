import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ZonaHorariaDefectoService } from './services/zona-horaria-defecto.service';

import { MediaMatcher } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { routes } from './app.routes';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { tokenIntercept } from './interceptors/token.interceptor';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { LoadingInterceptor } from './interceptors/loading.interceptor';


export const appConfig: ApplicationConfig = {

  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    ZonaHorariaDefectoService,
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura // Cambia 'saga-blue' por el tema que desees usar
      }
    }),
    DatePipe,
    MediaMatcher,
    provideRouter(routes),
    provideHttpClient(withFetch(),
      withInterceptors([tokenIntercept]),
      withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },

    provideClientHydration(withEventReplay()),
    /*{ provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }, */
  ],
};
