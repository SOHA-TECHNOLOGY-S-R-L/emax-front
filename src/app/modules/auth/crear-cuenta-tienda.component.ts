import { Component, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { findIndex } from 'lodash-es';
import { Persona } from '../../models/persona';
import { AlertService } from '../../services/alert.service';
import { PersonaService } from '../../services/persona.service';
import { UsuarioService } from '../../services/usuario.service';
import { FormUtils } from '../../utils/form-utils';
import { AngularMaterialModule } from '../compartido/angular-material.module';
import { ConfirmarClaveComponent } from "./confirmar-clave.component";
import { TipoDocumentoIdentidadEnum, TipoDocumentoIdentidadEtiquetas } from '../../enums/tipo-documento-identidad.enum';
import { TipoPersonaEnum } from '../../enums/tipo-persona.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-crear-cuenta-tienda',
  templateUrl: './crear-cuenta-tienda.component.html',
  styleUrl: './crear-cuenta-tienda.component.css',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule, ConfirmarClaveComponent]
})

export class CrearCuentaTiendaComponent {

  private personaService = inject(PersonaService);
  private snack = inject(SnackbarService);

  private usuarioService = inject(UsuarioService);
  //private alertService = inject(AlertService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  formUtils = FormUtils;

  //tipoDocumentosIdentidad: TipoDocumento[] = [];
  //tipoPersonas: TipoPersona[] = [];
  persona: Persona = new Persona();
  //formNewCuenta!: FormGroup;
  //frmDefault!: FrmCrearCuentaDefault;

