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
        //this.lstCategoria = categorias.sort((a, b) => a.orden - b.orden);
        this.lstCategoria =
          categorias
            //.filter(cat => cat.multimediasAsignada[0]?.multimedia?.mimeType?.startsWith('image/'))
            .map(cat => {
              if (cat.multimediasAsignada.length > 0 && cat.multimediasAsignada[0].multimedia?.mimeType?.startsWith('image/')) {
                const primerElemento =
                  cat.multimediasAsignada.find((m) => m.esPrincipal) || cat.multimediasAsignada[0];
                cat.multimediasAsignada = [primerElemento];
                cat.multimediasAsignada.map((mp) => {
                  mp.multimedia.urlMultimediaShow =
                    this.API_URL_VER_IMAGEN.concat(mp.multimedia.nombre);
                  return mp;
                });
              }
              return cat;
            })
      })
  }
}
