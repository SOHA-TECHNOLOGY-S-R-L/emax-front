import { Component, computed, effect, inject, signal } from '@angular/core';


import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { Caja } from '../../../../models/caja';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CajaUsuarioService } from '../../../../services/caja-usuario.service';
import { CajaService } from '../../../../services/caja.service';
import { LauncherSfsService } from '../../../../services/launcher-sfs.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { LauncherSfsComponent } from "../../../compartido/launcher-sfs/launcher-sfs.component";
import { InfoCajaUsuarioComponent } from "../../components/info-caja-usuario/info-caja-usuario.component";


@Component({
  selector: 'app-apertura-cierre-caja',
  templateUrl: './apertura-cierre-caja.component.html',
  styleUrls: ['./apertura-cierre-caja.component.css'],
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, RouterModule, FormsModule, ReactiveFormsModule, InfoCajaUsuarioComponent, LauncherSfsComponent]
})
export class AperturaCierreCajaComponent {

  public authService = inject(AuthService);
  private cajaUsuarioService = inject(CajaUsuarioService);
  private launcherSfsService = inject(LauncherSfsService);
  private cajaService = inject(CajaService);
  private usuarioService = inject(UsuarioService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  caja = signal(new Caja());

  cajaActiva = signal<boolean>(false);

  selectedCajaId = signal<number | null>(null);

  formCaja = this.fb.group({
    saldoPorConteo: [0, {
      validators: [Validators.required]
    }],
    cajaId: [null, { validators: [Validators.required] }],
  })


  usuario = computed(() => {
    const isAutenticado = this.authService.isAuthenticated()
    if (!isAutenticado) {
      return
    }
    return this.authService.usuario();
  })

  usuarioNotAutthenticateEffect = effect(() => {
    const user = this.usuario();
    if (user === undefined) { return; }

    if (!user) {
      this.alertService.info(`Se cerró la sesión por tiempo de inactividad`, "Caja");
      this.router.navigate(['/']);
    }
  });

  /*   selectedCajaUsuarioInactiveResource = rxResource({
      params: () => ({ cajaId: this.selectedCajaId() }),
      stream: ({ params }) => {
        if (!params?.cajaId) { return of(null); }

        return this.cajaUsuarioService.getCajaUsuarioInactiveByCajaId(params.cajaId)
          .pipe(
            catchError(() => {
              return of(null);
            })
          );
      }
    }); */

  refreshCajaUsuario = signal(0);

  cjUsuResource = rxResource({
    params: () => ({
      usuario: this.usuario(),
      refresh: this.refreshCajaUsuario()
    }),

    stream: ({ params }) => {

      if (!params?.usuario?.username) {
        return of(null);
      }

      return this.cajaUsuarioService.getCajaUsuarioActiveByUserName(params.usuario.username)
        .pipe(
          catchError(() => {
            return of(null);
          }),
          switchMap(active => {

            // SI EXISTE ACTIVA -> retornar
            if (active) {
              return of(active);
            }

            // SI NO EXISTE -> buscar inactiva
            return this.cajaUsuarioService.getCajaUsuarioInactiveByUserName(params.usuario!.username)
              .pipe(
                catchError(() => of(null))
              );

          })
        );
    }
  });

  cajaUsuario = computed(() => this.cjUsuResource.value());

  /*   infoCajaUsuario = computed(() => {
      if (this.selectedCajaId()) {
        return this.selectedCajaUsuarioInactiveResource.value();
      }
      return this.cajaUsuario();
    });
   */
  isCajaActiveEffect = effect(() => {
    const cju = this.cajaUsuario();
    if (!cju) { return }
    this.cajaActiva.set(cju.activa);
    this.seleccionarCaja(cju.cajaId)
  });

  cajasPorAsignarResource = rxResource({ stream: () => this.cajaService.getCajasPorAsignar() });

  cajasResource = rxResource({ stream: () => this.cajaService.getAllCaja() });

  protected readonly isFacturadorActive = computed(() =>
    this.launcherSfsService.state() != 'launcher'
  )


  constructor() { }

  seleccionarCaja(cajaId: number) {
    //this.selectedCajaId.set(cajaId);
    const cajas = this.cajasResource.value();
    if (!cajas) { return; }

    const caja = cajas.find(c => c.id === cajaId);
    if (!caja) { return; }

    this.caja.set(caja);
  }

  abrirCaja() {


    if (!this.formCaja.valid) { return }
    this.cajaUsuarioService.createCajaUsuario(this.caja()).subscribe(
      response => {
        //this.alertService.success(`Se habrió ${this.cajaUsuario.caja.nombre}, para ${this.cajaUsuario.usuario.username} con éxito!`, "Caja",)
        this.refreshCajaUsuario.update(v => v + 1);
        this.alertService.success(`Se habrió la caja con éxito!`, "Caja",)
        //this.router.navigate(['/']);
      })
    //})
  }

  cerrarCaja() {
    const cju = this.cajaUsuario();
    if (!cju) { return }
    const saldoPorConteo = this.formCaja.get('saldoPorConteo')!.value ?? 0;
    const saldoFinal = cju.saldoFinal ?? 0;
    if (saldoPorConteo == saldoFinal) {
      this.cajaUsuarioService.cerrarCajaUsuario(cju.id, saldoPorConteo).subscribe(
        response => {
          //this.alertService.success(`Se cerró ${this.cajaUsuario.caja.nombre}, para ${this.cajaUsuario.usuario.username} con éxito!`, "Caja")
          this.alertService.success(`Se cerró la caja con éxito!`, "Caja")
          this.router.navigate(['/']);
        }
      )
    } else {
      //this.alertService.warning(`No puede cerrar ${this.cajaUsuario.caja.nombre}, existe diferencias`, "Caja")
      this.alertService.warning(`No se puede cerrar caja, existe diferencias`, "Caja")
    }
  }




}
