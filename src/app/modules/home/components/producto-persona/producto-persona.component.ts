import { Component } from '@angular/core';
import { CarruselProductosComponent } from '../carrusel-productos/carrusel-productos.component';

@Component({
  selector: 'producto-persona',
  standalone: true,
  templateUrl: './producto-persona.component.html',
  styleUrl: './producto-persona.component.css',
  imports: [CarruselProductosComponent]

})
export class ProductoPersonaComponent {

}
