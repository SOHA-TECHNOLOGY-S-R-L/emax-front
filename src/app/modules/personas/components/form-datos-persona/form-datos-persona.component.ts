import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { Persona } from '../../../../models/persona';
import { Usuario } from '../../../../models/usuario';
import { PersonaService } from '../../../../services/persona.service';
import { FormUtils } from '../../../../utils/form-utils';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

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
  //public authService = inject(AuthService);

  inPersona = input<Persona | undefined>();//es6to genera una señal no mutble
  outPersona = output<any>();

  formUtils = FormUtils;

  personaForm: FormGroup = this.fb.group({
    id: [null],
    tipoDocumento: [null, Validators.required],
    numeroDocumento: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(12),
        Validators.pattern(/^\d+$/)
      ]
    ],
    nomApellRz: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z\s]+$/)
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
        Validators.pattern(/^\+?(\d[\s-]?){6,15}$/)
      ]
    ],
    direccion: [
      '',
      Validators.minLength(2)
    ]
  });

  tipoDocumentosResource = rxResource({ stream: () => this.personaService.getTipoDocumento() });
  tipoPersonasResource = rxResource({ stream: () => this.personaService.getTipoPersona() });
  tipoDocumentos = computed(() => this.tipoDocumentosResource.value() ?? []);
  tipoPersonas = computed(() => this.tipoPersonasResource.value() ?? []);

  newUsuario = signal(new Usuario());

  personaOutEffect = effect(() => {
    const persona = this.inPersona();
    const documentos = this.tipoDocumentos();

    if (!documentos.length) return;

    if (!persona) {
      //this.personaForm.reset({}, { emitEvent: false });
      this.personaForm.reset({}, { emitEvent: true });
      return;
    }

    const documentoSeleccionado = documentos.find(
      d => d.id === persona.tipoDocumento?.id
    ) ?? null;

    this.personaForm.patchValue({
      id: persona.id,
      tipoDocumento: documentoSeleccionado,
      numeroDocumento: persona.numeroDocumento,
      nomApellRz: persona.nomApellRz,
      email: persona.email,
      celular: persona.celular,
      direccion: persona.direccion
    }, { emitEvent: true });//emite los valores del formulario la priemra ves que se carga
  });

  constructor() {
    // Escucha cambios en todo el formulario
    this.personaForm.valueChanges?.pipe(
      startWith(this.personaForm.getRawValue()),//Emite el valor inicial del formulario
      debounceTime(500), // Evita que el método dispare en cada pulsacion. Espera 500ms tras el último cambio
      distinctUntilChanged() // Solo dispara si el valor realmente cambió
    ).subscribe(() => {
      this.create();
    });
  }

  create(): void {
    const formValid = this.personaForm.valid;

    const usuario = {
      ...this.newUsuario(),
      username: this.personaForm.value.numeroDocumento,
      noBloqueado: true,
      activo: true,
      reintentos: 0};

    const persona: Persona = {
      ...this.personaForm.value,
      //tipoDocumento: this.tipoDocumentoSelected()!,
      tipoPersona: this.tipoPersonas().find(tp => tp.id === 1)!, // Asignamos un tipo de persona por defecto (cliente)
      usuario};

    const formWithPerson = {
      formValid: formValid,
      persona: { ...persona }}

    this.outPersona.emit(formWithPerson);
  }
}
