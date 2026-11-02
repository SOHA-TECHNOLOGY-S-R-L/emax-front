import { ColorDetails, getColorEnumById } from "../enums/color.enum";
import { EstadoPedidoEtiquetas, getEstadoPedidoEnumById } from "../enums/estado-pedido.enum";
import { ItemRequestResponse, PedidoRequestResponse, ProductoRequestResponse } from "../interfaces/pedido-request-response";
import { ItemPedido } from "../models/item-pedido";
import { Pedido } from "../models/pedido";
import { Producto } from "../models/producto";



export function construirProductoModel(res: ProductoRequestResponse): Producto {
  return {
    ...res,
    color: getColorEnumById(res.color)
  };
}

export function constuirItemModel(res: ItemRequestResponse): ItemPedido {
  return {
    ...res,
    producto: construirProductoModel(res.producto)
  };
}

export function constuirPedidoModel(res: PedidoRequestResponse): Pedido {
  return {
    ...res,
    estadoPedido: getEstadoPedidoEnumById(res.estadoPedido),
    items: res.items.map(item => ({
      ...constuirItemModel(item)
    })
    )
  };
}


export function construirPedidoRequest(pedido: Pedido): PedidoRequestResponse {
  return {
    ...pedido,
    estadoPedido: pedido.estadoPedido == null ? null : EstadoPedidoEtiquetas[pedido.estadoPedido].id,
    items: pedido.items.map(item => ({
      ...item,
      producto: {
        ...item.producto,
        color: item.producto.color == null ? null : ColorDetails[item.producto.color].id
      }
    }))
  };
}
