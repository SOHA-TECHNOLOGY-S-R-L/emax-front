import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, computed, effect, EventEmitter, inject, input, Output, Signal } from '@angular/core';
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
import { ChatUtils } from '../../../../utils/chat-utils';
import { FormUtils } from '../../../../utils/form-utils';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { VerMultimediaProductoComponent } from "../../../compartido/ver-multimedia-producto/ver-multimedia-producto.component";
import { MultimediaProductoService } from './../../../../services/multimedia-producto.service';

@Component({
  selector: 'customize-item-producto-to-client',
  templateUrl: './customize-item-producto-to-client.component.html',
  styleUrl: './customize-item-producto-to-client.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, UpperCasePipe, VerMultimediaProductoComponent]

})
export class CustomizeItemProductoToClientComponent {
  public multimediaHttpService = inject(MultimediaHttpService);
  private multimediaProductoService = inject(MultimediaProductoService);
  private formBuilder = inject(FormBuilder);
  private itemService = inject(ItemService);
  public authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);

  //readonly dialog = inject(MatDialog);

  @Output() clickVerCarrito = new EventEmitter();

  producto = input.required<Producto>();
  gruposDe = computed(() => this.producto().gruposDe);
  minCantidadPedido = computed(() => this.producto().minCantidadPedido);
  maxCantidadPedido = computed(() => this.producto().maxCantidadPedido);
  estadoProductoColor = computed(() => COLOR_ESTADO_PRODUCTO[('' + this.producto().estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO])
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  readonly multimediasFromProducto = rxResource({
    params: () => {
      const p = this.producto();
      return { productoId: p.id };
    },
    stream: ({ params }) =>
      this.multimediaProductoService.multimediasProductoByProductoId(
        params.productoId
      ),
  });

  setCantidad = effect(() => {
    const producto = this.producto();
    if (!producto) return;
    this.frm.get('cantidad')!.setValue(this.minCantidadPedido());
  });

  //itemServiceSuscription$!: Subscription;
  item = new ItemPedido()

  readonly items = toSignal(
    this.itemService.getItems(),
    { initialValue: [] }
  );

  frm = this.formBuilder.group({
    // imagenProducto: [],
    descripcion: [''],
    cantidad: [0]
  })

  // Creamos un Signal (Angular Moderno) que nos diga si es móvil
  // Detecta Handset (celulares) en Portrait o Landscape
  public isMobile: Signal<boolean> = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  formUtils = FormUtils;
  chatUtils = ChatUtils;


  constructor() { }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  deleteItem(items: ItemPedido[], productoId: number) {
    this.itemService.setItems(this.itemService.deleteItemFromItems(items, productoId));
    //this.itemService.saveLocalStorageItems(items);
  }

  addItem(items: ItemPedido[], item: ItemPedido) {
    this.itemService.setItems([...items, { ...item }])
    //this.itemService.saveLocalStorageItems(items);
  }

  sendOneItemProducto() {
    const items = this.items();
    const mp = this.multimediasFromProducto.value()
    if (!mp) {
      this.item.imagenShow = 'no-imagen.png'
    }
    else {
      //para item siempre se muestra una imagen y no video
      const primerElemento = mp.find(mp => mp.multimedia.mimeType.startsWith('image'))
      this.item.imagenShow = primerElemento ? this.API_URL_VER_IMAGEN.concat(primerElemento.multimedia.nombre) : 'no-imagen.png';
    }
    this.item.cantidad = this.frm.get('cantidad')!.value ?? 0;
    this.item.descripcion = this.frm.get('descripcion')!.value ?? '';
    if (this.itemService.existItemInItems(items, this.producto().id)) {
      this.itemService.setItems(
        this.itemService.UpdateAmountItemFromExterno(items, this.producto().id, this.item.cantidad)
      );
      //this.itemService.saveLocalStorageItems(this.items);

    } else if (this.item.cantidad <= this.producto().maxCantidadPedido) {
      const item = {
        ...this.item,
        producto: this.producto()
      }
      this.itemService.setItems([...items, { ...item }]);
    } else { return }

    if (this.isMobile()) {
      this.clickVerCarrito.emit()
    }
  }

  chatear(producto: Producto) {
    const url = encodeURI(`${environment.apiFront}/tienda/productos-categoria/${producto.categoria?.nombre}/item-producto-persona-online/${producto.codigo}`);
    this.chatUtils.infoFromEmpleadoVenta(url);
  }
}
