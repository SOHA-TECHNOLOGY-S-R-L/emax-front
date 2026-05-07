import { TipoPedido } from './../../../../models/tipo-pedido';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as fileSaver from 'file-saver-es';
import { catchError, concatMap, map, of } from 'rxjs';
import { PEDIDO_COMPRA, PEDIDO_VENTA } from '../../../../constants/constantes';
import { DEVOLUCION_DE_PAGO_AL_CLIENTE, EGRESO_POR_COMPRA, INGRESO_POR_DEVOLUCION_COMPRA, PAGO_CLIENTE } from '../../../../constants/movimiento-pedido.constants';
import { CajaUsuario } from '../../../../models/caja-usuario';
import { Movimiento } from '../../../../models/movimiento';
import { TipoMovimientoPedido } from '../../../../models/tipo-movimiento-pedido';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CajaService } from '../../../../services/caja.service';
import { MovimientoService } from '../../../../services/movimiento.service';
import { PedidoService } from '../../../../services/pedido.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { InfoCajaUsuarioComponent } from '../../../caja/components/info-caja-usuario/info-caja-usuario.component';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { FormUtils } from '../../../../utils/form-utils';
import { SnackbarService } from '../../../../services/snackbar.service';


@Component({
  selector: 'app-movimiento',
  templateUrl: './movimiento.component.html',
  styleUrl: './movimiento.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, AngularMaterialModule, FormsModule, ReactiveFormsModule, InfoCajaUsuarioComponent]
})
export class MovimientoComponent {
  private activatedRoute = inject(ActivatedRoute);
  private pedidoService = inject(PedidoService);
  private cajasService = inject(CajaService);
  private movimientoService = inject(MovimientoService);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private alertService = inject(AlertService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);


  //titulo: string = '';
  PEDIDO_VENTA = PEDIDO_VENTA;
  PEDIDO_COMPRA = PEDIDO_COMPRA;
  formUtils = FormUtils;


  // @ViewChild("searchPedidoText") searchText!: ElementRef;

  readonly pedidoIdDeRuta = toSignal(
    this.activatedRoute.paramMap.pipe(map((p) => p.get('pedidoId'))),
    { initialValue: null },
  );

  pedidoId = signal<string>('')
  isFromPedidos = signal<boolean>(false);

  isFromPedidosEffect = effect(() => {
    const pedidoId = this.pedidoIdDeRuta();

    if (pedidoId === null || pedidoId == undefined || pedidoId.trim().length === 0) {
      this.snackbar.warning("Número de Pedido invalido");
      //this.alertService.error("Número de Pedido invalido", "Registro de pago pedido");
      return;
    }

    if (pedidoId) {
      this.isFromPedidos.set(true);
      this.pedidoId.set(pedidoId);
      this.frm.get('pedidoIdSearch')?.setValue(pedidoId);
    }
  });

  pedidoResource = rxResource({
    params: () => {
      const pedidoId = this.pedidoId()
      const pedidoHowNumber = +(pedidoId.trim().length === 0 ? 0 : pedidoId);
      if (pedidoId == null || pedidoId == undefined || pedidoId.trim().length === 0 || pedidoHowNumber === 0 || isNaN(pedidoHowNumber) || !Number.isInteger(pedidoHowNumber)) return;

      return { pedidoHowNumber };
    },
    stream: ({ params }) =>
      this.pedidoService.getPedido(params!.pedidoHowNumber).pipe(
        catchError(err => {
          this.alertService.info(
            `Número de pedido ${params!.pedidoHowNumber} no encontrado`,
            "Pedido"
          );
          return of(null);
        })
      ),
  });

  /*   pedidoResourcesNotFound = effect(() => {
      const pedido = this.pedidoResource.value()
      if (!pedido) {
        this.alertService.info(`Pedido no ese número no existe en la base de datos `, "Pedido");
      }
    }) */



  tipoMovimientosResource = rxResource({
    stream: () => this.movimientoService.getAllTipoMovimientosPedido(),
  });

