import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { find, findIndex } from 'lodash-es';
import { Persona } from '../../models/persona';
import { TipoDocumento } from '../../models/tipo-documento';
import { Usuario } from '../../models/usuario';
import { AlertService } from '../../services/alert.service';
import { PersonaService } from '../../services/persona.service';
import { UsuarioService } from '../../services/usuario.service';
import { FormUtils } from '../../utils/form-utils';
import { AngularMaterialModule } from '../compartido/angular-material.module';
import { ConfirmarClaveComponent } from "./confirmar-clave.component";
import { TipoPersona } from '../../models/tipo-persona';
import { CLIENTE } from '../../constants/constantes';

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
  tipoPersonaSelected!: TipoPersona;

  //usuario: Usuario = new Usuario();
  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();
  formNewCuenta!: FormGroup;
  isCliente: boolean = false;
  //isUsuario: boolean = false;
  frmDefault!: FrmCrearCuentaDefault;
  isClienteEdit: boolean = false;
  isValidFormEqualsClave = false;
  isLoading: boolean = false;



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
      console.log(this.tipoPersonas);
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
    this.usuario.username = this.formNewCuenta.get('numeroDocumento')?.value
    this.usuario.password = this.formNewCuenta.get('confirmaClave.clave')?.value
    this.usuario.noBloqueado = true;
    this.usuario.activo = true;
    this.usuario.reintentos = 0
    this.persona.usuario = { ...this.usuario }
    this.persona.tipoDocumento = find(this.tipoDocumentos, (td) => td.id === +this.formNewCuenta.get('tipoDocumentoId')?.value)!
    this.persona.numeroDocumento = this.formNewCuenta.get('numeroDocumento')?.value
    this.persona.nomApellRz = this.formNewCuenta.get('nomApellRz')?.value
    this.persona.email = this.formNewCuenta.get('correo')?.value
    this.persona.direccion = this.formNewCuenta.get('direccion')?.value
  }

  crearCuenta() {
    if (this.formNewCuenta.invalid) {
      this.formNewCuenta.markAllAsTouched();
      return;
    }
    if (this.formNewCuenta.valid) {
      this.isLoading = true;
      this.setValueControls();
      this.tipoPersonaSelected = this.tipoPersonas[this.findIndexTipoPersona(CLIENTE)];
      this.persona.tipoPersona = this.tipoPersonaSelected

      this.personaService.create(this.persona).subscribe(resp => {
        this.alertService.success(`Hola ${resp.nomApellRz} se ha creado tu cuenta, puedes iniciar sesión`, "Exito");
        this.router.navigate(['/login']);
      })
      this.isLoading = false;

    }
  }

  actualizarCuenta() {
    this.isLoading = true;

    this.setValueControls()
    this.persona.pedidos = [];
    this.personaService.update(this.persona)
      .subscribe(
        json => {
          this.alertService.success(`${json.mensaje}`, 'Cliente Actualizado')
          this.router.navigate(['/login']);
        }/* ,
        err => {
          this.errores = err.error.errors as string[];
          console.error('Código del error desde el backend: ' + err.status);
          console.error(err.error.errors);
        } */
      )
    this.isLoading = false;

  }

  findIndexTipoPersona(tipoPersonaId: number): number {
    return findIndex(this.tipoPersonas, (td) => td.id == tipoPersonaId)
  }

  findByNumDocumento(event: any) {
    this.isLoading = true;
    const numero = event.target.value;
    const tipoDocumentoId = this.formNewCuenta.get('tipoDocumentoId')?.value;
    this.personaService.getNumeroDocumento(numero).subscribe(resp => {
      if (resp != null) {
        this.isCliente = true
        this.persona = resp;
        this.frmDefault.tipoDocumentoId = resp.tipoDocumento?.id;
        this.frmDefault.numDocumento = resp.numeroDocumento;
        this.frmDefault.nomApellRz = resp.nomApellRz;
        this.frmDefault.correo = resp.email;
        //this.frmDefault.tipoPersonaId = resp.tipoPersona.id;

        this.tipoPersonaSelected = this.tipoPersonas[this.findIndexTipoPersona(resp.tipoPersona.id)];
        this.persona.tipoPersona = this.tipoPersonaSelected

        this.formNewCuenta.get('tipoDocumentoId')?.setValue(tipoDocumentoId);
        if (resp.usuario.password != null) {
          this.isClienteEdit = false;
        } else {
          this.isClienteEdit = true;
        }
        this.createForm();

      } else {
        this.tipoPersonaSelected = this.tipoPersonas[this.findIndexTipoPersona(CLIENTE)];
        this.persona.tipoPersona = this.tipoPersonaSelected
        this.isCliente = false
      }
      this.isLoading = false;

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
