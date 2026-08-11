import { Categoria } from "./categoria";
import { Persona } from "./persona";
import { Producto } from "./producto";

export class CuponAsignado {
  id!: number;
  cuponId !: number;
  persona!: Persona;
  categoria !: Categoria;
  producto !: Producto;
  tipoAsignacion!: string;// INCLUIDO, EXCLUIDO, SOLO
}

