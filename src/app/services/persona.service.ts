import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Persona } from '../models/persona';

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

  getTipoDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(environment.apiUrl + '/personas/documentos'
      /*,{headers: this.agregarAuthorizationHeader()}*/
    );
  }

  getTipoPersona(): Observable<TipoPersona[]> {
    return this.http.get<TipoPersona[]>(environment.apiUrl + '/personas/tipo-personas'
      /*,{headers: this.agregarAuthorizationHeader()}*/
    );
  }

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
    return this.http.get<Persona>(`${environment.apiUrl}/personas/numero-documento/${numero}`)
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
      /*,{headers: this.agregarAuthorizationHeader()}*/
    );
  }

  getAllPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${environment.apiUrl}/personas`
    );
  }

  getAllClientesPageable(params: any): Observable<PageableResponse> {

    return this.http.get<any>(`${environment.apiUrl}/clientes/pageable`, {
      /* headers: this.agregarAuthorizationHeader(),*/
      params: params,
    });

  }


  create(persona: Persona): Observable<Persona> {
    return this.http.post(`${environment.apiUrl}/personas`, persona
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

  getPersona(id: any): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/personas/${id}`
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


  getPersonaByIdAndTipoId(id: number, tipoPersonaId: number): Observable<Persona> {
    return this.http.get<Persona>(`${environment.apiUrl}/personas/${id}/tipo-persona/${tipoPersonaId}`
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

  update(persona: Persona): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/personas/${persona.id}`, persona
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
    return this.http.get<Persona[]>(`${environment.apiUrl}/personas/filtrar-persona/${term}`
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


  getAllEmpleadosPageable(params: any): Observable<PageableResponse> {
    return this.http.get<any>(`${environment.apiUrl}/empleados/pageable`, {
      params: params,
    });
  }
}
