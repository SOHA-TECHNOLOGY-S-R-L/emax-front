import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Caja } from '../models/caja';
import { AuthService } from './auth.service';
import { ComprobantesCorrelativos } from '../interfaces/comprobantes-correlativos';

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  private readonly _caja = signal<Caja | null>(null);

  readonly cajaSeleccionada = this._caja.asReadonly();


  setCaja(caja: Caja) {
    this._caja.set(caja);
  }

  limpiarCaja() {
    this._caja.set(null);
  }

  get caja() {
    return { ... this._caja }
  }

  constructor(private http: HttpClient,
    private authService: AuthService) { }



  getAllCaja(): Observable<Caja[]> {
    return this.http.get<Caja[]>(`${environment.apiUrl}/cajas`
    );
  }

  getCajaById(cajaId: number): Observable<Caja> {
    return this.http.get<Caja>(`${environment.apiUrl}/caja/${cajaId}`
    );
  }

  getCajasPorAsignar(): Observable<Caja[]> {
    return this.http.get<Caja[]>(`${environment.apiUrl}/cajas-por-asignar`);
  }

  crearCaja(caja: Caja): Observable<Caja> {
    return this.http.post<Caja>(`${environment.apiUrl}/caja`, caja).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error.error);
      })
    );


  }

  actualizarComprobantesCorrelativos(correlativos: ComprobantesCorrelativos, cajaId: number) {
    return this.http.put<Caja>(`${environment.apiUrl}/caja-correlativos/${cajaId}`, correlativos);

  }

  actualizarCaja(caja: Caja, cajaId:number) {
    return this.http.put<Caja>(`${environment.apiUrl}/caja/${cajaId}`, caja);

  }





}
