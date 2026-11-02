export enum TipoPedidoEnum {
  VENTA = 1,
  COMPRA = 2,
  COTIZACION_VENTA = 3,
  //COTIZACION_COMPRA = 4,
}

 export const TipoPedidoEtiquetas: Record<TipoPedidoEnum, string> = {
  [TipoPedidoEnum.VENTA]: 'Pedido de VENTA',
  [TipoPedidoEnum.COMPRA]: 'Orden de COMPRA',
  [TipoPedidoEnum.COTIZACION_VENTA]: 'Cotización de Venta',
  //[TipoPedido.COTIZACION_COMPRA]: 'Pasaporte',
};



