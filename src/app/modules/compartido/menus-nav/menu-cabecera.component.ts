import { UsuarioService } from './../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { Usuario } from '../../../models/usuario';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AngularMaterialModule } from '../angular-material.module';
import { ModalCarritoItemProductoComponent } from '../../pedidos/components/modal-carrito-item-producto/modal-carrito-item-producto.component';
import { ItemService } from '../../../services/item.service';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { PersonaService } from '../../../services/persona.service';
import { of, switchMap } from 'rxjs';
import { Persona } from '../../../models/persona';

@Component({
  selector: 'menu-cabecera',
  templateUrl: './menu-cabecera.component.html',
  styleUrl: './menu-cabecera.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, AngularMaterialModule]
})
export class MenuCabeceraComponent {
  public authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private personaService = inject(PersonaService);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private itemService = inject(ItemService);
  readonly dialog = inject(MatDialog);

  readonly items = toSignal(this.itemService.getItems(), { initialValue: [] });
  //isCliente: boolean = true;

  readonly usuarioResource = rxResource({
    params: () => this.authService.usuario(),
    stream: ({ params }) => {
      if (!params?.username) return of(null);
      return this.usuarioService.getUsuarioByUsername(params.username);
    }
  });

  readonly personaResource = rxResource({
    params: () => this.usuarioResource.value(),
    stream: ({ params }) => {
      if (!params?.id) return of(null);
      return this.personaService.getPersonaByUsuarioId(params.id);
    }
  });

  readonly isCliente = computed(() => {
    const persona = this.personaResource.value();
    if (!persona) return true;

    return !persona.tipoPersona.persona.startsWith('Empleado');
  });

  readonly isAutenticado = computed(() =>
    this.authService.isAuthenticated()
  );


  @Output()
  clickMenuEvent = new EventEmitter<any>();

  title: string = 'EMAX Comercio electronico'

  constructor() { }

  /*   ngOnInit(): void {
      debugger;
      if (!this.authService.isAuthenticated()) {
        return;
      }
      this.usuarioService.getUsuarioByUsername(this.authService.usuario.username)
        .pipe(
          switchMap(usr => this.personaService.getPersonaByUsuarioId(usr.id))
        )
        .subscribe({
          next: (persona) => {
            debugger;
            console.log('personasssssssssss', persona)
            this.isCliente = true
            if (persona.tipoPersona.persona.startsWith("Empleado")) {
              this.isCliente = false
            }
          },
          error: (err) => console.error('Error en la carga:', err)
        });
    } */

  /*   isAutenticado(): boolean {
      return this.authService.isAuthenticated();
    } */

  logout(): void {
    const username = this.authService.usuario()?.username;

    this.authService.logout();
    this.alertService.success(
      `Hola ${username}, has cerrado sesión con éxito!`,
      'Cerrar sesión'
    );

    this.router.navigate(['/tienda/productos-categoria', 'tienda']);
  }

  sideNavToggle(): void {
    this.clickMenuEvent.emit();
  }


  openModalCart(): void {
    const dialogRef = this.dialog.open(ModalCarritoItemProductoComponent, {
      data: 0,
/*       disableClose: true
 */    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        // this.animal.set(result);
      }
    });
  }


}
