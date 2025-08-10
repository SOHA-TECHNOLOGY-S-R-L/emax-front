import { Role } from "./role";

export class Usuario {
  id!: number;
  username!: string;
  activo!: boolean;
  bloqueado!: boolean;
  password!: string;
  nomApellRz!: string;
  email!: string;
  roles: Role[] = [];  //Se usa para modulo usuarios se ha cambviado revisar

}
