import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Cliente } from '../models/cliente';

import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { PageableResponse } from '../models/pageable-response';
import { TipoDocumento } from '../models/tipo-documento';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';
import { TipoPersona } from '../models/tipo-persona';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  //private urlEndPoint: string = 'http://localhost:8080/api/clientes';

  //private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})

  constructor(private http: HttpClient,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService) { }

  /*   private agregarAuthorizationHeader(){
      let token = this.authService.token;
      if(token != null){
        return this.httpHeaders.append('Authorization', 'Bearer ' + token)
      }
      return this.httpHeaders
    } */

  getTipoDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(environment.apiUrl + '/clientes/documentos'
      /*,{headers: this.agregarAuthorizationHeader()}*/
    );
  }

  getTipoPersona(): Observable<TipoPersona[]> {
    return this.http.get<TipoPersona[]>(environment.apiUrl + '/clientes/tipo-personas'
      /*,{headers: this.agregarAuthorizationHeader()}*/
    );
  }

  getNumeroDocumento(numero: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${environment.apiUrl}/clientes/numero-documento/${numero}`)
      .pipe(
        map((response: any) => response.cliente as Cliente),
        catchError(e => {
          if (e.status == 404) {
            console.log("e1", e);
            return EMPTY;
          }
          if (e.error.mensaje) {
            console.log("e2", e);
            this.alertService.error(e.error.mensaje, e.error.err);
          }
          console.log("e3", e);

          return throwError(e);
        }))
  }

  getCelular(celular: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${environment.apiUrl}/clientes/celular/${celular}`)
      .pipe(
        map((response: any) => response.cliente as Cliente),
        catchError(e => {
          console.error(e);
          /*           if (e.status == 404) {
                      return EMPTY;
                    }
                    if (e.error.mensaje) {
                      this.alertService.error(e.error.mensaje, e.error.err);
                    } */
          return EMPTY;
        }));;
  }

  getClienteByUsuarioId(usuarioId: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${environment.apiUrl}/clientes/usuario/${usuarioId}`
      /*,{headers: this.agregarAuthorizationHeader()}*/
    );
  }

  getAllClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${environment.apiUrl}/clientes`
    );
  }

  getAllClientesPageable(params: any): Observable<PageableResponse> {

    return this.http.get<any>(`${environment.apiUrl}/clientes/pageable`, {
      /* headers: this.agregarAuthorizationHeader(),*/
      params: params,
    });

  }

  /*   getClientes(page: number): Observable<any> {
      return this.http.get(`${environment.apiUrl}/clientes` + '/page/' + page).pipe(
        tap((response: any) => {
          console.log('ClienteService: tap 1');
          (response.content as Cliente[]).forEach(cliente => console.log(cliente.nomApellRz));
        }),
        map((response: any) => {
          (response.content as Cliente[]).map(cliente => {
            cliente.nomApellRz = cliente.nomApellRz.toUpperCase();
            return cliente;
          });
          return response;
        }),
        tap(response => {
          console.log('ClienteService: tap 2');
          (response.content as Cliente[]).forEach(cliente => console.log(cliente.nomApellRz));
        }));
    } */

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post(`${environment.apiUrl}/clientes`, cliente
    )
      .pipe(
        map((response: any) => response.cliente as Cliente),
        catchError(e => {
          /*          if (e.status == 400) {
                     return throwError(e);
                   } */
          if (e.error.mensaje) {
            this.alertService.error(e.error.mensaje, e.error.err);
          }
          return throwError(e);
        }));
  }

  getCliente(id: any): Observable<Cliente> {
    return this.http.get<Cliente>(`${environment.apiUrl}/clientes/${id}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      }));
  }

  update(cliente: Cliente): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/clientes/${cliente.id}`, cliente
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status == 400) {
          return throwError(e);
        }
        if (e.error.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${environment.apiUrl}/clientes/${id}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.error.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  subirFoto(archivo: File, id: any): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    const req = new HttpRequest('POST', `${environment.apiUrl}/clientes/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req);
  }

  filtrarClientes(term: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${environment.apiUrl}/clientes/filtrar-cliente/${term}`
    );
  }

  colocarCodigoRenovacionClave(numeroDocumento: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/cliente/${numeroDocumento}/codigo-renovacion`, null)
      .pipe(
        map((response: any) => response.cliente as Cliente),
        catchError(e => {
          if (e.status == 400) {
            return throwError(e);
          }
          if (e.error.mensaje) {
            console.error(e.error.mensaje);
          }
          return throwError(e);
        }));
  }
}
