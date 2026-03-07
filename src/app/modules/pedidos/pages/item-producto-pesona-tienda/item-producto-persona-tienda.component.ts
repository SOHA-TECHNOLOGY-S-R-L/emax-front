import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ItemPedido } from '../../../../models/item-pedido';
import { Producto } from '../../../../models/producto';
import { ProductoService } from '../../../../services/producto.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { AutocompleteResourceComponent } from '../../../compartido/autocomplete-resource/autocomplete-resource.component';
import { CarritoItemProductoComponent } from '../../components/carrito-item-producto/carrito-item-producto.component';
import { CustomizeItemProductoToClientComponent } from '../../components/customize-item-producto-to-client/customize-item-producto-to-client.component';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'item-producto-persona-tienda',
  templateUrl: './item-producto-persona-tienda.component.html',
  styleUrl: './item-producto-persona-tienda.component.css',
  standalone: true,
  imports: [CustomizeItemProductoToClientComponent, CarritoItemProductoComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, AutocompleteResourceComponent]

})
export class ItemProductoPersonaTiendaComponent {
  private productoService = inject(ProductoService);

  producto = signal<Producto | null>(null);
  items = signal<ItemPedido[]>([]);

  /******propeidades para el drawner container**********/
  // 2 propiedades
  // El constructor
  // El ondestroy
  //mobileQuery: MediaQueryList;
  //private _mobileQueryListener: () => void;
  protected readonly isMobile = signal(true);

  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;
  constructor() {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
  /**************************************************/

  buscarProductos = (term: string) =>
    this.productoService.filtrarProductos(term);

  mostrarProducto = (producto: Producto) =>
    producto.nombre

  onProductoSeleccionado(producto: Producto) {
    this.producto.set(producto);
    const nuevoItem = new ItemPedido();
    nuevoItem.producto = producto;
    this.items.update(items => [...items, nuevoItem]);

  }





}
