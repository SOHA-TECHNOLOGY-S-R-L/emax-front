import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../../guards/is-authenticated.guard';
import { RoleGuard } from '../../guards/role.guard';
import { AperturaCierreCajaComponent } from './pages/apertura-cierre-caja/apertura-cierre-caja.component';
import { RpteCajaPorUsuarioComponent } from './reportes/rpte-caja-por-usuario/rpte-caja-por-usuario.component';
import { RpteCajaComponent } from './reportes/rpte-cierre-caja/rpte-caja.component';

export const routes: Routes = [
    { path: '',
      component: AperturaCierreCajaComponent,
      canActivate: [isAuthenticatedGuard],
      pathMatch: 'full' },
    { path: 'rpte-caja',
      component: RpteCajaComponent,
      canActivate:[isAuthenticatedGuard, RoleGuard],
      data: { role: 'ROLE_REPORT_CJU' }
    },
    { path: 'rpte-caja-por-usuario',
      component: RpteCajaPorUsuarioComponent,
      canActivate:[isAuthenticatedGuard, RoleGuard],
      data: { role: 'ROLE_REPORT_USUARIO_CJU' }
    },


];

/* @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CajaRoutingModule { } */
