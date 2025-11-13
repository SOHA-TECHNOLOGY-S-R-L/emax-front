import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private _usuario!: Usuario;

  constructor(private httpClient: HttpClient, private router: Router, private authService: AuthService) { }

  getAllUsers(): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(`${environment.apiUrl}/usuarios`
    )
  }

  setUsuario(usuario: Usuario) {
    this._usuario = usuario
  }

  get usuario() {
    return { ...this._usuario }
  }

  getUsuarioByUsername(username: string): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${environment.apiUrl}/usuarios/${username}`
/*       , {headers: this.agregarAuthorizationHeader()}
 */    )
  }

  updateRolUsuario(usuario: Usuario, usuarioId: number): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/usuarios-roles/update/${usuarioId}`, usuario);
  }

  deleteRolUsuario(usuario: Usuario, usuarioId: number): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/usuarios-roles/delete/${usuarioId}`, usuario);
  }

   confirmarDobleInputClave(clave: string, confirmaClave: string): boolean {
    return clave === confirmaClave;
  }

  resetClaveConUserName(username: string): Observable<boolean> {
    return this.httpClient.get<boolean>(`${environment.apiUrl}/auth/${username}/renovar-clave`
    );
  }

  validarCodigoRenovaciónClaveUsuario(username: string, codigoVerificacion: string): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/usuario/${username}/validar-renovacion/${codigoVerificacion}`);
  }

  renovarClaveUsuario(username: string, clave: string): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/usuario/${username}/renovar-clave/${clave}`);
  }
}
