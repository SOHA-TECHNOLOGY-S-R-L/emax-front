import { SERVICIO_ENTREGA_PROVINCIAL } from './../../../../constants/constantes';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { findIndex, forEach } from 'lodash-es';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SERVICIO_ENTREGA_CIUDAD, SERVICIO_ENTREGA_LOCAL } from '../../../../constants/constantes';
import { ItemPedido } from '../../../../models/item-pedido';
import { Pedido } from '../../../../models/pedido';
import { Persona } from '../../../../models/persona';
import { Producto } from '../../../../models/producto';
import { TipoDocumento } from '../../../../models/tipo-documento';
import { TipoPedido } from '../../../../models/tipo-pedido';
import { AuthService } from '../../../../services/auth.service';
import { ItemService } from '../../../../services/item.service';
import { PedidoService } from '../../../../services/pedido.service';
import { PersonaService } from '../../../../services/persona.service';
import { ProductoService } from '../../../../services/producto.service';
import { ChatUtils } from '../../../../utils/chat-utils';
import { FormUtils } from '../../../../utils/form-utils';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { PagoPedidoPersonaOnlineComponent } from '../pago-pedido-persona-online/pago-pedido-persona-online.component';
import { AlertService } from './../../../../services/alert.service';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';

@Component({
  selector: 'pedido-persona-online-finalizado',
  templateUrl: './pedido-persona-online-finalizado.component.html',
  styleUrl: './pedido-persona-online-finalizado.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PrimeNgModule, StringToTitleWithAccents]

})
export class PedidoPersonaOnlineFinalizadoComponent implements OnInit {
  public authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private personaService = inject(PersonaService);
  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private alertService = inject(AlertService);
  readonly dialog = inject(MatDialog);
  private router = inject(Router);
  itemService = inject(ItemService)
  itemServiceSuscription$!: Subscription;
  persona!: Persona;
  pedido = new Pedido();
  tipoDocumentos: TipoDocumento[] = [];
  //tipoDocumentoSelected!: TipoDocumento;
  tipoPedidoVentaPersonas!: TipoPedido;
  tipoPedidos: TipoPedido[] = [];
  items: ItemPedido[] = [];
  item = new ItemPedido();
  serviciosEnvio: Producto[] = [];
  formUtils = FormUtils;
  chatUtils = ChatUtils;
  total: number = 0;
  //personaOnline!: boolean;
  isEnvio: boolean = false;
  formaEnvio!: string;

  SERVICIO_ENTREGA_LOCAL = SERVICIO_ENTREGA_LOCAL;
  SERVICIO_ENTREGA_CIUDAD = SERVICIO_ENTREGA_CIUDAD;
  SERVICIO_ENTREGA_PROVINCIAL = SERVICIO_ENTREGA_PROVINCIAL;
  //SERVICIO_DISENIO = SERVICIO_DISENIO;
  //SERVICIO_GRABADO_IMAGEN = SERVICIO_GRABADO_IMAGEN;


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
    this.personaService.getTipoDocumento().subscribe(doc => {
      this.tipoDocumentos = doc
    });

    this.activatedRoute.paramMap.subscribe(params => {
      let personaId = +params.get('personaId')!;
      this.personaService.getPersona(personaId).subscribe(cli => {
        const now = new Date();
        this.persona = cli;
        //const index = this.findIndexDocument(this.persona.tipoDocumento.id);
        //this.tipoDocumentoSelected = this.tipoDocumentos[index];
        this.pedido.persona = this.persona;
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        this.pedido.entregadoEn = moment(now).add(2, 'days').toISOString().slice(0, 16);
      });
    });

    /*     this.activatedRoute.queryParams.subscribe(params => {
          const value = params['personaOnline'];
          this.personaOnline = value.toLocaleLowerCase() === 'true' ? value : false;
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
      this.tipoPedidoVentaPersonas = this.tipoPedidos[0];
    });

  }

  calcularTotal() {
    this.total = this.itemService.calculateTotalFromItems(this.items)
  }


/*   findIndexDocument(tipoDocumentoId: number): number {
    return findIndex(this.tipoDocumentos, (td) => td.id == tipoDocumentoId)
  }
 */

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
      this.pedido.tipoPedido = this.tipoPedidoVentaPersonas
      this.pedidoService.createPedidoTienda(this.pedido).subscribe(p => {
        this.openDialog(p)
        this.itemService.setItems([]);

        //this.pedidoService.setPedido(p);
        //this.itemService.removeLocalStorageItems();
        //this.router.navigate(['/pedidos/contactanos']);
      });
    }
  }

  openDialog(pedido: Pedido): void {
    const dialogRef = this.dialog.open(PagoPedidoPersonaOnlineComponent, {
      data: pedido,
      height: 'auto',
/*       width: '90%',
 */      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['/']);

      //console.log('The dialog was closed');
      if (result) {
        this.alertService.success("Pagado! Si enviaste tu pago ya estamos atendiendo tu pedido.", "Pagado")
        //this.animal.set(result);
      } else {
        this.alertService.warning("Pago pendiente! Si enviaste el pago puedes omitir el mensaje.", "Pago pendiente")

      }

    });
  }

  addItemsServicioEnvio(event: any, formaEnvio: string) {
    this.isEnvio = event.target.checked;
    let envioSelected = this.serviciosEnvio.filter(ser => ser.codigo == formaEnvio);
    let envioNoSelected = this.serviciosEnvio.filter(ser => ser.codigo != formaEnvio);
    this.formaEnvio = formaEnvio;

    if (this.isEnvio) {
      //console.log(envioSelected[0].minCantidadPedido);
      this.item.cantidad = envioSelected[0].minCantidadPedido;
      this.item.descripcion = envioSelected[0].descripcion;
      this.item.producto = { ...envioSelected[0] };
      this.item.imagenUri = environment.API_URL_VER_IMAGEN + this.item.producto.imagen

      /*       if (this.itemService.existItemInItems(this.items, envioNoSelected[0].id)) {
              this.items = this.itemService.deleteItemFromItems(this.items, this.item.producto.id);
              this.itemService.setItems(this.items);
              this.itemService.saveLocalStorageItems(this.items);
            } */

      envioNoSelected.forEach(servicio => {
        if (this.itemService.existItemInItems(this.items, servicio.id)) {
          this.items = this.itemService.deleteItemFromItems(this.items, servicio.id);
        }
      })
      this.itemService.setItems(this.items);


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

