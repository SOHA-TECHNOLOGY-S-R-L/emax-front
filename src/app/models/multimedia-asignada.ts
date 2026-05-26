import { Multimedia } from "./multimedia";
import { Producto } from "./producto";

export class MultimediaAsignada {
  id!: number
  productoId!: number;
  multimedia!: Multimedia;
  visibleEnTienda: boolean = false;
  esPrincipal: boolean = false;
}
