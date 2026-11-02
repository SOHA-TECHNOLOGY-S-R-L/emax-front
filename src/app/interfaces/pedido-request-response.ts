import { ItemPedido } from "../models/item-pedido";
import { Pedido } from "../models/pedido";
import { Producto } from "../models/producto";

export interface ProductoRequestResponse extends Omit<Producto, 'color'> {
  color: number | null;
}

export interface ItemRequestResponse extends Omit<ItemPedido, 'producto'> {
  producto: ProductoRequestResponse;
}

 export interface PedidoRequestResponse extends Omit<Pedido, 'items' | 'estadoPedido'> {
  items: ItemRequestResponse[];
  estadoPedido: number | null;
}

