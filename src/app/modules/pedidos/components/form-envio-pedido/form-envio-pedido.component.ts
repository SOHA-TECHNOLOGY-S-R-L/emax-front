import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { FormUtils } from '../../../../utils/form-utils';
import { EnvioPedido } from '../../../../models/envio-pedido';
import { ENVIO_DEPARTAMENTO, ENVIO_DISTRITO, ENVIO_PROVINCIA } from '../../../../constants/constantes';

@Component({
  selector: 'form-envio-pedido',
  standalone: true,
  templateUrl: './form-envio-pedido.component.html',
  styleUrl: './form-envio-pedido.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule]

})
export class FormEnvioPedidoComponent {
  private fb = inject(FormBuilder);

  outEnvioPedido = output<any>();

  formUtils = FormUtils;
  SERVICIO_ENVIO_DISTRITO = ENVIO_DISTRITO;
  SERVICIO_ENVIO_PROVINCIA = ENVIO_PROVINCIA;
  SERVICIO_ENVIO_DEPARTAMENTO = ENVIO_DEPARTAMENTO;

  envioPedidoForm: FormGroup = this.fb.group({
    formaEnvio: [this.SERVICIO_ENVIO_DISTRITO, Validators.required],
    direccionEnvio: [
      null,
      [Validators.required, , Validators.minLength(2)]
    ],
    nomApellRzEnvio: [
      null,
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]
    ],

    celularEnvio: [
      null,
      [
        Validators.minLength(6),
        Validators.pattern(/^\+?(\d[\s-]?){6,15}$/)
      ]
    ],

  });

  constructor() {
    this.envioPedidoForm.valueChanges?.pipe(
      startWith(this.envioPedidoForm.getRawValue()),//Emite el valor inicial del formulario
      debounceTime(500), // Evita que el método dispare en cada pulsacion. Espera 500ms tras el último cambio
      distinctUntilChanged() // Solo dispara si el valor realmente cambió
    ).subscribe(() => {
      this.create();
    });
  }

  create(): void {
    const formValid = this.envioPedidoForm.valid;

    const envioPedido: EnvioPedido = {
      ...this.envioPedidoForm.value,
    };

    const formWithDatosEnvio = {
      formValid: formValid,
      envioPedido: { ...envioPedido }
    }
    this.outEnvioPedido.emit(formWithDatosEnvio);
  }

}
