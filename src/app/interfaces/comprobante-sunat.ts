import { VendedorEnCajaEnum } from './../enums/vendedor-en-caja.enum';
import { TipoDocumentoSunatEnum } from "../enums/tipo-documento-sunat.enum";

export interface ComprobanteSunat {
  id: number;
  vendedorEnCaja: VendedorEnCajaEnum;
  tipoDocumentoSunat: TipoDocumentoSunatEnum;
  serie: string;
  numero: string;
  //archivoCab: string;
  //archivoTri: string;
  //archivoLey: string;
  //archivoNot: string;
  //archivoDet: string;
}
