import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../../guards/is-authenticated.guard';
import { RoleGuard } from '../../guards/role.guard';
import { FormComponent } from './components/form.component';
import { ClientesComponent } from './pages/clientes.component';



export const routes: Routes = [

/*   { path: '', redirectTo: 'clientes', pathMatch: 'full' }, */
  { path: '',
    component: ClientesComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_LIST_CLIENTES' }
  },
  { path: 'form/:id', component: FormComponent, 
    canActivate: [isAuthenticatedGuard, RoleGuard], 
    data: { role: 'ROLE_UPDATE_CLIENTE' }  },
  { path: 'form', component: FormComponent, 
    canActivate: [isAuthenticatedGuard, RoleGuard], 
    data: { role: 'ROLE_REGISTER_CLIENTE' } },
];


/* @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientesRoutingModule { }
 */