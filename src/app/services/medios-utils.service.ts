import { inject, Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import { FormGroup } from '@angular/forms';
import { AuthService } from './auth.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediosUtilsService {

  //public imagenSeleccionada: File | null = null;
  public base64Image: string | null = null;

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

  isImage(fileInput: HTMLInputElement): boolean {
    let result:boolean = false;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      let imagenSeleccionada: File;
      //imagenSeleccionada = event.target.files[0];
      imagenSeleccionada = fileInput.files[0];
      if (imagenSeleccionada!.type.indexOf('image') < 0) {
        this.alertService.error('El archivo debe ser del tipo imagen', 'Imagen');
        return result= false;
      }
      return result = true;
    }
    return result;
  }

  imageToBase64(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.base64Image = e.target.result; //imagen a base 64
      };
      reader.readAsDataURL(file);
    }
  }

  subirImagen(file: File, cleinteOnline: boolean): Observable<any> {
    let formData = new FormData();
    formData.append("archivo", file);
    formData.append("clienteOnline", cleinteOnline.toString());

    let httpHeaders = new HttpHeaders()
    let token = this.authService.token;
    if (token != null) {
      httpHeaders.append('Authorization', 'Bearer ' + token)
    }

    return this.httpClient.post<any>(`${environment.apiUrl}/medios/upload`, formData, { headers: httpHeaders })
      .pipe(
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