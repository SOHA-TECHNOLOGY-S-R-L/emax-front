import { Component, inject } from '@angular/core';
import { CarruselImgServProdComponent } from "../../../compartido/carrusel-img-serv-prod/carrusel-img-serv-prod.component";
import { MultimediaProducto } from './../../../../models/multimedia-producto';
import { MultimediaProductoService } from './../../../../services/multimedia-producto.service';

@Component({
  selector: 'producto-persona',
  standalone: true,
  templateUrl: './producto-persona.component.html',
  styleUrl: './producto-persona.component.css',
  imports: [CarruselImgServProdComponent]

})
export class ProductoPersonaComponent {

  private multimediaProductoService = inject(MultimediaProductoService)
  multimediasProducto: MultimediaProducto[] = [];

  ngOnInit() {
    this.multimediaProductoService.multimediasProductoByEsPrincipal(true)
      .subscribe({
        next: (resp) => {
          this.multimediasProducto = resp;
        }
      });
  }
}
