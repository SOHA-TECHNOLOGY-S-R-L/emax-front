import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { findIndex } from 'lodash-es';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SERVICIO_ENTREGA_CIUDAD, SERVICIO_ENTREGA_LOCAL } from '../../../../constants/constantes';
import { Cliente } from '../../../../models/cliente';
import { ItemPedido } from '../../../../models/item-pedido';
import { Pedido } from '../../../../models/pedido';
import { Producto } from '../../../../models/producto';
import { TipoDocumento } from '../../../../models/tipo-documento';
import { TipoPedido } from '../../../../models/tipo-pedido';
import { AuthService } from '../../../../services/auth.service';
import { ClienteService } from '../../../../services/cliente.service';
import { ItemService } from '../../../../services/item.service';
import { PedidoService } from '../../../../services/pedido.service';
import { ProductoService } from '../../../../services/producto.service';
import { ChatUtils } from '../../../../utils/chat-utils';
import { FormUtils } from '../../../../utils/form-utils';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { SERVICIO_DISENIO, SERVICIO_SUBLIMACION } from '../../../../constants/constantes';

@Component({
  selector: 'pedido-cliente-online-finalizado',
  templateUrl: './pedido-cliente-online-finalizado.component.html',
  styleUrl: './pedido-cliente-online-finalizado.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PrimeNgModule]

})
export class PedidoClienteOnlineFinalizadoComponent implements OnInit {
  public authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private clienteService = inject(ClienteService);
  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private router = inject(Router);
  itemService = inject(ItemService)
  itemServiceSuscription$!: Subscription;
  cliente!: Cliente;
  pedido = new Pedido();
  tipoDocumentos: TipoDocumento[] = [];
  tipoDocumentoSelected!: TipoDocumento;
  tipoPedidoVentaClientes!: TipoPedido;
  tipoPedidos: TipoPedido[] = [];
  items: ItemPedido[] = [];
  item = new ItemPedido();
  serviciosEnvio: Producto[] = [];
  formUtils = FormUtils;
  chatUtils = ChatUtils;
  total: number = 0;
  //clienteOnline!: boolean;
  isEnvio: boolean = false;
  formaEnvio!: string;
  SERVICIO_ENTREGA_LOCAL = SERVICIO_ENTREGA_LOCAL;
  SERVICIO_ENTREGA_CIUDAD = SERVICIO_ENTREGA_CIUDAD;
  SERVICIO_DISENIO = SERVICIO_DISENIO;
  SERVICIO_SUBLIMACION = SERVICIO_SUBLIMACION;


  constructor() {
    this.itemServiceSuscription$ = this.itemService.getItems().subscribe({
      next: items => {
        this.items = this.itemService.importePorMargenCantidad(items);
        this.calcularTotal();
      },
      error: error => {
        console.error('Error al obtener el item:', error);
      }
    })
  }

  ngOnInit(): void {
    this.clienteService.getTipoDocumento().subscribe(doc => {
      this.tipoDocumentos = doc
    });

    this.activatedRoute.paramMap.subscribe(params => {
      let clienteId = +params.get('clienteId')!;
      this.clienteService.getCliente(clienteId).subscribe(cli => {
        const now = new Date();
        this.cliente = cli;
        const index = this.findIndexDocument(this.cliente.tipoDocumento.id);
        this.tipoDocumentoSelected = this.tipoDocumentos[index];
        this.pedido.cliente = this.cliente;
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        this.pedido.entregadoEn = moment(now).add(2, 'days').toISOString().slice(0, 16);
      });
    });

    /*     this.activatedRoute.queryParams.subscribe(params => {
          const value = params['clienteOnline'];
          this.clienteOnline = value.toLocaleLowerCase() === 'true' ? value : false;
        }) */

    //  if (this.items.length === 0) {
    //   this.items = this.itemService.importePorMargenCantidad(this.itemService.getLocalStorageItems());
    this.calcularTotal();
    // }

    this.productoService.getLstProductoServicioEnvio().subscribe(resp => {
      this.serviciosEnvio = resp
      console.log("this.serviciosEnvio", this.serviciosEnvio);

    });

    this.pedidoService.getAllTipoPedido().subscribe(result => {
      this.tipoPedidos = result
      this.tipoPedidos.forEach(r =>
        r.activo = r.id == 1 ? true : false
      )
      this.tipoPedidoVentaClientes = this.tipoPedidos[0];
    });

  }

