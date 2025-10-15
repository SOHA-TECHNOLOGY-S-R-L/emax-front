import { FormControl, FormGroup, NgModel } from '@angular/forms';
import { Producto } from '../models/producto';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/pedido';
import { Categoria } from '../models/categoria';
export class ChatUtils {

  static defaultMesage() {
    const mensaje = `Hola!, estoy interesado en los productos de la página.`
    const link = environment.API_URL_WHATSAPP + encodeURI(mensaje);
    window.open(link, "_blank")
  }

  static infoString(texto: string) {
    const mensaje = `Hola!, quiero saber mas de ${texto}`
    const link = environment.API_URL_WHATSAPP + encodeURI(mensaje);
    window.open(link, "_blank")
  }

 /*  static infoUrl(url: string) {
    const mensaje = `Hola!, quiero saber mas de ${url}`
    const link = environment.API_URL_WHATSAPP + encodeURI(mensaje);
    window.open(link, "_blank")
  } */

  static infoProduct(producto: Producto) {
    const mensaje = `Hola!, quiero saber mas de ${producto.codigo} - ${producto.nombre}`
    const link = environment.API_URL_WHATSAPP + encodeURI(mensaje);
    window.open(link, "_blank")
  }

  static sendPedido(pedido: Pedido) {
    const mensaje = `Pedido finalizado! Con código ${pedido.id}, por un monto de S/. ${pedido.precioNetoTotal} contiene ${pedido.items.length} producto(s). Pendiente de adjuntar voucher de pago...`
    const link = environment.API_URL_WHATSAPP + encodeURI(mensaje);
    window.open(link, "_blank")
  }

}
