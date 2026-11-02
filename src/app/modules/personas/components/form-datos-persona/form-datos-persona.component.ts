import { AuthService } from './../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { TipoDocumentoIdentidadEtiquetas } from '../../../../enums/tipo-documento-identidad.enum';
import { Persona } from '../../../../models/persona';
import { PersonaService } from '../../../../services/persona.service';
import { FormUtils } from '../../../../utils/form-utils';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { TipoDocumentoIdentidadEnum } from './../../../../enums/tipo-documento-identidad.enum';
import { TipoPersonaEnum } from '../../../../enums/tipo-persona.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'form-datos-persona',
  standalone: true,
  templateUrl: './form-datos-persona.component.html',
  styleUrl: './form-datos-persona.component.css',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class FormDatosPersonaComponent {
  private fb = inject(FormBuilder);
  private personaService = inject(PersonaService);
  private alertService = inject(AlertService);

  inPersona = input<Persona | undefined>();//es6to genera una señal no mutble
  usuarioId = signal<number | undefined>(undefined);
  outPersona = output<any>();

  // Convertimos el mapa en un array de objetos [{ id: 1, nombre: 'DNI' }, ...]
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

  formUtils = FormUtils;

  personaForm: FormGroup = this.fb.group({
    id: [null],
    tipoDocumentoIdentidad: [null, Validators.required],
    numeroDocumento: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(12),
        Validators.pattern(/^\d+$/)
      ]
    ],
    apellNomRznSocial: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        //Validators.pattern(/^[a-zA-Z0-9\s,]+$/) //Se agregó la coma aquí
      ]
    ],
    email: [
      '',
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ],
    celular: [
      '',
      [
        Validators.minLength(6),
        //Validators.pattern(/^\+?(\d[\s-]?){6,15}$/),
        Validators.pattern(/^\+?\d{6,15}$/), //Solo números, permite un "+" opcional al inicio
        Validators.required,
      ]
    ],
    direccionCompleta: [
      '',
      [
        Validators.minLength(2),
        Validators.required,

      ]
    ]
  });

  //tipoPersonasResource = rxResource({ stream: () => this.personaService.getTipoPersona() });
  //tipoPersonas = computed(() => this.tipoPersonasResource.value() ?? []);
  //tipoDocumentosResource = rxResource({ stream: () => this.personaService.getTipoDocumento() });
  //tipoDocumentos = computed(() => this.tipoDocumentosResource.value() ?? []);
  //newUsuario = signal(new Usuario());

  personaOutEffect = effect(() => {
    const persona = this.inPersona();
    const documentos = this.tipoDocumentos();

    if (!documentos.length) return;

    if (!persona || !persona.id) {
      if (this.personaForm.get('id')?.value !== null || this.personaForm.get('tipoDocumentoIdentidad')?.value !== null) {
        this.personaForm.reset({
          tipoDocumentoIdentidad: null
        }, { emitEvent: true });
      }
      return;
    }

    const formValues = this.personaForm.getRawValue();
    if (
      formValues.id === persona.id &&
      formValues.tipoDocumentoIdentidad === persona.tipoDocumentoIdentidad &&
      formValues.numeroDocumento === persona.numeroDocumento &&
      formValues.apellNomRznSocial === persona.apellNomRznSocial &&
      formValues.email === persona.email &&
      formValues.celular === persona.celular &&
      formValues.direccionCompleta === persona.direccionCompleta
    ) {
      return; // <-- Salimos prematuramente, rompiendo el bucle infinito
    }

    this.personaForm.patchValue({
      id: persona.id,
      tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad ?? null,
      numeroDocumento: persona.numeroDocumento,
      apellNomRznSocial: persona.apellNomRznSocial,
      email: persona.email,
      celular: persona.celular,
      direccionCompleta: persona.direccionCompleta
    }, { emitEvent: true });//emite los valores del formulario la priemra ves que se carga
  });


  constructor() {
    // Escucha cambios en todo el formulario
    this.personaForm.valueChanges?.pipe(
      startWith(this.personaForm.getRawValue()),//Emite el valor inicial del formulario
      debounceTime(500), // Evita que el método dispare en cada pulsacion. Espera 500ms tras el último cambio
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)) // Comparación estricta de objeto
    ).subscribe(() => {
      this.create();
    });
  }


  clienteByTipoDocumentoIdentidadAndNumeroDocumento(): void {
    const tipoControl = this.personaForm.get('tipoDocumentoIdentidad');
    const numeroControl = this.personaForm.get('numeroDocumento');

    const tipoDocumentoIdentidadEnum = tipoControl?.value as TipoDocumentoIdentidadEnum | null;
    const numeroDocumento = String(numeroControl?.value ?? '').trim();

    // No consultar si falta alguno de los dos campos.
    if (tipoDocumentoIdentidadEnum == null || !numeroDocumento || numeroControl?.invalid) {
      return;
    }

    this.personaService.clienteByTipoDocumentoIdentidadAndNumeroDocumento(tipoDocumentoIdentidadEnum, numeroDocumento)
      .subscribe({
        next: (persona: Persona) => {
          if (!persona) { return; }

          this.usuarioId.set(persona.usuarioId)

          this.personaForm.patchValue({
            id: persona.id ?? null,
            tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad ?? tipoDocumentoIdentidadEnum,
            numeroDocumento: persona.numeroDocumento ?? numeroDocumento,
            apellNomRznSocial: persona.apellNomRznSocial ?? '',
            direccionCompleta: persona.direccionCompleta ?? '',
            email: persona.email ?? '',
            celular: persona.celular ?? ''
          });
        },

        error: (error: HttpErrorResponse) => {
          const mensaje = error.error?.message ?? 'No fue posible consultar los datos de la persona.';
          this.alertService.error(mensaje, "Persona");
        }
      });
  }




  create(): void {
    const formValid = this.personaForm.valid;
    const persona: Persona = {
      ...this.personaForm.value,
      tipoPersona: TipoPersonaEnum.CLIENTE_PROVEEDOR, // Asignamos un tipo de persona por defecto (cliente)
      usuarioId: this.inPersona()?.usuarioId ?? this.usuarioId()
    };

    const formWithPerson = {
      formValid: formValid,
      persona: { ...persona }
    }

    this.outPersona.emit(formWithPerson);
  }
}
