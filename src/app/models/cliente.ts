import { Pedido } from './pedido';
import { TipoDocumento } from './tipo-documento';
import { Usuario } from './usuario';

export class Cliente {
  id!: number;
  nomApellRz!:string;
  direccion?:string;
  createAt!: string;
  tipoDocumento!: TipoDocumento;
  numeroDocumento!: string;
  email?:string;
  clave!:string;
  confirmaClave!:string;
  celular!: string;
  usuarioId?:number;
  pedidos: Array<Pedido> = [];
}
