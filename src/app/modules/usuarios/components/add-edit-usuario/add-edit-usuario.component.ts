import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Persona } from '../../../../models/persona';
import { Usuario } from '../../../../models/usuario';
import { TipoDocumento } from '../../../../models/tipo-documento';
import { TipoPersona } from '../../../../models/tipo-persona';
import { FormUtils } from '../../../../utils/form-utils';
import { PersonaService } from '../../../../services/persona.service';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { findIndex } from 'lodash-es';
import { ConfirmarClaveComponent } from '../../../auth/confirmar-clave.component';

@Component({
  selector: 'add-edit-usuario',
  templateUrl: './add-edit-usuario.component.html',
  styleUrl: './add-edit-usuario.component.css',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, ReactiveFormsModule, RouterModule, ConfirmarClaveComponent],

})
export class AddEditUsuarioComponent {
  private formBuilder = inject(FormBuilder);
  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();
  tipoDocumentos: TipoDocumento[] = [];
  tipoPersonas: TipoPersona[] = [];
  tipoDocumentoSelected!: TipoDocumento;
  tipoPersonaSelected!: TipoPersona;
  titulo: string = "Crear persona o proveedor";
  formUtils = FormUtils;
  personaForm!: FormGroup;
  frmDefault!: FrmPersonaDefault;
  isValidFormEqualsClave = false;
  isEmpleadoEdit = false;
  //isLoading: boolean = false;

  errores: string[] = [];

  constructor(private personaService: PersonaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertServie: AlertService,
    public authService: AuthService,
  ) { }

  ngOnInit() {

    this.frmDefault = {
      tipoDocumentoId: -1,
      numDocumento: '',
      nomApellRz: '',
      correo: '',
      direccion: '',
      celular: '',
      tipoPersonaId: -1
    }

    this.personaService.getTipoDocumento().subscribe(doc => this.tipoDocumentos = doc);
    this.personaService.getTipoPersona().subscribe(per => this.tipoPersonas = per.filter(per => per.persona.includes("Empleado")));

    this.createForm();
    this.activatedRoute.paramMap.subscribe(params => {
      const personaId = +params.get('id')!;
      const tipoPersonaId = +params.get('tipoPersonaId')!;

      if (personaId && tipoPersonaId) {
        this.titulo = "Editar empleado"
        this.personaService.getPersonaByIdAndTipoId(personaId, tipoPersonaId).subscribe((persona) => {
          this.persona = persona
          this.frmDefault.tipoDocumentoId = persona.tipoDocumento.id
          this.frmDefault.numDocumento = persona.numeroDocumento
          this.frmDefault.nomApellRz = persona.nomApellRz
          this.frmDefault.correo = persona.email
          this.frmDefault.direccion = persona.direccion
          this.frmDefault.celular = persona.celular
          this.frmDefault.tipoPersonaId = persona.tipoPersona.id
          this.frmDefault.username = persona.usuario.username
          this.isEmpleadoEdit = true;
          this.createForm();
        });
      }
    });
  }


  findIndexDocument(tipoDocumentoId: number): number {
    return findIndex(this.tipoDocumentos, (td) => td.id == tipoDocumentoId)
  }

  findIndexTipoPersona(tipoPersonaId: number): number {
    return findIndex(this.tipoPersonas, (td) => td.id == tipoPersonaId)
  }

