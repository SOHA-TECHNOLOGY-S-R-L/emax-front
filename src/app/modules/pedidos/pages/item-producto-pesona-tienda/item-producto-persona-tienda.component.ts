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
import { BreakpointObserver, Breakpoints, MediaMatcher } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'item-producto-persona-tienda',
  templateUrl: './item-producto-persona-tienda.component.html',
  styleUrl: './item-producto-persona-tienda.component.css',
  standalone: true,
  imports: [CustomizeItemProductoToClientComponent, CarritoItemProductoComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, AutocompleteResourceComponent]

})
export class ItemProductoPersonaTiendaComponent {
  private productoService = inject(ProductoService);
  private breakpointObserver = inject(BreakpointObserver);

  producto = signal<Producto | null>(null);
  items = signal<ItemPedido[]>([]);

  readonly isMobile = toSignal(
    /*Breakpoint	Media Query
      XSmall(max - width: 599.98px)
      Small(min - width: 600px) and(max - width: 959.98px)
      Medium(min - width: 960px) and(max - width: 1279.98px)
      Large(min - width: 1280px) and(max - width: 1919.98px)
      XLarge(min - width: 1920px)*/
    this.breakpointObserver.observe(Breakpoints.Large)
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

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
