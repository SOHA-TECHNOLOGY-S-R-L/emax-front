import { Categoria } from './categoria';
import { EstadoProducto } from './estado-producto';
import { MargenProducto } from './margen-producto';
import { MultimediaAsignada } from './multimedia-asignada';

export class Producto {
  id!: number;
  codigo!: string;
  nombre!: string;
  descripcion!: string;
  medidas?: string;
  peso?: string;
  umbralPocaCantidad: number = 5;
  umbralCantidadAgotada: number = 0;
  cantidadVendidos: number = 0;
  cantidadStock: number = 0; // esto se actualiza al comprar
  minCantidadPedido: number = 1;
  maxCantidadPedido: number = 999999999;
  gruposDe: number = 1;
  costoUnitarioMax: number = 0;
  costoUnitario: number = 0; // esto se actualiza al comprar
  //costoPersonalizacion: number=0;
  porcentajeIgv: number = 18;
  //margenGanancia:number=0;
  //costoUnitarioEmpaque: number=0;
  //precioBruto: number = 3;
  //precioNeto: number=0;
  //precioBrutoRebajado: number=2;
  //precioNetoRabajado: number=3;
  //createAt!:string
  //fechaPrecioRebajadoDesde!:string;
  //fechaPrecioRebajadoHasta!:string;
  //productosRelacionados!:string; //ventas dirigidas(prod sustituto por la calidad, mas caros)
  //productosPromocion!:string;
  visibleEnTienda: boolean = false;
  activo: boolean = true;
  colorId: number | undefined;
  materialId: number | undefined;
  categoria?: Categoria;
  usoId: number | undefined;;
  estadoProducto!: EstadoProducto;
  padreId: number | undefined;
  //hijos: Producto[] = [];
  margenesProducto: MargenProducto[] = [];
  multimediasAsignada: MultimediaAsignada[] = [];
  //campos utilitarios
  //multimediaPrincipal?: string;
  colorVariante! : string;
  colorActivo!: string;
  colorVisibleEnTienda!: string;
  //---------------------
  valorBrutoUnitarioSelect: number = 0;
  precioUnitarioSelect: number = 0;
}

//