  calcularTotal() {
    this.total = this.itemService.calculateTotalFromItems(this.items)
  }


  findIndexDocument(tipoDocumentoId: number): number {
    return findIndex(this.tipoDocumentos, (td) => td.id == tipoDocumentoId)
  }


  eliminarItemPedido(id: number): void {
    this.items = this.itemService.deleteItemFromItems(this.items, id);
    this.itemService.setItems(this.items);
    //this.itemService.saveLocalStorageItems(this.items);
  }

  actualizarDescripcion(productoId: number, event: any): void {
    const descripcion: string = event.target.value;
    this.items = this.itemService.UpdateDescripcionItemFromItemsCliete(this.items, productoId, descripcion);
    this.itemService.setItems(this.items);
    //this.itemService.saveLocalStorageItems(this.items);
  }

  actualizarCantidad(productoId: number, event: any): void {
    debugger;
    const cantidad: number = parseInt(event.target.value);
    this.items = this.itemService.UpdateAmountItemFromItems(this.items, productoId, cantidad);
    this.itemService.setItems(this.items);
    //this.itemService.saveLocalStorageItems(this.items);
  }

  actualizarImporte(productoId: number, event: any): void {
    const precio: number = parseFloat(event.target.value);
    this.items = this.itemService.UpdatePrecioItemFromItemsCliete(this.items, productoId, precio);
    this.calcularTotal();

    this.itemService.setItems(this.items);
    //this.itemService.saveLocalStorageItems(this.items);
  }

  crearPedidoTienda(pedidoTiendaForm: NgForm) {
    this.pedido.items = [...this.items];
    if (pedidoTiendaForm.form.valid && this.pedido.items.length > 0) {
      this.calcularTotal();
      this.pedido.precioNetoTotal = this.total
      this.pedido.tipoPedido = this.tipoPedidoVentaClientes
      this.pedidoService.createPedidoTienda(this.pedido).subscribe(p => {
        this.pedidoService.setPedido(p);
        //this.itemService.removeLocalStorageItems();
        //this.router.navigate(['/pedidos/contactanos']);
        this.router.navigate(['/contactanos-cliente']);

      });
    }
  }

  addItemsServicioEnvio(event: any, formaEnvio: string) {
    this.isEnvio = event.target.checked;
    let servicioSelected = this.serviciosEnvio.filter(ser => ser.codigo == formaEnvio);
    let servicioNoSelected = this.serviciosEnvio.filter(ser => ser.codigo != formaEnvio);
    this.formaEnvio = formaEnvio;

    if (this.isEnvio) {
      console.log(servicioSelected[0].minCantidadPedido);
      this.item.cantidad = servicioSelected[0].minCantidadPedido;
      this.item.descripcion = servicioSelected[0].descripcion;
      this.item.producto = { ...servicioSelected[0] };
      this.item.imagenUri = environment.API_URL_VER_IMAGEN + this.item.imagen

      if (this.itemService.existItemInItems(this.items, servicioNoSelected[0].id)) {
        this.items = this.itemService.deleteItemFromItems(this.items, this.item.producto.id);
        this.itemService.setItems(this.items);
        //this.itemService.saveLocalStorageItems(this.items);
      }

      if (!this.itemService.existItemInItems(this.items, this.item.producto.id)
        && this.item.cantidad <= this.item.producto.maxCantidadPedido) {
        this.items = [...this.items, { ...this.item }];
        this.itemService.setItems(this.items);
        //this.itemService.saveLocalStorageItems(this.items);
      }

    } else {
      this.pedido.direccionEnvio = "";
      this.pedido.celularEnvio = "";
      this.pedido.nomApellRzEnvio = "";
      this.serviciosEnvio.forEach(servicio => {
        if (this.itemService.existItemInItems(this.items, servicio.id)) {
          this.items = this.itemService.deleteItemFromItems(this.items, this.item.producto.id);
          this.itemService.setItems(this.items);
          //this.itemService.saveLocalStorageItems(this.items);
        }
      })
    }
  }

  ngOnDestroy(): void {
    if (this.itemServiceSuscription$) {
      this.itemServiceSuscription$.unsubscribe();
    }
  }


}

