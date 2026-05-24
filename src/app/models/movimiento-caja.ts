import { CajaUsuario } from "./caja-usuario";
import { Pedido } from "./pedido";
import { TipoMovimientoCaja } from "./tipo-movimiento-caja";
import { TipoPago } from "./tipo-pago";


export class MovimientoCaja {
  //id!: number;
  //cajaUsuario!: CajaUsuario;
  tipoPagoId!: number;
  tipoMovimientoCajaId!: number;
  ingresoDinero: number = 0;
  egresoDinero: number = 0;
  descripcion!: string;
}
