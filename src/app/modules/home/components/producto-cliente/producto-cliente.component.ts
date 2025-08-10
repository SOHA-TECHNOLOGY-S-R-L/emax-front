import { Component } from '@angular/core';
import { CarruselProductosComponent } from '../carrusel-productos/carrusel-productos.component';

@Component({
  selector: 'producto-cliente',
  standalone: true,
  templateUrl: './producto-cliente.component.html',
  styleUrl: './producto-cliente.component.css',
  imports:[CarruselProductosComponent]
})
export class ProductoClienteComponent {

}
