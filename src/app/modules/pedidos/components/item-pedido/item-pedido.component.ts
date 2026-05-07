import { ENVIO_DEPARTAMENTO, ENVIO_DISTRITO, ENVIO_PROVINCIA, PEDIDO_COMPRA, PEDIDO_VENTA } from './../../../../constants/constantes';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ItemPedido } from '../../../../models/item-pedido';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';
import { ItemService } from '../../../../services/item.service';
import { ProductoService } from '../../../../services/producto.service';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { EnvioPedido } from '../../../../models/envio-pedido';

@Component({
  selector: 'app-item-pedido',
  standalone: true,
  templateUrl: './item-pedido.component.html',
  styleUrl: './item-pedido.component.css',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PrimeNgModule, StringToTitleWithAccents]

})
export class ItemPedidoComponent {
  productoService = inject(ProductoService);
  itemService = inject(ItemService)
  inEnvioPedido = input<EnvioPedido | undefined>(undefined)
  envioPedido = signal<EnvioPedido | undefined>(undefined);
  inTipoPedidoId = input.required<number>()
  coloresResource = rxResource({ stream: () => this.productoService.getColoresProducto() });
  materialesResource = rxResource({ stream: () => this.productoService.getMaterialesProducto() });
  serviciosEnvioResource = rxResource({ stream: () => this.productoService.getLstProductoServicioEnvio() });
  serviciosEnvio = computed(() => this.serviciosEnvioResource.value() ?? []);
  rawItems = toSignal(this.itemService.getItems(), { initialValue: [] });
  items = computed(() => {
    let newItems: ItemPedido[] = []
    if (this.inTipoPedidoId() === PEDIDO_VENTA) {
      const hayEnvio = this.envioPedido()
      if (hayEnvio) {
        newItems = [...this.itemService.importeDeMargenCantidad(this.checkAddServicioEnvio(hayEnvio.formaEnvio)!)];
      } else {
        newItems = [... this.itemService.importeDeMargenCantidad(this.checkDeleteServicioEnvio())];
        //this.itemService.setItems(nuevosItems);
      }
    } else {
      //return this.itemService.importeDeCostoCantidad(this.rawItems());//SI ES PEDIDO COMPRA
      newItems = [...this.rawItems()];//SI ES PEDIDO COMPRA
    } return newItems;//SI ES PEDIDO COMPRA
  })

  total = computed(() => this.itemService.calculateTotalFromItems(this.items()));
  PEDIDO_VENTA = PEDIDO_VENTA
  PEDIDO_COMPRA = PEDIDO_COMPRA
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  SERVICIO_ENVIO_DISTRITO = ENVIO_DISTRITO;
  SERVICIO_ENVIO_PROVINCIA = ENVIO_PROVINCIA;
  SERVICIO_ENVIO_DEPARTAMENTO = ENVIO_DEPARTAMENTO;
  outItems = output<ItemPedido[]>();
  codigoDescuento = signal<string>('')

  setExisteEnvio = effect(() => {
    const inEnvio = this.inEnvioPedido();
    this.envioPedido.set(inEnvio)
  });

  constructor() {
    effect(() => {
      const items = this.items();
      //if (items.length > 0) {
      this.outItems.emit(items);
      //}
    });
  }
  checkDeleteServicioEnvio() {
    const itemsActuales = this.rawItems();
    const serviciosEnvio = this.serviciosEnvio();
    let nuevosItems = itemsActuales;
    serviciosEnvio.forEach(servicio => {
      if (this.itemService.existItemInItems(nuevosItems, servicio.id)) {
        nuevosItems = this.itemService.deleteItemFromItems(
          nuevosItems,
          servicio.id
        );
      }
    });
    return nuevosItems;
  }

  eliminarItemPedido(item: ItemPedido): void {
    const prod = item.producto
    const updated = this.itemService.deleteItemFromItems(this.items(), prod.id);
    this.itemService.setItems(updated);

    if (prod.codigo === this.SERVICIO_ENVIO_DISTRITO
      || prod.codigo === this.SERVICIO_ENVIO_PROVINCIA
      || prod.codigo === this.SERVICIO_ENVIO_DEPARTAMENTO) {
      this.envioPedido.set(undefined);
    }
    //this.itemService.saveLocalStorageItems(this.items);
  }

