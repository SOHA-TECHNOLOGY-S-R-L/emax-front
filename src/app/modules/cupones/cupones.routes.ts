import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../../guards/is-authenticated.guard';
import { RoleGuard } from '../../guards/role.guard';
import { CuponesMantenimientoComponent } from './pages/cupones-mantenimiento.component';
import { CuponesComponent } from './pages/cupones.component';

export const routes: Routes = [
  {
    path: '',
    component: CuponesComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_LIST_CUPON' },
    pathMatch: 'full'
  },
  {
    path: 'mantenimiento', component: CuponesMantenimientoComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_REGISTER_CUPON' }
  },

  {
    path: 'mantenimiento/:codigoCupon', component: CuponesMantenimientoComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_UPDATE_CUPON' }
  },




];

