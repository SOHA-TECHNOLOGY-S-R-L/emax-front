import { SnackbarService } from './../../../../services/snackbar.service';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, concatMap, map, of, tap } from 'rxjs';
import { getNameMovimientoInicialEnum, MovimientoInicialEnum } from '../../../../enums/movimiento-inicial.enum';
import { TipoDocumentoIdentidadEnum } from '../../../../enums/tipo-documento-identidad.enum';
import { TipoPedidoEnum, TipoPedidoEtiquetas } from '../../../../enums/tipo-pedido.enum';
import { ResponseController } from '../../../../interfaces/response-controller';
import { Caja } from '../../../../models/caja';
import { Pedido } from '../../../../models/pedido';
import { TipoMovimientoPedido } from '../../../../models/tipo-movimiento-pedido';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CajaUsuarioService } from '../../../../services/caja-usuario.service';
import { CajaService } from '../../../../services/caja.service';
import { LauncherSfsService } from '../../../../services/launcher-sfs.service';
import { MovimientoService } from '../../../../services/movimiento.service';
import { PedidoService } from '../../../../services/pedido.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { FormUtils } from '../../../../utils/form-utils';
import { InfoCajaUsuarioComponent } from '../../../caja/components/info-caja-usuario/info-caja-usuario.component';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { LauncherSfsComponent } from '../../../compartido/launcher-sfs/launcher-sfs.component';
import { ComprobantePdfRequest } from '../../../../interfaces/comprobante-pdf-request';
import { FormatoImpresionEnum } from '../../../../enums/formato-impresion.enum';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-movimiento',
  templateUrl: './movimiento.component.html',
  styleUrl: './movimiento.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, AngularMaterialModule, FormsModule, ReactiveFormsModule, InfoCajaUsuarioComponent, LauncherSfsComponent]
})
export class MovimientoComponent {
  private activatedRoute = inject(ActivatedRoute);
  private pedidoService = inject(PedidoService);
  private cajaUsuarioService = inject(CajaUsuarioService);
  private cajaService = inject(CajaService);
  private movimientoService = inject(MovimientoService);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private alertService = inject(AlertService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  private launcherSfsService = inject(LauncherSfsService);

  readonly tipoPedidoEnum = TipoPedidoEnum;
  readonly etiquetasPedido = TipoPedidoEtiquetas;
  readonly TipoDocumentoIdentidad = TipoDocumentoIdentidadEnum;
  formUtils = FormUtils;


  readonly pedidoIdDeRuta = toSignal(
    this.activatedRoute.paramMap.pipe(map((p) => p.get('pedidoId'))),
    { initialValue: null },
  );

  caja = signal<Caja | null>(null);
  newPedido = signal<Pedido | null>(null);
  pedidoId = signal<string>('')
  isFromPedidos = signal<boolean>(false);
  identificadorComprobante = signal<string | null>(null)


  isFromPedidosEffect = effect(() => {
    const pedidoId = this.pedidoIdDeRuta();

    if (pedidoId === null || pedidoId == undefined || pedidoId.trim().length === 0) {
      this.snackbar.warning("Número de Pedido invalido");
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
          this.alertService.info(`Número de pedido ${params!.pedidoHowNumber} no encontrado`, "Pedido");
          return of(null);
        })
      ),
  });

  personaDelPedido = computed(() => {
    return this.pedidoResource.value()?.persona ?? null;
  }
  )

  cajasResource = rxResource({ stream: () => this.cajaService.getAllCaja() });
  tipoPagosResource = rxResource({ stream: () => this.movimientoService.getAllTipoPagos(), });


  selectMovimiento = signal<string>(MovimientoInicialEnum.INGRESO)
  MovimientoInicialEnum = MovimientoInicialEnum;



  defaultSelectTipoMovimientoEffect = effect(() => {
    const pedido = this.pedidoResource.value()
    if (!pedido) { return }

    const tipoPedidoId = pedido.tipoPedido
    if (tipoPedidoId === TipoPedidoEnum.VENTA) {
      this.selectMovimiento.set(MovimientoInicialEnum.INGRESO);
    }
    if (tipoPedidoId === TipoPedidoEnum.COMPRA) {
      this.selectMovimiento.set(MovimientoInicialEnum.EGRESO)
    }
  })


  tipoMovimientosPedidoLst = signal<TipoMovimientoPedido[]>([]);

  loadTipoMovimientosLstEffect = effect(() => {
    const select = this.selectMovimiento()
    this.frm.get('iMovimiento')?.setValue(select);

  })

  setInitValuesControlsFormEffect = effect(() => {
    const select = this.selectMovimiento()
    const pedido = this.pedidoResource.value()

    if (!pedido) { return }

    if (select === MovimientoInicialEnum.INGRESO) {
      if (pedido.tipoPedido === TipoPedidoEnum.VENTA) {
        this.frm.get('saldoPedido')?.setValue(pedido.saldoPedido);
      }
      if (pedido.tipoPedido === TipoPedidoEnum.COMPRA) {
        this.frm.get('flujoEfectivoTotal')?.setValue(pedido.flujoEfectivoTotal);

      }
    }
    if (select === MovimientoInicialEnum.EGRESO) {
      if (pedido.tipoPedido === TipoPedidoEnum.VENTA) {
        this.frm.get('flujoEfectivoTotal')?.setValue(pedido.flujoEfectivoTotal);
      }
      if (pedido.tipoPedido === TipoPedidoEnum.COMPRA) {
        this.frm.get('saldoPedido')?.setValue(pedido.saldoPedido);

      }
    }
    this.frm.get('tipoPagoId')?.setValue(0);
    this.frm.get('ingresoDinero')?.setValue(0);
    this.frm.get('egresoDinero')?.setValue(0);
  })

  usuario = computed(() => {
    const isAutenticado = this.authService.isAuthenticated()
    if (!isAutenticado) {
      return
    }
    return this.authService.usuario();
  })

  usuarioNotAutthenticateEffect = effect(() => {
    if (!this.usuario()) {
      this.alertService.info(`Se cerro la sesión sesión por tiempo de inactividad `, "Caja");
      this.router.navigate(['/'])
    }
  })

  refreshCajaUsuario = signal(0);
  alreadyRedirected = signal(false);
  cajaActiva = signal<boolean>(false);


  cajaUsuarioResource = rxResource({
    params: () => ({
      usuario: this.usuario(),
      refresh: this.refreshCajaUsuario()
    }),
    stream: ({ params }) => {
      if (!params?.usuario?.username) return of(null);
      return this.cajaUsuarioService.getCajaUsuarioActiveByUserName(params.usuario.username)
        .pipe(
          catchError(() => {
            return of(null);
          })
        );
    }
  });

  isCajaUsuarioInactiveEffect = effect(() => {
    if (this.alreadyRedirected()) { return; }
    const status = this.cajaUsuarioResource.status();
    if (status === 'loading') { return; }

    const cju = this.cajaUsuarioResource.value();
    if (status === 'resolved' && cju === null) {
      this.alreadyRedirected.set(true);
      this.alertService.info(`Aperturar caja para realizar movimientos`, "Caja");
      this.router.navigate(['/cajas']);
    } else {
      this.cajaActiva.set(cju!.activa);
      this.seleccionarCaja(cju!.cajaId)
    }
  });

  seleccionarCaja(cajaId: number) {
    const cajas = this.cajasResource.value();
    if (!cajas) { return; }

    const caja = cajas.find(c => c.id === cajaId);
    if (!caja) { return; }

    this.caja.set(caja);
  }


  frm = this.formBuilder.group({
    pedidoIdSearch: ['', Validators.required],
    iMovimiento: [this.selectMovimiento()],
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
    const select = this.selectMovimiento();
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
    if (pedido.tipoPedido === TipoPedidoEnum.VENTA) {
      if (select == MovimientoInicialEnum.INGRESO) {
        let newSaldo = (saldoPedido - ingresoDinero)
        if (newSaldo >= 0) { saldoDinero = newSaldo; }
        if (newSaldo < 0) { saldoDinero = 0 }
      }
      if (select == MovimientoInicialEnum.EGRESO) {
        let newSaldo = (flujoEfectivoTotal - egresoDinero)
        if (newSaldo >= 0) { saldoDinero = newSaldo; }
        if (newSaldo < 0) { saldoDinero = 0 }
      }
    }
    if (pedido.tipoPedido === TipoPedidoEnum.COMPRA) {
      if (select == MovimientoInicialEnum.EGRESO) {
        let newSaldo = (saldoPedido - egresoDinero)
        if (newSaldo >= 0) { saldoDinero = newSaldo; }
        if (newSaldo < 0) { saldoDinero = 0 }
      }
      if (select == MovimientoInicialEnum.INGRESO) {
        let newSaldo = (flujoEfectivoTotal - ingresoDinero)
        if (newSaldo >= 0) { saldoDinero = newSaldo; }
        if (newSaldo < 0) { saldoDinero = 0 }
      }
    }
    return saldoDinero;
  });

  movimiento = computed(() => {
    const select = this.selectMovimiento();
    const pedido = this.pedidoResource.value();
    let ingresoDinero = this.ingresoDinero() ?? 0;
    let egresoDinero = this.egresoDinero() ?? 0;
    let tipoPagoId = this.tipoPagoId() ?? 0;

    if (!pedido) {
      return {
        tipoPagoId: tipoPagoId,
        movimientoInicial: select as MovimientoInicialEnum,
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
    if (pedido.tipoPedido === TipoPedidoEnum.VENTA) {
      if (select == MovimientoInicialEnum.INGRESO) {
        let newSaldo = (saldoPedido - ingresoDinero)
        if (newSaldo >= 0) { egresoDinero = 0; }
        if (newSaldo < 0) { egresoDinero = newSaldo }
      }
      if (select == MovimientoInicialEnum.EGRESO) {
        let newSaldo = (flujoEfectivoTotal - egresoDinero)
        if (newSaldo >= 0) { ingresoDinero = 0; }
        if (newSaldo < 0) { ingresoDinero = newSaldo }
      }
    }
    if (pedido.tipoPedido === TipoPedidoEnum.COMPRA) {
      if (select == MovimientoInicialEnum.EGRESO) {
        let newSaldo = (saldoPedido - egresoDinero)
        if (newSaldo >= 0) { ingresoDinero = 0; }
        if (newSaldo < 0) { ingresoDinero = newSaldo }
      }
      if (select == MovimientoInicialEnum.INGRESO) {
        let newSaldo = (flujoEfectivoTotal - ingresoDinero)
        if (newSaldo >= 0) { egresoDinero = 0; }
        if (newSaldo < 0) { egresoDinero = newSaldo }
      }

    }

    return {
      tipoPagoId: tipoPagoId,
      movimientoInicial: select as MovimientoInicialEnum,
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

  limpiar(tipoPedidoId: number) {
    this.pedidoId.set('');
    this.identificadorComprobante.set(null);
    this.newPedido.set(null);
    this.frm.get('pedidoIdSearch')?.setValue('');
    if (this.isFromPedidos()) {
      if (tipoPedidoId == TipoPedidoEnum.VENTA) {
        this.router.navigate(['/pedidos/listado-ventas'])
      } else {
        this.router.navigate(['/pedidos/listado-compras']);
      }
    }
  }

  goToListado() {
    //if (this.isFromPedidos()) {
    if (this.pedidoResource.value()?.tipoPedido == TipoPedidoEnum.VENTA) {
      this.router.navigate(['/pedidos/listado-ventas'])
    } else {
      this.router.navigate(['/pedidos/listado-compras']);
    }
    //}
  }

  regitrarMovimiento() {
    if (!this.frm.valid) { return }
    const pedido = this.pedidoResource.value()
    if (!pedido) { return }
    pedido.items = []
    pedido.movimientos = [this.movimiento()];


    this.pedidoService.createMovimiento(pedido)
      .pipe(
        tap(pedido => this.newPedido.set(pedido)),
        /* captura los errores de movimientos antes de pasar al concat
        catchError(err => {
          this.alertService.error(
            err?.error?.message ?? 'Error al registrar movimiento.', 'Movimientos');
          return EMPTY;
        }),*/
        concatMap(pedido =>
          this.pedidoService.previewMovToPersonaInPDF(pedido)
          /*.pipe(
            Captura los errores de generar previewDpf
            catchError(err => {
              this.alertService.error(
                err?.error?.message ?? 'Error al generar PDF.', 'Movimientos');
              return EMPTY;
            })
          )*/
        )
      ).subscribe({
        next: response => {
          const blob = response.body;

          if (!blob) {
            this.alertService.error('No se recibió el PDF del movimiento.', 'Movimientos');
            return;
          }

          const url = window.URL.createObjectURL(blob);
          const ventana = window.open(url);

          if (!ventana) {
            window.URL.revokeObjectURL(url);

            this.alertService.error('El navegador bloqueó la ventana emergente.', 'Movimientos');
            return;
          }

          const intervalo = setInterval(() => {
            try {
              if (ventana.document.readyState === 'complete') {
                clearInterval(intervalo);
                ventana.focus();
                ventana.print();
              }
            } catch (error) {
              // La ventana puede tener un origen distinto
              // al de la aplicación.
              console.debug('Esperando que cargue el PDF', error);
            }
          }, 900);
          //fileSaver.saveAs(response.body!, this.pedidoService.filenameFromHeader(response.headers));

          this.refreshCajaUsuario.update(v => v + 1);

          const mov = this.newPedido()?.movimientos.at(-1);
          //const movimientoeNUM = getNameMovimientoInicialEnum(mov?.movimientoInicial)
          //const pedidoEnum = TipoPedidoEnum[this.newPedido()?.tipoPedido!]
          //const num = this.newPedido()!.id.toString().padStart(6, '0');
          //console.log("movimientoeNUM", movimientoeNUM);
          //console.log("pedidoEnum", pedidoEnum);
          //console.log("Numero", num);


          this.snackbar.success(`${getNameMovimientoInicialEnum(mov?.movimientoInicial)}
          ${TipoPedidoEnum[this.newPedido()?.tipoPedido!]} PED N° ${this.newPedido()!.id.toString().padStart(6, '0')} generado`);

          if (this.isInvalidToComprobante()) {
            this.limpiar(this.newPedido()?.tipoPedido!)
            //this.pedidoId.set('');
            //this.frm.get('pedidoIdSearch')?.setValue('');
          }
        },

        error: (err: HttpErrorResponse) => {
          const message = err.error?.message ?? 'Error al aplicar movimiento.';
          this.snackbar.error(message)
          console.error(err);
        }
      });
    //}
    /*       if (select === MovimientoInicialEnum.EGRESO) {
            this.pedidoService.createMovimiento(pedidoRequest).pipe(
            ).subscribe({
              next: (response) => {
                this.newPedido.set(response);
                this.refreshCajaUsuario.update(v => v + 1);
                this.alertService.success(`${this.etiquetasPedido[pedido.tipoPedido]} con éxito`, "Éxito");
                if (this.isInvalidToComprobante()) {
                  this.limpiar(TipoPedidoEnum.VENTA);
                }
              },
              error: (err) => {
                console.error(err);
              }
            });
          } */
    //}
    /*     if (pedido.tipoPedido == TipoPedidoEnum.COMPRA) {
          this.pedidoService.createMovimiento(pedidoRequest).subscribe(response => {
            this.refreshCajaUsuario.update(v => v + 1);
            this.alertService.success(`${this.etiquetasPedido[pedido.tipoPedido]} con exito`, "Exito");
            this.limpiar(TipoPedidoEnum.COMPRA)

          })
        } */
  }


  generarComprobanteVenta() {
    if (this.isInvalidToComprobante()) { return }

    //const ubicacionCaja = this.caja()?.pathFacturador

    this.pedidoService.createComprobanteVenta(this.newPedido()!).pipe(
      concatMap(com => this.launcherSfsService.generarComprobante(com)),
    ).subscribe({
      next: response => {

        //fileSaver.saveAs(response.body!, this.pedidoService.filenameFromHeader(response.headers));

        //this.refreshCajaUsuario.update(v => v + 1);
        //this.snackbar.success(`${this.identificadorComprobante()} encontrado`);
        //this.newPedido.set(null);
        this.identificadorComprobante.set(response.data)
        this.snackbar.success(`${response.message}`);

        //if (this.isInvalidToComprobante()) {
        //  this.limpiar(this.newPedido()?.tipoPedido!);
        //}
      },

      error: (err: HttpErrorResponse) => {
        const message =
          err.error?.message ??
          'No se pudieron generar los archivos del comprobante.';

        this.snackbar.error(message);
        console.error('Error al generar archivos:', err);
      }


    }
    )

  }

  generarComprobanteNotaCredito() {
    if (this.isInvalidToComprobante()) { return }
    this.pedidoService.createComprobanteNotaCredito(this.newPedido()!).pipe(
      concatMap(com => this.launcherSfsService.generarComprobante(com))
    ).subscribe(response => {
      console.log("response:", response);
      this.alertService.success(`${response.message}`, "Exito");
      this.limpiar(this.newPedido()?.tipoPedido!)
    })
  }

  impirmirComprobanteVenta() {

    const idC = this.identificadorComprobante();
    if (!idC) { return }

    const request: ComprobantePdfRequest = {
      identificadorComprobante: idC,
      formatoImpresion: FormatoImpresionEnum.TICKET
    }

    this.launcherSfsService.previewComprobanteToPersonaInPDF(request).pipe(
    ).subscribe({
      next: response => {
        const blob = response.body;
        if (!blob) {
          this.alertService.error('No se recibió el PDF del Comprobante.', 'Comprobantes');
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const ventana = window.open(url);

        if (!ventana) {
          window.URL.revokeObjectURL(url);

          this.alertService.error('El navegador bloqueó la ventana emergente.', 'Comprobantes');
          return;
        }

        const intervalo = setInterval(() => {
          try {
            if (ventana.document.readyState === 'complete') {
              clearInterval(intervalo);
              ventana.focus();
              ventana.print();
            }
          } catch (error) {
            // La ventana puede tener un origen distinto al de la aplicación.
            console.debug('Esperando que cargue el Comprobante PDF', error);
          }
        }, 900);
        //fileSaver.saveAs(response.body!, this.pedidoService.filenameFromHeader(response.headers));

        //this.refreshCajaUsuario.update(v => v + 1);
        //this.snackbar.success(`${this.identificadorComprobante()} encontrado`);
        //this.identificadorComprobante.set(null);
        //this.newPedido.set(null);
        //if (this.isInvalidToComprobante()) {
        this.limpiar(this.newPedido()?.tipoPedido!);
        //}
      },

      error: async (err: HttpErrorResponse) => {
        let message = 'No se pudo generar el PDF del comprobante.';

        if (err.error instanceof Blob) {
          try {
            const text = await err.error.text();
            const response = JSON.parse(text);

            message = response.message ?? message;
          } catch {
            // Si el Blob no contiene JSON válido, usamos el mensaje por defecto.
          }
        } else if (err.error?.message) {
          message = err.error.message;
        }

        this.snackbar.error(message);
        console.error(err);
      }


    }
    )
  }

  public isInvalidToComprobante(): boolean {
    const newPedido = this.newPedido()
    const select = this.selectMovimiento();

    return !this.frm.valid
      || this.launcherSfsService.state() != 'running'
      || newPedido == null
      || newPedido.tipoPedido != TipoPedidoEnum.VENTA
      || newPedido.pagoTotal <= 0
      //|| newPedido.saldoPedido > 0
      || (select == MovimientoInicialEnum.INGRESO && newPedido.saldoPedido > 0) // solo puede tener 1 comporbante cuando cancela todo
      || (select == MovimientoInicialEnum.EGRESO && newPedido.saldoPedido != newPedido.precioTotal) // para devolucion el saldo
      || (select == MovimientoInicialEnum.INGRESO && newPedido.comprobantesSunat.length > 0) // solo puede tener 1 comporbante cuando cancela todo
      || (select == MovimientoInicialEnum.EGRESO && newPedido.comprobantesSunat.length < 1)
      || this.personaDelPedido()?.tipoDocumentoIdentidad == TipoDocumentoIdentidadEnum.OTRO
  }

}


