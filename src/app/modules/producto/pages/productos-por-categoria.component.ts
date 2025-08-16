import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../constants/color-estado-producto';
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
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class ProductosPorCategoriaComponent implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
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
      resp => {
        this.loadPorductosPorCategoria(resp.id, resp.nombre);
      })
  }

  ngOnInit(): void {
    const categoriaId = + this.activatedRoute.snapshot.params['categoriaId'];
    //console.log("ngOnInit.categoriaId", categoriaId);
    this.loadPorductosPorCategoria(categoriaId );
  }

  loadPorductosPorCategoria(categoriaId: number, categoriaName: string ='tienda') {
    //console.log("this.loadPorductosPorCategoria.categoriaId()", categoriaName);
    this.productoService.productosPorCategoria(categoriaId)
      .subscribe(resp => {
        this.lstProductos = resp.map(prd => {
          prd.estadoProducto.color = COLOR_ESTADO_PRODUCTO[('' + prd.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO];
          //prd.imagen = environment.API_URL_VER_IMAGEN + prd.imagen;
          prd.precioNetoStringShow = "S/ ".concat(prd.margenesProducto.map(m => m.precioNeto).toString().replaceAll(',', ' - '));
          return prd;
        })
        this.seoProductosPorCategoria(categoriaId.toString(), categoriaName, this.lstProductos);
        this.cdr.detectChanges();

      })
  }

  seoProductosPorCategoria(categoriaId: string, categoriaName: string, lstProductos: Producto[]) {
    const productos = lstProductos.map(pr => pr.nombre).toString();
    const tittle = `${categoriaId} - ${categoriaName}`;
    const descripcion = `En la categoria ${categoriaName} estan ${productos}`
    this.seo.title.setTitle(tittle)
    this.seo.meta.updateTag({ name: "description", content: descripcion })
    this.seo.meta.updateTag({ name: "keywords", content: `${productos}` })
    this.seo.meta.updateTag({ property: "og:type", content: "website" })
    this.seo.meta.updateTag({ property: "og:description", content: descripcion })
    this.seo.meta.updateTag({ property: "og:url", content: `${environment.apiFront}/tienda/productos-categoria/${categoriaId}` })
    this.seo.meta.updateTag({ property: "og:title", content: tittle })
    //this.seo.meta.updateTag({ property: "og:image", content: `${environment.API_URL_VER_IMAGEN}${categoria.imagen}` })
    //this.seo.serCanonicalURL(`${environment.apiFront}/tienda/productos-categoria`)
    this.seo.setIndexFollow(true);
  }


  chatear(producto: Producto) {
    this.chatUtils.infoProduct(producto);
  }

  ngOnDestroy(): void {
    if (this.categoriaSuscription$) {
      this.categoriaSuscription$.unsubscribe();
    }
  }

}
