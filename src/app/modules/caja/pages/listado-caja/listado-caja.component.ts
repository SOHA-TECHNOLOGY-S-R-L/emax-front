import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatAccordion } from '@angular/material/expansion';
import { AngularMaterialModule } from './../../../compartido/angular-material.module';
import { CajaService } from '../../../../services/caja.service';
import { AuthService } from '../../../../services/auth.service';
import { Caja } from '../../../../models/caja';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-caja',
  standalone: true,
  templateUrl: './listado-caja.component.html',
  styleUrl: './listado-caja.component.css',
  imports: [CommonModule, ReactiveFormsModule, AngularMaterialModule]
})
export class ListadoCajaComponent {


  private readonly formBuilder = inject(FormBuilder);
  private readonly cajaService = inject(CajaService);
  public readonly authService = inject(AuthService);
  private router = inject(Router)


  readonly accordion = viewChild.required(MatAccordion);

  readonly cajasResource = rxResource({
    stream: () => this.cajaService.getAllCaja()
  });

  readonly cajas = computed(
    () => this.cajasResource.value() ?? []
  );

  /**
   * Formulario independiente por cada caja.
   * La key es el ID de la caja.
   */
  private readonly formularios = new Map<number, FormGroup>();

  /**
   * Permite saber qué cajas están actualmente en modo edición.
   */
  readonly cajasEditando = signal<Set<number>>(new Set());

  constructor() {

    /**
     * Cada vez que cambia la lista de cajas, nos aseguramos de tener un formulario para cada una.
     */
    effect(() => {

      const cajas = this.cajas();

      cajas.forEach(caja => {
        if (!this.formularios.has(caja.id!)) {
          this.formularios.set(
            caja.id!,
            this.crearFormularioComprobanteCorrelativo(caja)
          );
        }

      });
    });
  }

  /**
   * Crea el formulario de una caja.
   * Todos los controles comienzan deshabilitados.
   */
  private crearFormularioComprobanteCorrelativo(caja: Caja): FormGroup {

    return this.formBuilder.group({
      boletaCorrelativo: [
        { value: caja.boletaCorrelativo ?? null, disabled: true }, [Validators.required, Validators.min(0)]],

      notaCreditoDeBoletaCorrelativo: [
        { value: caja.notaCreditoDeBoletaCorrelativo ?? null, disabled: true }, [Validators.required, Validators.min(0)]],

      facturaCorrelativo: [
        { value: caja.facturaCorrelativo ?? null, disabled: true }, [Validators.required, Validators.min(0)]],

      notaCreditoDeFacturaCorrelativo: [
        { value: caja.notaCreditoDeFacturaCorrelativo ?? null, disabled: true }, [Validators.required, Validators.min(0)]],

      /*       pathFacturador: [
              { value: caja.pathFacturador ?? '', disabled: true }, [ Validators.required ] ] */
    });
  }

  /**
   * Obtiene el formulario correspondiente a una caja.
   */
  formularioComprobanteCorrelativo(cajaId: number): FormGroup {

    const formulario = this.formularios.get(cajaId);
    if (!formulario) {
      throw new Error(`No existe formulario para la caja ${cajaId}`);
    }
    return formulario;
  }

  /**
   * Indica si una caja está actualmente en edición.
   */
  estaEditando(cajaId: number): boolean {
    return this.cajasEditando().has(cajaId);
  }

  /**
   * Activa la edición de una caja.
   */
  ajustarCorrelativos(caja: Caja): void {
    const formulario = this.formularioComprobanteCorrelativo(caja.id!);
    formulario.enable();
    this.cajasEditando.update(ids => {
      const nuevosIds = new Set(ids);
      nuevosIds.add(caja.id!);
      return nuevosIds;
    });
  }


  editarCaja(caja: Caja): void {
    this.cajaService.setCaja(caja);
    this.router.navigate(['cajas/mantenimiento']);
  }

  nuevaCaja() {
    this.cajaService.limpiarCaja();

    this.router.navigate(['cajas/mantenimiento']);
  }

  /**
   * Guarda los datos editables de una caja.
   */
  guardarCorrelativos(caja: Caja): void {
    const formulario = this.formularioComprobanteCorrelativo(caja.id!);
    if (formulario.invalid) {
      formulario.markAllAsTouched();
      return;
    }

    /**
     * getRawValue() nos permite obtener todos los valores incluso si posteriormente agregamos controles disabled.
     * Actualmente estamos en modo edición, por lo que también podríamos utilizar formulario.value.
     */
    const valores = formulario.getRawValue();

    const request = {
      //id: caja.id,
      boletaCorrelativo: valores.boletaCorrelativo,
      notaCreditoDeBoletaCorrelativo:
        valores.notaCreditoDeBoletaCorrelativo,
      facturaCorrelativo: valores.facturaCorrelativo,
      notaCreditoDeFacturaCorrelativo:
        valores.notaCreditoDeFacturaCorrelativo,
      //pathFacturador: valores.pathFacturador
    };

    this.cajaService.actualizarComprobantesCorrelativos(request, caja.id!).subscribe({

      next: () => {

        /**
         * Después de guardar correctamente:
         * - bloqueamos los controles
         * - quitamos la caja del modo edición
         */
        formulario.disable();

        this.cajasEditando.update(ids => {
          const nuevosIds = new Set(ids);
          nuevosIds.delete(caja.id!);
          return nuevosIds;
        });

        /**
         * Recarga la información desde backend.
         */
        this.cajasResource.reload();
      },

      error: error => {

        console.error(
          'Error al actualizar la caja',
          error
        );

        /**
         * Importante:
         * si falla el backend, NO deshabilitamos el formulario.
         *
         * El usuario puede corregir los datos y volver a guardar.
         */
      }
    });
  }


}
