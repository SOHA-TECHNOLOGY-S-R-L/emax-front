import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, input, Output, output, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { ItemPedido } from '../../../../models/item-pedido';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { ItemService } from '../../../../services/item.service';
import { MultimediaHttpService } from '../../../../services/multimedia-http.service';
import { PersonaService } from '../../../../services/persona.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { ProductoService } from './../../../../services/producto.service';
import { BreakpointObserver, Breakpoints, MediaMatcher } from '@angular/cdk/layout';


@Component({
  selector: 'carrito-item-producto',
  templateUrl: './carrito-item-producto.component.html',
  styleUrl: './carrito-item-producto.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PrimeNgModule, StringToTitleWithAccents]

})
export class CarritoItemProductoComponent {
  router = inject(Router);
  public authService = inject(AuthService);
  itemService = inject(ItemService)
  productoService = inject(ProductoService)
  personaService = inject(PersonaService);
  usuarioService = inject(UsuarioService);
  multimediaHttpService = inject(MultimediaHttpService);
  alertService = inject(AlertService);
  private breakpointObserver = inject(BreakpointObserver);

  itemServiceSuscription$!: Subscription;
  tipoPedidoId = input.required<number>();
  // isEnvio = signal<boolean>(false);

  //@Output() clickOcultarCarrito = new EventEmitter();


  readonly items = toSignal(
    this.itemService.getItems(),
    { initialValue: [] as ItemPedido[] }
  );

  readonly lstItemPedido = computed<ItemPedido[]>(() => {
    const items = this.itemService.importePorMargenCantidad([...this.items()])
    return items
  }
  );

  readonly total = computed(() =>
    this.itemService.calculateTotalFromItems(this.lstItemPedido())
  );

  item!: ItemPedido;

  modalEmitter = output<void>();

  // Creamos un Signal (Angular Moderno) que nos diga si es móvil
  // Detecta Handset (celulares) en Portrait o Landscape
/*   public isMobile: Signal<boolean> = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );
 */

  constructor() { }



  actualizarCantidad(productoId: number, event: any): void {
    const cantidad = Number((event.target as HTMLInputElement).value);
    const nuevosItems = this.itemService.UpdateAmountItemFromItems([...this.lstItemPedido()], productoId, cantidad);
    this.itemService.setItems(nuevosItems);
  }

  eliminarItemPedido(item: ItemPedido): void {
    const nuevosItems = this.itemService.deleteItemFromItems([...this.lstItemPedido()], item.producto.id);
    this.itemService.setItems(nuevosItems);
  }

  irRealizarPedido() {
    this.router.navigate(['/tienda/pedido-persona-online-finalizado', this.tipoPedidoId()]);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  seguirComprando() {
   // this.clickOcultarCarrito.emit();
    this.router.navigate(['/tienda/productos-categoria', 'tienda']);
  }

  closeModal() {
    this.modalEmitter.emit();
  }
}
