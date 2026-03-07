import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../models/usuario';
import { findIndex, includes } from 'lodash-es';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private _usuario = signal<Usuario | null>(null);
  private _token = signal<string | null>(null);

  constructor(private http: HttpClient) {
    if (this.isBrowser) {
      this.restoreSession();
    }
  }

  readonly usuario = computed(() => this._usuario());
  readonly token = computed(() => this._token());

  readonly roles = computed(() =>
    this._usuario()?.roles ?? []
  );

  readonly isAuthenticated = computed(() => {
    const token = this._token();
    if (!token) return false;

    const payload = this.obtenerDatosToken(token);
    return !!payload?.username;
  });

  login(usuario: Usuario) {
    return this.http.post<any>(environment.apiLogin, usuario);
  }

  guardarUsuario(accessToken: string): void {
    const payload = this.obtenerDatosToken(accessToken);

    const user = new Usuario();
    user.id = payload.id;
    user.username = payload.username;
    user.roles = payload.authorities as Role[];

    this._usuario.set(user);
    if (this.isBrowser) {
      sessionStorage.setItem('usuario', JSON.stringify(user));
    }
  }

  guardarToken(accessToken: string): void {
    this._token.set(accessToken);
    if (this.isBrowser) {
      sessionStorage.setItem('token', accessToken);
    }
  }

  hasRole(role: string) {
    const user = this._usuario();
    if (!user?.roles) return false;
    return user.roles.toString().includes(role);
  }


  hasAnyRole(...roles: string[]) {
      const userRoles = this._usuario()?.roles ? this._usuario()?.roles.toString() : "";
      if (!userRoles) return false
      return roles.some(r => userRoles.includes(r));
  }

  logout(): void {
    this._usuario.set(null);
    this._token.set(null);
    sessionStorage.clear();
  }

  // -------------------------

  private restoreSession() {
    const token = sessionStorage.getItem('token');
    const usuario = sessionStorage.getItem('usuario');

    if (token) this._token.set(token);
    if (usuario) this._usuario.set(JSON.parse(usuario));
  }

  obtenerDatosToken(accessToken: string | null): any {
    if (!accessToken) return null;
    return JSON.parse(atob(accessToken.split('.')[1]));
  }



  /* private _usuario!: Usuario |null;
  private _token!: string | null;

  constructor(private http: HttpClient) { }

  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    }
    return new Usuario();
  }

  public get token(): string | null {
    if (this._token != null) {
      return this._token;
    }
    return null;
  }

  login(usuario: Usuario): Observable<any> {
    return this.http.post<any>(`${environment.apiLogin}`, usuario);
  }

  guardarUsuario(accessToken: string): void {
    let payload = this.obtenerDatosToken(accessToken);
    this._usuario = new Usuario();
    this._usuario.id = payload.id;
    this._usuario.username = payload.username;
    this._usuario.roles = payload.authorities;
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
  } */
}
