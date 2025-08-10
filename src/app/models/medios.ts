import { Categoria } from "./categoria"
import { Color } from "./color"
import { Empaque } from "./empaque"
import { Material } from "./material"
import { Origen } from "./origen"
import { Uso } from "./uso"
import { GenericosDeProducto } from './genericos-de-producto';
import { GaleriaProducto } from "./galeria-producto"

export class Medios {
  id!: number;
  nombre!:string;
  descripcion!:string;
  archivo!:string;
  galeriaProducto:GaleriaProducto[]=[]
}


