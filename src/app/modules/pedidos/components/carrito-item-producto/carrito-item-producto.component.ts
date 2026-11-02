import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, output, Signal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { map, of, Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TipoPedidoEnum } from '../../../../enums/tipo-pedido.enum';
import { TipoPersonaEnum } from '../../../../enums/tipo-persona.enum';
import { EnvioPedido } from '../../../../models/envio-pedido';
import { ItemPedido } from '../../../../models/item-pedido';
import { Pedido } from '../../../../models/pedido';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { ItemService } from '../../../../services/item.service';
import { MultimediaHttpService } from '../../../../services/multimedia-http.service';
import { PedidoService } from '../../../../services/pedido.service';
import { PersonaService } from '../../../../services/persona.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { construirPedidoRequest } from '../../../../utils/build-pedido';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { ProductoService } from './../../../../services/producto.service';


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
  envioPedido = signal<EnvioPedido | undefined>(undefined);
  serviciosEnvioResource = rxResource({ stream: () => this.productoService.getLstProductoServicioEnvio() });
  serviciosEnvio = computed(() => this.serviciosEnvioResource.value() ?? []);

  readonly rawItems = toSignal(
    this.itemService.getItems(), { initialValue: [] }
  );

  readonly items = computed(() =>
    this.itemService.buildItems(
      this.rawItems(), this.envioPedido(), this.serviciosEnvio(), environment.API_URL_VER_IMAGEN, TipoPedidoEnum.VENTA
    )
  );

  readonly totalImporteBruto = computed(() =>
    this.itemService.calculateImporteBrutoFromItems(this.items())
  );

  readonly totalImporteOfertaDescuento = computed(() =>
    this.itemService.calculateDescuentoPorOfertayCuponFromItems(this.items())
  );

  readonly totalImporteNeto = computed(() =>
    this.itemService.calculateImporteNetoFromItems(this.items())
  );

  readonly totalIgv = computed(() =>
    this.itemService.calculateIgvFromItems(this.items())
  );

  readonly totalPrecio = computed(() =>
    this.itemService.calculatePrecioCostoFromItems(this.items())
  );

  readonly isAutenticado = computed(() =>
    this.authService.isAuthenticated()
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

    return persona.tipoPersona === TipoPersonaEnum.CLIENTE_PROVEEDOR;
  });



  btnNombre = computed(() => {
    if (/*!this.isAutenticado() ||*/ this.isCliente()) {
      return 'Seguir comprando';
    }
    return 'Buscar productos';
  })

  //tipoPedidoCotizacionVentaResource = rxResource({ stream: () => this.pedidoService.getTipoPedido(TipoPedido.COTIZACION_VENTA) });


  item!: ItemPedido;

  modalEmitter = output<void>();
  clickBuscarProductos = output<void>();
  //@Output() clickBuscarProductos = new EventEmitter();

  public isMobile: Signal<boolean> = toSignal(
    this.breakpointObserver
      .observe('(max-width: 1279.98px)')
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );



  constructor() { }



  actualizarCantidad(productoId: number, event: any): void {
    const cantidad = Number((event.target as HTMLInputElement).value);
    const nuevosItems = this.itemService.UpdateAmountItemFromItems([...this.items()], productoId, cantidad);
    this.itemService.setItems(nuevosItems);
  }

  eliminarItemPedido(item: ItemPedido): void {
    const nuevosItems = this.itemService.deleteItemFromItems([...this.items()], item.producto.id);
    this.itemService.setItems(nuevosItems);
  }

/*   irRealizarPedido() {
    if (!this.isAutenticado() || this.isCliente()) {
      this.router.navigate(['/tienda/pedido-persona-online-finalizado', OrigenPedidoEnum.ONLINE]);
      return;
    }
    this.router.navigate(['/tienda/pedido-persona-online-finalizado', OrigenPedidoEnum.TIENDA_FISICA]);
  } */



  seguirComprando() {
/*     if (!this.isAutenticado() || this.isCliente()) {
      this.router.navigate(['/tienda/productos-categoria', 'tienda']);
      return;
    } */

    if (this.isCliente()) {
      this.router.navigate(['/tienda/productos-categoria', 'tienda']);
      return;
    }

    if (this.authService.hasRole('ROLE_REGISTER_VENTA')) {
      this.router.navigate(['pedidos/item-producto-persona-tienda']);
      if (this.isMobile()) {
        this.clickBuscarProductos.emit();
      }
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
      items: [...this.items()],
      //precioBrutoTotal: this.subTotal(),
      descuentoPorOfertaTotal: this.totalImporteOfertaDescuento(),
      precioTotal: this.totalPrecio(),
      tipoPedido: TipoPedidoEnum.COTIZACION_VENTA
    }));


    this.pedidoService.downloadOrderToPersonaInPDF(construirPedidoRequest(this.cotizacion()))
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
