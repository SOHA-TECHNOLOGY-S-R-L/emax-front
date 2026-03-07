import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Categoria } from '../../../../models/categoria';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';
import { CategoriaService } from '../../../../services/categoria.service';
import { SeoService } from '../../../../services/seo.service';

@Component({
  selector: 'categorias-producto-persona',
  standalone: true,
  templateUrl: './categorias-producto-persona.component.html',
  styleUrl: './categorias-producto-persona.component.css',
  imports: [RouterModule, StringToTitleWithAccents]
})
export class CategoriasProductoPersonaComponent implements OnInit {
  //private seoService = inject(SeoService);
  private categoriaService = inject(CategoriaService);
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  lstCategoria: Categoria[] = []
  constructor() { }

  ngOnInit(): void {
    this.categoriaService.getCategoriasActivasYVisibleTienda()
      .subscribe(categorias => {
        this.lstCategoria = categorias.map(cat => {
          const categoria = { ...cat };
          if (categoria.multimedia) {
            categoria.multimedia = {
              ...categoria.multimedia,
              urlMultimediaShow: this.API_URL_VER_IMAGEN.concat(categoria.multimedia.nombre)
            };
          }
          return categoria;
        }).sort((a, b) => a.orden - b.orden);
      })
  }
}
