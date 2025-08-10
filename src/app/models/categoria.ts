import { Producto } from "./producto";

export class Categoria {
  id!: number;
  nombre!: string;
  descripcion!:string;
  imagen: string = 'no-imagen.jpg';
  activa!:boolean
  colorActiva!:string;
  orden!: number;
  productos :Producto[]=[];
  cantidadProductos!: number;
}
