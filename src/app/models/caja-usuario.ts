import { Caja } from "./caja";
import { MovimientoCaja } from "./movimiento-caja";
import { Movimiento } from "./movimiento";
import { Usuario } from "./usuario";


export class CajaUsuario {
	id!: number;
	fechaApertura!: string;
	fechaCierre!: string;
  fechaActualizacion!: string;
	ingresoEsperado!:number;
	ingresoPorConteo!:number;
	egresoEsperado!:number;
  saldoInicial:number = 0;
	saldoFinal:number = 0;
  saldoPorConteo!:number;
  activa:boolean=false;
  color!:string;
	caja!: Caja;
	usuario!: Usuario;
	movimientos: Movimiento[]=[];
  movimientosCaja: MovimientoCaja[]=[];
}
