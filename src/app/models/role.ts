import { Modulo } from "./modulo";

export class Role {
  id!: number;
  nombre!: string;
  descripcion!:string
  //modulo!: Modulo;
  activated:boolean=false;
}
