import { Multimedia } from "./multimedia";
import { MultimediaAsignada } from "./multimedia-asignada";
import { Producto } from "./producto";

export class Categoria {
  id!: number;
  nombre!: string;
  descripcion!: string;
  activa!: boolean
  visibleEnTienda!: boolean
  colorActiva!: string;
  colorVisibleEnTienda!: string;
  orden!: number;
  productos: Producto[] = [];
  multimediasAsignada: MultimediaAsignada[] = [];
  cantidadProductos!: number;
  //multimedia!: Multimedia;
}
