import { inject, Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';
import { MultimediaHttpService } from './multimedia-http.service';

@Injectable({
  providedIn: 'root'
})
export class MultimediaService {

  private multimediaHttpService = inject(MultimediaHttpService);

  readonly MAX_FILE_SIZE_KB = 30; // 🔧 ajustable
  readonly EXTENSIONS_IMAGES = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"];
  readonly EXTENSIONS_VIDEOS = ["mp4", "mpeg", "quicktime", "x-msvideo", "x-matroska"];
  readonly ALLOWED_IMAGES_MIME_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"];
  readonly ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/x-matroska"]

  //public imagenSeleccionada: File | null = null;
  public base64Image: string | null = null;

  //private imagenSeleccionada!: File;

  constructor(private alertService: AlertService,
    private authService: AuthService,
    //private httpClient: HttpClient
  ) { }

  /*   seleccionarImagen(event: any) {
      let imagenSeleccionada: File;
      this.imagenSeleccionada = event.target.files[0];
      if (this.imagenSeleccionada!.type.indexOf('image') < 0) {
        this.alertService.error('El archivo debe ser del tipo imagen', 'Imagen');
        return;
      }
    } */

  /*   listarArchivosMultimedia(params: any): Observable<PageableResponse> {
      return this.httpClient.get<any>(`${environment.apiUrl}/multimedia/listar/pageable`, { params: params })
    } */

  isImage(fileInput: HTMLInputElement): boolean {
    let result: boolean = false;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      let imagenSeleccionada: File;
      //imagenSeleccionada = event.target.files[0];
      imagenSeleccionada = fileInput.files[0];
      if (imagenSeleccionada!.type.indexOf('image') < 0) {
        this.alertService.error('El archivo debe ser del tipo imagen', 'Imagen');
        return result = false;
      }
      return result = true;
    }
    return result;
  }



  isMultimediaFile(file: File): boolean {
    let result: boolean = true;
    const isValidType =
      this.ALLOWED_IMAGES_MIME_TYPES.includes(file.type) ||
      this.ALLOWED_VIDEO_MIME_TYPES.includes(file.type);
    if (!isValidType) {
      result = false;
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

  /*   subirImagen(file: File, cleinteOnline: boolean): Observable<any> {
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
    } */

  filesMultimediaSelected(multimediaFiles: File[]): void {
    const validMultimediaFiles: File[] = [];
    for (const file of multimediaFiles) {
      if (!this.isMultimediaFile(file)) {
        this.alertService.error(`Formato no permitido: ${file.name}`, 'Error de formato');
        continue;
      }
      validMultimediaFiles.push(file);
    }

    if (validMultimediaFiles.length === 0) {
      this.alertService.warning(`No hay archivos multimedia validos para subir`, 'Subir multimedia');
      return;
    }

    this.multimediaHttpService.subirMultimediaFiles(validMultimediaFiles)
      .subscribe({
        next: (resp) => {
          this.alertService.success(`${validMultimediaFiles.length} archivos multimedia subidos correctamente`, 'Subir multimedia');
        },
        error: (err) => {
          this.alertService.error('Error al subir archivos multimedia', 'Subir multimedia');
        }
      });
  }


  tamanioEnKilobytes(file: File): number {
    const sizeInKb = file.size / 1024;
    return Math.round(sizeInKb);
  }



  /*   eliminarImagen(nombreImagen: string): Observable<any> {
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
    } */

}
