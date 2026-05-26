import { MultimediaAsignada } from "./multimedia-asignada";

export class Multimedia {
  id!: number;
  nombre!: string;
  descripcion!: string
  tamanioKb!: number
  ancho!: string
  alto!: string
  extension!: string
  mimeType!: string
  multimediasAsignada: MultimediaAsignada[] = [];
  urlMultimediaShow!: string;

}
