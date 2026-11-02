import { TipoDocumentoIdentidadEnum } from '../enums/tipo-documento-identidad.enum';
import { TipoPersonaEnum } from '../enums/tipo-persona.enum';
import { Pedido } from './pedido';

export class Persona {
  id!: number;
  tipoDocumentoIdentidad!: TipoDocumentoIdentidadEnum; //Enum
  numeroDocumento!: string;
  apellNomRznSocial?: string;
  direccionCompleta?: string;
  email?: string;
  celular!: string;
  tipoPersona?: TipoPersonaEnum;
  usuarioId?: number;
  username?: string | null;
  password?: string | null;
  pedidos: Array<Pedido> = [];
}
