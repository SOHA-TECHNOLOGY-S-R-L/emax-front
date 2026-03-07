import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { MultimediaProducto } from '../models/multimedia-producto';

@Injectable({
  providedIn: 'root'
})
export class MultimediaProductoService {
  private httpClient = inject(HttpClient);

  constructor() { }

  multimediasProductoByProductoId(productoId: number): Observable<MultimediaProducto[]> {
    return this.httpClient.get<MultimediaProducto[]>(`${environment.apiUrl}/multimedia/producto/${productoId}`)
    .pipe(
      map(res => res || []),
      catchError(() => of([])) // Si el servidor falla, devuelve un array vacío en lugar de un error
    );;
  }

    multimediasProductoByEsPrincipal(esPrincipal: boolean): Observable<MultimediaProducto[]> {
    return this.httpClient.get<MultimediaProducto[]>(`${environment.apiUrl}/multimedia/producto/esprincipal/${esPrincipal}`)
    .pipe(
      map(res => res || []),
      catchError(() => of([])) // Si el servidor falla, devuelve un array vacío en lugar de un error
    );;
  }

      multimediasServiciosEsPrincipal(): Observable<MultimediaProducto[]> {
    return this.httpClient.get<MultimediaProducto[]>(`${environment.apiUrl}/multimedia/servicios`)
    .pipe(
      map(res => res || []),
      catchError(() => of([])) // Si el servidor falla, devuelve un array vacío en lugar de un error
    );;
  }

}
