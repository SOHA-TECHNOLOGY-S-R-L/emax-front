import { CajaUsuario } from "./caja-usuario";
import { Pedido } from "./pedido";
import { TipoMovimientoPedido } from "./tipo-movimiento-pedido";
import { TipoPago } from "./tipo-pago";


export class Movimiento {
  //id!:number;
  //pedido!: Pedido;
	cajaUsuario!: CajaUsuario;
  tipoPagoId!:number;
  tipoMovimientoPedidoId!: number;
  //tipoPago!: TipoPago;
  //tipoMovimientoPedido!: TipoMovimientoPedido;
  ingresoDinero:number=0;
  egresoDinero:number=0;
  //saldoDinero!:number;

}
