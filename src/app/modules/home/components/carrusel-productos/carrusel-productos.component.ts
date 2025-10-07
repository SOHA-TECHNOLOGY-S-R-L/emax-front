import { Component, inject } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../../constants/color-estado-producto';
import { Producto } from '../../../../models/producto';
import { ProductoService } from '../../../../services/producto.service';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'carrusel-productos',
  templateUrl: './carrusel-productos.component.html',
  styleUrl: './carrusel-productos.component.css',
  standalone: true,
  imports: [PrimeNgModule, CommonModule, RouterModule]

})
export class CarruselProductosComponent {
  private productService = inject(ProductoService)
  lstProductos: Producto[] = [];
  responsiveOptions: any[] | undefined;
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;


  constructor() { }

  ngOnInit() {
    this.productService.productosPorCategoriaNombre('Tienda').subscribe(resp => {
      this.lstProductos = resp.map(prd => {
        prd.estadoProducto.color = COLOR_ESTADO_PRODUCTO[('' + prd.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO];
        //prd.imagen = environment.API_URL_VER_IMAGEN + prd.imagen;
        //console.log(prd.margenesProducto.map(margen => margen.precioNeto.toString()).toString());
        //prd.precioNetoStringShow = "S/ ".concat(prd.margenesProducto.map(m => m.precioNeto).toString().replaceAll(',', ' - '));
        prd.precioNetoNumberShow = 0;
        if (prd.margenesProducto.length > 0) {
          prd.precioNetoNumberShow = prd.margenesProducto.reduce((previous, current) => current.precioNeto < previous.precioNeto ? current : previous).precioNeto;
        }
        return prd;
      })
    });


    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }
}
