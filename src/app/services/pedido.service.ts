import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageableResponse } from '../interfaces/pageable-response';
import { Pedido } from '../models/pedido';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar.service';
//import { TipoPedido } from '../models/tipo-pedido';
import { ComprobanteSunat } from '../interfaces/comprobante-sunat';
import { PageableParams } from '../interfaces/pageable-params';
import { ItemRequestResponse, PedidoRequestResponse } from '../interfaces/pedido-request-response';
import { ResponseController } from '../interfaces/response-controller';
import { ItemPedido } from '../models/item-pedido';
import { AlertService } from './alert.service';
import { EstadoPedidoEnum, getEstadoPedidoEnumById } from '../enums/estado-pedido.enum';
import { constuirItemModel, constuirPedidoModel } from '../utils/build-pedido';


@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private _pedido!: Pedido

  //private urlEndPoint: string = 'http://localhost:8080/api/pedidos';

  //private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})

  constructor(private http: HttpClient,
    private authService: AuthService,
    private snackbar: SnackbarService,
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

  getAllPedidosPageable(params: PageableParams, tipoPedidoId: number): Observable<PageableResponse<Pedido>> {
    const backendParams = {
      ...params,
      active: params.active ? params.active.toUpperCase() : 'ID',
      direction: params.direction ? params.direction.toUpperCase() : 'DESC'
    };

    return this.http.get<PageableResponse<PedidoRequestResponse>>(`${environment.apiUrl}/pedidos/${tipoPedidoId}/pageable`,
      { params: backendParams })
      .pipe(
        map(res => ({
          ...res,
          content: res.content.map(constuirPedidoModel)
        })
        ));
  }

  getAnularPedido(pedidoId: number): Observable<ResponseController<EstadoPedidoEnum | null>> {
    return this.http.get<ResponseController<number>>(`${environment.apiUrl}/pedidos/${pedidoId}/anular-pedido`)
      .pipe(
        map(res => ({
          ...res,
          data: getEstadoPedidoEnumById(res.data)
        })
        )
      );
  }


  getPedidosPersonaPageable(params: PageableParams, personaId: number): Observable<PageableResponse<Pedido>> {
    const backendParams = {
      ...params,
      active: params.active ? params.active.toUpperCase() : 'ID',
      direction: params.direction ? params.direction.toUpperCase() : 'DESC'
    };
    return this.http.get<PageableResponse<PedidoRequestResponse>>
      (`${environment.apiUrl}/pedidos/persona/${personaId}/pageable`, { params: backendParams })
      .pipe(
        map(res => ({
          ...res,
          content: res.content.map(constuirPedidoModel)
        })
        )
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


  create(pedido: Pedido): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pedidos`, pedido
    ).pipe(
      map((response: any) => response.pedido as Pedido),
      catchError(e => {
        /*          if (e.status == 400) {
                  return throwError(e);
                } */
        if (e.error?.mensaje) {
          this.alertService.error(e.error.mensaje, e.error.err);
          //console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  createMovimiento(pedido: Pedido): Observable<Pedido> {
    return this.http.post<ResponseController<Pedido>>
      (`${environment.apiUrl}/pedido/movimiento`, pedido)
      .pipe(
        map((response: any) => response.data as Pedido));
  }

  createComprobanteVenta(pedido: Pedido): Observable<ComprobanteSunat> {
    return this.http.post<ComprobanteSunat>(`${environment.apiUrl}/pedido/comprobante-venta`, pedido
      /*, {headers: this.agregarAuthorizationHeader()}*/
    )
      .pipe(
        map((response: any) => response.comprobante as ComprobanteSunat),
        catchError(e => {
          /*           if (e.status == 400) {
                      return throwError(e);
                    } */
          if (e.error?.mensaje) {
            this.alertService.error(e.error.mensaje, "Comprobante SUNAT");
          }
          return throwError(e);
        }));
  }


  createComprobanteNotaCredito(pedido: Pedido): Observable<ComprobanteSunat> {
    return this.http.post<ComprobanteSunat>(`${environment.apiUrl}/pedido/comprobante-notacredito`, pedido
      /*, {headers: this.agregarAuthorizationHeader()}*/
    )
      .pipe(
        map((response: any) => response.comprobante as ComprobanteSunat),
        catchError(e => {
          /*           if (e.status == 400) {
                      return throwError(e);
                    } */
          if (e.error?.mensaje) {
            this.alertService.error(e.error.mensaje, e.error.err);
          }
          return throwError(e);
        }));
  }


  createPedidoVenta(pedido: PedidoRequestResponse): Observable<ResponseController<Pedido>> {
    return this.http.post<ResponseController<PedidoRequestResponse>>
      (`${environment.apiUrl}/pedido-venta`, pedido)
      .pipe(
        map(response => ({
          ...response,
          data: constuirPedidoModel(response.data)
        })),
        /*         catchError(e => {
                  if (e.error?.mensaje) {
                    this.alertService.error(e.error.mensaje, e.error.err);
                  }
                  return throwError(e);
                }) */
      );
  }

  createPedidoCompra(pedido: PedidoRequestResponse): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pedido-compra`, pedido
    ).pipe(
      map((response: any) => response.pedido as Pedido),
      catchError(e => {
        /*          if (e.status == 400) {
                  return throwError(e);
                } */
        if (e.error?.mensaje) {
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

  downloadOrderToPersonaInPDF(pedido: PedidoRequestResponse): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(`${environment.apiUrl}/pedidos/download-pdf`, pedido,
      { observe: 'response', responseType: 'blob' as 'json' })
  }

  previewMovToPersonaInPDF(pedido: Pedido): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(`${environment.apiUrl}/pedidos/preview-mov-pdf`, pedido,
      { observe: 'response', responseType: 'blob' as 'json' })
  }

  aplicarDescuento(pedido: PedidoRequestResponse, codigoCupon: string): Observable<ResponseController<ItemPedido[]>> {
    debugger;
    return this.http.post<ResponseController<ItemRequestResponse[]>>(
      `${environment.apiUrl}/pedidos/aplicar-cupon/${codigoCupon}`, pedido)
      .pipe(
        map(response => ({
          ...response,
          data: response.data.map(item => constuirItemModel(item))
        }))
      );
  }

}
