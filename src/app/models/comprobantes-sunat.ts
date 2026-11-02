import { TipoDocumentoSunatEnum } from "../enums/tipo-documento-sunat.enum";

export class ComprobantesSunat {
     id!: number;
     tipoDocumentoSunat!: TipoDocumentoSunatEnum;
     serie! : string;
     numero! : string;
}
