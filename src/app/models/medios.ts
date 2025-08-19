import { GaleriaProducto } from "./galeria-producto"

export class Medios {
  id!: number;
  nombre!:string;
  descripcion!:string;
  archivo!:string;
  galeriaProducto:GaleriaProducto[]=[]
}


