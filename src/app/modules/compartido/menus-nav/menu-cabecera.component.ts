import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Usuario } from '../../../models/usuario';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AngularMaterialModule } from '../angular-material.module';
import { ModalCarritoItemProductoComponent } from '../../pedidos/components/modal-carrito-item-producto/modal-carrito-item-producto.component';

@Component({
  selector: 'menu-cabecera',
  templateUrl: './menu-cabecera.component.html',
  styleUrl: './menu-cabecera.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, AngularMaterialModule]
})
export class MenuCabeceraComponent {


  @Output()
  clickMenuEvent = new EventEmitter<any>();

  title: string = 'EMAX Comercio electronico'
  //isAutenticado: boolean = false;
  usuario!: Usuario;
  /*   @Output()
    clickMenuEvent = new EventEmitter(); */

  //readonly animal = signal('');
  //readonly name = model('');
  readonly dialog = inject(MatDialog);

  constructor(private authService: AuthService,
    private router: Router,
    private alertService: AlertService) { }

  ngOnInit(): void {
    //this.isAutenticado = this.authService.isAuthenticated();
    if (this.isAutenticado()) {
      this.usuario = this.authService.usuario;
    }
  }

  isAutenticado(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    let username = this.authService.usuario.username;
    this.authService.logout();
    this.alertService.success(`Hola ${username}, has cerrado sesión con éxito!`, 'Cerrar sesión');
    //swal.fire('Logout', `Hola ${username}, has cerrado sesión con éxito!`, 'success');
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
