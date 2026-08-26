import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import moment from 'moment';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PEDIDO_COMPRA } from '../../../../constants/constantes';
import { ItemPedido } from '../../../../models/item-pedido';
import { Pedido } from '../../../../models/pedido';
import { Producto } from '../../../../models/producto';
import { AuthService } from '../../../../services/auth.service';
import { ItemService } from '../../../../services/item.service';
import { PedidoService } from '../../../../services/pedido.service';
import { ProductoService } from '../../../../services/producto.service';
import { SnackbarService } from '../../../../services/snackbar.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { AutocompleteResourceComponent } from '../../../compartido/autocomplete-resource/autocomplete-resource.component';
import { ItemPedidoComponent } from "../../components/item-pedido/item-pedido.component";
import { Persona } from '../../../../models/persona';

@Component({
  selector: 'item-producto-proveedor-tienda',
  templateUrl: './item-producto-proveedor-tienda.component.html',
  styleUrl: './item-producto-proveedor-tienda.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, AutocompleteResourceComponent, ItemPedidoComponent]

})
export class ItemProductoProveedorTiendaComponent {

  private productoService = inject(ProductoService);
  private pedidoService = inject(PedidoService);
  public authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  personaId = toSignal<number>(
    this.activatedRoute.paramMap.pipe(map((r) => Number(r.get('personaId')!))),
  );
  coloresResource = rxResource({ stream: () => this.productoService.getColoresProducto() });
  //materialesResource = rxResource({ stream: () => this.productoService.getMaterialesProducto() });
  producto = signal<Producto | null>(null);
  //envioPedido = signal<EnvioPedido | undefined>(undefined);
  serviciosEnvioResource = rxResource({ stream: () => this.productoService.getLstProductoServicioEnvio() });
  serviciosEnvio = computed(() => this.serviciosEnvioResource.value() ?? []);
  observaciones = signal<string>('');
  fechaAdquirido = signal<string>(this.obtenerFechaDefecto());
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  item = new ItemPedido();
  pedido = signal(new Pedido());
  readonly rawItems = toSignal(this.itemService.getItems(), { initialValue: [] });
  readonly items = computed(() =>
    this.itemService.buildItems(
      this.rawItems(), undefined, this.serviciosEnvio(), environment.API_URL_VER_IMAGEN, PEDIDO_COMPRA
    )
  );

  readonly totalCosto = computed(() =>
    this.itemService.calculatePrecioCostoFromItems(this.items())
  );

  //items = signal<ItemPedido[]>([]);
  PEDIDO_COMPRA = PEDIDO_COMPRA;



  constructor() { }

  private obtenerFechaDefecto(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    //return moment(now).add(2, 'days').toISOString().slice(0, 16);
    return moment(now).toISOString().slice(0, 16);
  }

  actualizarFecha(nuevaFecha: string) {
    this.fechaAdquirido.set(nuevaFecha);
  }


  findColorById(colorId: number) {
    const colores = this.coloresResource.value();
    if (!colores) return null;
    const color = colores.find((c) => c.id === colorId);
    return color ? color.nombre : 'Sin color';
  }


  buscarProductos = (term: string) =>
    this.productoService.filtrarProductos(term);

  mostrarProducto = (producto: Producto | null) =>
    producto?.nombre ?? '';

  onProductoToItems(producto: Producto) {
    this.producto.set(producto);
    const pr = producto;

    const items = this.items();
    const mp = pr.multimediasAsignada;
    if (!mp) {
      this.item.imagenShow = 'no-imagen.png';
    } else {
      const primerElemento = mp.find((mp) =>
        mp.multimedia.mimeType.startsWith('image'),
      );
      this.item.imagenShow = primerElemento
        ? this.API_URL_VER_IMAGEN.concat(primerElemento.multimedia.nombre)
        : 'no-imagen.png';
    }
    this.item.cantidad = 1;
    this.item.precioCostoItem = 0;
    if (this.itemService.existItemInItems(items, pr.id)) {
      this.itemService.setItems(
        this.itemService.UpdateAmountItemFromExterno(
          items,
          pr.id,
          this.item.cantidad,
        ),
      );
    } else {
      const item = {
        ...this.item,
        producto: pr,
      };
      this.itemService.setItems([...items, { ...item }]);
    }
  }

  getImagenPrincipal(producto: Producto): string {

    const multimediaPrincipal = producto.multimediasAsignada?.find(
      m => m.esPrincipal
    );

    return multimediaPrincipal?.multimedia?.nombre
      ? this.API_URL_VER_IMAGEN.concat(multimediaPrincipal.multimedia.nombre)
      : 'no-imagen.png';
  }


/*   recibirItems(itemsPedido: ItemPedido[]) {
    this.items.set(itemsPedido);
  } */

  actualizarObservacion(text: string) {
    this.observaciones.set(text);
  }


  crearPedidoTienda() {

    if (!this.authService.isAuthenticated()) {
      return;
    }

    if (this.items().length === 0) return;

    const persona = new Persona();
    persona.id = this.personaId()!

    //const envioPed = this.envioPedido();
    this.pedido.update(p => ({
      ...p,
      persona: persona,
      observacion: this.observaciones(),
      //direccionEnvio: envioPed?.direccionEnvio!,
      //celularEnvio: envioPed?.celularEnvio!,
      //nomApellRzEnvio: envioPed?.nomApellRzEnvio!,
      adquiridoEn: this.fechaAdquirido(),
      items: [...this.items()],
      tipoPedidoId: PEDIDO_COMPRA,
    }));
    this.pedidoService.createPedidoTienda(this.pedido())
      .subscribe(p => {
        this.itemService.setItems([]);
        this.snackbar.success(`Pedido ${p.tipoPedido.nombre} N° ${p.id}`);
        this.router.navigate(['/pedidos/listado-compras']);
      });
  }

}
