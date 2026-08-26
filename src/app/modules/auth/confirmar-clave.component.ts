import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FormUtils } from '../../utils/form-utils';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';



@Component({
  selector: 'confirmar-clave',
  standalone: true,
  templateUrl: './confirmar-clave.component.html',
  styleUrl: './confirmar-clave.component.css',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ConfirmarClaveComponent {
  private formBuilder = inject(FormBuilder);

  clave: string = '';
  confirClave: string = '';

  //formEqualsClaves!: FormGroup;
  formUtils = FormUtils;

  readonly formEqualsClaves: FormClaves =
    this.formBuilder.group({
      clave: this.formBuilder.nonNullable.control('',
        [Validators.required, Validators.minLength(4), Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d).{4,}$')]),
      confirmaClave: this.formBuilder.nonNullable.control('',
        [Validators.required, Validators.minLength(4), Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d).{4,}$')])
    },
      { validators: this.clavesIgualesValidator }
    );

  @Output() outFormEqualsClavesChange: EventEmitter<FormClaves> = new EventEmitter();

  constructor() { /** * Emitimos el formulario inicial. */
    this.outFormEqualsClavesChange.emit(this.formEqualsClaves);
    /** * Emitimos el formulario cada vez que * cambie alguno de sus controles. */
    this.formEqualsClaves.valueChanges.subscribe(() => {
      this.outFormEqualsClavesChange.emit(this.formEqualsClaves);
    });
  }



  /** Validador personalizado: asegura que las claves coincidan */
  private clavesIgualesValidator(group: AbstractControl): ValidationErrors | null {
    const clave = group.get('clave')?.value;
    const confirmaClave = group.get('confirmaClave')?.value;
    const confirmaClaveControl = group.get('confirmaClave'); /** * Si todavía no se han introducido ambas claves, * dejamos que actúen los validadores individuales. */

    if (!clave || !confirmaClave) {
      if (confirmaClaveControl?.hasError('notSame')) {
        const errors = { ...confirmaClaveControl.errors };
        delete errors['notSame'];
        confirmaClaveControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return null;
    } /** * Las claves no coinciden. */

    if (clave !== confirmaClave) {
      confirmaClaveControl?.setErrors({ ...confirmaClaveControl.errors, notSame: true });
      return { notSame: true };
    } /** * Las claves coinciden. * * Eliminamos únicamente el error `notSame`, * sin afectar required, minlength o pattern. */

    if (confirmaClaveControl?.hasError('notSame')) {
      const errors = { ...confirmaClaveControl.errors };
      delete errors['notSame'];
      confirmaClaveControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    return null;
  }
}

type FormClaves = FormGroup<{
  clave: FormControl<string>;
  confirmaClave: FormControl<string>;
}>;
