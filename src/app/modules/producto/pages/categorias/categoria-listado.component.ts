import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { COLOR_ACTIVO, ESTADO_ACTIVO } from '../../../../constants/color-estado';
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
  estadoActivo = ESTADO_ACTIVO
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  readonly categoriasResource = rxResource({
    stream: () => this.categoriaService.getCategoriasProducto()
  });

  //readonly categorias = computed(() => this.categoriasResource.value() ?? []);

  private categoriaEffect = effect(() => {
    const categorias = this.categoriasResource.value();
    if (!categorias) { return };
    this.categorias = categorias.map(cat => {
      cat.colorActiva = COLOR_ACTIVO[('' + cat.activa) as keyof typeof COLOR_ACTIVO];
      cat.colorVisibleEnTienda = COLOR_ACTIVO[('' + cat.visibleEnTienda) as keyof typeof COLOR_ACTIVO];
      cat.cantidadProductos = cat.productos.length;
      if (cat.multimediasAsignada.length > 0) {
        const primerElemento = cat.multimediasAsignada.find((m) => m.esPrincipal) || cat.multimediasAsignada[0];
        cat.multimediasAsignada = [primerElemento];
        cat.multimediasAsignada.map((mp) => {
          mp.multimedia.urlMultimediaShow = this.API_URL_VER_IMAGEN.concat(mp.multimedia.nombre);
          return mp;
        });
      }
      return cat;
    })
  });

  constructor() { }


}
