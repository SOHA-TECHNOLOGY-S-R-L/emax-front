import { Component, inject } from '@angular/core';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../../services/producto.service';
import { Producto } from '../../../../models/producto';
import { COLOR_ESTADO_PRODUCTO } from '../../../../constants/color-estado-producto';
import { environment } from '../../../../../environments/environment';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';

@Component({
  selector: 'carrusel-servicios',
  templateUrl: './carrusel-servicios.component.html',
  styleUrl: './carrusel-servicios.component.css',
  standalone: true,
  imports: [PrimeNgModule, CommonModule, RouterModule, StringToTitleWithAccents]
})
export class CarruselServiciosComponent {
  private productService = inject(ProductoService)
  lstProductos: Producto[] = [];
  responsiveOptions: any[] | undefined;
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  constructor() { }

  ngOnInit() {
    this.productService.getLstProductosServicios().subscribe(resp => {

            //console.log("this.lstProductos.resp", resp);

      this.lstProductos = resp.map(prd => {
        prd.estadoProducto.color = COLOR_ESTADO_PRODUCTO[('' + prd.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO];
        //prd.imagen = environment.API_URL_VER_IMAGEN + prd.imagen;
        //console.log(prd.margenesProducto.map(margen => margen.precioNeto.toString()).toString());
        //prd.precioNetoStringShow = "S/ ".concat(prd.margenesProducto.map(m => m.precioNeto).toString().replaceAll(',', ' - '));


        return prd;
      })
      //console.log("this.lstProductos.servicios", this.lstProductos);
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
