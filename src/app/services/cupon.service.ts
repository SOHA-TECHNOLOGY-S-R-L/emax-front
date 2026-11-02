import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Cupon } from '../models/cupon';
import { PageableResponse } from '../interfaces/pageable-response';
import { TipoDescuentoCupon } from '../models/tipo-descuento-cupon';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';
import { UsoCupon } from '../models/uso-cupon';
import { PageableParams } from '../interfaces/pageable-params';

@Injectable({
  providedIn: 'root',
})
export class CuponService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
  ) { }



  getAllCuponPageable(params: PageableParams): Observable<PageableResponse<Cupon>> {
    const backendParams = {
      ...params,
      active: params.active ? params.active.toUpperCase() : 'ID',
      direction: params.direction ? params.direction.toUpperCase() : 'DESC'
    };

    return this.http.get<PageableResponse<Cupon>>(`${environment.apiUrl}/cupon/pageable`, {
      params: backendParams,
    });
  }

  getAllCuponesActivos(): Observable<Cupon[]> {
    return this.http.get<Cupon[]>(`${environment.apiUrl}/cupon/actives`);
  }


  getCuponesParaClienteActivos(): Observable<Cupon[]> {
    return this.http.get<Cupon[]>(`${environment.apiUrl}/cupon/para-cliente`);
  }

  /*   getAllProducto(): Observable<Producto[]> {
      return this.http.get<Producto[]>(`${environment.apiUrl}/productos`);
    } */

  /*   getUsosCupon(): Observable<UsoCupon[]> {
      return this.http.get<UsoCupon[]>(`${environment.apiUrl}/cupon/usos`);
    }
   */

  getTiposDescuentoCupon(): Observable<TipoDescuentoCupon[]> {
    return this.http.get<TipoDescuentoCupon[]>(`${environment.apiUrl}/cupon/tipos-descuento`);
  }


  createCupon(cupon: Cupon): Observable<Cupon> {
    return this.http.post(`${environment.apiUrl}/cupon/registrar`, cupon,)
      .pipe(
        map((response: any) => response.cupon as Cupon),
        catchError((e) => {
          if (e.error?.mensaje) {
            this.alertService.error(e.error.err, e.error.mensaje);
          }
          return throwError(e);
        }),
      );
  }

  updateCupon(cupon: Cupon): Observable<Cupon> {
    return this.http
      .put<any>(`${environment.apiUrl}/cupon/update/${cupon.codigo}`, cupon)
      .pipe(
        catchError((e) => {
          if (e.error?.mensaje) {
            this.alertService.error(e.error.err, e.error.mensaje);
          }
          return throwError(e);
        }),
      );
  }



  getCuponByCodigo(codigo: string): Observable<Cupon> {
    return this.http
      .get<Cupon>(
        `${environment.apiUrl}/cupon/${codigo}`,
        /*, {headers: this.agregarAuthorizationHeader()}*/
      )
      .pipe(
        catchError((e) => {
          if (e.status != 401 && e.error?.mensaje) {
            // this.router.navigate(['/productos']);
            console.error(e.error.mensaje);
          }

          return throwError(e);
        }),
      );
  }

}
