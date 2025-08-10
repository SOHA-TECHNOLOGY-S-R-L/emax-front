import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Usuario } from '../../../models/usuario';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'menu-app',
  templateUrl: './menu-app.component.html',
  styleUrl: './menu-app.component.css',
  standalone: true,
  imports: [CommonModule,RouterModule, MatListModule, MatIconModule]
})
export class MenuAppComponent {

  title: string = 'EMAX Comercio electronico'
  isAutenticado: boolean = false;
  usuario!: Usuario;
  @Output()
  clickMenuEvent = new EventEmitter();



  constructor(public authService: AuthService,
    private router: Router,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.isAutenticado = this.authService.isAuthenticated();
    if (this.isAutenticado) {
      this.usuario = this.authService.usuario;
    }
  }

  logout(): void {
    let username = this.authService.usuario.username;
    this.authService.logout();
    this.clickMenuEvent.emit();

    //this.alertService.success(`Hola ${username}, has cerrado sesión con éxito!`, 'Cerrar sesión');
    //this.router.navigate(['']);
  }

}
