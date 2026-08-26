import { Pedido } from './pedido';

export class Persona {
  id!: number;
  nomApellRz?: string;
  direccion?: string;
  createAt!: string;
  //tipoDocumento!: TipoDocumento;
  //tipoPersona!: TipoPersona;
  tipoDocumentoId?: number;
  tipoPersonaId?: number;

  numeroDocumento!: string;
  email?: string;
  //clave!:string;
  //confirmaClave!:string;
  celular!: string;
  usuarioId?: number;

  username?: string | null;
  password?: string | null;

  //usuario!: Usuario;
  pedidos: Array<Pedido> = [];
}
