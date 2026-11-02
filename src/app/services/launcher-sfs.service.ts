import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { StatusSfs } from '../interfaces/status-sfs';
import { ComprobanteSunat } from '../interfaces/comprobante-sunat';
import { ResponseController } from '../interfaces/response-controller';
import { ComprobantePdfRequest } from '../interfaces/comprobante-pdf-request';

export type FacturadorState =
  | 'launcher'
  | 'starting-launcher'
  | 'ready'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'terminating';

@Injectable({
  providedIn: 'root'
})
export class LauncherSfsService {



  private readonly http = inject(HttpClient);
  private readonly _state = signal<FacturadorState>('launcher');
  readonly state = this._state.asReadonly();

  setState(state: FacturadorState): void {
    this._state.set(state);
  }


  checkStatus(): Observable<StatusSfs> {
    return this.http.get<StatusSfs>(`${environment.apiSfs}/sfs/status`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error.error);
      })
    );
  }

  startSfs(jarPath: string): Observable<StatusSfs> {
    return this.http.post<StatusSfs>(`${environment.apiSfs}/sfs/start`, { jarPath }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error.error);
      })
    );
  }

  stopSfs(): Observable<StatusSfs> {
    return this.http.post<StatusSfs>(`${environment.apiSfs}/sfs/stop`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error.error);
      })
    );
  }

  shutdown(): Observable<StatusSfs> {
    return this.http.post<StatusSfs>(`${environment.apiSfs}/sfs/shutdown`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error.error);
      })
    );
  }


    generarComprobante(comprobanteSunat: ComprobanteSunat): Observable<ResponseController<string>> {

    return this.http.post<ResponseController<string>>(`${environment.apiSfs}/comprobantes/generar-archivos`, comprobanteSunat).pipe(

    );
  }


  previewComprobanteToPersonaInPDF(request: ComprobantePdfRequest): Observable<HttpResponse<Blob>> {
    return this.http.post<Blob>(`${environment.apiSfs}/comprobantes/preview-pdf`, request,
      { observe: 'response', responseType: 'blob' as 'json' })
  }

}
