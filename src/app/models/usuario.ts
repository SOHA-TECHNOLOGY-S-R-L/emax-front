import { Cliente } from "./cliente";
import { Role } from "./role";

export class Usuario {
  id!: number;
  username!: string;
  activo!: boolean;
  noBloqueado!: boolean;
  //empleado:boolean=false;
  password!: string;
  reintentos!:number;
  //nomApellRz!: string;
  //email!: string;
  codigoRenovacionClave!: string;
  cliente!:Cliente;
  roles: Role[] = [];  //Se usa para modulo usuarios se ha cambviado revisar

}
