import { Role } from "./role";

export class Modulo {
  id!: number;
  nombre!: string;
  roles:Role[]=[];
  //activated:boolean=false
}
