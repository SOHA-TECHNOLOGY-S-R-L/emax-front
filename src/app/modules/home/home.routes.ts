import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';
import { HomeComponent } from './pages/home.component';
import { ProductoServicioClienteComponent } from './pages/producto-servicio-cliente/producto-servicio-cliente.component';
import { ContactanosClienteComponent } from './pages/contactanos-cliente/contactanos-cliente.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'productos-servicios', component: ProductoServicioClienteComponent },
  { path: 'contactanos-cliente', component: ContactanosClienteComponent },
];

/* @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { } */
