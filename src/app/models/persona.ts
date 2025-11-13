import { Pedido } from './pedido';
import { TipoDocumento } from './tipo-documento';
import { TipoPersona } from './tipo-persona';
import { Usuario } from './usuario';

export class Persona {
  id!: number;
  nomApellRz!: string;
  direccion?: string;
  createAt!: string;
  tipoDocumento!: TipoDocumento;
  tipoPersona!: TipoPersona;
  numeroDocumento!: string;
  email?: string;
  //clave!:string;
  //confirmaClave!:string;
  celular!: string;
  //usuarioId?:number;
  usuario!: Usuario;
  pedidos: Array<Pedido> = [];
}
