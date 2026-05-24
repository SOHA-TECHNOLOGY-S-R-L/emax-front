import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';


import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Caja } from '../../../../models/caja';
import { CajaUsuario } from '../../../../models/caja-usuario';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CajaService } from '../../../../services/caja.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { InfoCajaUsuarioComponent } from "../../components/info-caja-usuario/info-caja-usuario.component";
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';


@Component({
  selector: 'app-apertura-cierre-caja',
  templateUrl: './apertura-cierre-caja.component.html',
  styleUrls: ['./apertura-cierre-caja.component.css'],
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, RouterModule, FormsModule, ReactiveFormsModule, InfoCajaUsuarioComponent]
})
export class AperturaCierreCajaComponent {

  public authService = inject(AuthService);
  private cajaService = inject(CajaService);
  private usuarioService = inject(UsuarioService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  caja = signal(new Caja());

  cajaActiva = signal<boolean>(false);

  selectedCajaId = signal<number | null>(null);

  formCaja = this.fb.group({
    direccionCaja: ['', {
      validators: [Validators.required]
    }],
    descripcionCaja: ['', {
      validators: [Validators.required]
    }],
    saldoPorConteo: [0, {
      validators: [Validators.required]
    }],
    cajaId: [0, { validators: [Validators.required] }],
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

  selectedCajaUsuarioResource = rxResource({
    params: () => ({ cajaId: this.selectedCajaId() }),
    stream: ({ params }) => {
      if (!params?.cajaId) { return of(null); }

      return this.cajaService.getCajaUsuarioInactiveByCajaId(params.cajaId)
        .pipe(
          catchError(() => {
            return of(null);
          })
        );
    }
  });

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

      return this.cajaService.getCajaUsuarioActiveByUserName(params.usuario.username)
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
            return this.cajaService.getCajaUsuarioInactiveByUserName(params.usuario!.username)
              .pipe(
                catchError(() => of(null))
              );

          })
        );
    }
  });

  cajaUsuario = computed(() => this.cjUsuResource.value());

  infoCajaUsuario = computed(() => {
    if (this.selectedCajaId()) {
      return this.selectedCajaUsuarioResource.value();
    }
    return this.cajaUsuario();
  });

  isCajaActiveEffect = effect(() => {
    const cju = this.cajaUsuario();
    if (!cju) { return }
    this.cajaActiva.set(cju.activa);
  });

  cajasResource = rxResource({ stream: () => this.cajaService.getCajasPorAsignar() });

  constructor() { }

  asignarCajaUsuario(cajaId: number) {
    this.selectedCajaId.set(cajaId);
    const cajas = this.cajasResource.value();
    if (!cajas) { return; }

    const caja = cajas.find(c => c.id === cajaId);
    if (!caja) { return; }

    this.caja.set(caja);

    this.formCaja.patchValue({
      direccionCaja: caja.direccion,
      descripcionCaja: caja.descripcion
    });
  }

  abrirCaja() {

    this.caja.update((cj) => {
      if (!cj) return cj; // Validación por si el valor inicial es null/undefined
      return {
        ...cj,
        direccion: this.formCaja.get('direccionCaja')!.value!,
        descripcion: this.formCaja.get('descripcionCaja')!.value!
      };
    });

    if (!this.formCaja.valid) { return }
    this.cajaService.createCajaUsuario(this.caja()).subscribe(
      response => {
        //this.alertService.success(`Se habrió ${this.cajaUsuario.caja.nombre}, para ${this.cajaUsuario.usuario.username} con éxito!`, "Caja",)
        this.refreshCajaUsuario.update(v => v + 1);
        this.alertService.success(`Se habrió la caja con éxito!`, "Caja",)
        this.router.navigate(['/']);
      })
    //})
  }

  cerrarCaja() {
    const cju = this.cajaUsuario();
    if (!cju) { return }
    const saldoPorConteo = this.formCaja.get('saldoPorConteo')!.value ?? 0;
    const saldoFinal = cju.saldoFinal ?? 0;
    if (saldoPorConteo == saldoFinal) {
      this.cajaService.cerrarCajaUsuario(cju.id, saldoPorConteo).subscribe(
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
