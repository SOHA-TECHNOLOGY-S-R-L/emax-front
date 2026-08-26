import { UsuarioService } from './../../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Persona } from '../../../../models/persona';
import { TipoDocumento } from '../../../../models/tipo-documento';
import { TipoPersona } from '../../../../models/tipo-persona';
import { Usuario } from '../../../../models/usuario';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { PersonaService } from '../../../../services/persona.service';
import { FormUtils } from '../../../../utils/form-utils';
import { ConfirmarClaveComponent } from '../../../auth/confirmar-clave.component';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'add-edit-usuario',
  templateUrl: './add-edit-usuario.component.html',
  styleUrl: './add-edit-usuario.component.css',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, ReactiveFormsModule, RouterModule, ConfirmarClaveComponent],

})
export class AddEditUsuarioComponent {
  private formBuilder = inject(FormBuilder);
  private activatedRoute = inject(ActivatedRoute);
  private readonly personaService = inject(PersonaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  readonly authService = inject(AuthService);


  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();

  //tipoDocumentoSelected!: TipoDocumento;
  //tipoPersonaSelected!: TipoPersona;
  formUtils = FormUtils;

  personaForm = this.formBuilder.group({
    tipoDocumentoId: [-1,
    Validators.required
    ],
    numeroDocumento: ['',
      { validators: [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern('^\\d+$')] }
    ],
    nomApellRz: ['',
      { validators: [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z\\s]+$')] }
    ],
    correo: ['',
      [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]
    ],
    direccion: ['',
      { validators: [Validators.required, Validators.minLength(5)] }
    ],
    celular: ['',
      [Validators.required, Validators.minLength(6), Validators.maxLength(14), Validators.pattern('^\\d+$')]
    ],
    tipoPersonaId: [-1,
    Validators.required],
    username: ['',
      [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
    //confirmaClave: null,
    confirmaClave: this.formBuilder.group({
      clave: this.formBuilder.nonNullable.control(''),
      confirmaClave: this.formBuilder.nonNullable.control('')
    })

  })

  isValidFormEqualsClave = false;

  errores: string[] = [];


  readonly tipoDocumentosResources = rxResource({
    stream: () => this.personaService.getTipoDocumento()
  });

  readonly tipoPersonasResources = rxResource({
    stream: () => this.personaService.getTipoPersona()
  });

  private params = toSignal(this.activatedRoute.paramMap);


  readonly personaId = computed(() => {
    const id = this.params()?.get('personaId');
    return id ? Number(id) : null;
  });

  readonly tipoPersonaId = computed(() => {
    const id = this.params()?.get('tipoPersonaId');
    return id ? Number(id) : null;
  });

  readonly personaResource = rxResource({
    params: () => ({
      personaId: this.personaId(),
      tipoPersonaId: this.tipoPersonaId()
    }),
    stream: ({ params }) => {

      if (params.personaId === null || params.tipoPersonaId === null) { return of(null); }

      return this.personaService.getPersonaByIdAndTipoId(params.personaId, params.tipoPersonaId)
        .pipe(
          catchError(() => { return of(null); })
        )
    }
  });

  readonly isEmpleadoEdit = computed(() => this.personaResource.value() !== null);

  readonly isCliente = signal<boolean>(false)

  readonly usuarioResource = rxResource({
    params: () => ({
      usuarioId: this.personaResource.value()?.usuarioId
    }),
    stream: ({ params }) => {

      if (params.usuarioId === null) { return of(null); }

      return this.usuarioService.getUsuarioById(params.usuarioId!)
        .pipe(
          catchError(() => { return of(null); })
        )
    }

  })


  readonly titulo = computed(() => this.isEmpleadoEdit() ? 'Editar empleado' : 'Crear empleado');


  private readonly sincronizarPersonaForm = effect(() => {
    const persona = this.personaResource.value();
    const usuario = this.usuarioResource.value();

    if (!persona || !usuario) { return; }

    /** * Guardamos la persona que vino del backend. */
    this.persona = persona; /** * Cargamos los datos de la persona en el formulario. */
    this.usuario = usuario;
    this.personaForm.patchValue({
      tipoDocumentoId: persona.tipoDocumentoId ?? -1,
      numeroDocumento: persona.numeroDocumento ?? '',
      nomApellRz: persona.nomApellRz ?? '',
      correo: persona.email ?? '',
      celular: persona.celular ?? '',
      direccion: persona.direccion ?? '',
      tipoPersonaId: persona.tipoPersonaId ?? -1,
      username: usuario.username ?? ''
    });
  });


  constructor() { }

  setValueControls() {
    // 1. Extraer todos los valores del formulario en una sola operación
    const { tipoDocumentoId,
      tipoPersonaId,
      numeroDocumento,
      nomApellRz,
      correo,
      celular,
      direccion,
      username } = this.personaForm.getRawValue();

    const clave =
      this.personaForm
        .controls
        .confirmaClave
        .controls
        .clave
        .value;
    /** * Actualizamos solamente los datos que pertenecen * a Persona. */
    this.persona = {
      ...this.persona,
      tipoDocumentoId: tipoDocumentoId ?? undefined,
      tipoPersonaId: tipoPersonaId ?? undefined,
      numeroDocumento: numeroDocumento ?? '',
      nomApellRz: nomApellRz ?? '',
      email: correo ?? '',
      celular: celular ?? '',
      direccion: direccion ?? '',
      //usuario: {
      //...(this.persona.usuario ?? {}),
      username: username ?? numeroDocumento ?? '',
      password: clave ?? '',
      //noBloqueado: true,
      //activo: true,
      //reintentos: 0
    }
  };


  addEmpleado(): void {

    if (this.personaForm.invalid || !this.isValidFormEqualsClave) {
      this.personaForm.markAllAsTouched();
      return;
    }

    //this.isLoading = true;
    this.setValueControls();
    this.personaService.create(this.persona)
      .subscribe({
        next: persona => {
          this.router.navigate(['/usuarios']);
          this.alertService.success(`La persona ${persona.nomApellRz} ha sido creada con éxito`, 'Nueva persona');
        },
        error: err => {
          this.errores = err.error?.errors ?? [];
          console.error('Error creando usuario:', err);
        }
      });
    //this.isLoading = false;

  }


  findByNumDocumento(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numero = input.value.trim();
    const tipoDocumentoId = this.personaForm.get('tipoDocumentoId')?.value;


    if (!numero) { return; }
    this.personaService.getNumeroDocumento(numero).subscribe({
      next: resp => {
        if (!resp) { return; } /** * No modificamos isEmpleadoEdit. * * isEmpleadoEdit pertenece al estado determinado * por la URL + personaResource. */
        this.persona = resp; /** * Cargamos la persona encontrada * directamente en el formulario. */
        this.usuarioService.getUsuarioById(resp.usuarioId!).subscribe(
          resp => this.usuario = resp /** * Cargamos el usuario * directamente en el formulario. */
        );
        this.isCliente.set(true)
        this.personaForm.patchValue({
          tipoDocumentoId: resp.tipoDocumentoId ?? -1,
          numeroDocumento: resp.numeroDocumento ?? '',
          nomApellRz: resp.nomApellRz ?? '',
          correo: resp.email ?? '',
          celular: resp.celular ?? '',
          direccion: resp.direccion ?? '',
          tipoPersonaId: resp.tipoPersonaId ?? -1,
          username: this.usuario?.username ?? ''
        });
      },
      error: err => {
        console.error('Error buscando persona por documento:', err);
      },
      complete: () => {
        this.personaForm.get('tipoDocumentoId')?.setValue(tipoDocumentoId!);
      }
    });
  }

  update(): void {

    if (this.personaForm.invalid || !this.isValidFormEqualsClave) {
      this.personaForm.markAllAsTouched();
      return;
    }
    //this.isLoading = true;
    this.setValueControls()
    this.persona.pedidos = [];

    this.personaService.update(this.persona.id, this.persona).subscribe({
      next: json => {
        this.router.navigate(['/usuarios']);
        this.alertService.success(`${json?.mensaje}`, 'Usuario actualizado');
      },
      error: err => {
        this.errores = err.error?.errors ?? [];
        console.error('Código del error desde el backend:', err.status);
        console.error(err.error?.errors);
      }
    });

  }

  formEqualsClavesChange(equalsClavesChange: FormGroup): void {
    this.personaForm.setControl('confirmaClave', equalsClavesChange);
    this.isValidFormEqualsClave = equalsClavesChange.valid;
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


/* interface FormClaves {
  clave: string;
  confirmaClave: string;
} */
