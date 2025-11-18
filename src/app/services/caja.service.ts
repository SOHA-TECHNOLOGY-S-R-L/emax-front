import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { Caja } from '../models/caja';
import { CajaUsuario } from '../models/caja-usuario';
import { Usuario } from '../models/usuario';
import { forEach, tap } from 'lodash-es';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  // private urlEndPoint: string = 'http://localhost:8080/api/cajas';

  //private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  /*   private agregarAuthorizationHeader(){
      let token = this.authService.token;
      if(token != null){
        return this.httpHeaders.append('Authorization', 'Bearer ' + token)
      }
      return this.httpHeaders
    } */

  getAllCaja(): Observable<Caja[]> {
    return this.http.get<Caja[]>(`${environment.apiUrl}/cajas`
      /*  , {headers: this.agregarAuthorizationHeader()} */
    );
  }

  getCajasPorAsignar(): Observable<Caja[]> {
    return this.http.get<Caja[]>(`${environment.apiUrl}/cajas-por-asignar`);
  }

  getCajaUsuarioByUserName(username: string): Observable<CajaUsuario> {
    return this.http.get<CajaUsuario>(`${environment.apiUrl}/cajas/usuarios/${username}`
    )
      .pipe(
        map<CajaUsuario, CajaUsuario>(resp => {
          if (resp != null && resp.movimientos.length > 0) {
            resp.movimientos.splice(0, resp.movimientos.length)
          }
          return resp
        }
        )
      );
  }

    getCajaUsuarioInactivoByCajaId(cajaId: number): Observable<CajaUsuario> {
    return this.http.get<CajaUsuario>(`${environment.apiUrl}/cajas/${cajaId}/usuarios`
    )
      .pipe(
        map<CajaUsuario, CajaUsuario>(resp => {
          if (resp != null && resp.movimientos.length > 0) {
            resp.movimientos.splice(0, resp.movimientos.length)
          }
          return resp
        }
        )
      );
  }

  getCajaUsuarioByCajaIdAndUserId(cajaId: number, userId: number): Observable<CajaUsuario> {
    return this.http.get<CajaUsuario>(`${environment.apiUrl}/cajas/${cajaId}/usuarios/${userId}`
      /*, {headers: this.agregarAuthorizationHeader()} */
    );

  }

  getCajaUsuarioByCajaIdAndUsername(cajaId: number, username: string): Observable<CajaUsuario> {
    return this.http.get<CajaUsuario>(`${environment.apiUrl}/cajas/${cajaId}/usuarios/${username}`
      /*, {headers: this.agregarAuthorizationHeader()} */
    );

  }

  create(cajaUsuario: CajaUsuario): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/cajas/usuarios`, cajaUsuario
      /*, {headers: this.agregarAuthorizationHeader()}*/
    );
  }



  update(cajaUsuario: CajaUsuario): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/cajas/usuarios/${cajaUsuario.id}`, cajaUsuario
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status == 400) {
          return throwError(e);
        }
        if (e.error?.mensaje) {
          console.error(e.error?.mensaje);
        }
        return throwError(e);
      }));
  }

  ceateReporteCierreCaja(filtros: any): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(`${environment.apiUrl}/cajas/reporte/cierre-caja`, filtros,
      { observe: 'response', responseType: 'blob' as 'json' })
  }

  /*   getPedido(id: number): Observable<Pedido> {
      return this.http.get<Pedido>(`${this.urlEndPoint}/${id}`, {headers: this.agregarAuthorizationHeader()} );
    }

    delete(id: number): Observable<void> {
      return this.http.delete<void>(`${this.urlEndPoint}/${id}`, {headers: this.agregarAuthorizationHeader()});
    }

    filtrarProductos(term: string): Observable<Producto[]> {
      return this.http.get<Producto[]>(`${this.urlEndPoint}/filtrar-productos/${term}`, {headers: this.agregarAuthorizationHeader()});
    }*/




}
