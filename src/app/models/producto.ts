import { Categoria } from './categoria';
import { EstadoProducto } from './estado-producto';
import { MargenProducto } from './margen-producto';
import { MultimediaProducto } from './multimedia-producto';

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
  costoUnitario: number = 0; // esto se actualiza al comprar
  //costoPersonalizacion: number=0;
  impuestoIgv: number = 18;
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
  hijos: Producto[] = [];
  margenesProducto: MargenProducto[] = [];
  multimediasProducto: MultimediaProducto[] = [];
  //campos utilitarios
  //multimediaPrincipal?: string;
  colorVariante! : string;
  colorActivo!: string;
  colorVisibleEnTienda!: string;
  precioMasBajoProductoShow: number = 0;
}

//
