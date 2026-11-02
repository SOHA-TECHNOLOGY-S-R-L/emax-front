import { Injectable } from '@angular/core';
import { ItemPedido } from '../models/item-pedido';
import { BehaviorSubject } from 'rxjs';
import { findIndex } from 'lodash-es';
import { Producto } from '../models/producto';
import { EnvioPedido } from '../models/envio-pedido';
import { TipoPedidoEnum } from '../enums/tipo-pedido.enum';
/* import { VENTA } from '../constants/constantes';
 */
@Injectable({
  providedIn: 'root'
})
export class ItemService {

  itemsBehaviorSubject = new BehaviorSubject<ItemPedido[]>([]);

  constructor() { }

  setItems(items: ItemPedido[]) {
    this.itemsBehaviorSubject.next(items);
  }

  getItems() {
    return this.itemsBehaviorSubject.asObservable();
  }

  existItemInItems(items: Array<ItemPedido>, productoId: number): boolean {
    let existe = false;
    items.forEach((item: ItemPedido) => {
      if (productoId === item.producto.id) {
        existe = true;
      }
    });
    return existe;
  }

  //adiciona cantidad a un item especifico de un array de items
  addItemtoItems(items: Array<ItemPedido>, productoId: number, cantidad: number): Array<ItemPedido> {
    return items.map(item =>
      item.producto.id === productoId
        ? { ...item, cantidad }
        : item
    );
  }

  addServicioEnvio(items: ItemPedido[], formaEnvio: string, serviciosEnvio: Producto[],
    urlImagen: string): ItemPedido[] {

    let nuevosItems = this.deleteServiciosEnvio(items, serviciosEnvio);

    const envioSelected = serviciosEnvio.find(s => s.codigo === formaEnvio);

    if (!envioSelected) { return nuevosItems; }
    if (this.existItemInItems(nuevosItems, envioSelected.id)) {
      return nuevosItems;
    }
    if (envioSelected.minCantidadPedido > envioSelected.cantidadStock) {
      return nuevosItems;
    }

    let lstMultimediaServicioEnvio = envioSelected?.multimediasAsignada
    lstMultimediaServicioEnvio = lstMultimediaServicioEnvio ?
      lstMultimediaServicioEnvio.filter(lst => lst.multimedia.mimeType.startsWith('image')) : [];

    const nuevoItem: ItemPedido = {
      ...new ItemPedido(),
      cantidad: envioSelected.minCantidadPedido,
      descripcion: envioSelected.descripcion,
      imagenShow: lstMultimediaServicioEnvio.length > 0 ?
        urlImagen.concat(lstMultimediaServicioEnvio[0].multimedia.nombre) : 'no-imagen.png',
      producto: { ...envioSelected }
    };
    return [...nuevosItems, nuevoItem]
  };

  buildItems(items: ItemPedido[], envioPedido: EnvioPedido | undefined, serviciosEnvio: Producto[],
    urlImagen: string , tipoPedidoId: number): ItemPedido[] {

    let resultado = [...items];
    if (envioPedido) {
      resultado = this.addServicioEnvio(
        resultado,
        envioPedido.formaEnvio,
        serviciosEnvio,
        urlImagen
      );
    } else {
      resultado = this.deleteServiciosEnvio(resultado, serviciosEnvio);
    }

    return this.importeDeMargenCantidad(resultado, tipoPedidoId);
  }


  UpdateAmountItemFromItems(items: Array<ItemPedido>, productoId: number, cantidad: number): Array<ItemPedido> {
    if (cantidad === 0) {
      return this.deleteItemFromItems(items, productoId);
    }

    return items.map(item =>
      item.producto.id === productoId ? { ...item, cantidad } : item
    );
  }
  /*
    UpdateAmountItemFromItemsProveedor(items: Array<ItemPedido>, productoId: number, cantidad: number): Array<ItemPedido> {
      if (cantidad === 0) {
        return this.deleteItemFromItems(items, productoId);
      }

      return items.map(item =>
        item.producto.id === productoId
          ? { ...item, cantidad }
          : item
      );
    } */

