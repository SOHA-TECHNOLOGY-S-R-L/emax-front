import { Component, inject } from '@angular/core';
import { Producto } from '../../../../models/producto';
import { ProductoService } from '../../../../services/producto.service';
import { CarruselImgServProdComponent } from "../../../compartido/carrusel-img-serv-prod/carrusel-img-serv-prod.component";

@Component({
  selector: 'producto-persona',
  standalone: true,
  templateUrl: './producto-persona.component.html',
  styleUrl: './producto-persona.component.css',
  imports: [CarruselImgServProdComponent]

})
export class ProductoPersonaComponent {

  private productoService = inject(ProductoService)
  productos: Producto[] = [];

  ngOnInit() {
    this.productoService.productoWithMultimediaEsPrincipal()
      .subscribe({
        next: (resp) => {
          this.productos = resp;
        }
      });
  }
}
