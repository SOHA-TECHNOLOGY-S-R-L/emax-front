import { Multimedia } from "./multimedia";
import { Producto } from "./producto";

export class MultimediaProducto {
  producto!: Producto;
  multimedia!: Multimedia;
  visibleEnTienda: boolean = false;
  esPrincipal: boolean = false;
}
