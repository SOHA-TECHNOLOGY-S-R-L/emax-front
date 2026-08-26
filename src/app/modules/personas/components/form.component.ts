import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { Persona } from '../../../models/persona';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { PersonaService } from '../../../services/persona.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { FormDatosPersonaComponent } from './form-datos-persona/form-datos-persona.component';
import { CLIENTE_PROVEEDOR } from '../../../constants/constantes';

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

  personaId = toSignal<number>(this.activatedRoute.paramMap.pipe(map(r => Number(r.get('personaId')))));
  //persona = signal(new Persona());
  persona = signal(new Persona()); // Sigue usándose SOLO para la carga inicial (Edición / Registro)
  personaFormValue = signal<Persona | null>(null); // <-- NUEVA: Guarda el estado del formulario para enviar a la API
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


  constructor() { }


  onDatosPersona($event: any) {
    const persona = $event.persona as Persona;
    this.formValid.set($event.formValid);
    this.personaFormValue.set(persona);
  }

  cargarPersona(personaId: number) {
    this.personaService.getPersona(personaId).subscribe((result) => {
      this.persona.set(result);
    });
  }

  create(): void {
    const personaAEmitir = this.personaFormValue();
    if (!personaAEmitir || !this.formValid()) return; // Validación de seguridad
    personaAEmitir.tipoPersonaId = CLIENTE_PROVEEDOR
    this.personaService.create(personaAEmitir)
      .subscribe(
        persona => {
          this.router.navigate(['/personas']);
          this.alertServie.success(`La persona ${persona.nomApellRz} ha sido creada con éxito`, 'Nueva persona');
        },
      );
  }

  update(): void {
    const personaId = this.personaId();
    const personaUpdate = this.personaFormValue(); // <-- Cambiado aquí también

    if (!personaId || !personaUpdate) { return; }

    this.personaService.update(personaId, personaUpdate)
      .subscribe(
        json => {
          this.router.navigate(['/personas']);
          this.alertServie.success(`${json?.mensaje}`, 'Persona Actualizada');
        }
      );
  }



}