  UpdatePriceCostItemFromItems(items: Array<ItemPedido>, productoId: number, precioCosto: number): Array<ItemPedido> {
    if (precioCosto === 0) {
      return this.deleteItemFromItems(items, productoId);
    }

    return items.map(item =>
      item.producto.id === productoId ? { ...item, precioCostoItem: precioCosto } : item
    );
  }

/*   UpdatePrecioItemFromItemsCliete(items: Array<ItemPedido>, productoId: number, precio: number): Array<ItemPedido> {
    return items.map(item =>
      item.producto.id === productoId ? { ...item, precioItem: precio } : item
    );
  } */

  UpdateDescripcionItemFromItemsCliete(items: Array<ItemPedido>, productoId: number, descripcion: string): Array<ItemPedido> {
    return items.map(item =>
      item.producto.id === productoId ? { ...item, descripcion } : item
    );
  }

  UpdateAmountItemFromExterno(items: Array<ItemPedido>, productoId: number, cantidad: number): Array<ItemPedido> {
    return items.map(item => {

      if (item.producto.id !== productoId) {
        return item;
      }

      const nuevaCantidad = item.cantidad + cantidad;

      if (nuevaCantidad > item.producto.maxCantidadPedido) {
        return item;
      }

      return {
        ...item,
        cantidad: nuevaCantidad
      };
    });
  }


  deleteItemFromItems(items: Array<ItemPedido>, productoId: number): Array<ItemPedido> {
    //const indice = findIndex(items, (item: ItemPedido) => item.producto.id === productoId);
    //return items.splice(indice, 1) ? items : [];
    return items.filter(item => item.producto.id !== productoId);

  }

  deleteServiciosEnvio(items: ItemPedido[], serviciosEnvio: Producto[]): ItemPedido[] {
    let nuevosItems = [...items];
    serviciosEnvio.forEach(servicio => {
      if (this.existItemInItems(nuevosItems, servicio.id)) {
        nuevosItems = this.deleteItemFromItems(nuevosItems, servicio.id);
      }
    });
    return nuevosItems;
  }

  importeDeMargenCantidad(items: ItemPedido[], tipoPedidoId: number) {
    return items.map(item => {
      //variables para item solo por unidad
      let porcentajeIgv = item.producto.porcentajeIgv;
      let valBrutoItem = 0;
      let valOfertaItem = 0;
      let valNetoItem = 0;
      let valPrecioItem = 0;
      //variables para items de cant* p.unit
      let importeBrutoItem = 0;
      let descuentoPorOfertaItem = 0;
      let descuentoPorCuponItem = 0;
      let importeNetoItem = 0
      let igvItem = 0;
      let precioCostoItem = 0;
      //let costoItem = 0;

      for (let margen of item.producto.margenesProducto) {
        if (
          margen.maxCantidad &&
          item.cantidad >= margen.minCantidad &&
          item.cantidad <= margen.maxCantidad
        ) {
          valBrutoItem = margen.valorBrutoUnitario;
          //valOfertaItem = margen.hayOferta ? margen.valorUnitarioOferta : 0;
          valOfertaItem = margen.valorUnitarioOferta;
          valNetoItem = margen.precioUnitarioOferta > 0 ? margen.valorUnitarioOferta : margen.valorBrutoUnitario;
          valPrecioItem = margen.precioUnitarioOferta > 0 ? margen.precioUnitarioOferta : margen.precioUnitario
        }

        if (
          !margen.maxCantidad &&
          item.cantidad >= margen.minCantidad
        ) {
          valBrutoItem = margen.valorBrutoUnitario;
          //valOfertaItem = margen.hayOferta ? margen.valorUnitarioOferta : 0;
          valOfertaItem = margen.valorUnitarioOferta;
          valNetoItem = margen.precioUnitarioOferta > 0 ? margen.valorUnitarioOferta : margen.valorBrutoUnitario;
          valPrecioItem = margen.precioUnitarioOferta > 0 ? margen.precioUnitarioOferta : margen.precioUnitario
        }
      }
      importeBrutoItem = Number((item.cantidad * valBrutoItem).toFixed(2));
      descuentoPorOfertaItem = (valBrutoItem !== valNetoItem) ? Number((importeBrutoItem - (item.cantidad * valOfertaItem)).toFixed(2)) : 0;
      descuentoPorCuponItem = Number((item.descuentoPorCuponItem ?? 0).toFixed(2)); //se aplica el decuneto al total no a solo una cantidad
      importeNetoItem = Number(((item.cantidad * valNetoItem) - descuentoPorCuponItem).toFixed(2));
      igvItem = Number((importeNetoItem * (porcentajeIgv / 100)).toFixed(2));
      //importePrecioItem = Number((importeNetoItem * ((100 + porcentajeIgv)/ 100)).toFixed(2)) ;
      precioCostoItem = (tipoPedidoId === TipoPedidoEnum.VENTA) ? Number((importeNetoItem + igvItem).toFixed(2)) : item.precioCostoItem ;
      //costoItem = Number((item.cantidad * item.costoItem).toFixed(2));

      return {
        ...item,
        valorBrutoUnitarioItem: valBrutoItem,
        precioUnitarioItem: valPrecioItem,
        importeBrutoItem: importeBrutoItem,
        descuentoPorOfertaItem: descuentoPorOfertaItem,
        descuentoPorCuponItem: descuentoPorCuponItem,
        importeNetoItem: importeNetoItem,
        igvItem: igvItem,
        precioCostoItem: precioCostoItem,
        //costoItem: costoItem,
        producto: {
          ...item.producto,
          //valorBrutoUnitarioSelect: valBrutoItem,
          //precioUnitarioSelect: valPrecioItem
        }
      };
    });
  }


