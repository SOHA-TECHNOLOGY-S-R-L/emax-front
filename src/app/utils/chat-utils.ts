import moment from 'moment';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/pedido';
import { Producto } from '../models/producto';
export class ChatUtils {

  static defaultMesageFromEmpleadoVenta() {
    const mensaje = `Hola!, estoy interesado en los productos de la página.`
    const link = environment.URL_WHATSAPP_VENTA + encodeURI(mensaje);
    window.open(link, "_blank")
  }

  static infoFromEmpleadoVenta(texto: string) {
    const mensaje = `Hola!, quiero saber mas de ${texto}`
    const link = environment.URL_WHATSAPP_VENTA + encodeURI(mensaje);
    window.open(link, "_blank")
  }

 /*  static infoUrl(url: string) {
    const mensaje = `Hola!, quiero saber mas de ${url}`
    const link = environment.API_URL_WHATSAPP + encodeURI(mensaje);
    window.open(link, "_blank")
  } */

  static infoProductFromEmpleadoVenta(producto: Producto) {
    const mensaje = `Hola!, quiero saber mas de ${producto.codigo} - ${producto.nombre}`
    const link = environment.URL_WHATSAPP_VENTA + encodeURI(mensaje);
    window.open(link, "_blank")
  }

  static pagoPedidoToEmpleadoCaja(pedido: Pedido) {
    const mensaje = `Envío imagen con pago por pedido con código ${pedido.id}, por un monto de S/. ${pedido.precioNetoTotal.toFixed(2)}, fecha creación de pedido  ${moment(pedido.createAt).format('DD/MM/yyyy HH:mm:ss')}`
    const link = environment.URL_WHATSAPP_CAJA + encodeURI(mensaje);
    window.open(link, "_blank")
  }

}
