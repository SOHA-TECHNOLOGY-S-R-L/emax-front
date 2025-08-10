/* import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesRoutingModule } from './clientes-routing.module';
import { Router, RouterModule } from '@angular/router';
import { ClientesComponent } from './pages/clientes.component';
import { DetalleComponent } from './components/detalle.component';
import { FormComponent } from './components/form.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { CompartidoModule } from '../compartido/compartido.module';



@NgModule({
  declarations: [
    FormComponent,
    DetalleComponent,
  ],
  imports: [
    ClientesComponent,
    CompartidoModule

     CommonModule,
    RouterModule,
    ClientesRoutingModule,
    CompartidoModule, 
  ],
  providers: [
         { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ],
})
export class ClientesModule { } */
