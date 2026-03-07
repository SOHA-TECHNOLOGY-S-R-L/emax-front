import { Multimedia } from "./multimedia";
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
  cantidadProductos!: number;
  multimedia!: Multimedia;
}
