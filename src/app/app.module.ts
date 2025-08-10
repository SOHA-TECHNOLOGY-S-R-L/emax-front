/*
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CompartidoModule } from './modules/compartido/compartido.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './modules/auth/login.component';
import { CommonModule, DatePipe, NgOptimizedImage, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ZonaHorariaDefectoService } from './services/zona-horaria-defecto.service';
import localeEsPE from '@angular/common/locales/es-PE';
import { TokenInterceptor } from './interceptors/token.interceptor';

import { LayoutModule, MediaMatcher } from '@angular/cdk/layout';
import { CrearCuentaTiendaComponent } from './modules/auth/crear-cuenta-tienda.component';
import { PrincipalComponent } from './modules/compartido/principal.component';


registerLocaleData(localeEsPE);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CrearCuentaTiendaComponent


  ],
  imports: [
    CommonModule,
    PrincipalComponent
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    CompartidoModule,
    HttpClientModule,
    LayoutModule,
    NgOptimizedImage
  ],
  providers: [ZonaHorariaDefectoService,
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideAnimationsAsync(),
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    MediaMatcher
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
 */