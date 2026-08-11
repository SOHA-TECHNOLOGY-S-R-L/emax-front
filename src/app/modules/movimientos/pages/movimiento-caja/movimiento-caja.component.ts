import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { TipoMovimientoCaja } from '../../../../models/tipo-movimiento-caja';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CajaService } from '../../../../services/caja.service';
import { MovimientoService } from '../../../../services/movimiento.service';
import { FormUtils } from '../../../../utils/form-utils';
import { InfoCajaUsuarioComponent } from '../../../caja/components/info-caja-usuario/info-caja-usuario.component';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-movimiento-caja',
  templateUrl: './movimiento-caja.component.html',
  styleUrl: './movimiento-caja.component.css',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, RouterModule, FormsModule, ReactiveFormsModule, InfoCajaUsuarioComponent]

})
export class MovimientoCajaComponent {

  private cajasService = inject(CajaService);
  private movimientoService = inject(MovimientoService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  tipoPagosResource = rxResource({
    stream: () => this.movimientoService.getAllTipoPagos(),
  });


  tipoMovimientosCajaResource = rxResource({
    stream: () => this.movimientoService.getAllTipoMovimientosCaja(),
  });

  tipoMovCajaIngresos = computed(() => {
    const lst = this.tipoMovimientosCajaResource.value() ?? [];
    return lst.filter(f => f.tipo === "I")
  })

  tipoMovCajaEgresos = computed(() => {
    const lst = this.tipoMovimientosCajaResource.value() ?? [];
    return lst.filter(f => f.tipo === "E")
  })

  selectTipoMovimiento = signal<string>('I')

  titulo = computed(() => {
    const tmov = this.selectTipoMovimiento()
    //const mov = tmov == 'I' ? 'Ingreso' : 'Egreso'
    return `Registro de ${tmov == 'I' ? 'Ingreso' : 'Egreso'} a caja chica`;
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

  cajaUsuarioResource = rxResource({
    params: () => ({
      usuario: this.usuario(),
      refresh: this.refreshCajaUsuario()
    }),
    stream: ({ params }) => {
      if (!params?.usuario?.username) return of(null);
      return this.cajasService.getCajaUsuarioActiveByUserName(params.usuario.username)
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
    }
  });

  // cajaUsuario = signal<CajaUsuario | null>(null);

  /*   existCajaUsuarioEffect = effect(() => {
      const cju = this.cajaUsuarioResource.value();
      if (!cju) { return }
      this.cajaUsuario.set(cju);
    }); */

  constructor() { }

  tipoMovimientosCajaLst = signal<TipoMovimientoCaja[]>([]);

  loadTipoMovimientosLstEffect = effect(() => {
    const select = this.selectTipoMovimiento()
    this.resetForm();
    if (select === "I") {
      this.tipoMovimientosCajaLst.set([...this.tipoMovCajaIngresos()])
    }
    if (select === "E") {
      this.tipoMovimientosCajaLst.set([...this.tipoMovCajaEgresos()])
    }
    this.frm.get('iMovimiento')!.setValue(select)
  })


  frm = this.formBuilder.group({
    //pedidoIdSearch: ['', Validators.required],
    iMovimiento: [this.selectTipoMovimiento()],
    tipoMovimientoCajaId: [0, [Validators.required, Validators.min(1)]],
    //saldoPedido: [{ value: 0, disabled: true }],
    //flujoEfectivoTotal: [{ value: 0, disabled: true }],
    ingresoDinero: [0, { validators: [Validators.required] }],
    egresoDinero: [0, { validators: [Validators.required] }],
    tipoPagoId: [0, [Validators.required, Validators.min(1)]],
    descripcion: [''],

  });

  ingresoDinero = toSignal(
    this.frm.get('ingresoDinero')!.valueChanges,
    { initialValue: this.frm.get('ingresoDinero')!.value }
  );

  egresoDinero = toSignal(
    this.frm.get('egresoDinero')!.valueChanges,
    { initialValue: this.frm.get('egresoDinero')!.value }
  );

  descripcion = toSignal(
    this.frm.get('descripcion')!.valueChanges,
    { initialValue: this.frm.get('descripcion')!.value }
  );

  /*   tipoPagoId = toSignal(
      this.frm.get('tipoPagoId')!.valueChanges,
      { initialValue: this.frm.get('tipoPagoId')!.value }
    ); */

  movimiento = computed(() => {
    const select = this.selectTipoMovimiento();
    let ingresoDinero = this.ingresoDinero() ?? 0;
    let egresoDinero = this.egresoDinero() ?? 0;
    let descripcion = this.descripcion() ?? '';

    if (ingresoDinero <= 0 && egresoDinero <= 0) {
      ingresoDinero = 0;
      egresoDinero = 0;
    }
    if (select == 'I') {
      egresoDinero = 0;
    }
    if (select == 'E') {
      ingresoDinero = 0;
    }

    return {
      tipoPagoId: this.frm.controls.tipoPagoId.value!,
      tipoMovimientoCajaId: this.frm.controls.tipoMovimientoCajaId.value!,
      ingresoDinero,
      egresoDinero,
      descripcion
    };
  })

  formUtils = FormUtils;


  onSubmitForm() {
    console.log("this.movimiento()", this.movimiento())
    this.movimientoService.createMovimientoCaja(this.movimiento()).subscribe({

      next: () => {
        this.refreshCajaUsuario.update(v => v + 1);
        this.selectTipoMovimiento.set('I');
        this.frm.get('iMovimiento')!.setValue('I')
        this.resetForm();
        this.alertService.info(`Movimiento registrado con éxito!`, "Movimiento");
      }
    })
  }

  resetForm() {
    //this.selectTipoMovimiento.set('I');
    this.frm.reset({
      //iMovimiento: 'I',
      tipoMovimientoCajaId: 0,
      ingresoDinero: 0,
      egresoDinero: 0,
      tipoPagoId: 0,
      descripcion: ''
    });

  }

}
