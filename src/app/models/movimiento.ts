import { CajaUsuario } from "./caja-usuario";
import { Pedido } from "./pedido";
import { TipoMovimientoPedido } from "./tipo-movimiento-pedido";
import { TipoPago } from "./tipo-pago";


export class Movimiento {
  id!:number;
  pedido!: Pedido;
	cajaUsuario!: CajaUsuario;
  tipoPago!: TipoPago;
  tipoMovimientoPedido!: TipoMovimientoPedido;
	//createAt!: string;
	//pagoDinero!:number;
  //vueltoDinero!:number;
  ingresoDinero:number=0;
  egresoDinero:number=0;
  //saldoBrutoDinero!:number;
  saldoDinero!:number;

}
