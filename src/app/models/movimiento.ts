import { MovimientoInicialEnum } from '../enums/movimiento-inicial.enum';


export class Movimiento {
  //id!: number;
  tipoPagoId!:number;
  movimientoInicial!: MovimientoInicialEnum;
  ingresoDinero:number=0;
  egresoDinero:number=0;
}
