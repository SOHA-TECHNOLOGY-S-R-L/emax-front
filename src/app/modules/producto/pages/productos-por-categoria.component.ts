import { CommonModule, UpperCasePipe } from '@angular/common';
import { AfterViewInit, Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EMPTY, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../constants/color-estado-producto';
import { Producto } from '../../../models/producto';
import { ChatUtils } from '../../../utils/chat-utils';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { CategoriaService } from './../../../services/categoria.service';
import { ProductoService } from './../../../services/producto.service';
import { SeoService } from './../../../services/seo.service';
import { PageableResponse } from '../../../models/pageable-response';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ELEMENTOS_POR_PAGINA, PRIMERA_PAGINA, SIGUIENTE_PAGINA, ULTIMA_PAGINA } from '../../../constants/constantes';

@Component({
  selector: 'productos-por-categoria',
  templateUrl: './productos-por-categoria.component.html',
  styleUrl: './productos-por-categoria.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, UpperCasePipe],

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
    this.activatedRoute.paramMap.pipe(map(p => p.get('nombre'))),
    { initialValue: null }
  );

  readonly categoriaDeServicio = toSignal(
    this.categoriaService.getCategoriaSubject(),
    { initialValue: null }
  );

  readonly categoriaActiva = computed(() =>
    this.categoriaDeServicio()?.nombre ?? this.categoriaDeRuta()
  );

  lstProductos = signal<Producto[]>([]);


  /*   readonly productosResource = rxResource({
      params: () => {
        const categoria = this.categoriaActiva();
        return categoria ? { categoria } : null;
      },
      stream: ({ params }) => {
        if (params === null) {
          return EMPTY
        }
        return this.productoService.productosPorCategoriaNombre(params.categoria)
      }
    }); */

  /*   readonly lstProductos = computed<Producto[]>(() => {
      const productos = this.productosResource.value();
      if (!productos) return [];

      return productos
        .map(prd => {
          prd.estadoProducto.color =
            COLOR_ESTADO_PRODUCTO[('' + prd.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO];
          //muestar todos los productos en formato string
          //prd.precioNetoStringShow = "S/ ".concat(prd.margenesProducto.map(m => m.precioNeto).toString().replaceAll(',', ' - '));
          prd.precioMasBajoProductoShow =
            prd.margenesProducto.length > 0
              ? prd.margenesProducto.reduce((previous, current) => current.precioNeto < previous.precioNeto ? current : previous).precioNeto
              : 0;
          if (prd.multimediasProducto.length > 0) {
            const primerElemento = prd.multimediasProducto.find(m => m.esPrincipal) || prd.multimediasProducto[0];
            prd.multimediasProducto = [primerElemento];
            prd.multimediasProducto.
              map(mp => {
                mp.multimedia.urlMultimediaShow = this.API_URL_VER_IMAGEN.concat(mp.multimedia.nombre)
                return mp;
              })
          }
          return prd;
        })
        .sort((a, b) => a.estadoProducto.id - b.estadoProducto.id);
    }); */

  doSeoEffect = effect(() => {
    const categoria = this.categoriaActiva();
    const productos = this.lstProductos();

    if (!categoria || productos.length === 0) return;

    const multimedia = productos[0].categoria?.multimedia;
    const imagenCategoria = multimedia ? this.API_URL_VER_IMAGEN.concat(multimedia.nombre) : 'no-imagen.png';

    const titulo = categoria;
    const descripcion = `Categoria ${categoria}`;

    this.seo.title.setTitle(titulo);
    this.seo.meta.updateTag({ name: 'description', content: descripcion });
    this.seo.meta.updateTag({ property: 'og:type', content: 'website' });
    this.seo.meta.updateTag({ property: 'og:title', content: titulo });
    this.seo.meta.updateTag({ property: 'og:description', content: descripcion });
    this.seo.meta.updateTag({
      property: 'og:url',
      content: `${environment.apiFront}/tienda/productos-categoria/${categoria}`
    });
    this.seo.meta.updateTag({
      property: 'og:image',
      content: imagenCategoria
    });

    this.seo.setIndexFollow(true);
  });


  // ************propiedades del paginador***********
  pageable: PageableResponse = new PageableResponse();
  //length = 50;
  pageSize = 8;
  pageIndex = 0;
  pageSizeOptions = [8, 16, 24];
  pageEvent?: PageEvent;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  initProductosPorCategoriaEffect = effect(() => {
    //debugger;
    const categoriaNombre = this.categoriaActiva()
    if (!categoriaNombre) { return };
    this.cargarProductosPorCategoria(this.loadParams(this.pageIndex, this.pageSize));
  })
  //**************************************** */

  constructor() { }

  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel = ELEMENTOS_POR_PAGINA;
    this.paginator._intl.firstPageLabel = PRIMERA_PAGINA;
    this.paginator._intl.nextPageLabel = SIGUIENTE_PAGINA;
    this.paginator._intl.lastPageLabel = ULTIMA_PAGINA;
  }

  chatear(categoriaNombre: string, productoCodigo: string) {
    const url = encodeURI(`${environment.apiFront}/tienda/productos-categoria/${categoriaNombre}/item-producto-persona-online/${productoCodigo}`);
    this.chatUtils.infoFromEmpleadoVenta(url);
    this.router.navigate(['/tienda/productos-categoria', categoriaNombre, 'item-producto-persona-online', productoCodigo]);
  }

  cargarProductosPorCategoria(params: any) {
    return this.productoService.productosPorCategoriaNombre(params).subscribe(response => {
      this.pageable = response;

      const productos = response.content as Producto[];
      this.lstProductos.set(
        productos.map(prd => {
          prd.estadoProducto.color =
            COLOR_ESTADO_PRODUCTO[('' + prd.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO];
          //muestar todos los productos en formato string
          //prd.precioNetoStringShow = "S/ ".concat(prd.margenesProducto.map(m => m.precioNeto).toString().replaceAll(',', ' - '));
          prd.precioMasBajoProductoShow =
            prd.margenesProducto.length > 0
              ? prd.margenesProducto.reduce((previous, current) => current.precioNeto < previous.precioNeto ? current : previous).precioNeto
              : 0;
          if (prd.multimediasProducto.length > 0) {
            const primerElemento = prd.multimediasProducto.find(m => m.esPrincipal) || prd.multimediasProducto[0];
            prd.multimediasProducto = [primerElemento];
            prd.multimediasProducto.
              map(mp => {
                mp.multimedia.urlMultimediaShow = this.API_URL_VER_IMAGEN.concat(mp.multimedia.nombre)
                return mp;
              })
          }
          return prd;
        })
          //.sort((a, b) => a.estadoProducto.id - b.estadoProducto.id)
      );
    })
  }

  loadParams(pageIndex: number, pageSize: number) {
    return {
      //active: "ID",
      //direction: "DESC",
      pageNumber: pageIndex,
      pageSize: pageSize,
      categoriaNombre: this.categoriaActiva()

      /*       query: this.multimediaFilters.query,
            extensiones: this.multimediaFilters.extensiones,
            tamanio: this.multimediaFilters.tamanio,
            ancho: this.multimediaFilters.ancho,
            alto: this.multimediaFilters.alto, */

    };
  }


  handlePageEvent(e: PageEvent) {
    //debugger;
    this.pageEvent = e;
    //this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.cargarProductosPorCategoria(this.loadParams(this.pageIndex, this.pageSize));
  }

  /*   ngOnDestroy(): void {
      if (this.categoriaSuscription$) {
        this.categoriaSuscription$.unsubscribe();
      }
    } */

}
