import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { Movimiento } from '../models/movimiento';
import { TipoPago } from '../models/tipo-pago';
import { MovimientoCaja } from '../models/movimiento-caja';
import { environment } from '../../environments/environment';
import { TipoMovimientoPedido } from '../models/tipo-movimiento-pedido';
import { TipoMovimientoCaja } from '../models/tipo-movimiento-caja';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {

  // private urlEndPoint: string = 'http://localhost:8080/api/movimientos';

  //private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})

  constructor(private http: HttpClient,
    private alertService: AlertService,
    private authService: AuthService) { }

  /*   private agregarAuthorizationHeader(){
      let token = this.authService.token;
      if(token != null){
        return this.httpHeaders.append('Authorization', 'Bearer ' + token)
      }
      return this.httpHeaders
    } */


  getAllTipoPagos(): Observable<TipoPago[]> {
    return this.http.get<TipoPago[]>(`${environment.apiUrl}/movimientos/tipoPagos`
      /*, {headers: this.agregarAuthorizationHeader()} */
    );
  }

  getAllTipoMovimientosPedido(): Observable<TipoMovimientoPedido[]> {
    return this.http.get<TipoMovimientoPedido[]>(`${environment.apiUrl}/movimientos/tipoMovimientosPedido`
      /*  , {headers: this.agregarAuthorizationHeader()} */
    );
  }

  getAllTipoMovimientosCaja(): Observable<TipoMovimientoCaja[]> {
    return this.http.get<TipoMovimientoCaja[]>(`${environment.apiUrl}/movimientos/tipoMovimientosCaja`
      /*  , {headers: this.agregarAuthorizationHeader()} */
    );
  }

  createMovimiento(movimiento: Movimiento): Observable<Movimiento> {
    return this.http.post(`${environment.apiUrl}/movimientos`, movimiento
      /*, {headers: this.agregarAuthorizationHeader()}*/
    )
      .pipe(
        map((response: any) => response.movimiento as Movimiento),
        catchError(e => {
/*           if (e.status == 400) {
            return throwError(e);
          } */
          if (e.error.mensaje) {
            this.alertService.error(e.error.mensaje, e.error.err);
          }
          return throwError(e);
        }));
  }

  createMovimientoCaja(movimientoCaja: MovimientoCaja): Observable<MovimientoCaja> {
    return this.http.post(`${environment.apiUrl}/movimientos/caja`, movimientoCaja
      /*, {headers: this.agregarAuthorizationHeader()}*/
    )
      .pipe(
        map((response: any) => response.movimientoCaja as MovimientoCaja),
        catchError(e => {
/*           if (e.status == 400) {
            return throwError(e);
          } */
          if (e.error.mensaje) {
            this.alertService.error(e.error.mensaje, e.error.err);
          }

          return throwError(e);
        }));
  }

  ceateReporteMovEnCaja(filtros: any): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(`${environment.apiUrl}/movimientos/reporte/mov-en-caja`, filtros,
      { observe: 'response', responseType: 'blob' as 'json' })
  }






}
