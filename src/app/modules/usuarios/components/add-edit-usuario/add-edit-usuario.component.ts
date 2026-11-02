import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { TipoDocumentoIdentidadEnum, TipoDocumentoIdentidadEtiquetas } from '../../../../enums/tipo-documento-identidad.enum';
import { Persona } from '../../../../models/persona';
import { Usuario } from '../../../../models/usuario';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { PersonaService } from '../../../../services/persona.service';
import { FormUtils } from '../../../../utils/form-utils';
import { ConfirmarClaveComponent } from '../../../auth/confirmar-clave.component';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { UsuarioService } from './../../../../services/usuario.service';
import { TipoPersonaEnum, TipoPersonaEtiquetas } from '../../../../enums/tipo-persona.enum';
import { HttpErrorResponse } from '@angular/common/http';

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
    tipoDocumentoIdentidad: [-1,
    Validators.required
    ],
    numeroDocumento: ['',
      { validators: [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern('^\\d+$')] }
    ],
    apellNomRznSocial: ['',
      { validators: [Validators.required, Validators.minLength(2)] }
    ],
    correo: ['',
      [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]
    ],
    direccionCompleta: ['',
      { validators: [Validators.required, Validators.minLength(5)] }
    ],
    celular: ['',
      [Validators.required, Validators.minLength(6), Validators.maxLength(14), Validators.pattern('^\\d+$')]
    ],
    tipoPersona: [-1,
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

  public tipoDocumentos = signal(
    Object.keys(TipoDocumentoIdentidadEtiquetas)
      .filter(key => !isNaN(Number(key)))
      .map(key => {
        const idNum = Number(key) as TipoDocumentoIdentidadEnum;
        return {
          id: idNum, nombre: TipoDocumentoIdentidadEtiquetas[idNum]
        };
      })
  );

  public tipoPersonas = signal(
    Object.keys(TipoPersonaEtiquetas)
      .filter(key => !isNaN(Number(key)))
      .map(key => {
        const idNum = Number(key) as TipoPersonaEnum;
        return {
          id: idNum, nombre: TipoPersonaEtiquetas[idNum]
        };
      })
  );

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

  readonly isEdit = computed(() => this.personaResource.value() !== null);

  existePersona = signal<boolean>(false);

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


  readonly titulo = computed(() => this.isEdit() ? 'Editar trabajador' : 'Crear trabajador');


  private readonly sincronizarPersonaForm = effect(() => {
    const persona = this.personaResource.value();
    const usuario = this.usuarioResource.value();

    if (!persona || !usuario) { return; }

    /** * Guardamos la persona que vino del backend. */
    this.persona = persona; /** * Cargamos los datos de la persona en el formulario. */
    this.usuario = usuario;
    this.personaForm.patchValue({
      tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad ?? -1,
      numeroDocumento: persona.numeroDocumento ?? '',
      apellNomRznSocial: persona.apellNomRznSocial ?? '',
      correo: persona.email ?? '',
      celular: persona.celular ?? '',
      direccionCompleta: persona.direccionCompleta ?? '',
      tipoPersona: persona.tipoPersona ?? -1,
      username: usuario.username ?? ''
    });
    this.personaForm.markAllAsTouched()
  });


  constructor() { }

  setValueControls() {
    // 1. Extraer todos los valores del formulario en una sola operación
    const { tipoDocumentoIdentidad,
      tipoPersona,
      numeroDocumento,
      apellNomRznSocial,
      correo,
      celular,
      direccionCompleta,
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
      tipoDocumentoIdentidad: (tipoDocumentoIdentidad ?? TipoDocumentoIdentidadEnum.OTRO) as TipoDocumentoIdentidadEnum,
      tipoPersona: tipoPersona ?? undefined,
      numeroDocumento: numeroDocumento ?? '',
      apellNomRznSocial: apellNomRznSocial ?? '',
      email: correo ?? '',
      celular: celular ?? '',
      direccionCompleta: direccionCompleta ?? '',
      //usuario: {
      //...(this.persona.usuario ?? {}),
      username: username ?? numeroDocumento ?? '',
      password: clave ?? '',
      //noBloqueado: true,
      //activo: true,
      //reintentos: 0
    }
  };


  addTrabajador(): void {
    if (this.personaForm.invalid || !this.isValidFormEqualsClave) {
      this.personaForm.markAllAsTouched();
      return;
    }

    //this.isLoading = true;
    this.setValueControls();
    this.personaService.createTrabajador(this.persona)
      .subscribe({
        next: persona => {
          this.router.navigate(['/usuarios']);
          this.alertService.success(`La persona ${persona.apellNomRznSocial} ha sido creada con éxito`, 'Nueva persona');
        },
        error: err => {
          this.errores = err.error?.errors ?? [];
          console.error('Error creando usuario:', err);
        }
      });
    //this.isLoading = false;

  }

  personaByTipoDocumentoIdentidadAndNumeroDocumento(): void {
    const tipoControl = this.personaForm.get('tipoDocumentoIdentidad');
    const numeroControl = this.personaForm.get('numeroDocumento');

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
          this.persona = persona; /** * Cargamos la persona encontrada * directamente en el formulario. */
          this.usuarioService.getUsuarioById(persona.usuarioId!).subscribe(
            resp => this.usuario = resp /** * Cargamos el usuario * directamente en el formulario. */
          );

          const tieneDatos = persona.tipoPersona !== null && persona.tipoDocumentoIdentidad !== null;
          this.existePersona.set(tieneDatos);

          this.personaForm.patchValue({
            tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad ?? -1,
            numeroDocumento: persona.numeroDocumento ?? '',
            apellNomRznSocial: persona.apellNomRznSocial ?? '',
            correo: persona.email ?? '',
            celular: persona.celular ?? '',
            direccionCompleta: persona.direccionCompleta ?? '',
            tipoPersona: persona.tipoPersona ?? -1,
            username: this.usuario?.username ?? ''
          });
          this.personaForm.markAsTouched();
        },

        error: (error: HttpErrorResponse) => {
          const mensaje = error.error?.message ?? 'No fue posible consultar los datos de la persona.';
          this.alertService.error(mensaje, "Persona");
        },
        complete: () => {
          this.personaForm.get('tipoDocumentoIdentidad')?.setValue(tipoDocumentoIdentidadEnum!);
        }
      });
  }


  /*   findByNumDocumento(event: Event): void {
      const input = event.target as HTMLInputElement;
      const numero = input.value.trim();
      const tipoDocumento = this.personaForm.get('tipoDocumento')?.value;
      if (!numero) { return; }
      this.personaService.getNumeroDocumento(numero).subscribe({
        next: resp => {
          if (!resp) { return; }
          this.persona = resp;
          this.usuarioService.getUsuarioById(resp.usuarioId!).subscribe(
            resp => this.usuario = resp
          );
          this.isCliente.set(true)
          this.personaForm.patchValue({
            tipoDocumentoIdentidad: resp.tipoDocumentoIdentidad ?? -1,
            numeroDocumento: resp.numeroDocumento ?? '',
            apellNomRznSocial: resp.apellNomRznSocial ?? '',
            correo: resp.email ?? '',
            celular: resp.celular ?? '',
            direccionCompleta: resp.direccionCompleta ?? '',
            tipoPersonaId: resp.tipoPersona ?? -1,
            username: this.usuario?.username ?? ''
          });
        },
        error: err => {
          console.error('Error buscando persona por documento:', err);
        },
        complete: () => {
          this.personaForm.get('tipoDocumento')?.setValue(tipoDocumento!);
        }
      });
    } */

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