  importeDeCostoCantidad(items: ItemPedido[]) {
    return items.map(item => {
      return {
        ...item,
        importe: item.cantidad * item.producto.costoUnitario,
        /*         producto: {
                  ...item.producto,
                  precioMasBajoProductoShow: precioAplicado
                } */
      };
    });
  }

  //cacula el subTotal del un array de tipo items
  calculateImporteBrutoFromItems(items: Array<ItemPedido>): number {
    //let subTotal = 0
    return items.reduce((n, item) => n + item.importeBrutoItem, 0);
  }

  calculateDescuentoPorOfertayCuponFromItems(items: Array<ItemPedido>): number {
    return items.reduce((n, item) => (n + (item.descuentoPorOfertaItem + item.descuentoPorCuponItem)), 0);
  }

  /*   calculateImporteDescuentoFromItems(items: Array<ItemPedido>): number {
      return items.reduce((n, item) => n + item.importeDescuentoItem, 0);
    } */

  calculateImporteNetoFromItems(items: Array<ItemPedido>): number {
    return items.reduce((n, item) => n + item.importeNetoItem, 0);
  }

  calculateIgvFromItems(items: Array<ItemPedido>): number {
    return items.reduce((n, item) => n + item.igvItem, 0);
  }


  calculatePrecioCostoFromItems(items: Array<ItemPedido>): number {
    return items.reduce((n, item) => n + item.precioCostoItem, 0);
  }

  saveSessionStorageItems(items: Array<ItemPedido>) {
    sessionStorage.setItem('items', JSON.stringify(items));
  }

  getSessionStorageItems(): Array<ItemPedido> {
    const items = sessionStorage.getItem('items');
    return items ? JSON.parse(items) : [];
  }

  saveLocalStorageItems(items: Array<ItemPedido>) {
    localStorage.setItem('items', JSON.stringify(items));
  }

  getLocalStorageItems(): Array<ItemPedido> {
    const items = localStorage.getItem('items');
    return items ? JSON.parse(items) : [];
  }

  removeLocalStorageItems() {
    localStorage.removeItem('items');
    this.setItems([]);
  }

  removeSessionStorageItems() {
    localStorage.removeItem('items');
    this.setItems([]);

  }
}
