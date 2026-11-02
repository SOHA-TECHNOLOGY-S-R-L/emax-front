import { ColorDetails } from './../../../../enums/color.enum';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule, UpperCasePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  Signal
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../../constants/color-estado-producto';
import { ItemPedido } from '../../../../models/item-pedido';
import { Producto } from '../../../../models/producto';
import { AuthService } from '../../../../services/auth.service';
import { ItemService } from '../../../../services/item.service';
import { MultimediaHttpService } from '../../../../services/multimedia-http.service';
import { SnackbarService } from '../../../../services/snackbar.service';
import { ChatUtils } from '../../../../utils/chat-utils';
import { FormUtils } from '../../../../utils/form-utils';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { VerMultimediaAsignadaComponent } from '../../../compartido/ver-multimedia-asignada/ver-multimedia-asignada.component';
import { ProductoService } from './../../../../services/producto.service';
import { MargenProducto } from '../../../../models/margen-producto';

@Component({
  selector: 'customize-item-producto-to-client',
  templateUrl: './customize-item-producto-to-client.component.html',
  styleUrl: './customize-item-producto-to-client.component.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    UpperCasePipe,
    VerMultimediaAsignadaComponent
  ],
})
export class CustomizeItemProductoToClientComponent {
  public multimediaHttpService = inject(MultimediaHttpService);
  private formBuilder = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private itemService = inject(ItemService);
  //public authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private snackbar = inject(SnackbarService);

  @Output() clickVerCarrito = new EventEmitter();

  inProducto = input.required<Producto>();

  readonly productoPadre = rxResource({
    params: () => {
      const padreId = this.inProducto().padreId;

      if (padreId == null) {
        return undefined;
      }
      //if (!padreId) return null;
      return { padreId };
    },
    stream: ({ params }) => this.productoService.getProducto(params.padreId),
  });

/*   producto = computed<Producto>(() => {
    const p = this.inProducto();
    return {
      ...p,
      cantidadStock: p.padreId
        ? this.productoPadre!.value()!.cantidadStock
        : p.cantidadStock,
    };
  }); */


  producto = computed<Producto>(() => {
    const p = this.inProducto();

    if (p.padreId == null) {
      return p;
    }

    const padre = this.productoPadre.value();

    return {
      ...p,
      cantidadStock: padre?.cantidadStock ?? 0,
    };
  });

  margenes = computed<MargenProducto[]>(() => {
    const mrgn = this.producto().margenesProducto;
    const porcentajeIgv = this.producto().porcentajeIgv;
    const hoy = new Date();

    if (mrgn.length < 0) { return []; }
    return mrgn.map((m) => {
      // Convertimos las fechas a objetos Date por seguridad (si vienen como string de la API)
      const inicio = m.fechaInicioOferta ? new Date(m.fechaInicioOferta) : null;
      const fin = m.fechaFinOferta ? new Date(m.fechaFinOferta) : null;

      //const sinFechas = inicio === null && fin === null;
      const enRango = (inicio !== null && fin !== null) && (inicio <= hoy && fin >= hoy);
      const valor = m.valorUnitarioOferta > 0
      const hayOferta = (enRango) && valor;
      const igvUnitarioOferta = hayOferta ? Number((m.valorUnitarioOferta * (porcentajeIgv / 100)).toFixed(2)) : 0; //saco el 18
      const precioUnitarioOferta = hayOferta ? Number((m.valorUnitarioOferta * ((100 + porcentajeIgv) / 100)).toFixed(2)) : 0;
      return {
        ...m,
        igvUnitarioOferta: igvUnitarioOferta,
        precioUnitarioOferta: precioUnitarioOferta
        //hayOferta: hayOferta  Se asigna true o false dinámicamente
      };
    });
  });

  /*   colorProductoResource = rxResource({
      params: () => {
        const colorId = this.inProducto().colorId;
        if (!colorId) return null;
        return { colorId };
      },
      stream: ({ params }) =>
        this.productoService.getColorProducto(params!.colorId),
    }); */

  materialProductoResource = rxResource({
    params: () => {
      const materialId = this.inProducto().materialId;
      if (!materialId) return null;
      return { materialId };
    },
    stream: ({ params }) =>
      this.productoService.getMaterialProducto(params!.materialId),
  });

