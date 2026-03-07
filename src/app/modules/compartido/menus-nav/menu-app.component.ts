import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
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
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule]
})
export class MenuAppComponent {
  public authService = inject(AuthService);

  usuario = computed(() => {
    const isAutenticado = this.authService.isAuthenticated()
    if (!isAutenticado) { return }
    console.log(this.authService.usuario())
    return this.authService.usuario()
  })

  title: string = 'EMAX Comercio electronico'
  //isAutenticado: boolean = false;
  //usuario!: Usuario;
  @Output()
  clickMenuEvent = new EventEmitter();



  constructor(
    private router: Router,
    private alertService: AlertService) { }

  /*   ngOnInit(): void {
      debugger;
      this.isAutenticado = this.authService.isAuthenticated();
      if (this.isAutenticado) {
        debugger;
        this.usuario = this.authService.usuario()!;
        console.log("this.usuarioooooooooooo", this.usuario)
      }
    } */

  logout(): void {
    //let username = this.authService.usuario.username;
    this.authService.logout();
    this.clickMenuEvent.emit();

    //this.alertService.success(`Hola ${username}, has cerrado sesión con éxito!`, 'Cerrar sesión');
    //this.router.navigate(['']);
  }

}
