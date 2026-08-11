import { Producto } from './producto';

export class ItemPedido {
  producto!: Producto;
  cantidad: number = 0;
  costoUnitarioItem: number = 0;
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
