import { FormatoImpresionEnum } from './../enums/formato-impresion.enum';
export interface ComprobantePdfRequest {
  identificadorComprobante : string,
  formatoImpresion: FormatoImpresionEnum

}
