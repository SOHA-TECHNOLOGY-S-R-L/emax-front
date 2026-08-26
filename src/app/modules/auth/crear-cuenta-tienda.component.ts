import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { findIndex } from 'lodash-es';
import { CLIENTE_PROVEEDOR } from '../../constants/constantes';
import { Persona } from '../../models/persona';
import { TipoDocumento } from '../../models/tipo-documento';
import { TipoPersona } from '../../models/tipo-persona';
import { AlertService } from '../../services/alert.service';
import { PersonaService } from '../../services/persona.service';
import { UsuarioService } from '../../services/usuario.service';
import { FormUtils } from '../../utils/form-utils';
import { AngularMaterialModule } from '../compartido/angular-material.module';
import { ConfirmarClaveComponent } from "./confirmar-clave.component";

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
  private usuarioService = inject(UsuarioService);
  private alertService = inject(AlertService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  formUtils = FormUtils;

  tipoDocumentos: TipoDocumento[] = [];
  tipoPersonas: TipoPersona[] = [];
  persona: Persona = new Persona();
  formNewCuenta!: FormGroup;
  frmDefault!: FrmCrearCuentaDefault;
  existePersona: boolean = false ;
  isPassword: boolean = false;

  isValidFormEqualsClave = false;


  ngOnInit() {

    this.frmDefault = {
      tipoDocumentoId: -1,
      numDocumento: '',
      nomApellRz: '',
      correo: '',
      clave: '',
      confirmaClave: '',
    }

    this.personaService.getTipoDocumento().subscribe(doc => {
      this.tipoDocumentos = doc
    });

    this.personaService.getTipoPersona().subscribe(per => {
      this.tipoPersonas = per.filter(per => per.persona.includes("Cliente") || per.persona.includes("Proveedor"))
    });

    this.createForm();

  }

  createForm(): void {
    this.formNewCuenta = this.formBuilder.group({
      tipoDocumentoId: [this.frmDefault.tipoDocumentoId, Validators.required],
      numeroDocumento: [this.frmDefault.numDocumento,
      { validators: [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern('^\\d+$')] }
      ],
      nomApellRz: [this.frmDefault.nomApellRz,
      { validators: [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z\\s]+$')] }
      ],
      correo: [this.frmDefault.correo, [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]
      ],
      confirmaClave: null,
    })
  }

  setValueControls() {
    this.persona.tipoDocumentoId = +this.formNewCuenta.get('tipoDocumentoId')?.value
    this.persona.numeroDocumento = this.formNewCuenta.get('numeroDocumento')?.value
    this.persona.nomApellRz = this.formNewCuenta.get('nomApellRz')?.value
    this.persona.email = this.formNewCuenta.get('correo')?.value
    this.persona.direccion = this.formNewCuenta.get('direccion')?.value
    this.persona.username = this.formNewCuenta.get('numeroDocumento')?.value
    this.persona.password = this.formNewCuenta.get('confirmaClave.clave')?.value
  }

  crearCuenta() {
    if (this.formNewCuenta.invalid) {
      this.formNewCuenta.markAllAsTouched();
      return;
    }
    if (this.formNewCuenta.valid) {
      //this.isLoading = true;
      this.setValueControls();
      //this.tipoPersonaSelected = this.tipoPersonas[this.findIndexTipoPersona(CLIENTE_PROVEEDOR)];
      //this.persona.tipoPersona = this.tipoPersonaSelected
      this.persona.tipoPersonaId = CLIENTE_PROVEEDOR

      this.personaService.create(this.persona).subscribe(resp => {
        this.alertService.success(`Hola ${resp.nomApellRz} se ha creado tu cuenta, puedes iniciar sesión`, "Exito");
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
          this.alertService.success(`${json?.mensaje}`, 'Cliente Actualizado')
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

  findIndexTipoPersona(tipoPersonaId: number): number {
    return findIndex(this.tipoPersonas, (td) => td.id == tipoPersonaId)
  }

  findByNumDocumento(event: any) {
    const numero = event.target.value;
    const tipoDocumentoId = this.formNewCuenta.get('tipoDocumentoId')?.value;
    this.personaService.getNumeroDocumento(numero).subscribe(resp => {
      if (resp != null) {
        this.existePersona = true;
        this.persona = resp;
        this.frmDefault.tipoDocumentoId = resp.tipoDocumentoId;
        this.frmDefault.numDocumento = resp.numeroDocumento;
        this.frmDefault.nomApellRz = resp.nomApellRz;
        this.frmDefault.correo = resp.email;
        this.formNewCuenta.get('tipoDocumentoId')?.setValue(tipoDocumentoId);
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

  }

  formEqualsClavesChange(equalsClavesChange: FormGroup) {
    this.formNewCuenta.setControl('confirmaClave', equalsClavesChange);
    this.isValidFormEqualsClave = equalsClavesChange.valid

  }

  /*   findByCelular(event: any) {
      const celular = event.target.value;
      const tipoDocumentoId = this.formNewCuenta.get('tipoDocumentoId')?.value;
      const numeroDocumento = this.formNewCuenta.get('numeroDocumento')?.value;
      const nomApellRz = this.formNewCuenta.get('nomApellRz')?.value;
      const direccion = this.formNewCuenta.get('direccion')?.value;

      this.personaService.getCelular(celular).subscribe(resp => {
        this.persona = resp;
        this.frmDefault.tipoDocumentoId = resp.tipoDocumento?.id;
        this.frmDefault.numDocumento = resp.numeroDocumento;
        this.frmDefault.nomApellRz = resp.nomApellRz;
        this.frmDefault.correo = resp.email;
        this.createForm();

      }, () => {
        this.formNewCuenta.get('tipoDocumentoId')?.setValue(tipoDocumentoId);
        this.formNewCuenta.get('numeroDocumento')?.setValue(numeroDocumento);
        this.formNewCuenta.get('nomApellRz')?.setValue(nomApellRz);
        this.formNewCuenta.get('direccion')?.setValue(direccion);
        this.formNewCuenta.get('celular')?.setValue(celular);
      })

    } */

  resetForm() {
    this.formNewCuenta.reset();
  }

}


interface FrmCrearCuentaDefault {
  tipoDocumentoId?: number,
  tipoPersonaId?: number,
  numDocumento?: string,
  nomApellRz?: string,
  correo?: string,
  clave?: string,
  confirmaClave?: string,
}
