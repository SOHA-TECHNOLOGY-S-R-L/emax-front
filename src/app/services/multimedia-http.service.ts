import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageableResponse } from '../models/pageable-response';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';
import { Multimedia } from '../models/multimedia';

@Injectable({
  providedIn: 'root'
})
export class MultimediaHttpService {

  /*   readonly MAX_FILE_SIZE_KB = 30; // 🔧 ajustable
    readonly EXTENSIONS_IMAGES = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"];
    readonly EXTENSIONS_VIDEOS = ["mp4", "mpeg", "quicktime", "x-msvideo", "x-matroska"];
    readonly ALLOWED_IMAGES_MIME_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"];
    readonly ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/x-matroska"] */

  //public imagenSeleccionada: File | null = null;
  //public base64Image: string | null = null;

  //private imagenSeleccionada!: File;

  constructor(private alertService: AlertService,
    private authService: AuthService,
    private httpClient: HttpClient
  ) { }

  /*   seleccionarImagen(event: any) {
      let imagenSeleccionada: File;
      this.imagenSeleccionada = event.target.files[0];
      if (this.imagenSeleccionada!.type.indexOf('image') < 0) {
        this.alertService.error('El archivo debe ser del tipo imagen', 'Imagen');
        return;
      }
    } */

  listarArchivosMultimedia(params: any): Observable<PageableResponse> {
    //console.log(params);
    return this.httpClient.get<any>(`${environment.apiUrl}/multimedia/listar/pageable`, { params: params })
  }

  /*   isImage(fileInput: HTMLInputElement): boolean {
      let result: boolean = false;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        let imagenSeleccionada: File;
        imagenSeleccionada = fileInput.files[0];
        if (imagenSeleccionada!.type.indexOf('image') < 0) {
          this.alertService.error('El archivo debe ser del tipo imagen', 'Imagen');
          return result = false;
        }
        return result = true;
      }
      return result;
    } */

  /*   imageToBase64(file: File) {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.base64Image = e.target.result; //imagen a base 64
        };
        reader.readAsDataURL(file);
      }
    } */

  subirImagen(file: File, cleinteOnline: boolean): Observable<any> {
    let formData = new FormData();
    formData.append("archivo", file);
    formData.append("personaOnline", cleinteOnline.toString());

    let httpHeaders = new HttpHeaders()
    let token = this.authService.token;
    if (token != null) {
      httpHeaders.append('Authorization', 'Bearer ' + token)
    }
    return this.httpClient.post<any>(`${environment.apiUrl}/multimedia/upload`, formData, { headers: httpHeaders })
      .pipe(
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

  subirMultimediaFiles(files: File[]): Observable<any> {
    let formData = new FormData();
    files.forEach(file => {
      formData.append('archivos', file);
    });

    let httpHeaders = new HttpHeaders()
    let token = this.authService.token;
    if (token != null) {
      httpHeaders.append('Authorization', 'Bearer ' + token)
    }

    return this.httpClient.post<any>(`${environment.apiUrl}/multimedia/uploads`, formData, { headers: httpHeaders })
      .pipe(
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

  eliminarMultimedias(multimedias: Multimedia[]): Observable<any> {
    return this.httpClient.post<any>(`${environment.apiUrl}/multimedia/eliminar-varios`, multimedias)
      .pipe(
        catchError(e => {
          if (e.status == 404) {
            return throwError(e);
          }
          if (e.error?.mensaje) {
            this.alertService.error(e.error.mensaje, e.error.titulo)
          }
          return throwError(e);
        }));
  }

  eliminarImagen(nombreImagen: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.apiUrl}/multimedia/eliminar/${nombreImagen}`)
      .pipe(
        catchError(e => {
          if (e.status == 404) {
            return throwError(e);
          }
          if (e.error?.mensaje) {
            console.error(e.error.mensaje);
          }
          return throwError(e);
        }));
  }

}
