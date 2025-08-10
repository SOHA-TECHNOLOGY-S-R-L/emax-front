import { Component } from '@angular/core';
import { CarruselEmpresaComponent } from '../carrusel-empresa/carrusel-empresa.component';
import { CarruselServiciosComponent } from '../carrusel-servicios/carrusel-servicios.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'servicios-cliente',
  standalone: true,
  templateUrl: './servicios-cliente.component.html',
  styleUrl: './servicios-cliente.component.css',
  imports:[CarruselServiciosComponent, RouterModule]
})
export class ServiciosClienteComponent {

}
