import { Component, inject, OnInit } from '@angular/core';
import { Categoria } from '../../../../models/categoria';
import { ProductoService } from '../../../../services/producto.service';
import { environment } from '../../../../../environments/environment';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../../services/seo.service';
import { CategoriaService } from '../../../../services/categoria.service';

@Component({
  selector: 'categorias-producto-persona',
  standalone: true,
  templateUrl: './categorias-producto-persona.component.html',
  styleUrl: './categorias-producto-persona.component.css',
  imports: [RouterModule]
})
export class CategoriasProductoPersonaComponent implements OnInit {
  private seoService = inject(SeoService);
  private categoriaService = inject(CategoriaService);
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  lstCategoria: Categoria[] = []
  constructor() { }

  ngOnInit(): void {
    this.categoriaService.getCategoriasActivasYVisibleTienda().subscribe(categorias => {
      this.lstCategoria = categorias.sort((a, b) => a.orden - b.orden)
    })

  }

}
