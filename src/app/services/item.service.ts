import { Injectable } from '@angular/core';
import { ItemPedido } from '../models/item-pedido';
import { BehaviorSubject } from 'rxjs';
import { findIndex } from 'lodash-es';

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
    /*     return items = items.map((item: ItemPedido) => {
          item.cantidad = cantidad;
          return item;
        });
           */
    return items.map(item =>
      item.producto.id === productoId
        ? { ...item, cantidad }
        : item
    );
  }

  UpdateAmountItemFromItems(items: Array<ItemPedido>, productoId: number, cantidad: number): Array<ItemPedido> {
    /*     if (cantidad == 0) {
          return this.deleteItemFromItems(items, productoId);
        }
        items = items.map((item: ItemPedido) => {
          if (productoId === item.producto.id) {
            item.cantidad = cantidad;
          }
          return item;
        });

        return items */
    if (cantidad === 0) {
      return this.deleteItemFromItems(items, productoId);
    }

    return items.map(item =>
      item.producto.id === productoId
        ? { ...item, cantidad }
        : item
    );
  }

  UpdateAmountItemFromItemsProveedor(items: Array<ItemPedido>, productoId: number, cantidad: number): Array<ItemPedido> {
    /*     if (cantidad == 0) {
          return this.deleteItemFromItems(items, productoId);
        }
        items = items.map((item: ItemPedido) => {
          if (productoId === item.producto.id) {
            item.cantidad = cantidad;
          }
          return item;
        });

        return items */
    if (cantidad === 0) {
      return this.deleteItemFromItems(items, productoId);
    }

    return items.map(item =>
      item.producto.id === productoId
        ? { ...item, cantidad }
        : item
    );
  }

  UpdateCostItemFromItemsProveedor(items: Array<ItemPedido>, productoId: number, costo: number): Array<ItemPedido> {
    return items.map(item =>
      item.producto.id === productoId
        ? { ...item, importe: costo }
        : item
    );
  }

  UpdatePrecioItemFromItemsCliete(items: Array<ItemPedido>, productoId: number, precio: number): Array<ItemPedido> {
    /*     items = items.map((item: ItemPedido) => {
          if (productoId === item.producto.id) {
            item.importe = precio;
          }
          return item;
        });

        return items */
    return items.map(item =>
      item.producto.id === productoId
        ? { ...item, importe: precio }
        : item
    );
  }

  UpdateDescripcionItemFromItemsCliete(items: Array<ItemPedido>, productoId: number, descripcion: string): Array<ItemPedido> {
    /*     items = items.map((item: ItemPedido) => {
          if (productoId === item.producto.id) {
            item.descripcion = descripcion;
          }
          return item;
        });

        return items */
    return items.map(item =>
      item.producto.id === productoId
        ? { ...item, descripcion }
        : item
    );
  }

  UpdateAmountItemFromExterno(items: Array<ItemPedido>, productoId: number, cantidad: number): Array<ItemPedido> {
    /*     items = items.map((item: ItemPedido) => {
          if (productoId === item.producto.id) {
            item.cantidad += cantidad;
            if (item.cantidad > item.producto.maxCantidadPedido) {
              item.cantidad -= cantidad;
            }
          }
          return item;
        });
        return items */
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

  /*  UpdateImageItemFromExterno(items: Array<ItemPedido>, productoId: number, imagen: string): Array<ItemPedido> {
     items = items.map((item: ItemPedido) => {
       if (productoId === item.producto.id) {
         item.imagen = imagen;
       }
       return item;
     });

     return items
   } */


  deleteItemFromItems(items: Array<ItemPedido>, productoId: number): Array<ItemPedido> {
    //const indice = findIndex(items, (item: ItemPedido) => item.producto.id === productoId);
    //return items.splice(indice, 1) ? items : [];
    return items.filter(item => item.producto.id !== productoId);

  }

  importePorMargenCantidad(items: ItemPedido[]) {
    console.log('aqui', items)
    return items.map(item => {

      let precioAplicado = 0;
      for (let margen of item.producto.margenesProducto) {
        if (
          margen.maxCantidad &&
          item.cantidad >= margen.minCantidad &&
          item.cantidad <= margen.maxCantidad
        ) {
          precioAplicado = margen.precioNeto;
        }

        if (
          !margen.maxCantidad &&
          item.cantidad >= margen.minCantidad
        ) {
          precioAplicado = margen.precioNeto;
        }
      }

      return {
        ...item,
        importe: item.cantidad * precioAplicado,
        producto: {
          ...item.producto,
          precioMasBajoProductoShow: precioAplicado
        }
      };
    });
    /*
        console.log("aqui",items);
        return items.map(item => {
          for (let margen of item.producto.margenesProducto) {
            if (margen.maxCantidad &&
              (item.cantidad >= margen.minCantidad) &&
              (item.cantidad <= margen.maxCantidad)) {
              item.producto.precioMasBajoProductoShow = margen.precioNeto;
              item.importe = item.cantidad * margen.precioNeto;
            }
            if (!margen.maxCantidad &&
              (item.cantidad >= margen.minCantidad)) {
              item.producto.precioMasBajoProductoShow = margen.precioNeto;
              item.importe = item.cantidad * margen.precioNeto;
            }
          }
          return item;
        }) */
  }

  //cacula el total del un array de tipo items
  calculateTotalFromItems(items: Array<ItemPedido>): number {
    let total = 0
    return total = items.reduce((n, item) => n + item.importe, 0);
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
