import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import moment from 'moment';
import { map, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { COMPRA_TIPO_PEDIDO, SERVICIO_ENTREGA_CIUDAD, SERVICIO_ENTREGA_LOCAL, VENTA_TIPO_PEDIDO } from '../../../../constants/constantes';
import { ItemPedido } from '../../../../models/item-pedido';
import { Pedido } from '../../../../models/pedido';
import { Persona } from '../../../../models/persona';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';
import { AuthService } from '../../../../services/auth.service';
import { ItemService } from '../../../../services/item.service';
import { PedidoService } from '../../../../services/pedido.service';
import { PersonaService } from '../../../../services/persona.service';
import { ProductoService } from '../../../../services/producto.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { ChatUtils } from '../../../../utils/chat-utils';
import { FormUtils } from '../../../../utils/form-utils';
import { AutocompleteResourceComponent } from '../../../compartido/autocomplete-resource/autocomplete-resource.component';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { FormDatosPersonaComponent } from '../../../personas/components/form-datos-persona/form-datos-persona.component';
import { PagoPedidoPersonaOnlineComponent } from '../pago-pedido-persona-online/pago-pedido-persona-online.component';
import { SERVICIO_ENTREGA_PROVINCIAL } from './../../../../constants/constantes';
import { AlertService } from './../../../../services/alert.service';
import { FormEnvioPedidoComponent } from '../form-envio-pedido/form-envio-pedido.component';
import { EnvioPedido } from '../../../../models/envio-pedido';

@Component({
  selector: 'pedido-persona-online-finalizado',
  templateUrl: './pedido-persona-online-finalizado.component.html',
  styleUrl: './pedido-persona-online-finalizado.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PrimeNgModule, StringToTitleWithAccents, FormDatosPersonaComponent, FormEnvioPedidoComponent, AutocompleteResourceComponent]

})
export class PedidoPersonaOnlineFinalizadoComponent {

  public authService = inject(AuthService);
  private ar = inject(ActivatedRoute);
  private personaService = inject(PersonaService);
  private usuarioService = inject(UsuarioService);
  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  itemService = inject(ItemService)
  // 4 es el tipo pedido venta online - 3 pedido de tienda
  tipoPedidoId = toSignal(this.ar.paramMap.pipe(map(params => +(params.get('tipoPedidoId') ?? 4))), { initialValue: 4 });
  rawItems = toSignal(this.itemService.getItems(), { initialValue: [] });
  isEnvio = signal<boolean>(false);
  inPersona = signal<Persona | undefined>(undefined);
  personSelect = signal<Persona | undefined>(undefined);
  pedido = signal(new Pedido());
  fechaEntrega = signal<string>(this.obtenerFechaDefecto());
  observaciones = signal<string>('');
  //itemServiceSuscription$!: Subscription;
  serviciosEnvioResource = rxResource({ stream: () => this.productoService.getLstProductoServicioEnvio() });
  tipoPedidosResource = rxResource({ stream: () => this.pedidoService.getAllTipoPedido() });
  serviciosEnvio = computed(() => this.serviciosEnvioResource.value() ?? []);
  tipoPedidos = computed(() => {
    const tipos = this.tipoPedidosResource.value() ?? [];
    return tipos.map(t => ({
      ...t,
      activo: t.id === 1
    }));
  });
  items = computed(() => this.itemService.importePorMargenCantidad(this.rawItems()));
  total = computed(() => this.itemService.calculateTotalFromItems(this.items()));
  tipoPedidoVentaPersonas = computed(() => this.tipoPedidos()[0]);
  formPersonaValid: boolean = false;
  formEnvioPedidoValid: boolean = true;

  private personFromOnlineEffect = effect(() => {
    const tipoPedidoId = this.tipoPedidoId();
    if (tipoPedidoId === 4) {
      this.cargarPersonaOnline();
    }
  });

  item = new ItemPedido();
  formUtils = FormUtils;
  chatUtils = ChatUtils;
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  SERVICIO_ENTREGA_LOCAL = SERVICIO_ENTREGA_LOCAL;
  SERVICIO_ENTREGA_CIUDAD = SERVICIO_ENTREGA_CIUDAD;
  SERVICIO_ENTREGA_PROVINCIAL = SERVICIO_ENTREGA_PROVINCIAL;

  constructor() { }

  buscarPersonas = (term: string) =>
    this.personaService.filtrarPersonas(term);

  mostrarPersona = (persona: Persona) =>
    persona.nomApellRz

  personSelecToInForm(persona: Persona) {
    console.log("personSelecToInForm -->persona para update", persona);
    this.inPersona.set(persona);
  }

  outPersonSelect($event: any) {
    this.formPersonaValid = $event.formValid
    if (!this.formPersonaValid) { return }

    const persona = $event.persona as Persona;
    this.personSelect.set(persona);
  }

  private obtenerFechaDefecto(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return moment(now).add(2, 'days').toISOString().slice(0, 16);
  }

  actualizarFecha(nuevaFecha: string) {
    this.fechaEntrega.set(nuevaFecha);
  }

  actualizarObservacion(text: string) {
    this.observaciones.set(text);
  }

  eliminarItemPedido(item: ItemPedido): void {
    const updated = this.itemService.deleteItemFromItems(this.items(), item.producto.id);
    this.itemService.setItems(updated);
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

  actualizarImporte(productoId: number, event: any): void {
    const precio: number = parseFloat(event.target.value);
    const updated = this.itemService.UpdatePrecioItemFromItemsCliete(this.items(), productoId, precio);
    //this.calcularTotal();
    this.itemService.setItems(updated);
    //this.itemService.saveLocalStorageItems(this.items);
  }

  toggleIsEnvio(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isEnvio.set(checkbox.checked);
    if (checkbox.checked) { return } //si no esta activo el formulario
    this.sinCheckEnvioPedido()
    this.formEnvioPedidoValid = true
  }

  private sinCheckEnvioPedido() {
    //debugger;
    const envio = this.isEnvio();
    if (envio) { return }

    const itemsActuales = this.items();
    const serviciosEnvio = this.serviciosEnvio();
    this.pedido.update(p => ({
      ...p,
      direccionEnvio: "",
      celularEnvio: "",
      nomApellRzEnvio: ""
    }));

    let nuevosItems = itemsActuales;
    serviciosEnvio.forEach(servicio => {
      if (this.itemService.existItemInItems(nuevosItems, servicio.id)) {
        nuevosItems = this.itemService.deleteItemFromItems(
          nuevosItems,
          servicio.id
        );
      }
    });
    this.itemService.setItems(nuevosItems);
  };


  crearPedidoTienda() {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    //debugger;
    const persona = this.personSelect();
    if (!this.formPersonaValid && !persona) { return }
    const personaId = persona!.id
    if (personaId) {
      this.personaService.update(personaId, persona!).subscribe(result => {
        console.log('persona actualziada')
        this.personSelect.set(result.persona)
        this.actualizarPedido()
      })
    } else {
      this.personaService.create(persona!).subscribe(result => {
        console.log("persona creada", persona)
        this.personSelect.set(result)
        this.actualizarPedido()
      })
    }
  }

  actualizarPedido() {

    if (!this.formEnvioPedidoValid || this.items().length === 0) return;
    //debugger;
    //const per = this.personSelect();
    this.pedido.update(p => ({
      ...p,
      persona: this.personSelect(),
      observacion: this.observaciones(),
      entregadoEn: this.fechaEntrega(),
      items: [...this.items()],
      precioNetoTotal: this.total(),
      tipoPedido: this.tipoPedidoVentaPersonas(),
    }));
    //debugger;
    this.pedidoService.createPedidoTienda(this.pedido())
      .subscribe(p => {
        this.itemService.setItems([]);
        if (this.tipoPedidoId() === 4) {
          this.openDialog(p);
        } else {
          this.alertService.info(`Pedido ${p.tipoPedido.nombre} N° ${p.id}`, "Finalizado");

          if (p.tipoPedido.id == VENTA_TIPO_PEDIDO) {
            this.router.navigate(['/pedidos/listado-ventas']);
          }
          if (p.tipoPedido.id == COMPRA_TIPO_PEDIDO) {
            this.router.navigate(['/pedidos/listado-compras']);
          }
        }
      });
  }


  openDialog(pedido: Pedido): void {
    const dialogRef = this.dialog.open(PagoPedidoPersonaOnlineComponent, {
      data: pedido,
      height: 'auto',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['/']);

      if (result) {
        this.alertService.success("Pagado! Si enviaste tu pago ya estamos atendiendo tu pedido.", "Pagado")
      } else {
        this.alertService.warning("Pago pendiente! Si enviaste el pago puedes omitir el mensaje.", "Pago pendiente")
      }

    });
  }

  outEnvioPedidoSelect($event: any) {
    this.formEnvioPedidoValid = $event.formValid
    if (!this.formEnvioPedidoValid) { return }

    const envioPedido = $event.envioPedido as EnvioPedido;
    if (!this.isEnvio()) { return }

    this.checkEnvioPedido(envioPedido);
  }


  private checkEnvioPedido(datos: EnvioPedido) {
    const itemsActuales = this.items();

    let envioSelected = this.serviciosEnvio().find(ser => ser.codigo == datos.formaEnvio);
    let envioNoSelected = this.serviciosEnvio().filter(ser => ser.codigo != datos.formaEnvio);

    if (!envioSelected) return;
    let lstMultimediaServicioEnvio = envioSelected?.multimediasProducto
    lstMultimediaServicioEnvio = lstMultimediaServicioEnvio ?
      lstMultimediaServicioEnvio.filter(lst => lst.multimedia.mimeType.startsWith('image')) : [];


    let nuevosItems = itemsActuales;
    envioNoSelected!.forEach(servicio => {
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

    this.itemService.setItems(nuevosItems);
    this.pedido.update(p => ({
      ...p,
      //persona: this.personSelect() ?? undefined,
      direccionEnvio: datos.direccionEnvio ?? "",
      celularEnvio: datos.celularEnvio ?? "",
      nomApellRzEnvio: datos.nomApellRzEnvio ?? "",
      entregadoEn: this.fechaEntrega()
    }));
  };


  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  cargarPersonaOnline() {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    const usuario = this.authService.usuario()
    if (!usuario) { return }

    this.usuarioService.getUsuarioByUsername(usuario.username)
      .pipe(
        switchMap(usr => this.personaService.getPersonaByUsuarioId(usr.id))
      )
      .subscribe({
        next: (persona) => {
          console.log('cargarPersonaOnline-->persona para update', persona)
          this.inPersona.set(persona);
        },
        error: (err) => console.error('Error en la carga:', err)
      });
  }



}