  createForm(): void {
    this.personaForm = this.formBuilder.group({
      tipoDocumentoId: [this.frmDefault.tipoDocumentoId, Validators.required],

      numeroDocumento: [this.frmDefault.numDocumento,
      { validators: [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern('^\\d+$')] }
      ],
      nomApellRz: [this.frmDefault.nomApellRz,
      { validators: [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z\\s]+$')] }
      ],

      correo: [this.frmDefault.correo, [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]
      ],

      direccion: [this.frmDefault.direccion,
      { validators: [Validators.required, Validators.minLength(5)] }
      ],

      celular: [this.frmDefault.celular, [Validators.required, Validators.minLength(6), Validators.maxLength(14), Validators.pattern('^\\d+$')]],

      tipoPersonaId: [this.frmDefault.tipoPersonaId, Validators.required],


      username: [this.frmDefault.username, [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],


      confirmaClave: null,

    })
  }
  setValueControls() {
    const indDoc = this.findIndexDocument(this.personaForm.get('tipoDocumentoId')?.value);
    this.tipoDocumentoSelected = this.tipoDocumentos[indDoc];

    const indPer = this.findIndexTipoPersona(this.personaForm.get('tipoPersonaId')?.value);
    this.tipoPersonaSelected = this.tipoPersonas[indPer];

    this.usuario.username = this.personaForm.get('username')?.value;
    this.usuario.password = this.personaForm.get('confirmaClave.clave')?.value
    this.usuario.noBloqueado = true
    this.usuario.activo = true;
    this.usuario.reintentos = 0
    this.persona.usuario = { ...this.usuario }
    this.persona.tipoDocumento = this.tipoDocumentoSelected
    this.persona.numeroDocumento = this.personaForm.get('numeroDocumento')?.value
    this.persona.nomApellRz = this.personaForm.get('nomApellRz')?.value
    this.persona.email = this.personaForm.get('correo')?.value
    this.persona.celular = this.personaForm.get('celular')?.value
    this.persona.direccion = this.personaForm.get('direccion')?.value
    this.persona.tipoPersona = this.tipoPersonaSelected
  }

  addEmpleado(): void {
    //this.isLoading = true;
    this.setValueControls();
    this.personaService.create(this.persona)
      .subscribe(
        persona => {
          this.router.navigate(['/usuarios']);
          this.alertServie.success(`El persona ${persona.nomApellRz} ha sido creado con éxito`, 'Nuevo persona')
        },
      );
    //this.isLoading = false;

  }

  findByNumDocumento(event: any) {
    const numero = event.target.value;
    const tipoDocumentoId = this.personaForm.get('tipoDocumentoId')?.value;
    this.personaService.getNumeroDocumento(numero).subscribe(resp => {
      if (resp) {
        this.persona = resp;
        this.frmDefault.tipoDocumentoId = resp.tipoDocumento?.id;
        this.frmDefault.numDocumento = resp.numeroDocumento;
        this.frmDefault.nomApellRz = resp.nomApellRz;
        this.frmDefault.correo = resp.email;
        //this.isPersona = true
        //this.isUsuario = (resp.usuario) ? true : false;
      }
      this.createForm();

    }, err => {
      console.log("Entro")
    }, () => {
      this.personaForm.get('tipoDocumentoId')?.setValue(tipoDocumentoId);
    })

  }

  update(): void {
    //this.isLoading = true;
    this.setValueControls()
    this.persona.pedidos = [];
    this.personaService.update(this.persona)
      .subscribe(
        json => {
         // this.isLoading = false;
          this.router.navigate(['/usuarios']);
          this.alertServie.success(`${json?.mensaje}`, 'Usuario actualizado')
        },
        err => {
          this.errores = err.error.errors as string[];
          console.error('Código del error desde el backend: ' + err.status);
          console.error(err.error.errors);
         // this.isLoading = false;

        }
      )

  }

  formEqualsClavesChange(equalsClavesChange: FormGroup) {
    this.personaForm.setControl('confirmaClave', equalsClavesChange);
    this.isValidFormEqualsClave = equalsClavesChange.valid
    //console.log("valid", equalsClavesChange.valid);
  }

  /*   compararDocumento(o1: TipoDocumento, o2: TipoDocumento): boolean {
      if (o1 === undefined && o2 === undefined) {
        return true;
      }

      return o1 === null || o2 === null || o1 === undefined || o2 === undefined ? false : o1.id === o2.id;
    }

    compararPersona(o1: TipoPersona, o2: TipoPersona): boolean {
      if (o1 === undefined && o2 === undefined) {
        return true;
      }

      return o1 === null || o2 === null || o1 === undefined || o2 === undefined ? false : o1.id === o2.id;
    } */

}


interface FrmPersonaDefault {
  tipoDocumentoId?: number,
  numDocumento?: string,
  nomApellRz?: string,
  correo?: string,
  direccion?: string,
  celular?: string,
  username?: string,
  tipoPersonaId?: number
}