  tipoMovPedidoIngresos = computed(() => {
    const lst = this.tipoMovimientosResource.value() ?? [];
    return lst.filter(f => f.tipo === "I")
  })

  tipoMovPedidoEgresos = computed(() => {
    const lst = this.tipoMovimientosResource.value() ?? [];
    return lst.filter(f => f.tipo === "E")
  })

  tiposPedidoResource = rxResource({
    stream: () => this.pedidoService.getAllTipoPedido(),
  });

  tipoPagosResource = rxResource({
    stream: () => this.movimientoService.getAllTipoPagos(),
  });


  selectTipoMovimiento = signal<string>('I')


  defaultSelectTipoMovimientoEffect = effect(() => {
    const pedido = this.pedidoResource.value()
    if (!pedido) { return }

    const tipoPedidoId = pedido.tipoPedidoId
    if (tipoPedidoId === PEDIDO_VENTA) {
      this.selectTipoMovimiento.set('I');
    }
    if (tipoPedidoId === PEDIDO_COMPRA) {
      this.selectTipoMovimiento.set('E')
    }
  })

  tituloTipoPedido = computed(() => {
    const pedido = this.pedidoResource.value()
    const tiposPedido = this.tiposPedidoResource.value()

    if (!pedido || !tiposPedido) { return 'Registro de pago' }

    const tipoPedido = tiposPedido!.find((tp) => tp.id === pedido!.tipoPedidoId);
    return tipoPedido ? `Registro de pago por ${tipoPedido.nombre}` : 'Registro de pago';
  })


  tipoMovimientosPedidoLst = signal<TipoMovimientoPedido[]>([]);

  loadTipoMovimientosLstEffect = effect(() => {
    const select = this.selectTipoMovimiento()

    if (select === "I") {
      this.tipoMovimientosPedidoLst.set([...this.tipoMovPedidoIngresos()])
    }
    if (select === "E") {
      this.tipoMovimientosPedidoLst.set([...this.tipoMovPedidoEgresos()])
    }
    this.frm.get('iMovimiento')?.setValue(select);

  })

  setInitValuesControlsFormEffect = effect(() => {
    const select = this.selectTipoMovimiento()
    const pedido = this.pedidoResource.value()

    if (!pedido) { return }

    let tmpi = 0
    if (select === "I") {
      if (pedido.tipoPedidoId === PEDIDO_VENTA) {
        tmpi = PAGO_CLIENTE;
        this.frm.get('saldoPedido')?.setValue(pedido.saldoPedido);
      }
      if (pedido.tipoPedidoId === PEDIDO_COMPRA) {
        tmpi = INGRESO_POR_DEVOLUCION_COMPRA;
        this.frm.get('flujoEfectivoTotal')?.setValue(pedido.flujoEfectivoTotal);

      }
    }
    if (select === "E") {
      if (pedido.tipoPedidoId === PEDIDO_VENTA) {
        tmpi = DEVOLUCION_DE_PAGO_AL_CLIENTE;
        this.frm.get('flujoEfectivoTotal')?.setValue(pedido.flujoEfectivoTotal);
      }
      if (pedido.tipoPedidoId === PEDIDO_COMPRA) {
        tmpi = EGRESO_POR_COMPRA;
        this.frm.get('saldoPedido')?.setValue(pedido.saldoPedido);

      }
    }
    this.frm.get('tipoMovimientoPedidoId')?.setValue(tmpi);
    this.frm.get('tipoPagoId')?.setValue(0);
    this.frm.get('ingresoDinero')?.setValue(0);
    this.frm.get('egresoDinero')?.setValue(0);
  })

  usuario = computed(() => {
    const isAutenticado = this.authService.isAuthenticated()
    if (!isAutenticado) {
      this.alertService.info(`Se cerro la sesión sesión por tiempo de inactividad `, "Caja");
      return
    }
    return this.authService.usuario();
  })

  usuarioNotAutthenticateEffect = effect(() => {
    if (!this.usuario()) { this.router.navigate(['/']) }
  })

