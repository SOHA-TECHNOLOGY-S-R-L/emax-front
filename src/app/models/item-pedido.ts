import { Producto } from './producto';

export class ItemPedido {
  producto!: Producto;
  costoUnitarioItem: number = 0; //costo unitario de compra
  valorBrutoUnitarioItem: number = 0; //valor bruto pra ventas
  precioUnitarioItem: number = 0
  cantidad: number = 0;
  importeBrutoItem!: number;
  descuentoPorOfertaItem!: number;
  descuentoPorCuponItem!: number;
  importeNetoItem!: number;
  igvItem!: number;
  precioCostoItem!: number; //trae el precio si es venta o el costo si es compra
  //costoItem: number = 0;
  codigoCupon!: string;
  descripcion!: string;
  imagenShow!: string;//para item siempre se mostrara imagen no videos
}
