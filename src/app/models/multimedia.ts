import { MultimediaProducto } from "./multimedia-producto";

export class Multimedia {
  id!: number;
  nombre!: string;
  descripcion!: string
  tamanioKb!: number
  ancho!: string
  alto!: string
  extension!: string
  mimeType!: string
  //checked: boolean = false;
  multimediasProducto: MultimediaProducto[] = [];
  //campos utilitarios
  //nombreMultimediaShow: string = 'no-imagen.png';
  urlMultimediaShow!: string;

}
