import { CarritoItemProductoComponent } from './../../components/carrito-item-producto/carrito-item-producto.component';
import { CustomizeItemProductoToClientComponent } from './../../components/customize-item-producto-to-client/customize-item-producto-to-client.component';


import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Producto } from '../../../../models/producto';
import { AuthService } from '../../../../services/auth.service';
import { ProductoService } from '../../../../services/producto.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { map, Subscription, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SeoService } from '../../../../services/seo.service';
import { toSignal } from '@angular/core/rxjs-interop'


@Component({
  selector: 'item-producto-cliente-online',
  templateUrl: './item-producto-cliente-online.component.html',
  styleUrl: './item-producto-cliente-online.component.css',
  standalone: true,
  imports: [CarritoItemProductoComponent, CustomizeItemProductoToClientComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]

})
export class ItemProductoClienteOnlineComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private seo = inject(SeoService);
  public authService = inject(AuthService);
  public productoId = toSignal<number>(this.activatedRoute.paramMap.pipe(map(r => + (r.get('productoId')!))));
  producto!: Producto;
  constructor() {
  }

  ngOnInit(): void {
    console.log("productoId()", this.productoId())
    this.loadProducto(Number(this.productoId()));
  }

  loadProducto(productoId: number) {
    this.productoService.getProducto(productoId)
      .subscribe(prd => {
        this.producto = prd;
        //this.producto.imagen = environment.API_URL_VER_IMAGEN + prd.imagen;
        this.seoProducto(this.producto.id, this.producto)
      })
  }

  seoProducto(productoId: number, producto: Producto) {
    const tittle = `${productoId} - ${producto.nombre}`;
    const descripcion = `${producto.descripcion} `
    this.seo.title.setTitle(tittle)
    this.seo.meta.updateTag({ name: "description", content: descripcion })
    this.seo.meta.updateTag({ name: "keywords", content: `${producto.nombre}` })
    this.seo.meta.updateTag({ property: "og:type", content: "website" })
    this.seo.meta.updateTag({ property: "og:description", content: descripcion })
    this.seo.meta.updateTag({ property: "og:url", content: `${environment.apiFront}/tienda/item-producto-cliente-online/${productoId}` })
    this.seo.meta.updateTag({ property: "og:title", content: tittle })
    this.seo.meta.updateTag({ property: "og:image", content: `${environment.API_URL_VER_IMAGEN}${producto.imagen}` })
    //this.seo.serCanonicalURL(`${environment.apiFront}/tienda/item-producto-cliente-online`)
    this.seo.setIndexFollow(true);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }


}
