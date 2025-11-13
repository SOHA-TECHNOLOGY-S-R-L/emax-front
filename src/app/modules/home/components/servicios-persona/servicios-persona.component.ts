import { Component } from '@angular/core';
import { CarruselEmpresaComponent } from '../carrusel-empresa/carrusel-empresa.component';
import { CarruselServiciosComponent } from '../carrusel-servicios/carrusel-servicios.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'servicios-persona',
  standalone: true,
  templateUrl: './servicios-persona.component.html',
  styleUrl: './servicios-persona.component.css',
  imports:[CarruselServiciosComponent, RouterModule]
})
export class ServiciosPersonaComponent {

}
