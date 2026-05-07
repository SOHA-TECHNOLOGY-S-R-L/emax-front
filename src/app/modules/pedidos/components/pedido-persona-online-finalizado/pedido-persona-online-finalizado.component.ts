import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import moment from 'moment';
import { map, switchMap } from 'rxjs';
import { PEDIDO_VENTA } from '../../../../constants/constantes';
import { EnvioPedido } from '../../../../models/envio-pedido';
import { ItemPedido } from '../../../../models/item-pedido';
import { Pedido } from '../../../../models/pedido';
import { Persona } from '../../../../models/persona';
import { AuthService } from '../../../../services/auth.service';
import { PedidoService } from '../../../../services/pedido.service';
import { PersonaService } from '../../../../services/persona.service';
import { ProductoService } from '../../../../services/producto.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { AutocompleteResourceComponent } from '../../../compartido/autocomplete-resource/autocomplete-resource.component';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { FormDatosPersonaComponent } from '../../../personas/components/form-datos-persona/form-datos-persona.component';
import { FormEnvioPedidoComponent } from '../form-envio-pedido/form-envio-pedido.component';
import { ItemPedidoComponent } from "../item-pedido/item-pedido.component";
import { PagoPedidoPersonaOnlineComponent } from '../pago-pedido-persona-online/pago-pedido-persona-online.component';
import { AlertService } from './../../../../services/alert.service';
import { ItemService } from '../../../../services/item.service';
import { SnackbarService } from '../../../../services/snackbar.service';

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
  //private alertService = inject(AlertService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  // 4 es el tipo pedido venta online - 3 pedido de tienda
  origenPedidoId = toSignal(this.ar.paramMap.pipe(map(params => +(params.get('origenPedidoId') ?? 4))), { initialValue: 4 });
  isEnvio = signal<boolean>(false);
  inPersona = signal<Persona | undefined>(undefined);
  personSelect = signal<Persona | undefined>(undefined);
  pedido = signal(new Pedido());
  fechaEntrega = signal<string>(this.obtenerFechaDefecto());
  observaciones = signal<string>('');
  envioPedido = signal<EnvioPedido | undefined>(undefined);
  //formaEnvio = signal<string>('');
  items = signal<ItemPedido[]>([]);
  formPersonaValid: boolean = false;
  formEnvioPedidoValid: boolean = true;

  private personFromOnlineEffect = effect(() => {
    const origenPedidoId = this.origenPedidoId();
    if (origenPedidoId === 4) {
      this.cargarPersonaOnline();
    }
  });

  PEDIDO_VENTA = PEDIDO_VENTA;

  constructor() { }

  buscarPersonas = (term: string) =>
    this.personaService.filtrarPersonas(term);

  mostrarPersona = (persona: Persona) =>
    persona.nomApellRz

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
    if(checkbox.checked) {return}
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
    //this.checkEnvioPedido(envioPedido);
  }

  recibirItems(itemsPedido: ItemPedido[]) {
    console.log("itemsPedido", itemsPedido);
    this.items.set(itemsPedido);
  }

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

    const envioPed = this.envioPedido();

    this.pedido.update(p => ({
      ...p,
      personaId: this.personSelect()!.id,
      observacion: this.observaciones(),
      direccionEnvio: envioPed?.direccionEnvio!,
      celularEnvio: envioPed?.celularEnvio!,
      nomApellRzEnvio: envioPed?.nomApellRzEnvio!,
      entregadoEn: this.fechaEntrega(),
      items: [...this.items()],
      //precioNetoTotal: this.total(),
      tipoPedidoId: PEDIDO_VENTA,
    }));
    this.pedidoService.createPedidoTienda(this.pedido())
      .subscribe(p => {
        this.itemService.setItems([]);
        if (this.origenPedidoId() === 4) {
          this.openDialog(p);
        } else {
          this.snackbar.success(`Pedido ${p.tipoPedido.nombre} N° ${p.id}`);
        }
        this.router.navigate(['/pedidos/listado-ventas']);
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
        this.snackbar.success("Pagado! Si enviaste tu pago ya estamos atendiendo tu pedido.")
      } else {
        this.snackbar.warning("Pago pendiente! Si enviaste el pago puedes omitir el mensaje.")
      }

    });
  }

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

