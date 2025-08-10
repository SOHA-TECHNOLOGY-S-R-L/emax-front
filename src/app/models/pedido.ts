import { Cliente } from './cliente';
import { EstadoPedido } from './estado-pedido';
import { ItemPedido } from './item-pedido';
import { Movimiento } from './movimiento';
import { TipoPedido } from './tipo-pedido';

export class Pedido {
  id!:number;
  //descripcion!: string;
  observacion!: string;
  items:Array<ItemPedido> = [];
  movimientos:Array<Movimiento> = [];
  cliente?:Cliente;
  nomApellRzEnvio:string = '';
  direccionEnvio:string = '';
  celularEnvio:string = '';
  estadoPedido!:EstadoPedido;
  tipoPedido!:TipoPedido;
  costoBrutoTotal:number=0;
  costoNetoTotal:number=0;
  precioBrutoTotal!:number;
  precioNetoTotal:number=0;
  pagoTotal:number=0;
  vueltoTotal:number=0;
  saldoPedido!:number;
  flujoEfectivoTotal!:number;

  //total!:number;
  createAt!:string;
  entregadoEn!:string;
  adquiridoEn!:string;
  //aceptado:boolean = true;
  //vencido:boolean = false;
  pagado:boolean = false;
  devuelto:boolean = false;


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
