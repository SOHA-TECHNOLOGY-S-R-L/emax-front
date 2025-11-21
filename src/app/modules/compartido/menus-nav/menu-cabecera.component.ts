import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Usuario } from '../../../models/usuario';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'menu-cabecera',
  templateUrl: './menu-cabecera.component.html',
  styleUrl: './menu-cabecera.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule]
})
export class MenuCabeceraComponent {

  @Output()
  clickMenuEvent = new EventEmitter<any>();

  title: string = 'EMAX Comercio electronico'
  //isAutenticado: boolean = false;
  usuario!: Usuario;
  /*   @Output()
    clickMenuEvent = new EventEmitter(); */

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

}
