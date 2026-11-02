import { getVendedorEnCajaEnumByNumeroDocumento, VendedorEnCajaEtiquetas } from './../../../../enums/vendedor-en-caja.enum';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Caja } from '../../../../models/caja';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormUtils } from '../../../../utils/form-utils';
import { CajaService } from '../../../../services/caja.service';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../services/alert.service';
import { VendedorEnCajaEnum } from '../../../../enums/vendedor-en-caja.enum';

@Component({
  selector: 'app-caja-mantenimiento',
  standalone: true,
  templateUrl: './caja-mantenimiento.component.html',
  styleUrl: './caja-mantenimiento.component.css',
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class CajaMantenimientoComponent {

  private formBuilder = inject(FormBuilder);
  private cajaService = inject(CajaService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  formUtils = FormUtils;

  readonly caja = this.cajaService.cajaSeleccionada;

  readonly modoEdicion = computed(
    () => this.caja() !== null
  );

  readonly titulo = computed(
    () => this.modoEdicion() ? 'Editar caja' : 'Nueva caja'
  );

  //caja = signal<Caja>(new Caja());

  readonly formCaja = this.formBuilder.group({
    nombre: [null as string | null, Validators.required],
    responsable: [null as string | null, Validators.required],
    direccion: [null as string | null, Validators.required],
    boletaSerie: [null as string | null, Validators.required],
    notaCreditoDeBoletaSerie: [null as string | null, Validators.required],
    facturaSerie: [null as string | null, Validators.required],
    notaCreditoDeFacturaSerie: [null as string | null, Validators.required],
    pathFacturador: [null as string | null, Validators.required],
    numeroDocumentoFacturador: [null as string | null, Validators.required],

  });

  vendedores = Object.values(VendedorEnCajaEnum);
  vendedorEnCajaEtiquetas = VendedorEnCajaEtiquetas;


  constructor() {
    /**
     * Si existe una caja seleccionada, cargamos sus valores en el formulario.
     */

    const caja = this.caja();

    if (!caja) { return; }

    this.formCaja.patchValue({
      nombre: caja.nombre ?? null,
      responsable: caja.responsable ?? null,
      direccion: caja.direccion ?? null,

      boletaSerie: caja.boletaSerie ?? null,

      notaCreditoDeBoletaSerie:
        caja.notaCreditoDeBoletaSerie ?? null,

      facturaSerie:
        caja.facturaSerie ?? null,

      notaCreditoDeFacturaSerie:
        caja.notaCreditoDeFacturaSerie ?? null,

      pathFacturador:
        caja.pathFacturador ?? null,

      numeroDocumentoFacturador: caja.vendedorEnCaja ?? null
      // caja.vendedorEnCaja == null ? null : VendedorEnCajaEtiquetas[caja.vendedorEnCaja].numeroDocumentoFacturador


    });

  }


  guardarCaja(): void {
    if (this.formCaja.invalid) {
      this.formCaja.markAllAsTouched();
      return;
    }

    const valores = this.formCaja.getRawValue();
    const cajaActual = this.caja();

    if (cajaActual) {

      const cajaActualizada: Caja = {
        ...cajaActual,

        nombre: valores.nombre!,
        responsable: valores.responsable!,
        direccion: valores.direccion!,

        boletaSerie: valores.boletaSerie!,
        notaCreditoDeBoletaSerie:
          valores.notaCreditoDeBoletaSerie!,

        facturaSerie:
          valores.facturaSerie!,

        notaCreditoDeFacturaSerie:
          valores.notaCreditoDeFacturaSerie!,

        pathFacturador:
          valores.pathFacturador!,

        //vendedorEnCaja: getVendedorEnCajaEnumByNumeroDocumento (this.formCaja.get('numeroDocumentoFacturador')?.value!)!

        vendedorEnCaja: valores.numeroDocumentoFacturador!,

      };

      this.cajaService.actualizarCaja(cajaActualizada, cajaActual.id!).subscribe({
        next: caja => {
          this.cajaService.setCaja(caja);
          this.router
        },
        error: error => {
          console.error(
            'Error al actualizar la caja',
            error
          );
        }
      });

      this.router.navigate(['cajas/listar']);
      return;
    }

    /**
     * Estamos creando una nueva caja.
     */
    const nuevaCaja: Caja = {
      //id: undefined,
      nombre: valores.nombre!,
      responsable: valores.responsable!,
      direccion: valores.direccion!,
      boletaSerie: valores.boletaSerie!,
      notaCreditoDeBoletaSerie: valores.notaCreditoDeBoletaSerie!,
      facturaSerie: valores.facturaSerie!,
      notaCreditoDeFacturaSerie: valores.notaCreditoDeFacturaSerie!,
      pathFacturador: valores.pathFacturador!,
      vendedorEnCaja: valores.numeroDocumentoFacturador!,


    };

    this.cajaService.crearCaja(nuevaCaja).subscribe({
      next: caja => {
        this.cajaService.setCaja(caja);
        this.router.navigate(['cajas/listar']);
      },
      error: error => {
        this.alertService.error("'Error al crear la caja'", "Caja")
        //console.error('Error al crear la caja', error);
      }

    });


  }


}
