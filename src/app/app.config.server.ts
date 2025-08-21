import { mergeApplicationConfig, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ZonaHorariaDefectoService } from './services/zona-horaria-defecto.service';

const serverConfig: ApplicationConfig = {
  providers: [
    ZonaHorariaDefectoService,
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
