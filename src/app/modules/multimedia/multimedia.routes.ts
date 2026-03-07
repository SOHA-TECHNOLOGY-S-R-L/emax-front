import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../../guards/is-authenticated.guard';
import { RoleGuard } from '../../guards/role.guard';
import { ListMultimediaComponent } from './pages/list-multimedia/list-multimedia.component';

export const routes: Routes = [
  {
    path: '',
    component: ListMultimediaComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_LIST_MULTIMEDIA' },
    pathMatch: 'full'
  },


];