  refreshCajaUsuario = signal(0);

  cajaUsuarioResource = rxResource({
    params: () => ({
      usuario: this.usuario(),
      refresh: this.refreshCajaUsuario()
    }),
    stream: ({ params }) => {
      if (!params?.usuario?.username) return of(null);
      return this.cajasService.getCajaUsuarioActiveByUserName(params.usuario.username);
    }
  });

  isCajaUsuarioInactiveEffect = effect(() => {
    const cju = this.cajaUsuarioResource.value();
    const status = this.cajaUsuarioResource.status();

    if (status === 'resolved' && !cju) {
      this.alertService.info(`Aperturar caja para realizar movimientos en caja `, "Caja")
      this.router.navigate(['/cajas']);
    }
  });


  frm = this.formBuilder.group({
    pedidoIdSearch: ['', Validators.required],
    iMovimiento: [this.selectTipoMovimiento()],
    tipoMovimientoPedidoId: [{ value: 0, disabled: true }],
    saldoPedido: [{ value: 0, disabled: true }],
    flujoEfectivoTotal: [{ value: 0, disabled: true }],
    ingresoDinero: [0, { validators: [Validators.required] }],
    egresoDinero: [0, { validators: [Validators.required] }],
    tipoPagoId: [0, { validators: [Validators.required, Validators.min(1)] }],
  });

  ingresoDinero = toSignal(
    this.frm.get('ingresoDinero')!.valueChanges,
    { initialValue: this.frm.get('ingresoDinero')!.value }
  );

  egresoDinero = toSignal(
    this.frm.get('egresoDinero')!.valueChanges,
    { initialValue: this.frm.get('egresoDinero')!.value }
  );

  tipoPagoId = toSignal(
    this.frm.get('tipoPagoId')!.valueChanges,
    { initialValue: this.frm.get('tipoPagoId')!.value }
  );

  newSaldoCalculado = computed(() => {
    const select = this.selectTipoMovimiento();
    const pedido = this.pedidoResource.value();
    let ingresoDinero = this.ingresoDinero() ?? 0;
    let egresoDinero = this.egresoDinero() ?? 0;
    let saldoDinero = 0

    if (!pedido) return 0;

    const saldoPedido = pedido.saldoPedido;
    const flujoEfectivoTotal = pedido.flujoEfectivoTotal


    if (ingresoDinero <= 0 && egresoDinero <= 0) {
      ingresoDinero = 0;
      egresoDinero = 0;
    }
    if (pedido.tipoPedidoId === PEDIDO_VENTA) {
      if (select == 'I') {
        let newSaldo = (saldoPedido - ingresoDinero)
        if (newSaldo >= 0) { saldoDinero = newSaldo; }
        if (newSaldo < 0) { saldoDinero = 0 }
      }
      if (select == 'E') {
        let newSaldo = (flujoEfectivoTotal - egresoDinero)
        if (newSaldo >= 0) { saldoDinero = newSaldo; }
        if (newSaldo < 0) { saldoDinero = 0 }
      }
    }
    if (pedido.tipoPedidoId === PEDIDO_COMPRA) {
      if (select == 'E') {
        let newSaldo = (saldoPedido - egresoDinero)
        if (newSaldo >= 0) { saldoDinero = newSaldo; }
        if (newSaldo < 0) { saldoDinero = 0 }
      }
      if (select == 'I') {
        let newSaldo = (flujoEfectivoTotal - ingresoDinero)
        if (newSaldo >= 0) { saldoDinero = newSaldo; }
        if (newSaldo < 0) { saldoDinero = 0 }
      }
    }
    return saldoDinero;
  });

