import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../models/usuario';
import { findIndex } from 'lodash-es';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _usuario!: Usuario |null;
  private _token!: string | null;

  constructor(private http: HttpClient) { }

  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    } /*else if (this._usuario == null && sessionStorage.getItem('usuario') != null) {
      this._usuario = JSON.parse(sessionStorage.getItem('usuario')!) as Usuario;
      return this._usuario;
    }*/
    return new Usuario();
  }

  public get token(): string | null {
    if (this._token != null) {
      return this._token;
    } /* else if (this._token == null && sessionStorage.getItem('token') != null) {
      this._token = sessionStorage.getItem('token');
      return this._token;
    } */
    return null;
  }

  login(usuario: Usuario): Observable<any> {
  /*   const urlEndpoint = 'http://localhost:8080/login';

    const credenciales = btoa('angularapp' + ':' + '12345');

     const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + credenciales
    });

     let params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', usuario.username);
    params.set('password', usuario.password);
    console.log(params.toString());  */
    return this.http.post<any>(`${environment.apiLogin}`, usuario);
  }

  guardarUsuario(accessToken: string): void {
    let payload = this.obtenerDatosToken(accessToken);
    this._usuario = new Usuario();
    this._usuario.id = payload.id;
    //this._usuario.nombre = payload.nombre;
    //this._usuario.apellido = payload.apellido;
    //this._usuario.email = payload.email;
    this._usuario.username = payload.username;
    this._usuario.roles = payload.authorities;
    //this._usuario.authorities = payload.authorities;
    sessionStorage.setItem('usuario', JSON.stringify(this._usuario));
  }

  guardarToken(accessToken: string): void {
    this._token = accessToken;
    sessionStorage.setItem('token', accessToken);
  }

  obtenerDatosToken(accessToken: string | null): any {
    if (accessToken != null) {
      return JSON.parse(atob(accessToken.split(".")[1]));
    }
    return null;
  }

  isAuthenticated(): boolean {
    let payload = this.obtenerDatosToken(this.token);
    if (payload != null && payload.username && payload.username.length > 0) {
      return true;
    }
    return false;
  }

  hasRole(role: string): boolean {
    this.usuario.roles.toString()

     if (this.usuario.roles.toString().includes(role)) {
      return true;
    }
    return false;
  }

  logout(): void {
     this._token = null;
    this._usuario = null;
    sessionStorage.clear();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
  }
}
