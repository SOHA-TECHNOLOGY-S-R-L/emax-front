import { VendedorEnCajaEnum } from './../enums/vendedor-en-caja.enum';


export class Caja {
  id?: number;
  nombre?: string;
  responsable?: string;
  direccion?: string;
  //descripcion!: string;

  pathFacturador?: string //esta es la ruta del facturador sunat que vendra de la base de dats D:\pry_facturador\SFS_v-2.4\facturadorApp-2.4.jar
  vendedorEnCaja?: string ;
  // pathLanzadorSFS?: string // esta es la ruta del lanzador que hemos trabajado D:\pry_facturador\lanzadorFacturadorSFS.jar
  boletaSerie?: string
  boletaCorrelativo?: number

  notaCreditoDeBoletaSerie?: string
  notaCreditoDeBoletaCorrelativo?: number

  facturaSerie?: string;
  facturaCorrelativo?: number;

  notaCreditoDeFacturaSerie?: string
  notaCreditoDeFacturaCorrelativo?: number
}
