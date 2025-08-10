import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../models/usuario';
import swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Router } from '@angular/router';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
      imports: [ CommonModule, MatDatepickerModule, MatNativeDateModule,MatFormFieldModule, MatInputModule, MatTableModule, MatPaginatorModule, RouterModule, FormsModule, ReactiveFormsModule, MatCardModule, MatAutocompleteModule, MatSelectModule, MatRadioModule, MatIconModule, MatDialogModule]


})
export class LoginComponent implements OnInit {

  titulo: string = 'Identifícate';
  usuario: Usuario;

  constructor(private authService: AuthService,
              private router: Router,
              private alertService: AlertService) {
    this.usuario = new Usuario();
  }

  ngOnInit() {
     if (this.authService.isAuthenticated()) {
      this.alertService.success(`Hola ${this.authService.usuario.username} ya estás autenticado!`, 'Autenticación')
      //swal.fire('Login', `Hola ${this.authService.usuario.username} ya estás autenticado!`, 'info');
      this.router.navigate(['']);
    }
  }

  login(): void {
     //console.log(this.usuario);
    if (this.usuario.username == null || this.usuario.password == null) {
      //swal.fire('Error Login', 'Username o password vacías!', 'error');
      this.alertService.info(`Usuario o clave vacios!`, 'Autenticación')

      return;
    }

    this.authService.login(this.usuario).subscribe(response => {
      console.log(response);
      this.authService.guardarUsuario(response.token);
      this.authService.guardarToken(response.token);
      let usuario = this.authService.usuario;
      this.router.navigate(['/']);
      //this.alertService.success(`Hola ${usuario.username}, has iniciado sesión con éxito!`, 'Autenticación')
      //swal.fire('Login', `Hola ${usuario.username}, has iniciado sesión con éxito!`, 'success');
    }, err => {
      //if (err.status == 400) {
        this.alertService.error('Usuario o clave incorrectas!', 'Autenticación')
        //swal.fire('Error Login', 'Usuario o clave incorrectas!', 'error');
     // }
    }
    );
  }

}
