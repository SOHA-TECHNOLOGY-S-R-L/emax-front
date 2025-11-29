import { CommonModule, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../constants/color-estado-producto';
import { Producto } from '../../../models/producto';
import { ChatUtils } from '../../../utils/chat-utils';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { CategoriaService } from './../../../services/categoria.service';
import { ProductoService } from './../../../services/producto.service';
import { SeoService } from './../../../services/seo.service';
import { StringToTitleWithAccents } from "../../../pipes/StringToTitleWithAccents.pipe";

@Component({
  selector: 'productos-por-categoria',
  templateUrl: './productos-por-categoria.component.html',
  styleUrl: './productos-por-categoria.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule,  UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class ProductosPorCategoriaComponent implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private seo = inject(SeoService);
  categoriaSuscription$!: Subscription;
  //categoria!: Categoria;
  lstProductos: Producto[] = [];
  chatUtils = ChatUtils;
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  constructor(private cdr: ChangeDetectorRef) {
    this.categoriaSuscription$ = this.categoriaService.getCategoriaSubject().subscribe(
      categoria => {
        this.loadPorductosPorCategoria( categoria.nombre);
      })
  }

  ngOnInit(): void {
    const categoriaNombre =  this.activatedRoute.snapshot.params['nombre'];
    //console.log("ngOnInit.categoriaId", categoriaId);
    this.loadPorductosPorCategoria(categoriaNombre);
  }

  loadPorductosPorCategoria(categoriaName:string) {
    //console.log("this.loadPorductosPorCategoria.categoriaId()", categoriaName);
    this.productoService.productosPorCategoriaNombre(categoriaName)
      .subscribe(resp => {
        const productos = resp.map(prd => {
          prd.estadoProducto.color = COLOR_ESTADO_PRODUCTO[('' + prd.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO];
          //muestar todos los productos en formato string
          //prd.precioNetoStringShow = "S/ ".concat(prd.margenesProducto.map(m => m.precioNeto).toString().replaceAll(',', ' - '));
          //muestra el valor mínimo de un array de números
          prd.precioNetoNumberShow = 0;
          if (prd.margenesProducto.length > 0) {
            prd.precioNetoNumberShow = prd.margenesProducto.reduce((previous, current) => current.precioNeto < previous.precioNeto ? current : previous).precioNeto;
          }
          return prd;
        })

        this.lstProductos = productos.sort((a, b) => a.estadoProducto.id - b.estadoProducto.id);

        this.seoProductosPorCategoria(categoriaName, this.lstProductos);
        this.cdr.detectChanges();

      })
  }

  seoProductosPorCategoria( categoriaName: string, lstProductos: Producto[]) {
    //const productos = lstProductos.map(pr => pr.nombre).toString();
    const imagenCategoria = lstProductos.length > 0 ? lstProductos[0].categoria!.imagen : 'no-imagen.png';
    const tittle = categoriaName;
    const descripcion = `Categoria ${categoriaName}`
    this.seo.title.setTitle(tittle)
    this.seo.meta.updateTag({ name: "description", content: descripcion })
    //this.seo.meta.updateTag({ name: "keywords", content: `${productos}` })
    this.seo.meta.updateTag({ property: "og:type", content: "website" })
    this.seo.meta.updateTag({ property: "og:description", content: descripcion })
    this.seo.meta.updateTag({ property: "og:url", content: `${environment.apiFront}/tienda/productos-categoria/${categoriaName}` })
    this.seo.meta.updateTag({ property: "og:title", content: tittle })
    this.seo.meta.updateTag({ property: "og:image", content: `${environment.API_URL_VER_IMAGEN}${imagenCategoria}` })
    //this.seo.serCanonicalURL(`${environment.apiFront}/tienda/productos-categoria`)
    this.seo.setIndexFollow(true);
  }


  chatear(categoriaNombre: string, productoCodigo: string) {
    const url = encodeURI( `${environment.apiFront}/tienda/productos-categoria/${categoriaNombre}/item-producto-persona-online/${productoCodigo}`);
    this.chatUtils.infoFromEmpleadoVenta(url);
    this.router.navigate(['/tienda/productos-categoria', categoriaNombre, 'item-producto-persona-online',productoCodigo]);
  }

  ngOnDestroy(): void {
    if (this.categoriaSuscription$) {
      this.categoriaSuscription$.unsubscribe();
    }
  }

}
