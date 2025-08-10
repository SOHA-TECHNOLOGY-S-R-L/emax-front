import { Component, inject, OnInit } from '@angular/core';
import { Categoria } from '../../../../models/categoria';
import { ProductoService } from '../../../../services/producto.service';
import { environment } from '../../../../../environments/environment';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../../services/seo.service';
import { CategoriaService } from '../../../../services/categoria.service';

@Component({
  selector: 'categorias-producto-cliente',
  standalone: true,
  templateUrl: './categorias-producto-cliente.component.html',
  styleUrl: './categorias-producto-cliente.component.css',
  imports: [RouterModule]
})
export class CategoriasProductoClienteComponent implements OnInit {
  private seoService = inject(SeoService);
  private categoriaService = inject(CategoriaService);
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  lstCategoria: Categoria[] = []
  constructor() { }

  ngOnInit(): void {
    this.categoriaService.getCategoriasActivas().subscribe(categorias => {
      this.lstCategoria = categorias.sort((a, b) => a.orden - b.orden)
      /*
            this.lstCategoria = categorias.map(cat => {
              cat.imagen = environment.API_URL_VER_IMAGEN + cat.imagen;
              return cat;
            }).sort((a, b) => a.orden - b.orden)

                  let nombreCategoria = this.lstCategoria.map(cat => cat.nombre)
                  console.log("this.lstCategoria", `Ofrecemos ${nombreCategoria.toString()} , para`);

                   this.seoService.meta.updateTag({name: "description", content: `Ofrecemos ${nombreCategoria.toString()}, para hacer publicidad,  mercahndising y branding`})
                  this.seoService.meta.updateTag({name: "og:description", content: `Ofrecemos ${nombreCategoria.toString()}, para hacer publicidad,  mercahndising y branding`})
                 this.seoService.setIndexFollow(true); */

    })

  }

}
