import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Pedido } from '../models/pedido';
import { Producto } from '../models/producto';
import { AuthService } from './auth.service';
import { EstadoPedido } from '../models/estado-pedido';
import { PageableResponse } from '../models/pageable-response';
import { environment } from '../../environments/environment';
import { TipoPedido } from '../models/tipo-pedido';
import { AlertService } from './alert.service';
import * as fileSaver from 'file-saver-es';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private _pedido!: Pedido

  //private urlEndPoint: string = 'http://localhost:8080/api/pedidos';

  //private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})

  constructor(private http: HttpClient,
    private authService: AuthService,
    private alertService: AlertService) { }

  /*   private agregarAuthorizationHeader(){
      let token = this.authService.token;
      if(token != null){
        return this.httpHeaders.append('Authorization', 'Bearer ' + token)
      }
      return this.httpHeaders
    } */

  setPedido(pedido: Pedido) {
    this._pedido = pedido
  }

  get pedido() {
    return { ...this._pedido }
  }

  public filenameFromHeader(headers: HttpHeaders): string {
    const disposition = headers.get('Content-Disposition');
    if (!disposition || disposition.indexOf('filename=') < 0) {
      return '';
    }
    return disposition.substring(disposition.indexOf('filename=') + 9, disposition.length);
  }

  getAllPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${environment.apiUrl}/pedidos`
      /* , {headers: this.agregarAuthorizationHeader()} */
    );
  }

  getAllPedidosPageable(params: any, tipoPedidoId: number): Observable<PageableResponse> {
    return this.http.get<any>(`${environment.apiUrl}/pedidos/${tipoPedidoId}/pageable`, {
      /*headers: this.agregarAuthorizationHeader(),*/
      params: params,
    });
  }

    getPedidosClientePageable(params: any, clienteId: number): Observable<PageableResponse> {
    return this.http.get<any>(`${environment.apiUrl}/pedidos/cliente/${clienteId}/pageable`, {
      /*headers: this.agregarAuthorizationHeader(),*/
      params: params,
    });
  }



  getAllEstadoPedido(): Observable<EstadoPedido[]> {
    return this.http.get<EstadoPedido[]>(`${environment.apiUrl}/pedidos/estado-pedido`
      /*, {headers: this.agregarAuthorizationHeader()} */
    );
  }

  getAllTipoPedido(): Observable<TipoPedido[]> {
    return this.http.get<TipoPedido[]>(`${environment.apiUrl}/pedidos/tipo-pedido`
    );
  }

  getTipoPedido(tipoPedidoId: number): Observable<TipoPedido> {
    return this.http.get<TipoPedido>(`${environment.apiUrl}/pedidos/tipo-pedido/${tipoPedidoId}`
    );
  }

  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${environment.apiUrl}/pedidos/${id}`
      /*, {headers: this.agregarAuthorizationHeader()} */
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/pedidos/${id}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    );
  }

  /*   filtrarProductos(term: string): Observable<Producto[]> {
      return this.http.get<Producto[]>(`${environment.apiUrl}/pedidos/filtrar-productos/${term}`
      );
    } */

  create(pedido: Pedido): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pedidos`, pedido
    ).pipe(
      map((response: any) => response.pedido as Pedido),
      catchError(e => {
        /*          if (e.status == 400) {
                  return throwError(e);
                } */
        if (e.error.mensaje) {
          this.alertService.error(e.error.mensaje, e.error.err);
          //console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  createPedidoTienda(pedido: Pedido): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pedidos`, pedido
    ).pipe(
      map((response: any) => response.pedido as Pedido),
      catchError(e => {
        /*          if (e.status == 400) {
                  return throwError(e);
                } */
        if (e.error.mensaje) {
          this.alertService.error(e.error.mensaje, e.error.err);
          //console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  ceateReportePorTipoPedido(filtros: any): Observable<HttpResponse<Blob>> {

    return this.http.post<Blob>(`${environment.apiUrl}/pedidos/reporte/tipo-pedido`, filtros,
      { observe: 'response', responseType: 'blob' as 'json' })
  }

  downloadOrderToClienteInPDF(pedido: Pedido): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(`${environment.apiUrl}/pedidos/download-pdf`, pedido,
      { observe: 'response', responseType: 'blob' as 'json' })
  }

  /*   ceateReporteCompras(filtros: any): Observable<HttpResponse<Blob>>{

      return this.http.post<Blob>(`${environment.apiUrl}/pedidos/reporte/compras`, filtros,
         {observe: 'response', responseType:'blob' as 'json'})
    } */

  update(pedido: Pedido): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/pedidos/${pedido.id}`, pedido
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
}
