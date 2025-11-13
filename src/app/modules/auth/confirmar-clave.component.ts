import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
export class ConfirmarClaveComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private alertService = inject(AlertService);

  //@Input() parent!: FormGroup;

  //@Input() inClave!: string;
  //@Input() inConfirClave!: string;
  @Output() outFormEqualsClavesChange: EventEmitter<FormGroup> = new EventEmitter();

  clave: string = '';
  confirClave: string = '';

  formEqualsClaves!: FormGroup;
  //frmDefault!: FrmClaveDefault;
  formUtils = FormUtils;
  //isClaveEquals: boolean = false;

  ngOnInit() {
/*     this.frmDefault = {
      clave: '',
      confirmaClave: '',
    } */
    this.createForm();

    // Emitimos el formulario inicial
    this.outFormEqualsClavesChange.emit(this.formEqualsClaves);

    // Emitir el grupo completo al padre cuando cambie
    this.formEqualsClaves.valueChanges.subscribe(() => {
      this.outFormEqualsClavesChange.emit(this.formEqualsClaves);
    });
  }

  createForm() {
    this.formEqualsClaves = this.formBuilder.group({
      clave: ['', [Validators.required, Validators.minLength(4), Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d).{4,}$')]],
      confirmaClave: ['', [Validators.required, Validators.minLength(4), Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d).{4,}$')]]
    }, { validators: this.clavesIgualesValidator })
    //this.formArrayClave.push(formGroup);
  }

  /** Validador personalizado: asegura que las claves coincidan */
  private clavesIgualesValidator(group: AbstractControl): ValidationErrors | null {
    const clave = group.get('clave')?.value;
    const confirmaClave = group.get('confirmaClave')?.value;
    if (clave && confirmaClave && clave !== confirmaClave) {
      group.get('confirmaClave')?.setErrors({ notSame: true });
      return { notSame: true };
    }
    // si estaban con error pero ahora coinciden, limpiamos el error
    if (group.get('confirmaClave')?.hasError('notSame')) {
      group.get('confirmaClave')?.setErrors(null);
    }
    return null;
  }
}

/*   setValueControls() {
    this.frmDefault.clave = this.formEqualsClaves.get('clave')?.value
    this.frmDefault.confirmaClave = this.formEqualsClaves.get('confirmaClave')?.value
    this.createForm();
    if (this.formEqualsClaves.valid) {
      if (this.confirmarDobleInputClave(this.frmDefault.clave!, this.frmDefault.confirmaClave!)) {
        //this.outClave.emit(this.frmDefault.clave);
        this.outFormEqualsClavesChange.emit(this.formEqualsClaves);

      } else {
        this.formEqualsClaves.reset();
        this.alertService.error("La clave no coincide", "Clave")
      }
    }

  } */

  /*   confirmarDobleInputClave(clave: string, confirmaClave: string): boolean {
      return clave === confirmaClave;
    } */



/* interface FrmClaveDefault {
  clave?: string,
  confirmaClave?: string,
}
 */
