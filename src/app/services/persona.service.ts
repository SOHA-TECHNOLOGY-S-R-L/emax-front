import { TipoDocumentoIdentidadEnum } from './../enums/tipo-documento-identidad.enum';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Persona } from '../models/persona';

import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { PageableResponse } from '../interfaces/pageable-response';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';
import { PageableParams } from '../interfaces/pageable-params';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  //private urlEndPoint: string = 'http://localhost:8080/api/personas';

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


  /*   getTipoPersona(): Observable<TipoPersona[]> {
      return this.http.get<TipoPersona[]>(environment.apiUrl + '/personas/tipo-personas'
      );
    } */

  getClienteByNumeroDocumento(numero: string): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/clientes/numero-documento/${numero}`)
      .pipe(
        map((response: any) => response.persona as Persona),
        catchError(e => {
          if (e.status == 404) {
            return EMPTY;
          }
          if (e.error.mensaje) {
            this.alertService.error(e.error.mensaje, e.error.err);
          }

          return throwError(e);
        }))
  }

  getNumeroDocumento(numero: string): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/persona/numero-documento/${numero}`)
      .pipe(
        map((response: any) => response.persona as Persona),
        catchError(e => {
          if (e.status == 404) {
            return EMPTY;
          }
          if (e.error?.mensaje) {
            this.alertService.error(e.error.mensaje, e.error.err);
          }

          return throwError(e);
        }))
  }

  clienteByTipoDocumentoIdentidadAndNumeroDocumento(
    tipoDocumentoIdentidad: TipoDocumentoIdentidadEnum, numeroDocumento: string): Observable<Persona> {

    return this.http.get<Persona>(`${environment.apiUrl}/cliente/tipo-documento-identidad/${tipoDocumentoIdentidad}/numero-documento/${numeroDocumento}`)
      .pipe(
        map((response: any) => response.data as Persona)
        /*Si el backend responde con 400, 401, 404, 503 u otro estado de error, Angular emitirá un HttpErrorResponse y lo recibirá el componente en el callback error*/
        /*         catchError(e => {
                  if (e.status == 404) {
                    return EMPTY;
                  }
                  if (e.error?.mensaje) {
                    this.alertService.error(e.error.mensaje, e.error.err);
                  }

                  return throwError(e);
                }) */
      )
  }

  personaByTipoDocumentoIdentidadAndNumeroDocumento(
    tipoDocumentoIdentidad: number, numeroDocumento: string): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/persona/tipo-documento-identidad/${tipoDocumentoIdentidad}/numero-documento/${numeroDocumento}`)
      .pipe(
        map((response: any) => response.data as Persona)
      )
  }

  getCelular(celular: string): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/personas/celular/${celular}`)
      .pipe(
        map((response: any) => response.persona as Persona),
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

  getPersonaByUsuarioId(usuarioId: number): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/personas/usuario/${usuarioId}`
    );
  }

  personasByIds(personaIds: string): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${environment.apiUrl}/personas/ids/${personaIds}`
    ).pipe(
      catchError(() => of([])
      ))
  }

  getAllPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${environment.apiUrl}/personas`
    );
  }

  getAllClientesPageable(params: PageableParams): Observable<PageableResponse<Persona>> {
    const backendParams = {
      ...params,
      active: params.active ? params.active.toUpperCase() : 'ID',
      direction: params.direction ? params.direction.toUpperCase() : 'DESC'
    };

    return this.http.get<PageableResponse<Persona>>(`${environment.apiUrl}/clientes/pageable`, {
      /* headers: this.agregarAuthorizationHeader(),*/
      params: backendParams,
    });

  }


  createCliente(persona: Persona): Observable<Persona> {
    return this.http.post(`${environment.apiUrl}/cliente`, persona
    )
      .pipe(
        map((response: any) => response.persona as Persona),
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

  createTrabajador(persona: Persona): Observable<Persona> {
    return this.http.post(`${environment.apiUrl}/trabajador`, persona
    )
      .pipe(
        map((response: any) => response.persona as Persona),
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

  getPersona(personaId: any): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/persona/${personaId}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/personas']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      }));
  }


  getPersonaByIdAndTipoId(personaId: number, tipoPersonaId: number): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/personas/${personaId}/tipo-persona/${tipoPersonaId}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status != 401 && e.error.mensaje) {
          //this.router.navigate(['/personas']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      }));
  }

  update(personaId: number, persona: Persona): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/persona/${personaId}`, persona
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status == 400) {
          return throwError(e);
        }
        if (e.error?.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  delete(id: number): Observable<Persona> {
    return this.http.delete<Persona>(`${environment.apiUrl}/personas/${id}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.error?.mensaje) {
          console.error(e.error?.mensaje);
        }
        return throwError(e);
      }));
  }

  subirFoto(archivo: File, id: any): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    const req = new HttpRequest('POST', `${environment.apiUrl}/personas/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req);
  }

  filtrarPersonas(term: string): Observable<Persona[]> {
    const filtro = term?.trim();
    if (!filtro || filtro.length < 2) {
      return of([]);
    }
    return this.http.get<Persona[]>(`${environment.apiUrl}/personas/filtrar-persona/${encodeURIComponent(filtro)}`
    );
  }

  colocarCodigoRenovacionClave(numeroDocumento: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/persona/${numeroDocumento}/codigo-renovacion`, null)
      .pipe(
        map((response: any) => response.persona as Persona),
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


  getAllEmpleadosPageable(params: PageableParams): Observable<PageableResponse<Persona>> {
    const backendParams = {
      ...params,
      active: params.active ? params.active.toUpperCase() : 'ID',
      direction: params.direction ? params.direction.toUpperCase() : 'DESC'
    };

    return this.http.get<PageableResponse<Persona>>(`${environment.apiUrl}/trabajadores/pageable`, {
      params: backendParams,
    });
  }
}
