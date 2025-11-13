import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../../guards/is-authenticated.guard';
import { RoleGuard } from '../../guards/role.guard';
import { MovimientoCajaComponent } from './pages/movimiento-caja/movimiento-caja.component';
import { MovimientoComponent } from './pages/movimiento/movimiento.component';
import { RpteMovimientoEnCajaPorUsuarioComponent } from './reportes/rpte-movimiento-en-caja-por-usuario/rpte-movimiento-en-caja-por-usuario.component';
import { RpteMovimientoEnCajaComponent } from './reportes/rpte-movimiento-en-caja/rpte-movimiento-en-caja.component';

export const routes: Routes = [

  {
    path: 'caja',
    pathMatch: 'full',
    component: MovimientoCajaComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_REGISTER_MOVCAJA' }
  },
  {
    path: 'rpte-mov-en-caja',
    pathMatch: 'full',
    component: RpteMovimientoEnCajaComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_REPORT_MOVCAJA' }
  },
  {
    path: 'rpte-mov-en-caja-por-usuario',
    pathMatch: 'full',
    component: RpteMovimientoEnCajaPorUsuarioComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_RPTE_MOVCAJA_USUARIO' }
  },
  {
    path: ':pedidoId',
    pathMatch: 'full',
    component: MovimientoComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_REGISTER_PAGO_PEDIDO' }
  },
  {
    path: '',
    pathMatch: 'full',
    component: MovimientoComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_REGISTER_PAGO_PEDIDO' }
  },



];

/* @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosRoutingModule { }
 */
