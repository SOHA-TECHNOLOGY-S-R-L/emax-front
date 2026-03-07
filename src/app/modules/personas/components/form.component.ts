import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { Persona } from '../../../models/persona';
import { TipoDocumento } from '../../../models/tipo-documento';
import { Usuario } from '../../../models/usuario';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { PersonaService } from '../../../services/persona.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { TipoPersona } from './../../../models/tipo-persona';
import { FormDatosPersonaComponent } from './form-datos-persona/form-datos-persona.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, FormsModule, RouterModule, FormDatosPersonaComponent],
})
export class FormComponent {

  private personaService = inject(PersonaService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private alertServie = inject(AlertService);
  public authService = inject(AuthService);

  personaId = toSignal<number>(this.activatedRoute.paramMap.pipe(map(r => Number(r.get('id')))));
  persona = signal(new Persona());
  titulo = signal<string>("Editar persona");
  formValid = signal<boolean>(false);

  private personaEffect = effect(() => {
    const personaId = this.personaId();
    if (personaId) {
      this.cargarPersona(personaId);
    } else {
      this.persona.set(new Persona());
      this.titulo.set("Registro persona");

    }
  });

  usuario: Usuario = new Usuario();
  tipoDocumentos: TipoDocumento[] = [];
  tipoPersonas: TipoPersona[] = [];
  tipoDocumentoSelected!: TipoDocumento;
  tipoPersonaSelected!: TipoPersona;

  constructor() { }

  buscarPersonas = (term: string) =>
    this.personaService.filtrarPersonas(term);

  mostrarPersona = (persona: Persona) =>
    persona.nomApellRz

  onPersonaSeleccionada(persona: Persona) {
    console.log(persona);
    this.persona.set(persona);
  }

  onDatosPersona($event: any) {
    const persona = $event.persona as Persona;
    this.formValid.set($event.formValid);
    this.persona.set(persona);
  }

  cargarPersona(personaId: number) {
    this.personaService.getPersona(personaId).subscribe((result) => {
      this.persona.set(result);
    });
  }

  create(): void {
    /*        this.usuario.username = this.persona.numeroDocumento;
          this.usuario.noBloqueado = true
          this.usuario.activo = true;
          this.usuario.reintentos = 0

          this.persona.tipoDocumento = this.tipoDocumentoSelected
          this.persona.tipoPersona = this.tipoPersonaSelected

          this.persona.usuario = { ...this.usuario } */

    this.personaService.create(this.persona())
      .subscribe(
        persona => {
          this.router.navigate(['/personas']);
          this.alertServie.success(`El persona ${persona.nomApellRz} ha sido creado con éxito`, 'Nuevo persona')
        },
      );
  }

  update(): void {
    const personaId = this.personaId();
    const personaUpdate = this.persona();

    if(!personaId) {return }

    this.personaService.update(personaId, personaUpdate)
      .subscribe(
        json => {
          this.router.navigate(['/personas']);
          this.alertServie.success(`${json?.mensaje}`, 'Persona Actualizado')
        }
      )
  }



}

