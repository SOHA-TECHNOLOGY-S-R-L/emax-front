import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { COLOR_ACTIVO_CATEGORIA, ESTADO_ACTIVO_CATEGORIA } from '../../../../constants/color-estado-producto';
import { Categoria } from '../../../../models/categoria';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';
import { AuthService } from '../../../../services/auth.service';
import { CategoriaService } from '../../../../services/categoria.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'categoria-listado',
  standalone: true,
  templateUrl: './categoria-listado.component.html',
  styleUrl: './categoria-listado.component.css',
  imports: [CommonModule, RouterModule, AngularMaterialModule, StringToTitleWithAccents]
})
export class CategoriaListadoComponent {
  //private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  public authService = inject(AuthService);

  categorias: Categoria[] = [];
  verImagenCategoria!: string;
  estadoActivoCategoria = ESTADO_ACTIVO_CATEGORIA
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  readonly categoriasResource = rxResource({
    stream: () => this.categoriaService.getCategoriasProducto()
  });

  //readonly categorias = computed(() => this.categoriasResource.value() ?? []);

  private categoriaEffect = effect(() => {
    const categorias = this.categoriasResource.value();
    if (!categorias) { return };
    this.categorias = categorias.map(cat => {
      //cat.urlMultimediaImageCategoriaShow = 'no-imagen.png';
      if (cat.multimedia) {
        cat.multimedia.urlMultimediaShow = this.API_URL_VER_IMAGEN.concat(cat.multimedia.nombre)
      }
      const categoria = {
        ...cat,
        colorActiva: COLOR_ACTIVO_CATEGORIA[('' + cat.activa) as keyof typeof COLOR_ACTIVO_CATEGORIA],
        colorVisibleEnTienda: COLOR_ACTIVO_CATEGORIA[('' + cat.visibleEnTienda) as keyof typeof COLOR_ACTIVO_CATEGORIA],
        cantidadProductos: cat.productos.length
      };

      return categoria;
    })
  });

  constructor() { }


}
