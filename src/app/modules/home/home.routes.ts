import { Routes } from '@angular/router';
import { UbicanosClienteComponent } from './pages/ubicanos-cliente/ubicanos-cliente.component';
import { HomeComponent } from './pages/home.component';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';
import { ProductosClienteComponent } from './pages/productos-cliente/productos-cliente.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'productos-cliente', component: ProductosClienteComponent },
  { path: 'ubicanos-cliente', component: UbicanosClienteComponent },
];

/* @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { } */
