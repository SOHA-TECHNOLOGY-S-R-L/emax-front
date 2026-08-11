export class MargenProducto {
  id!: number;
  minCantidad!: number;
  maxCantidad?: number;
  margen!: number;
  valorBrutoUnitario!: number;
  valorUnitarioOferta!: number;
  fechaInicioOferta!: Date;
  fechaFinOferta!: Date;

  //valorNetoUnitario!: number;
  igvUnitario!: number;
  precioUnitario!: number;
  //------------
  igvUnitarioOferta !: number;
  precioUnitarioOferta!: number;
  descripcionOferta!: string;

  //hayOferta :boolean = false;
}
