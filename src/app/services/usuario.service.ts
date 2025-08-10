import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { PageableResponse } from '../models/pageable-response';
import { Usuario } from '../models/usuario';
import { environment } from '../../environments/environment';
import { Modulo } from '../models/modulo';


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


  getAllUsuariosPageable(params: any): Observable<PageableResponse> {
    return this.httpClient.get<any>(`${environment.apiUrl}/usuarios/pageable`, {
      params: params,
    });
  }

  getUsuarioByUsername(username: string): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${environment.apiUrl}/usuarios/${username}`
/*       , {headers: this.agregarAuthorizationHeader()}
 */    )
    /*     .pipe(
          catchError(e => {
            if (e.status != 401 && e.error.mensaje) {
              this.router.navigate(['/clientes']);
              console.error(e.error.mensaje);
            }

            return throwError(e);
          })); */
  }

  updateRolUsuario(usuario:Usuario, usuarioId: number): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/usuarios-roles/update/${usuarioId}`, usuario);
  }

  deleteRolUsuario(usuario:Usuario, usuarioId: number): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/usuarios-roles/delete/${usuarioId}`, usuario);
  }

}
