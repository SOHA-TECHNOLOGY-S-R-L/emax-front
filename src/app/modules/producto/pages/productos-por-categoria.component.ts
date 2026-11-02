import { ColorDetails } from './../../../enums/color.enum';
import { CommonModule, UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../constants/color-estado-producto';
import {
  ELEMENTOS_POR_PAGINA,
  PRIMERA_PAGINA,
  SIGUIENTE_PAGINA,
  ULTIMA_PAGINA,
} from '../../../constants/constantes';
import { PageableResponse } from '../../../interfaces/pageable-response';
import { Producto } from '../../../models/producto';
import { ChatUtils } from '../../../utils/chat-utils';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { CategoriaService } from './../../../services/categoria.service';
import { ProductoService } from './../../../services/producto.service';
import { SeoService } from './../../../services/seo.service';

@Component({
  selector: 'productos-por-categoria',
  templateUrl: './productos-por-categoria.component.html',
  styleUrl: './productos-por-categoria.component.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    UpperCasePipe,
  ],
})
export class ProductosPorCategoriaComponent implements AfterViewInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private seo = inject(SeoService);
  chatUtils = ChatUtils;
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  readonly categoriaDeRuta = toSignal(
    this.activatedRoute.paramMap.pipe(map((p) => p.get('nombre'))),
    { initialValue: null },
  );

  readonly categoriaDeServicio = toSignal(
    this.categoriaService.getCategoriaSubject(),
    { initialValue: null },
  );

  readonly categoriaActiva = computed(
    () => this.categoriaDeServicio()?.nombre ?? this.categoriaDeRuta(),
  );

  lstProductos = signal<Producto[]>([]);
  //producto = signal<Producto | null>(null);
  colorDetails = ColorDetails;

  // ************propiedades del paginador***********
  //pageable!: PageableResponse<Producto>;
  pageable = signal<PageableResponse<Producto> | null>(null);  //length = 50;
  pageSize = 8;
  pageIndex = 0;
  pageSizeOptions = [8, 16, 24];
  pageEvent?: PageEvent;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  initProductosPorCategoriaEffect = effect(() => {
    const categoriaNombre = this.categoriaActiva();
    if (!categoriaNombre) {
      return;
    }
    this.cargarProductosPorCategoria(
      this.loadParams(this.pageIndex, this.pageSize),
    );
  });
  //**************************************** */

  doSeoEffect = effect(() => {
    const categoria = this.categoriaActiva();
    const productos = this.lstProductos();

    if (!categoria || productos.length === 0) return;

    /*    const multimedia = categoria?.multimedia;
       const imagenCategoria = multimedia
         ? this.API_URL_VER_IMAGEN.concat(multimedia.nombre)
         : 'no-imagen.png'; */

    const titulo = categoria;
    const descripcion = `Categoria ${categoria}`;
    this.seo.title.setTitle(titulo);
    this.seo.meta.updateTag({ name: 'description', content: descripcion });
    this.seo.meta.updateTag({ property: 'og:type', content: 'website' });
    this.seo.meta.updateTag({ property: 'og:title', content: titulo });
    this.seo.meta.updateTag({ property: 'og:description', content: descripcion });
    this.seo.meta.updateTag({ property: 'og:url', content: `${environment.apiFront}/tienda/productos-categoria/${categoria}`, });
    //this.seo.meta.updateTag({property: 'og:image',content: imagenCategoria,});
    this.seo.setIndexFollow(true);
  });
  constructor() { }

  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel = ELEMENTOS_POR_PAGINA;
    this.paginator._intl.firstPageLabel = PRIMERA_PAGINA;
    this.paginator._intl.nextPageLabel = SIGUIENTE_PAGINA;
    this.paginator._intl.lastPageLabel = ULTIMA_PAGINA;
  }

  chatear(categoriaNombre: string, productoCodigo: string) {
    const url = encodeURI(
      `${environment.apiFront}/tienda/productos-categoria/${categoriaNombre}/item-producto-persona-online/${productoCodigo}`,
    );
    this.chatUtils.infoFromEmpleadoVenta(url);
    this.router.navigate([
      '/tienda/productos-categoria',
      categoriaNombre,
      'item-producto-persona-online',
      productoCodigo,
    ]);
  }

  /* cargarProductosPorCategoria(params: any) {
    return this.productoService.productosPorCategoriaNombre(params)
      .subscribe((response) => {
        //       this.pageable = response;
        this.pageable.set(response);
        const productos = response.content as Producto[];
        //console.log("cargarProductosPorCategoria", productos);
        this.lstProductos.set(

          productos.map((prd) => {
            prd.estadoProducto.color =
              COLOR_ESTADO_PRODUCTO[
              ('' +
                prd.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO
              ];

            let cantidadDisponible = 0;
            if (prd.padreId) {
              console.log("padreId", prd.padreId)
              this.cargarProducto(prd.padreId); // aqui deberia cargar
              console.log("prdctoPadre", this.producto()) // aqui imprime null, error
              cantidadDisponible = this.producto() ? this.producto()?.cantidadStock! : 0
            } else {
              cantidadDisponible = prd.cantidadStock
            }
            prd.cantidadStock = cantidadDisponible;
            //muestar todos los productos en formato string
            //prd.precioNetoStringShow = "S/ ".concat(prd.margenesProducto.map(m => m.precioNeto).toString().replaceAll(',', ' - '));
            prd.precioUnitarioMasBajo =
              prd.margenesProducto.length > 0
                ? prd.margenesProducto.reduce((previous, current) =>
                  current.precioUnitario < previous.precioUnitario
                    ? current
                    : previous,
                ).precioUnitario
                : 0;
            if (prd.multimediasAsignada.length > 0) {
              const primerElemento =
                prd.multimediasAsignada.find((m) => m.esPrincipal) ||
                prd.multimediasAsignada[0];
              prd.multimediasAsignada = [primerElemento];
              prd.multimediasAsignada.map((mp) => {
                mp.multimedia.urlMultimediaShow =
                  this.API_URL_VER_IMAGEN.concat(mp.multimedia.nombre);
                return mp;
              });
            }
            return prd;
          }),
          //.sort((a, b) => a.estadoProducto.id - b.estadoProducto.id)
        );
      });
  }
 */



  cargarProductosPorCategoria(params: any): void {
    this.productoService.productosPorCategoriaNombre(params).pipe(
      switchMap((response) => {
        this.pageable.set(response);
        const productos = response.content as Producto[];

        const productos$ = productos.map((prd) => {
          if (prd.padreId == null) {
            // Producto padre: conserva su propio stock.
            return of(prd);
          }

          // Variante: consulta el producto padre y obtiene su stock.
          return this.productoService.getProducto(prd.padreId).pipe(
            map((padre) => ({
              ...prd,
              cantidadStock: padre.cantidadStock,
            })),
          );
        });

        // Espera a que terminen todas las peticiones.
        return productos$.length > 0
          ? forkJoin(productos$)
          : of([] as Producto[]);
      }),

      map((productos) =>
        productos.map((prd) => {
          prd.estadoProducto.color =
            COLOR_ESTADO_PRODUCTO[
            ('' + prd.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO
            ];

          // El stock ya fue calculado antes de llegar aquí.
          prd.precioUnitarioMasBajo =
            prd.margenesProducto.length > 0
              ? prd.margenesProducto.reduce((previous, current) =>
                current.precioUnitario < previous.precioUnitario
                  ? current
                  : previous,
              ).precioUnitario
              : 0;

          if (prd.multimediasAsignada.length > 0) {
            const primerElemento =
              prd.multimediasAsignada.find((m) => m.esPrincipal) ||
              prd.multimediasAsignada[0];

            prd.multimediasAsignada = [primerElemento];

            prd.multimediasAsignada.forEach((mp) => {
              mp.multimedia.urlMultimediaShow =
                this.API_URL_VER_IMAGEN.concat(mp.multimedia.nombre);
            });
          }

          return prd;
        }),
      ),
    ).subscribe({
      next: (productos) => {
        this.lstProductos.set(productos);
        //console.log('Productos con stock actualizado', productos);
      },
      error: (err) => {
        console.error('Error al cargar productos por categoría', err);
      },
    });
  }



  loadParams(pageIndex: number, pageSize: number) {
    return {
      pageNumber: pageIndex,
      pageSize: pageSize,
      categoriaNombre: this.categoriaActiva(),
    };
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    //this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.cargarProductosPorCategoria(
      this.loadParams(this.pageIndex, this.pageSize),
    );
  }
}
