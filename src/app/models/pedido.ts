import { Persona } from './persona';
import { ItemPedido } from './item-pedido';
import { Movimiento } from './movimiento';
import { TipoPedidoEnum } from '../enums/tipo-pedido.enum';
import { ComprobanteSunat } from '../interfaces/comprobante-sunat';
import { EstadoPedidoEnum } from '../enums/estado-pedido.enum';

export class Pedido {
  id!: number;
  //descripcion!: string;
  observacion!: string;
  items: Array<ItemPedido> = [];
  movimientos: Array<Movimiento> = [];
  comprobantesSunat: Array<ComprobanteSunat>= []
  persona?:Persona;
  //personaId: number | undefined;
  apellNomRznSocialEnvio: string = '';
  direccionEnvio: string = '';
  celularEnvio: string = '';
  //estadoPedido!: EstadoPedido;
  estadoPedido!: EstadoPedidoEnum | null;
  tipoPedido!:TipoPedidoEnum;
  //tipoPedidoId: number | undefined;
  //costoBrutoTotal: number = 0;
  //costoNetoTotal: number = 0;
  costoTotal: number = 0;
  importeBrutoTotal!: number;
  descuentoPorOfertaTotal : number = 0;
  descuentoPorCuponTotal: number = 0;
  importeNetoTotal: number = 0;
  igvTotal: number = 0;
  precioTotal: number = 0;
  pagoTotal: number = 0;
  vueltoTotal: number = 0;
  saldoPedido!: number;
  flujoEfectivoTotal!: number;

  //total!:number;
  createAt!: string;
  entregadoEn!: string;
  adquiridoEn!: string;
  //aceptado:boolean = true;
  //vencido:boolean = false;
  //pagado: boolean = false;
  //devuelto: boolean = false;
  isAnuladoDisabled:boolean = false;
  username: string = ''


  /*    calcularGranTotal(): number {
      this.precioNetoTotal = 0;
      this.items.forEach((item: ItemPedido) => {
        this.precioNetoTotal += item.calcularImporte();
      });
      return this.precioNetoTotal;
    } */
  /*
    calcularGranSaldo(): number {
      return this.calcularGranTotal() - this.pago;
    } */


}
