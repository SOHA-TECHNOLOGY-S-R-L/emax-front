import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { MargenProducto } from '../models/margen-producto';
import { Material } from '../models/material';
import { PageableResponse } from '../models/pageable-response';
import { Producto } from '../models/producto';
import { Uso } from '../models/uso';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';
import { Color } from '../models/color';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService) { }

  /*   private agregarAuthorizationHeader(){
        let token = this.authService.token;
        if(token != null){
          return this.httpHeaders.append('Authorization', 'Bearer ' + token)
        }
        return this.httpHeaders
      } */


  /*   getCategoriasProducto(): Observable<Categoria[]> {
      return this.http.get<Categoria[]>(environment.apiUrl + '/producto/categorias');
    }

    getCategoriasActivas(): Observable<Categoria[]> {
      return this.http.get<Categoria[]>(environment.apiUrl + '/categorias/active');
    }
  */
  getColoresProducto(): Observable<Color[]> {
    return this.http.get<Color[]>(`${environment.apiUrl}/producto/colores`
    );
  }

  /*   getEmpaquesProducto(): Observable<Empaque[]> {
      return this.http.get<Empaque[]>(`${environment.apiUrl}/producto/empaques`
      );
    } */

  getMaterialesProducto(): Observable<Material[]> {
    return this.http.get<Material[]>(`${environment.apiUrl}/producto/materiales`
    );
  }

  /*   getOrigenesProducto(): Observable<Origen[]> {
      return this.http.get<Origen[]>(`${environment.apiUrl}/producto/origenes`
      );
    } */

  getUsosInternoProducto(): Observable<Uso[]> {
    return this.http.get<Uso[]>(`${environment.apiUrl}/producto/usos`
    );
  }

  getAllProductosPageable(params: any): Observable<PageableResponse> {
    return this.http.get<any>(`${environment.apiUrl}/producto/pageable`, {
      params: params,
    });
  }

  getAllProducto(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.apiUrl}/productos`);
  }

  getIdsProductosActivos(): Observable<number[]> {
    return this.http.get<number[]>(`${environment.apiUrl}/productos/ids`);
  }



  filtrarProductos(term: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.apiUrl}/producto/filtrar-productos/${term}`
    );
  }



  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post(`${environment.apiUrl}/producto`, producto
      /*,{headers: this.agregarAuthorizationHeader()}*/
    )
      .pipe(
        map((response: any) => response.prodcuto as Producto),
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


  createProductoImagen(formData: FormData): Observable<Producto> {
    let httpHeaders = new HttpHeaders()
    let token = this.authService.token;
    if (token != null) {
      httpHeaders.append('Authorization', 'Bearer ' + token)
    }

    return this.http.post(`${environment.apiUrl}/producto/imagen`, formData
      , { headers: httpHeaders }
    )
      .pipe(
        map((response: any) => response.producto as Producto),
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

  updateProductoImagen(formData: FormData, productoId: number): Observable<Producto> {
    let httpHeaders = new HttpHeaders()
    let token = this.authService.token;
    if (token != null) {
      httpHeaders.append('Authorization', 'Bearer ' + token)
    }

    return this.http.put<Producto>(`${environment.apiUrl}/producto/imagen/${productoId}`, formData, { headers: httpHeaders })
      .pipe(
        map((response: any) => response.producto as Producto),
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

  getProducto(id: any): Observable<Producto> {
    return this.http.get<Producto>(`${environment.apiUrl}/producto/id/${id}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status != 401 && e.error?.mensaje) {
          // this.router.navigate(['/productos']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      }));
  }

  async getProductoHowPromise(productoId: number): Promise<Producto> {
    return await lastValueFrom(this.getProducto(productoId));
  }

  async getIdsProductosActivosHowPromise(): Promise<number[] | []> {
    try {
      const res = await lastValueFrom(this.getIdsProductosActivos());
      return res
    } catch (error) {
      return [];
    }
  }

  getProductoByCod(codigo: string): Observable<Producto> {
    return this.http.get<Producto>(`${environment.apiUrl}/producto/codigo/${codigo}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status != 401 && e.error?.mensaje) {
          // this.router.navigate(['/productos']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      }));
  }

  getLstProductoServicioEnvio(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.apiUrl}/productos/servicio/envio`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status != 401 && e.error?.mensaje) {
          // this.router.navigate(['/productos']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      }));
  }

  getLstProductosServicios(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.apiUrl}/productos/servicios`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.status != 401 && e.error?.mensaje) {
          // this.router.navigate(['/productos']);
          console.error(e.error.mensaje);
        }

        return throwError(e);
      }));
  }

  updateProducto(producto: Producto): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/producto/${producto.id}`, producto
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



  deleteProducto(id: number): Observable<Producto> {
    return this.http.delete<Producto>(`${environment.apiUrl}/producto/${id}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.error?.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  deleteMargenProducto(id: number): Observable<MargenProducto> {
    return this.http.delete<MargenProducto>(`${environment.apiUrl}/margenes/${id}`
      /*, {headers: this.agregarAuthorizationHeader()}*/
    ).pipe(
      catchError(e => {
        if (e.error?.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  subirImagen(archivo: File, productoId: any): Observable<Producto> {
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("productoId", productoId);

    /*     const req = new HttpRequest('POST', `${environment.apiUrl}/personas/upload`, formData, {
          reportProgress: true
        }); */

    return this.http.post<any>(`${environment.apiUrl}/upload-imagen/`, formData).pipe(
      map(response => response.producto as Producto),
      catchError(e => {
        if (e.error?.mensaje) {
          this.alertService.error(e.error.mensaje, e.error.err);
        }
        return throwError(e);
      })
    )
  }

  productosPorCategoriaId(id: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.apiUrl}/productos/categoria/${id}`).pipe(
      catchError(e => {
        if (e.error?.mensaje) {
          this.alertService.error(e.error.mensaje, e.error.err);
        }
        return throwError(e);
      })
    )
  }

    productosPorCategoriaNombre(categoriaNombre: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.apiUrl}/productos/categoria/${categoriaNombre}`).pipe(
      catchError(e => {
        if (e.error?.mensaje) {
          this.alertService.error(e.error.mensaje, e.error.err);
        }
        return throwError(e);
      })
    )
  }

    productoCategoria(productoCodigo: string, categoriaNombre: string): Observable<Producto> {
    return this.http.get<Producto>(`${environment.apiUrl}/producto/${productoCodigo}/categoria/${categoriaNombre}`).pipe(
      catchError(e => {
        if (e.error?.mensaje) {
          this.alertService.error(e.error.mensaje, e.error.err);
        }
        return throwError(e);
      })
    )
  }
}