  gruposDe = computed(() => this.producto().gruposDe);
  minCantidadPedido = computed(() => this.producto().minCantidadPedido);
  maxCantidadPedido = computed(() => this.producto().maxCantidadPedido);
  estadoProductoColor = computed(
    () =>
      COLOR_ESTADO_PRODUCTO[
      ('' +
        this.producto().estadoProducto
          .id) as keyof typeof COLOR_ESTADO_PRODUCTO
      ],
  );
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  setCantidad = effect(() => {
    const producto = this.producto();
    if (!producto) return;
    this.frm.get('cantidad')!.setValue(this.minCantidadPedido());
  });

  //itemServiceSuscription$!: Subscription;
  item = new ItemPedido();

  readonly items = toSignal(this.itemService.getItems(), { initialValue: [] });

  frm = this.formBuilder.group({
    descripcion: [''],
    cantidad: [0],
  });

  // Creamos un Signal (Angular Moderno) que nos diga si es móvil
  // Detecta Handset (celulares) en Portrait o Landscape
  public isMobile: Signal<boolean> = toSignal(
    this.breakpointObserver
      .observe('(max-width: 1279.98px)')
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  formUtils = FormUtils;
  chatUtils = ChatUtils;
  colorDetails = ColorDetails;


  //hoy = signal<Date>(new Date());

  /*   hayOferta = computed<boolean>(() => {
      const pr = this.producto();
      if ((pr.margen.fechaInicioOferta == null && margen.fechaFinOferta == null)
        || margen.fechaInicioOferta <= hoy() && margen.fechaFinOferta >= hoy()) {
        <span class="precio" > {{ margen.precioUnitarioOferta | currency: 'PEN' }
      } </span>
    }
    }) */


  private idIntervalo: any;


  constructor() { }

  /*   ngOnInit(): void {
      this.idIntervalo = setInterval(() => {
        this.hoy.set(new Date());
      }, 1000);
    } */

  /*   isAuthenticated(): boolean {
      return this.authService.isAuthenticated();
    } */

  deleteItem(items: ItemPedido[], productoId: number) {
    this.itemService.setItems(
      this.itemService.deleteItemFromItems(items, productoId),
    );
    //this.itemService.saveLocalStorageItems(items);
  }

  addItem(items: ItemPedido[], item: ItemPedido) {
    this.itemService.setItems([...items, { ...item }]);
    //this.itemService.saveLocalStorageItems(items);
  }

  sendOneItemProducto() {
    const pr = {
      ...this.producto(),
      margenesProducto: [... this.margenes()]

    }
    const cantidadToCarrito = this.frm.get('cantidad')!.value ?? 0;

    if (cantidadToCarrito > pr.cantidadStock) {
      this.snackbar.warning('Disponible del producto insuficiente');
      return;
    }

    if (cantidadToCarrito > pr.maxCantidadPedido) {
      this.snackbar.warning(
        `La cantidad ${cantidadToCarrito} supera el máximo permitido`,
      );
      return;
    }

    if (cantidadToCarrito < pr.minCantidadPedido) {
      this.snackbar.warning(
        `La cantidad ${cantidadToCarrito} es menor a la mínima permitida`,
      );
      return;
    }

    const items = this.items();
    const mp = this.producto().multimediasAsignada;
    if (!mp) {
      this.item.imagenShow = 'no-imagen.png';
    } else {
      //para item siempre se muestra una imagen y no video
      const primerElemento = mp.find((mp) => mp.multimedia.mimeType.startsWith('image'));
      this.item.imagenShow = primerElemento ? this.API_URL_VER_IMAGEN.concat(primerElemento.multimedia.nombre) : 'no-imagen.png';
    }

    this.item.cantidad = cantidadToCarrito;
    this.item.descripcion = this.frm.get('descripcion')!.value ?? '';

    if (this.itemService.existItemInItems(items, pr.id)) {
      this.itemService.setItems(
        this.itemService.UpdateAmountItemFromExterno(items, pr.id, this.item.cantidad)
      );
      //this.itemService.saveLocalStorageItems(this.items);
    } else if (this.item.cantidad <= pr.maxCantidadPedido) {
      const item = {
        ...this.item,
        producto: pr,
      };
      this.itemService.setItems([...items, { ...item }]);
    } else {
      return;
    }

    if (this.isMobile()) {
      this.clickVerCarrito.emit();
    }
  }

  chatear(producto: Producto) {
    const url = encodeURI(
      `${environment.apiFront}/tienda/productos-categoria/${producto.categoria?.nombre}/item-producto-persona-online/${producto.codigo}`,
    );
    this.chatUtils.infoFromEmpleadoVenta(url);
  }

  /*   ngOnDestroy(): void {
      if (this.idIntervalo) {
        clearInterval(this.idIntervalo);
      }
    } */
}
