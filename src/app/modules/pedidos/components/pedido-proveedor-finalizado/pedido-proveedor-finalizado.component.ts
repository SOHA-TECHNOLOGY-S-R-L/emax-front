import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { findIndex } from 'lodash-es';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
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
import { ChatUtils } from '../../../../utils/chat-utils';
import { FormUtils } from '../../../../utils/form-utils';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'pedido-proveedor-finalizado',
  templateUrl: './pedido-proveedor-finalizado.component.html',
  styleUrl: './pedido-proveedor-finalizado.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule ]

})
export class PedidoProveedorFinalizadoComponent implements OnInit, OnChanges {


  public authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private clienteService = inject(ClienteService);
  private pedidoService = inject(PedidoService);
  private router = inject(Router);
  private itemService = inject(ItemService)
  itemServiceSuscription$!: Subscription;
  cliente!: Cliente;
  pedido = new Pedido();
  item = new ItemPedido();
  lstItemPedido: ItemPedido[] = [];
  tipoDocumentos: TipoDocumento[] = [];
  tipoPedidos: TipoPedido[] = [];
  tipoDocumentoSelected!: TipoDocumento;
  tipoPedidoVentaClientes!: TipoPedido;
  @Input() producto!: Producto;
  @Input() clienteId!: number;
  formUtils = FormUtils;
  chatUtils = ChatUtils;
  total: number = 0;


  constructor() {
    /*     this.itemServiceSuscription$ = this.itemService.getItems().subscribe({
          next: items => {
            this.lstItemPedido = items;
            console.log("this.lstItemPedido", this.lstItemPedido)
            this.calcularTotal();
          },
          error: error => {
            console.error('Error al obtener el item:', error);
          }
        }) */
  }

  ngOnInit(): void {
    this.clienteService.getTipoDocumento().subscribe(doc => {
      this.tipoDocumentos = doc
    });

    this.clienteService.getCliente(this.clienteId).subscribe(cli => {
      const now = new Date();
      this.cliente = cli;
      const index = this.findIndexDocument(this.cliente.tipoDocumento.id);
      this.tipoDocumentoSelected = this.tipoDocumentos[index];
      this.pedido.cliente = this.cliente;
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      this.pedido.adquiridoEn = moment(now).toISOString().slice(0, 16);
      //this.pedido.adquiridoEn = moment(now).add(2, 'days').toISOString().slice(0, 16);
    });


    /*     this.activatedRoute.queryParams.subscribe(params => {
          const value = params['clienteOnline'];
          this.clienteOnline = value ? value.toLocaleLowerCase() === 'true' : false;
        }) */

    /*     if (this.lstItemPedido.length === 0) {
          this.lstItemPedido = this.itemService.getLocalStorageItems();
          this.calcularTotal();
        } */

    this.pedidoService.getAllTipoPedido().subscribe(result => {
      this.tipoPedidos = result
      this.tipoPedidos.forEach(r =>
        r.activo = r.id == 1 ? true : false
      )
      this.tipoPedidoVentaClientes = this.tipoPedidos[1];
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['producto'].currentValue != changes['producto'].previousValue) {

    //this.item.cantidad = (this.frm.get('cantidad')?.value ? this.frm.get('cantidad')?.value : 0)!;
    this.item.cantidad = this.producto.cantidadStock;
    this.item.importe = this.item.cantidad * this.producto.costoUnitario;
    this.item.imagen = environment.API_URL_VER_IMAGEN + this.producto.imagen
    this.item.descripcion = '';
    this.item.producto = { ...this.producto };
    if (!this.itemService.existItemInItems(this.lstItemPedido, this.producto.id)) {
      this.lstItemPedido = [...this.lstItemPedido, { ...this.item }];
    }
    this.calcularTotal();

    //this.itemService.setItems(this.items);
    //this.itemService.saveLocalStorageItems(this.items);


    /*       if (this.items.length === 0) {
            this.items = this.itemService.getLocalStorageItems()
          } */

    // this.verImagenItem = environment.API_URL_VER_IMAGEN + this.item.imagen;
    //}
  }

  findIndexDocument(tipoDocumentoId: number): number {
    return findIndex(this.tipoDocumentos, (td) => td.id == tipoDocumentoId)
  }

  calcularTotal() {
    this.total = this.itemService.calculateTotalFromItems(this.lstItemPedido)
  }

  eliminarItemPedido(id: number): void {
    this.lstItemPedido = this.itemService.deleteItemFromItems(this.lstItemPedido, id);
    this.calcularTotal();

    //this.itemService.setItems(this.lstItemPedido);
    //this.itemService.saveLocalStorageItems(this.lstItemPedido);
  }


  actualizarCantidad(productoId: number, event: any): void {
    const cantidad: number = parseInt(event.target.value);
    this.lstItemPedido = this.itemService.UpdateAmountItemFromItemsProveedor(this.lstItemPedido, productoId, cantidad);
    //this.calcularTotal();

    //this.itemService.setItems(this.lstItemPedido);
    //this.itemService.saveLocalStorageItems(this.lstItemPedido);
  }

  actualizarImporte(productoId: number, event: any): void {
    const costo: number = parseFloat(event.target.value);
    this.lstItemPedido = this.itemService.UpdateCostItemFromItemsProveedor(this.lstItemPedido, productoId, costo);
    //this.calcularTotal();

    //this.itemService.setItems(this.lstItemPedido);
    //this.itemService.saveLocalStorageItems(this.lstItemPedido);
  }

  crearPedidoTienda(pedidoTiendaForm: NgForm) {
    this.pedido.items = [...this.lstItemPedido];
    if (pedidoTiendaForm.form.valid && this.pedido.items.length > 0) {
      this.calcularTotal();
      this.pedido.costoNetoTotal = this.total;
      //this.pedido.adquiridoEn = moment(this.pedido.adquiridoEn).toISOString().slice(0, 16);
      this.pedido.tipoPedido = this.tipoPedidoVentaClientes;
      //console.log(JSON.stringify(this.pedido));
      this.pedidoService.createPedidoTienda(this.pedido).subscribe(p => {
        this.pedidoService.setPedido(p);
        this.router.navigate(['/movimientos']);

      });
    }
  }


}
