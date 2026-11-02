import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as fileSaver from 'file-saver-es';
import moment from 'moment';
import { concatMap, of, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TipoPedidoEnum, TipoPedidoEtiquetas } from '../../../../enums/tipo-pedido.enum';
import { TipoPersonaEnum } from '../../../../enums/tipo-persona.enum';
import { ResponseController } from '../../../../interfaces/response-controller';
import { EnvioPedido } from '../../../../models/envio-pedido';
import { Pedido } from '../../../../models/pedido';
import { Persona } from '../../../../models/persona';
import { AuthService } from '../../../../services/auth.service';
import { CuponService } from '../../../../services/cupon.service';
import { ItemService } from '../../../../services/item.service';
import { PedidoService } from '../../../../services/pedido.service';
import { PersonaService } from '../../../../services/persona.service';
import { ProductoService } from '../../../../services/producto.service';
import { SnackbarService } from '../../../../services/snackbar.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { construirPedidoRequest } from '../../../../utils/build-pedido';
import { AutocompleteResourceComponent } from '../../../compartido/autocomplete-resource/autocomplete-resource.component';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { FormDatosPersonaComponent } from '../../../personas/components/form-datos-persona/form-datos-persona.component';
import { FormEnvioPedidoComponent } from '../form-envio-pedido/form-envio-pedido.component';
import { ItemPedidoComponent } from "../item-pedido/item-pedido.component";
import { PagoPedidoPersonaOnlineComponent } from '../pago-pedido-persona-online/pago-pedido-persona-online.component';


@Component({
  selector: 'pedido-persona-online-finalizado',
  templateUrl: './pedido-persona-online-finalizado.component.html',
  styleUrl: './pedido-persona-online-finalizado.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PrimeNgModule, FormDatosPersonaComponent, FormEnvioPedidoComponent, AutocompleteResourceComponent, ItemPedidoComponent]

})
export class PedidoPersonaOnlineFinalizadoComponent {

