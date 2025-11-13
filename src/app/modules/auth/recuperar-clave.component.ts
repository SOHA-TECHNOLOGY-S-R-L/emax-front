import { Usuario } from './../../models/usuario';
import { AlertService } from './../../services/alert.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AngularMaterialModule } from '../compartido/angular-material.module';
import { MatStepper, StepperOrientation } from '@angular/material/stepper';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { Persona } from '../../models/persona';
import { FormUtils } from '../../utils/form-utils';
import { UsuarioService } from '../../services/usuario.service';
import { ConfirmarClaveComponent } from './confirmar-clave.component';

@Component({
  selector: 'recuperar-clave',
  standalone: true,
  templateUrl: './recuperar-clave.component.html',
  styleUrl: './recuperar-clave.component.css',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, ConfirmarClaveComponent],
})
export class RecuperarClaveComponent {

  private usuarioService = inject(UsuarioService);
  private personaService = inject(PersonaService);
  private _formBuilder = inject(FormBuilder);
  private alert = inject(AlertService);
  private router = inject(Router)
  //public numDocumento: string | null | undefined;
  //firstFormGroup!: FormGroup;
  //secondFormGroup!: FormGroup;
  public persona!: Persona;
  public usuario!: Usuario;
  public emailPrincipal: string = '';
  public isValidFormEqualsClave = false;

  formUtils = FormUtils;


  @ViewChild('stepper') stepper!: MatStepper;

  firstFormGroup = this._formBuilder.group({
    numeroDocumento: ['',
      { validators: [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern('^\\d+$')] }
    ],
  });
  secondFormGroup = this._formBuilder.group({
    codigoVerificacion: ['',
      { validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^\\d+$')] }
    ],
  });

  //thirdFormGroup!: FormGroup;

  thirdFormGroup = this._formBuilder.group({

    confirmaClave: null,
  });

  stepperOrientation: Observable<StepperOrientation>;

  constructor() {
    const breakpointObserver = inject(BreakpointObserver);

    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }



  colocarCodigoVerificacionUsuario() {
    const numDocumento = this.firstFormGroup.get('numeroDocumento')?.value;
    if (numDocumento != null) {
      this.personaService.colocarCodigoRenovacionClave(numDocumento).subscribe(resp => {
        this.persona = resp
        this.emailPrincipal = this.formatoMailRecuperacion(this.persona.email!);
        if (this.persona.email) {
          this.stepper.next();
        }
      }, err => {
        //this.alert.error(err.error.mensaje, 'Error');
      });
    } else {
      return;
    }
  }

  formatoMailRecuperacion(mail: string): string {
    if (mail.length > 0) {
      const indLarge = mail.length;
      const indInicioDominio = (mail.indexOf('@') - 1)
      const partDominio = mail.slice(indInicioDominio, indLarge);
      const partCorreo = mail.slice(0, 2);
      return partCorreo + '...' + partDominio

    }
    return "";
  }

  valdiarCodigoVerificacion() {
    const codigoRenovacion = this.secondFormGroup.get('codigoVerificacion')?.value;
    if (this.persona.numeroDocumento != null && codigoRenovacion != null) {
      this.usuarioService.validarCodigoRenovaciónClaveUsuario(this.persona.numeroDocumento, codigoRenovacion).subscribe(resp => {
        if (resp.isCodValido) {
          this.stepper.next();
        } else {
          this.alert.error('El código ingresado no es valido', 'Error');
        }
      });
    } else {
      return;
    }
  }

  renovarClaveUsuario() {

    const clave = this.thirdFormGroup.get('confirmaClave.clave')?.value
    this.usuarioService.renovarClaveUsuario(this.persona.numeroDocumento!, clave!).subscribe(resp => {
      if (resp.isRenovarClaveUser) {
        //this.alert.success('Se ha renovado la clave correctamente', 'Éxito');
        this.stepper.next();
      } else {
        this.alert.error('No se pudo renovar la clave del usuario', 'Error');
      }
    });

  }


  formEqualsClavesChange(equalsClavesChange: FormGroup) {
    (this.thirdFormGroup as FormGroup).setControl('confirmaClave', equalsClavesChange);
    //this.thirdFormGroup.setControl('confirmaClave', equalsClavesChange);
    this.isValidFormEqualsClave = equalsClavesChange.valid
  }

  irLogin() {
    this.router.navigate(['/login']);
  }
}
