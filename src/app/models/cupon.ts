
export class Cupon {
  codigo!: string;
  descripcion!: string;
  caducidad!: boolean;
  fchHoraCaducidad: Date | null = null;
  limiteUsoDelCupon: number | null = null;
  limiteUsoNProductosPedido: number | null = null;
  limiteUsoPorPersona!: number;
//  usoCupon!: string;
  usoCombinado: boolean = false;
  categoriasIncluidas!: string;
  categoriasExcluidas!: string;
  productosIncluidos!: string;
  productosExcluidos!: string;
  excluirProductosOferta!: boolean;
  personasExcluidas!: string;
  tipoDescuentoCupon!: string;
  importe!: number;
  //horaCaducidad!: Date;
  gastoMinimoProductos: number | null = null;
  gastoMaximoProductos: number | null = null;
  //aplicaPersonasConPedidos: boolean = false;
  //activo!: boolean;
  visibleEnTienda: boolean = false;
  //colorActivo!: string;
  colorVisibleEnTienda!: string;
  colorExcluirProductosOferta!: string;


}