  public authService = inject(AuthService);
  private ar = inject(ActivatedRoute);
  private personaService = inject(PersonaService);
  private usuarioService = inject(UsuarioService);
  private pedidoService = inject(PedidoService);
  private itemService = inject(ItemService);
  private productoService = inject(ProductoService);
  private cuponService = inject(CuponService)
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);

  /* origenPedidoId = toSignal(this.ar.paramMap.pipe(
    map(params => +(params.get('origenPedidoId') ??  OrigenPedidoEnum.ONLINE ))), { initialValue: OrigenPedidoEnum.ONLINE });
 */
  isEnvio = signal<boolean>(false);
  inPersona = signal<Persona | undefined>(undefined);
  personSelect = signal<Persona | undefined>(undefined);
  pedido = signal(new Pedido());
  fechaEntrega = signal<string>(this.obtenerFechaDefecto());
  observaciones = signal<string>('');
  envioPedido = signal<EnvioPedido | undefined>(undefined);

  serviciosEnvioResource = rxResource({ stream: () => this.productoService.getLstProductoServicioEnvio() });

  readonly cuponesActivosResource = rxResource({
    stream: () => this.cuponService.getAllCuponesActivos(),
  })

  readonly hayCuponesParaVendedor = computed(() => {
    const cupones = this.cuponesActivosResource.value();
    if (!cupones) { return false; }
    return cupones.some(cp => cp.visibleParaVendedor === true);
  });

  readonly hayCuponesParaCliente = computed(() => {
    const cupones = this.cuponesActivosResource.value();
    if (!cupones) { return false; }
    return cupones.some(cp => cp.visibleParaCliente === true);
  });


  serviciosEnvio = computed(() => this.serviciosEnvioResource.value() ?? []);
  //formaEnvio = signal<string>('');
  //items = signal<ItemPedido[]>([]);
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

  readonly totalDescuentoPorOfertayCupon = computed(() =>
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
  //subTotal = computed(() => this.itemService.calculateSubTotalFromItems(this.items()));

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

  private personAuthenticateEffect = effect(() => {
    const persona = this.personaResource.value();
    if (!persona || !this.isCliente()) return;

    this.inPersona.set(persona);

  });

  readonly isCliente = computed(() => {
    const persona = this.personaResource.value();
    if (!persona) return true;
    return persona.tipoPersona === TipoPersonaEnum.CLIENTE_PROVEEDOR;
  });


  formPersonaValid: boolean = false;
  formEnvioPedidoValid: boolean = true;

  readonly tipoPedidoEnum = TipoPedidoEnum;
  readonly tipoPedidoEtiquetas = TipoPedidoEtiquetas;

  constructor() { }

  buscarPersonas = (term: string) =>
    this.personaService.filtrarPersonas(term);

  mostrarPersona = (persona: Persona | null) =>
    persona?.apellNomRznSocial ?? '';

  personSelecToInForm(persona: Persona) {
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

  toggleIsEnvio(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isEnvio.set(checkbox.checked);
    if (checkbox.checked) { return }
    this.envioPedido.set(undefined);
  }

  outEnvioPedidoSelect($event: any) {
    this.formEnvioPedidoValid = $event.formValid
    if (!$event.formValid) { return }

    const envioPedido = $event.envioPedido as EnvioPedido;

    if (this.isEnvio()) {
      this.envioPedido.set(envioPedido);
    } else {
      this.envioPedido.set(undefined);
    }
  }


  crearPedidoTienda() {
    if (!this.isAutenticado()) {
      return;
    }
    const persona = this.personSelect();
    if (!this.formPersonaValid && !persona) { return }
    const personaId = persona!.id
    if (personaId) {
      this.personaService.update(personaId, persona!).subscribe(result => {
        this.personSelect.set(result.persona)
        this.actualizarPedido();
        this.crearPedidoVenta();
      })
    } else {
      this.personaService.createCliente(persona!).subscribe(result => {
        this.personSelect.set(result)
        this.actualizarPedido();
        this.crearPedidoVenta();
      })
    }
  }

  actualizarPedido() {
    if (!this.formEnvioPedidoValid || this.items().length === 0) return;

    const envioPed = this.envioPedido();

    this.pedido.update(p => ({
      ...p,
      persona: this.personSelect(),
      observacion: this.observaciones(),
      direccionEnvio: envioPed?.direccionEnvio!,
      celularEnvio: envioPed?.celularEnvio!,
      apellNomRznSocialEnvio: envioPed?.apellNomRznSocialEnvio!,
      entregadoEn: this.fechaEntrega(),
      items: [...this.items()],
      tipoPedido: TipoPedidoEnum.VENTA,
    }));
  }

  crearPedidoVenta() {
    if (!this.formEnvioPedidoValid || this.items().length === 0) return;
    this.pedidoService.createPedidoVenta(construirPedidoRequest(this.pedido()))
      .subscribe({
        next: (response) => {
          const pedido = response.data
          if (this.isCliente()) {
            this.openDialog(pedido);
          } else {
            this.snackbar.success(`${this.tipoPedidoEtiquetas[pedido.tipoPedido]} N°: ${pedido.id}`);
            this.itemService.setItems([]);
            this.router.navigate(['/pedidos/listado-ventas']);
          }
        },
        error: (err) => {
          const body = err.error as
            | ResponseController<unknown> //parecido al any la diferencia es qu te aobliga a comprobar el tipo antes de usar
            | null;
          let message = body?.message ?? 'Error.';
          // Si data contiene errores de validación
          if (Array.isArray(body?.data)) {
            message += ': ' + body.data.join('; ');
          }
          this.snackbar.error(message)
          console.error(message, err);
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
      this.router.navigate(['/pedidos/listado-ventas']);
      if (result) {
        this.snackbar.success("Si enviaste tu pago, estamos atendiendo tu pedido.")
      } else {
        this.snackbar.warning("Pago pendiente! Puedes omitir el mensaje si has pagado.")
      }

    });
  }

  /*   isAuthenticated(): boolean {
      return this.authService.isAuthenticated();
    } */

  /*   cargarPersonaOnline() {
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
            //console.log('cargarPersonaOnline-->persona para update', persona)
            this.inPersona.set(persona);
          },
          error: (err) => console.error('Error en la carga:', err)
        });
    } */


  aplicarCuponDescuento(input: HTMLInputElement) {
    const codigoDescuento = ((input.value) as string).trim();

    if (!codigoDescuento) { return; }

    this.actualizarPedido();
    const pedidoRequest = construirPedidoRequest(this.pedido());

    this.pedidoService.aplicarDescuento(pedidoRequest, codigoDescuento)
      .subscribe({
        next: (response) => {
          this.itemService.setItems(response.data);
          this.snackbar.success(response.message)
        },
        error: (err) => {
          const body = err.error as
            | ResponseController<unknown> //parecido al any la diferencia es qu te aobliga a comprobar el tipo antes de usar
            | null;

          let message = body?.message ?? 'Error al aplicar el cupón.';
          // Si data contiene errores de validación
          if (Array.isArray(body?.data)) {
            message += ': ' + body.data.join('; ');
          }

          this.snackbar.error(message)
          console.error(message, err);
        }

      });

  }

}