  movimiento = computed(() => {
    const select = this.selectTipoMovimiento();
    const pedido = this.pedidoResource.value();
    let ingresoDinero = this.ingresoDinero() ?? 0;
    let egresoDinero = this.egresoDinero() ?? 0;
    let tipoPagoId = this.tipoPagoId() ?? 0;

    if (!pedido) {
      return {
        cajaUsuario: this.cajaUsuarioResource.value()!,
        tipoPagoId: tipoPagoId,
        tipoMovimientoPedidoId: this.frm.controls.tipoMovimientoPedidoId.value!,
        ingresoDinero,
        egresoDinero,
      };
    }

    const saldoPedido = pedido.saldoPedido
    const flujoEfectivoTotal = pedido.flujoEfectivoTotal

    if (ingresoDinero <= 0 && egresoDinero <= 0) {
      ingresoDinero = 0;
      egresoDinero = 0;
      //this.alertService.info(`Ingreso de dinero no puede ser cero ni negativo `, "Caja")
      //return
    }
    if (pedido.tipoPedidoId === PEDIDO_VENTA) {
      if (select == 'I') {
        let newSaldo = (saldoPedido - ingresoDinero)
        if (newSaldo >= 0) { egresoDinero = 0; }
        if (newSaldo < 0) { egresoDinero = newSaldo }
      }
      if (select == 'E') {
        let newSaldo = (flujoEfectivoTotal - egresoDinero)
        if (newSaldo >= 0) { ingresoDinero = 0; }
        if (newSaldo < 0) { ingresoDinero = newSaldo }
      }
    }
    if (pedido.tipoPedidoId === PEDIDO_COMPRA) {
      if (select == 'E') {
        let newSaldo = (saldoPedido - egresoDinero)
        if (newSaldo >= 0) { ingresoDinero = 0; }
        if (newSaldo < 0) { ingresoDinero = newSaldo }
      }
      if (select == 'I') {
        let newSaldo = (flujoEfectivoTotal - ingresoDinero)
        if (newSaldo >= 0) { egresoDinero = 0; }
        if (newSaldo < 0) { egresoDinero = newSaldo }
      }

    }

    return {
      cajaUsuario: this.cajaUsuarioResource.value()!,
      tipoPagoId: tipoPagoId,
      tipoMovimientoPedidoId: this.frm.controls.tipoMovimientoPedidoId.value!,
      ingresoDinero,
      egresoDinero,
    };
  })

  constructor() { }

  searchByPedidoId(event: string): void {
    const pedidoId = +(event.trim().length === 0 ? 0 : event);
    if (event.trim().length === 0 || pedidoId === 0 || isNaN(pedidoId) || !Number.isInteger(pedidoId)) {
      this.alertService.error("Debe ingrear un número de Pedido valido", "Registro de pago pedido");
      return;
    }
    this.pedidoId.set(event)
  }

  onSubmitForm() {

    if (!this.frm.valid) { return }
    const pedido = this.pedidoResource.value()
    if (!pedido) { return }
    pedido.items = []
    pedido.movimientos = [this.movimiento()];
    console.log("pedido: ", pedido)

    if (pedido.tipoPedidoId == PEDIDO_VENTA) {
      this.pedidoService.createMovimiento(pedido).pipe(
        concatMap(ped => this.pedidoService.downloadOrderToPersonaInPDF(ped))
      ).subscribe(response => {
        fileSaver.saveAs(response.body!,
          this.pedidoService.filenameFromHeader(response.headers)) //utilidad pra qeu descargue automaticamente
        if (this.isFromPedidos()) {
          this.router.navigate(['/pedidos/listado-ventas'])
        };
        this.refreshCajaUsuario.update(v => v + 1);
        this.alertService.success(`${this.tituloTipoPedido()} con exito`, "Exito");
      })
    }
    if (pedido.tipoPedidoId == PEDIDO_COMPRA) {
      this.pedidoService.createMovimiento(pedido).subscribe(response => {
        //this.alertService.success(`Se registró el pedido exitosamente`, "Exito");
        if (this.isFromPedidos()) {
          this.router.navigate(['/pedidos/listado-compras']);
        };
        this.refreshCajaUsuario.update(v => v + 1);
        this.alertService.success(`${this.tituloTipoPedido()} con exito`, "Exito");

      })
    }
    this.pedidoId.set('');
    this.frm.get('pedidoIdSearch')?.setValue('');

  }



}



