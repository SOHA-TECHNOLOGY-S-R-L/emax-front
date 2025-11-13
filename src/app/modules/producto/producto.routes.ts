import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../../guards/is-authenticated.guard';
import { RoleGuard } from '../../guards/role.guard';
import { MantenimientoProductoComponent } from './pages/mantenimiento-producto.component';
import { ProductosComponent } from './pages/productos.component';
import { ProductosPorCategoriaComponent } from './pages/productos-por-categoria.component';
import { CategoriaListadoComponent } from './pages/categorias/categoria-listado.component';
import { CategoriaMantenimientoComponent } from './pages/categorias/categoria-mantenimiento.component';

export const routes: Routes = [
  {
    path: '',
    component: ProductosComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_LIST_PRODUCTOS' },
    pathMatch: 'full'
  },
  /*   { path: 'form-producto', component: FormProductoComponent,
      canActivate:[isAuthenticatedGuard,RoleGuard],
      data: { role: 'ROLE_REGISTER_PRODUCTO' }
     }, */

  {
    path: 'mantenimiento-producto', component: MantenimientoProductoComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_REGISTER_PRODUCTO' }
  },

  {
    path: 'mantenimiento-producto/:productoId', component: MantenimientoProductoComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_UPDATE_PRODUCTO' }
  },

  /*   { path: 'form-producto/:productoId', component: FormProductoComponent,
      canActivate:[isAuthenticatedGuard,RoleGuard],
      data: { role: 'ROLE_UPDATE_PRODUCTO' }
    }, */

    /*
  {
    path: 'productos-categoria/:categoriaId',
    component: ProductosPorCategoriaComponent,
  },*/

  {
    path: 'categorias',
    component: CategoriaListadoComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_LIST_CATEGORIAS' }
  },

  {
    path: 'mantenimiento-categoria',
    component: CategoriaMantenimientoComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_REGISTER_CATEGORIA' }
  },

  {
    path: 'categorias/:categoriaId',
    component: CategoriaMantenimientoComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_UPDATE_CATEGORIA' }
  }


];

/* @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductoRoutingModule { } */
