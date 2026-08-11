import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { COLOR_ACTIVO, ESTADO_ACTIVO, USO_CUPON } from '../../../constants/color-estado';
import { PageableParams } from '../../../interfaces/pageable-params';
import { Cupon } from '../../../models/cupon';
import { PageableResponse } from '../../../models/pageable-response';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { CuponService } from '../../../services/cupon.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-cupones',
  standalone: true,
  templateUrl: './cupones.component.html',
  styleUrl: './cupones.component.css',
  imports: [CommonModule, RouterModule, AngularMaterialModule]
})
export class CuponesComponent {
  private cuponService = inject(CuponService);
  public authService = inject(AuthService);


  displayedColumns: string[] = ['codigo', 'tipoCupon', 'usoCombinado', 'importe', 'fchHoraCaducidad', 'limiteUsoDelCupon', 'limiteUsoPorPersona', 'visibleEnTienda', 'acciones'];
  //dataSource: Cupon[] = [];
  //cupones: Cupon[] = [];
  //pageable!: PageableResponse<Cupon>;
  //pageable: PageableResponse = new PageableResponse();
  //querySearch!: string;
  //@ViewChild(MatPaginator) paginator!: MatPaginator;
  //@ViewChild(MatSort) sort!: MatSort;
  //isLoading = true;
  estadoActivo = ESTADO_ACTIVO;
  usoCupon = USO_CUPON
  //API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  /*   usosCuponResource = rxResource({
      stream: () => this.cuponService.getUsosCupon(),
    }); */


  readonly params = signal<PageableParams>({
    active: 'codigo',
    direction: 'desc',
    pageNumber: 0,
    pageSize: 10,
    query: ''
  });

  tiposDescuentoCuponResource = rxResource({
    stream: () => this.cuponService.getTiposDescuentoCupon(),
  });

  readonly cuponesResource = rxResource({
    params: () => this.params(),
    stream: ({ params }) => {
      if (this.authService.hasRole('ROLE_LIST_CUPON')) {
        return this.cuponService.getAllCuponPageable(params);
      }
      console.warn('Sin permisos');
      return EMPTY;
    }
  })

  readonly page = computed(() =>
    this.cuponesResource.value()?.page
  );



  readonly cupones = computed(() => {
    const response = this.cuponesResource.value();
    if (!response) {
      return [];
    }
    return response.content.map(cp => {
      cp.colorVisibleEnTienda = COLOR_ACTIVO[('' + cp.visibleEnTienda) as keyof typeof COLOR_ACTIVO];
      return cp;
    });

  });

  loading = this.cuponesResource.isLoading;
  constructor() { }
  findTipoDescuentoByCodigo(codigo: string) {
    const tipos = this.tiposDescuentoCuponResource.value();
    if (!tipos) return null;
    const tipo = tipos.find((c) => c.codigo === codigo);
    return tipo ? tipo.descripcion : 'Sin descripcion';
  }

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

  /*   findUsoCuponByCodigo(codigo: string) {
      const usos = this.usosCuponResource.value();
      if (!usos) return null;
      const uso = usos.find((c) => c.codigo === codigo);
      return uso ? uso.descripcion : 'Sin descripcion';
    } */


  /*   delete(producto: Producto): void {

      const dialogRef = this.alertService.decision(`¿Seguro que desea eliminar ${producto.nombre}?`, "Borrar producto")
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.productoService.deleteProducto(producto.id).subscribe(
            () => {
              this.loadItems();
              this.alertService.success(`${producto.nombre} eliminado con éxito.`, 'Producto Eliminado!')

            }
          )
        }
      });

    } */

}
