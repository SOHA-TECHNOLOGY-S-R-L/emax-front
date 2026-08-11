import { Component, computed, inject, signal } from '@angular/core';
import { SearchBoxTableComponent } from '../../compartido/search-box-table/search-box-table.component';

import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { Producto } from '../../../models/producto';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ProductoService } from '../../../services/producto.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';

import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';
import { COLOR_ACTIVO, ESTADO_ACTIVO } from '../../../constants/color-estado';
import { PageableParams } from '../../../interfaces/pageable-params';
import { StringToTitleWithAccents } from '../../../pipes/StringToTitleWithAccents.pipe';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
  standalone: true,
  imports: [SearchBoxTableComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, StringToTitleWithAccents, UpperCasePipe]
})
export class ProductosComponent {

  private productoService = inject(ProductoService);
  public authService = inject(AuthService);
  private alertService = inject(AlertService);

  displayedColumns: string[] = ['multimedia', 'codigo', 'nombre', 'categoria', 'cantidadStock', 'costoUnitario', 'variante', 'activo', 'visibleEnTienda', 'acciones'];
  estadoActivoProducto = ESTADO_ACTIVO
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;


  constructor() { }

  readonly params = signal<PageableParams>({
    active: 'codigo',
    direction: 'desc',
    pageNumber: 0,
    pageSize: 10,
    query: ''
  });

  readonly productosResource = rxResource({
    params: () => this.params(),
    stream: ({ params }) => {
      if (this.authService.hasRole('ROLE_LIST_PRODUCTOS')) {
        const resul = this.productoService.getAllProductosPageable(params);
        return resul;
      }

      console.warn('Sin permisos');
      return EMPTY;
    }
  })

  loading = this.productosResource.isLoading

  readonly productos = computed(() => {
    const response = this.productosResource.value();
    if (!response) {
      return [];
    }
    return response.content.map(prod => {
      prod.colorVariante = COLOR_ACTIVO[('' + (prod.padreId ? true : false)) as keyof typeof COLOR_ACTIVO];
      prod.colorActivo = COLOR_ACTIVO[('' + prod.activo) as keyof typeof COLOR_ACTIVO];
      prod.colorVisibleEnTienda = COLOR_ACTIVO[('' + prod.visibleEnTienda) as keyof typeof COLOR_ACTIVO];

      if (prod.multimediasAsignada.length > 0) {
        const primerElemento = prod.multimediasAsignada.find((m) => m.esPrincipal) || prod.multimediasAsignada[0];
        prod.multimediasAsignada = [primerElemento];
        prod.multimediasAsignada.map((mp) => {
          mp.multimedia.urlMultimediaShow = this.API_URL_VER_IMAGEN.concat(mp.multimedia.nombre);
          return mp;
        });
      }
      return prod;
    });
  });

  readonly page = computed(() =>
    this.productosResource.value()?.page
  );

  pageChanged(event: PageEvent) {
    this.params.update(params => ({
      ...params,
      pageNumber: event.pageIndex,
      pageSize: event.pageSize
    }));
  }

  sortChanged(sort: Sort) {
    const direction = sort.direction ? sort.direction : 'desc';
    const active = sort.direction ? sort.active : 'codigo';

    this.params.update(params => {
      // Evitamos peticiones duplicadas si el estado del orden no cambió realmente
      if (params.active === active && params.direction === direction) {
        return params;
      }

      return {
        ...params,
        active,
        direction,
        pageNumber: 0 // Reiniciamos a la primera página al ordenar
      };
    });
  }


  searchEvent(query: string) {
    this.params.update(params => ({
      ...params,
      query,
      pageNumber: 0
    }));
  }



  delete(producto: Producto): void {

    const dialogRef = this.alertService.decision(`¿Seguro que desea eliminar ${producto.nombre}?`, "Borrar producto")
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.productoService.deleteProducto(producto.id).subscribe(
          () => {
            //this.loadItems();
            this.alertService.success(`${producto.nombre} eliminado con éxito.`, 'Producto Eliminado!')

          }
        )
      }
    });

  }

}
