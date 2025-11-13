import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../../guards/is-authenticated.guard';
import { RoleGuard } from '../../guards/role.guard';
import { FormComponent } from './components/form.component';
import { PersonasComponent } from './pages/personas.component';



export const routes: Routes = [

/*   { path: '', redirectTo: 'personas', pathMatch: 'full' }, */
  { path: '',
    component: PersonasComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_LIST_PERSONAS' }
  },
  { path: 'form/:id', component: FormComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_UPDATE_PERSONA' }  },
  { path: 'form', component: FormComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_REGISTER_PERSONA' } },
];


/* @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonasRoutingModule { }
 */
