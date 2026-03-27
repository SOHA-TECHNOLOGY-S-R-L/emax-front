import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, input, Output, output, Signal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { map, of, Subscription } from 'rxjs';
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
import { Pedido } from '../../../../models/pedido';
import { PedidoService } from '../../../../services/pedido.service';
import { COTIZACION_VENTA } from '../../../../constants/constantes';


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
  pedidoService = inject(PedidoService);
  private breakpointObserver = inject(BreakpointObserver);

  itemServiceSuscription$!: Subscription;
  cotizacion = signal(new Pedido());

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

  readonly usuarioResource = rxResource({
    params: () => this.authService.usuario(),
    stream: ({ params }) => {
      if (!params?.username) return of(null);
      return this.usuarioService.getUsuarioByUsername(params.username);
    }
  });

  readonly personaResource = rxResource({
    params: () => this.usuarioResource.value(),
    stream: ({ params }) => {
      if (!params?.id) return of(null);
      return this.personaService.getPersonaByUsuarioId(params.id);
    }
  });

  readonly isCliente = computed(() => {
    const persona = this.personaResource.value();
    if (!persona) return true;

    return !persona.tipoPersona.persona.startsWith('Empleado');
  });

  readonly isAutenticado = computed(() =>
    this.authService.isAuthenticated()
  );

  btnNombre = computed(() => {
    if (!this.isAutenticado() || this.isCliente()) {
      return 'Seguir comprando';
    }
    return 'Buscar productos';
  })

  tipoPedidoCotizacionVentaResource = rxResource({ stream: () => this.pedidoService.getTipoPedido(COTIZACION_VENTA) });


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
    //this.router.navigate(['/tienda/pedido-persona-online-finalizado', this.tipoPedidoId()]);

    // 3-VENTA POR TIENDA -->
    // 4-VENTA POR online -->
    if (!this.isAutenticado() || this.isCliente()) {
      this.router.navigate(['/tienda/pedido-persona-online-finalizado', 4]);

      // this.router.navigate(['/tienda/productos-categoria', 'tienda']);
      return;
    }

    this.router.navigate(['/tienda/pedido-persona-online-finalizado', 3]);

    /*     if (this.authService.hasRole('ROLE_REGISTER_VENTA')) {
          this.router.navigate(['pedidos/item-producto-persona-tienda']);
        } else {
          this.alertService.info("Usuario sin permisos para venta al cliente", "Ir a tienda")
        } */

  }



  seguirComprando() {
    if (!this.isAutenticado() || this.isCliente()) {
      this.router.navigate(['/tienda/productos-categoria', 'tienda']);
      return;
    }

    if (this.authService.hasRole('ROLE_REGISTER_VENTA')) {
      this.router.navigate(['pedidos/item-producto-persona-tienda']);
    } else {
      this.alertService.info("Usuario sin permisos para venta al cliente", "Ir a tienda")
    }
  }

  generarCotizacion() {
    if (!this.isAutenticado()) {
      this.alertService.info("Iniciar sesion para imprimir cotizacion", "Cotización")
      return;
    }
    const persona = this.personaResource.value();
    this.cotizacion.update(p => ({
      ...p,
      persona: persona!,
      //observacion: this.observaciones(),
      //entregadoEn: this.fechaEntrega(),
      items: [...this.lstItemPedido()],
      precioNetoTotal: this.total(),
      tipoPedido: this.tipoPedidoCotizacionVentaResource.value()!
    }));

    this.pedidoService.downloadOrderToPersonaInPDF(this.cotizacion())
      .subscribe(response => {

        const blob = response.body;
        if (!blob) return;

        const url = window.URL.createObjectURL(blob);
        const ventana = window.open(url);

        if (!ventana) {
          console.error('El navegador bloqueó la ventana emergente');
          return;
        }

        // Esperar a que cargue el PDF y luego imprimir
        const intervalo = setInterval(() => {
          try {
            if (ventana.document.readyState === 'complete') {
              clearInterval(intervalo);
              ventana.focus();
              ventana.print();
            }
          } catch (e) {
            // Evita error por cross-origin mientras carga
          }
        }, 500);

        /*        fileSaver.saveAs(response.body!,
                 this.pedidoService.filenameFromHeader(response.headers)) //utilidad pra qeu descargue automaticamente
               if (this.isFromPedidos) {
                 this.router.navigate(['/pedidos/listado-ventas'])
               };
               this.alertService.success(`Se realizó la  ${this.pedido.tipoPedido.nombre} exitosamente`, "Exito"); */
      })
  }


  closeModal() {
    this.modalEmitter.emit();
  }
}