  actualizarDescripcion(productoId: number, event: any): void {
    const descripcion: string = event.target.value;
    const updated = this.itemService.UpdateDescripcionItemFromItemsCliete(this.items(), productoId, descripcion);
    this.itemService.setItems(updated);
    //this.itemService.saveLocalStorageItems(this.items);
  }

  actualizarCantidad(productoId: number, event: any): void {
    const cantidad: number = parseInt(event.target.value);
    const updated = this.itemService.UpdateAmountItemFromItems(this.items(), productoId, cantidad);
    this.itemService.setItems(updated);
    //this.itemService.saveLocalStorageItems(this.items);
  }

  //actualizarImporte(productoId: number, event: any): void {
  /*actualiza el precio en items
  despues de grabar en aray de setitems modifica nuevamente rawitems
  vuelve entrar al método importePorMargenCantidad
  el método calcula el importe en base a los margenes del producto
  nunca cambiara el precio total
  metodo actualizarImporte no sirve para ventas
  input de subtotal(importe) en HTML no sirve debe sersolo texto en ventas*/
  //const precio: number = parseFloat(event.target.value);
  //const updated = this.itemService.UpdatePrecioItemFromItemsCliete(this.items(), productoId, precio);
  //this.itemService.setItems(updated);
  //}

  actualizarImporteWithCosto(productoId: number, event: any): void {
    const costo: number = parseFloat(event.target.value);
    const updated = this.itemService.UpdateCostItemFromItemsProveedor(this.items(), productoId, costo);
    this.itemService.setItems(updated);
    //this.itemService.saveLocalStorageItems(this.lstItemPedido);
  }


  private checkAddServicioEnvio(formaEnvio: string) {
    const itemsActuales = this.rawItems();

    let envioSelected = this.serviciosEnvio().find(ser => ser.codigo == formaEnvio);
    let envioNoSelected = this.serviciosEnvio().filter(ser => ser.codigo != formaEnvio);

    if (!envioSelected) return;
    let lstMultimediaServicioEnvio = envioSelected?.multimediasProducto
    lstMultimediaServicioEnvio = lstMultimediaServicioEnvio ?
      lstMultimediaServicioEnvio.filter(lst => lst.multimedia.mimeType.startsWith('image')) : [];


    let nuevosItems = itemsActuales;
    envioNoSelected.forEach(servicio => {
      if (this.itemService.existItemInItems(nuevosItems, servicio.id)) {
        nuevosItems = this.itemService.deleteItemFromItems(nuevosItems, servicio.id);
      }
    })
    const yaExiste = this.itemService.existItemInItems(nuevosItems, envioSelected.id);

    if (!yaExiste) {

      const nuevoItem: ItemPedido = {
        ...new ItemPedido(),
        cantidad: envioSelected.minCantidadPedido,
        descripcion: envioSelected.descripcion,
        imagenShow: lstMultimediaServicioEnvio.length > 0 ?
          this.API_URL_VER_IMAGEN.concat(
            lstMultimediaServicioEnvio[0].multimedia.nombre) : 'no-imagen.png',
        producto: { ...envioSelected }
      };

      if (nuevoItem.cantidad <= envioSelected.maxCantidadPedido) {
        nuevosItems = [...nuevosItems, nuevoItem];
      }
    }
    return nuevosItems
  };


  findColorById(colorId: number) {
    const colores = this.coloresResource.value();
    if (!colores) return null;
    const color = colores.find((c) => c.id === colorId);
    return color ? color.nombre : 'Sin color';
  }

  findMaterialById(materialId: number) {
    const materiales = this.materialesResource.value();
    if (!materiales) return null;
    const material = materiales.find((m) => m.id === materialId);
    return material ? material.nombre : 'Sin material';
  }

  ingresarCodigoDescuento(text: string) {
    this.codigoDescuento.set(text);
  }

}