  formNewCuenta = this.formBuilder.group({
    tipoDocumentoIdentidad: [-1, Validators.required],
    numeroDocumento: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(12),
        Validators.pattern(/^\d+$/)
      ]
    ],
    apellNomRznSocial: ['',
      { validators: [Validators.required, Validators.minLength(2)] }
    ],
    direccionCompleta: ['',
      { validators: [Validators.required, Validators.minLength(5)] }
    ],
    celular: ['',
      [Validators.required, Validators.minLength(6), Validators.maxLength(14), Validators.pattern('^\\d+$')]
    ],
    correo: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]
    ],
    //confirmaClave: null,
    confirmaClave: this.formBuilder.group({
      clave: this.formBuilder.nonNullable.control(''),
      confirmaClave: this.formBuilder.nonNullable.control('')
    })
  })

  existePersona: boolean = false;
  isPassword: boolean = false;
  isValidFormEqualsClave = false;

  public tipoDocumentos = signal(
    Object.keys(TipoDocumentoIdentidadEtiquetas)
      .filter(key => !isNaN(Number(key)))
      .map(key => {
        const idNum = Number(key) as TipoDocumentoIdentidadEnum;
        return {
          id: idNum,
          nombre: TipoDocumentoIdentidadEtiquetas[idNum]
        };
      })
  );



  setValueControls() {
    // 1. Extraer todos los valores del formulario en una sola operación
    const { tipoDocumentoIdentidad,
      numeroDocumento,
      apellNomRznSocial,
      correo,
      celular,
      direccionCompleta,
    } = this.formNewCuenta.getRawValue();

    const clave =
      this.formNewCuenta
        .controls
        .confirmaClave
        .controls
        .clave
        .value;
    /** * Actualizamos solamente los datos que pertenecen * a Persona. */
    this.persona = {
      ...this.persona,
      tipoDocumentoIdentidad: (tipoDocumentoIdentidad ?? TipoDocumentoIdentidadEnum.OTRO) as TipoDocumentoIdentidadEnum,
      numeroDocumento: numeroDocumento ?? '',
      apellNomRznSocial: apellNomRznSocial ?? '',
      email: correo ?? '',
      celular: celular ?? '',
      direccionCompleta: direccionCompleta ?? '',
      //usuario: {
      //...(this.persona.usuario ?? {}),
      username: numeroDocumento ?? '',
      password: clave ?? '',
      //noBloqueado: true,
      //activo: true,
      //reintentos: 0
    }

  }

  crearCuenta() {
    if (this.formNewCuenta.invalid || !this.isValidFormEqualsClave) {
      this.formNewCuenta.markAllAsTouched();
      return;
    }
    if (this.formNewCuenta.valid) {
      //this.isLoading = true;
      this.setValueControls();
      //this.tipoPersonaSelected = this.tipoPersonas[this.findIndexTipoPersona(CLIENTE_PROVEEDOR)];
      //this.persona.tipoPersona = this.tipoPersonaSelected
      this.persona.tipoPersona = TipoPersonaEnum.CLIENTE_PROVEEDOR
      this.personaService.createCliente(this.persona).subscribe(resp => {
        this.snack.success(`Hola ${resp.apellNomRznSocial} se ha creado tu cuenta, puedes iniciar sesión`);
        this.router.navigate(['/login']);
      })
      //this.isLoading = false;

    }
  }

  actualizarCuenta() {
    //this.isLoading = true;

    this.setValueControls()
    this.persona.pedidos = [];
    this.personaService.update(this.persona.id, this.persona)
      .subscribe(
        json => {
          this.snack.success(`${json?.mensaje}`)
          this.router.navigate(['/login']);
        }/* ,
        err => {
          this.errores = err.error.errors as string[];
          console.error('Código del error desde el backend: ' + err.status);
          console.error(err.error.errors);
        } */
      )
    //this.isLoading = false;

  }


  personaByTipoDocumentoIdentidadAndNumeroDocumento(): void {
    const tipoControl = this.formNewCuenta.get('tipoDocumentoIdentidad');
    const numeroControl = this.formNewCuenta.get('numeroDocumento');

    const tipoDocumentoIdentidadEnum = tipoControl?.value as TipoDocumentoIdentidadEnum | null;
    const numeroDocumento = String(numeroControl?.value ?? '').trim();

    // No consultar si falta alguno de los dos campos.
    if (tipoDocumentoIdentidadEnum == null || !numeroDocumento || numeroControl?.invalid) {
      return;
    }

    this.personaService.personaByTipoDocumentoIdentidadAndNumeroDocumento(
      tipoDocumentoIdentidadEnum, numeroDocumento).subscribe({
        next: (persona) => {
          if (!persona) { return; }
          this.existePersona = persona.tipoPersona !== null && persona.tipoDocumentoIdentidad !== null;
          this.persona = persona; /** * Cargamos la persona encontrada * directamente en el formulario. */
          this.usuarioService.getUsuarioById(persona.usuarioId!).subscribe(
            resp => this.isPassword = !!resp.password /** * Cargamos el usuario * directamente en el formulario. */
          );
          //this.isTrabajador.set(persona.tipoPersona === TipoPersonaEnum.CLIENTE_PROVEEDOR ? false : true)
          this.formNewCuenta.patchValue({
            tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad ?? -1,
            numeroDocumento: persona.numeroDocumento ?? '',
            apellNomRznSocial: persona.apellNomRznSocial ?? '',
            direccionCompleta: persona.direccionCompleta ?? '',
            celular: persona.celular ?? '',
            correo: persona.email ?? ''
            //this.frmDefault.celular= persona.celular ?? '',
            //this.frmDefault.direccionCompleta= persona.direccionCompleta ?? '',

          });

          //this.frmDefault.markAsTouched()
          //this.createForm();
        },

        error: (error: HttpErrorResponse) => {
          const mensaje = error.error?.message ?? 'No fue posible consultar los datos de la persona.';
          this.snack.error(mensaje);
        },
        complete: () => {
          this.formNewCuenta.get('tipoDocumentoIdentidad')?.setValue(tipoDocumentoIdentidadEnum);
        }
      });
  }

  formEqualsClavesChange(equalsClavesChange: FormGroup) {
    this.formNewCuenta.setControl('confirmaClave', equalsClavesChange);
    this.isValidFormEqualsClave = equalsClavesChange.valid

  }


  /*   findByNumDocumento(event: any) {
      const numero = event.target.value;
      const tipoDocumento = this.formNewCuenta.get('tipoDocumento')?.value;
      this.personaService.getNumeroDocumento(numero).subscribe(resp => {
        if (resp != null) {
          this.existePersona = true;
          this.persona = resp;
          this.frmDefault.tipoDocumentoIdentidad = resp.tipoDocumentoIdentidad;
          this.frmDefault.numeroDocumento = resp.numeroDocumento;
          this.frmDefault.apellNomRznSocial = resp.apellNomRznSocial;
          this.frmDefault.correo = resp.email;
          this.formNewCuenta.get('tipoDocumento')?.setValue(tipoDocumento);
          this.usuarioService.getUsuarioById(resp.usuarioId!).subscribe(resp => {
            this.isPassword = !!resp.password;
          })
          this.createForm();
        }

      }, err => {
        console.log("Entro")
      }, () => {
        //this.formNewCuenta.get('numeroDocumento')?.setValue(numero);
      })

    } */

  resetForm() {
    this.formNewCuenta.reset();
  }

}

