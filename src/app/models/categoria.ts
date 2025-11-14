import { Producto } from "./producto";

export class Categoria {
  id!: number;
  nombre!: string;
  descripcion!: string;
  imagen: string = 'no-imagen.png';
  activa!: boolean
  visibleEnTienda!: boolean
  colorActiva!: string;
  colorVisibleEnTienda!: string;
  orden!: number;
  productos: Producto[] = [];
  cantidadProductos!: number;
}
