import { CarritoItemProductoComponent } from '../../components/carrito-item-producto/carrito-item-producto.component';
import { CustomizeItemProductoToClientComponent } from '../../components/customize-item-producto-to-client/customize-item-producto-to-client.component';


import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Producto } from '../../../../models/producto';
import { ProductoService } from '../../../../services/producto.service';
import { SeoService } from '../../../../services/seo.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';


@Component({
  selector: 'item-producto-persona-online',
  templateUrl: './item-producto-persona-online.component.html',
  styleUrl: './item-producto-persona-online.component.css',
  standalone: true,
  imports: [CarritoItemProductoComponent, CustomizeItemProductoToClientComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]

})
export class ItemProductoPersonaOnlineComponent {
  private activatedRoute = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private breakpointObserver = inject(BreakpointObserver);

  private seo = inject(SeoService);
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  readonly categoriaNombre = toSignal(
    this.activatedRoute.paramMap.pipe(map(p => p.get('nombre'))), { initialValue: null }
  );

  readonly productoCodigo = toSignal(
    this.activatedRoute.paramMap.pipe(map(p => p.get('productoCodigo'))), { initialValue: null }
  );

  readonly producto = rxResource({
    params: () => {
      const codigo = this.productoCodigo();
      const categoria = this.categoriaNombre();

      if (!codigo || !categoria) return null;

      return { codigo, categoria };
    },
    stream: ({ params }) =>
      this.productoService.productoCategoria(
        params!.codigo,
        params!.categoria
      )

  });

  readonly multimediaPrincipal = computed(() => {
    const prd = this.producto.value();
    if (!prd) return;
    if (prd.multimediasProducto.length > 0) {
      const primerElemento = prd.multimediasProducto.find(m => m.esPrincipal) || prd.multimediasProducto[0];
      return this.API_URL_VER_IMAGEN.concat(primerElemento.multimedia.nombre)
    }
    return 'no-imagen.png';
    /* a ?? b. Devuelve "a" si a NO es null ni undefined. Si "a" es null o undefined, devuelve "b" */
    //return lista.find(m => m.esPrincipal) ?? lista[0].multimedia.nombre ?? 'no-imagen.png';
  });

  doSeoEffect = effect(() => {
    const producto = this.producto.value();
    const categoria = this.categoriaNombre();

    if (!producto || !categoria) return;

    this.seoProducto(producto, categoria);
  });

  readonly isMobile = toSignal(
    /*Breakpoint	Media Query
      XSmall(max - width: 599.98px)
      Small(min - width: 600px) and(max - width: 959.98px)
      Medium(min - width: 960px) and(max - width: 1279.98px)
      Large(min - width: 1280px) and(max - width: 1919.98px)
      XLarge(min - width: 1920px)*/
    this.breakpointObserver.observe(Breakpoints.Large)
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );



  seoProducto(producto: Producto, categoriaNombre: string) {
    const tittle = `${producto.nombre}(${producto.codigo}) ${categoriaNombre}`;
    const descripcion = `${producto.descripcion} `
    this.seo.title.setTitle(tittle)
    this.seo.meta.updateTag({ name: "description", content: descripcion })
    this.seo.meta.updateTag({ name: "keywords", content: `${producto.nombre}` })
    this.seo.meta.updateTag({ property: "og:type", content: "website" })
    this.seo.meta.updateTag({ property: "og:description", content: descripcion })
    this.seo.meta.updateTag({ property: "og:url", content: `${environment.apiFront}/tienda/productos-categoria/${categoriaNombre}/item-producto-persona-online/${producto.codigo}` })
    this.seo.meta.updateTag({ property: "og:title", content: tittle })
    this.seo.meta.updateTag({ property: "og:image", content: `${this.multimediaPrincipal()}` })
    //this.seo.serCanonicalURL(`${environment.apiFront}/tienda/item-producto-persona-online`)
    this.seo.setIndexFollow(true);
  }




}
