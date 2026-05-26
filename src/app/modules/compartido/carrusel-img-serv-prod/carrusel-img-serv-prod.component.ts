import { Component, computed, input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../constants/color-estado-producto';
import { Producto } from '../../../models/producto';
import { StringToTitleWithAccents } from '../../../pipes/StringToTitleWithAccents.pipe';
import { PrimeNgModule } from '../prime-ng.module';


@Component({
  selector: 'carrusel-img-serv-prod',
  templateUrl: './carrusel-img-serv-prod.component.html',
  styleUrl: './carrusel-img-serv-prod.component.css',
  standalone: true,
  imports: [RouterModule, PrimeNgModule, StringToTitleWithAccents]
})

export class CarruselImgServProdComponent implements OnInit {
  inProductos = input.required<Producto[]>();//es6to genera una señal no mutble
  responsiveOptions: any[] | undefined;
  inCircular = input.required<boolean>();
  inShowNavigators = input.required<boolean>();
  inShowIndicators = input.required<boolean>();
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  productos = computed(() => {
    const lista = this.inProductos();
    if (!lista || lista.length === 0) {
      return [];
    }

    return lista
      .filter(pr => pr.multimediasAsignada[0].multimedia?.mimeType?.startsWith('image/'))
      .map(pr => {
        const producto = {
          ...pr,
          precioMasBajoProductoShow: pr.margenesProducto.length
            ? Math.min(...pr.margenesProducto.map(m => m.precioNeto))
            : 0,
          estadoProducto: {
            ...pr.estadoProducto,
            color: COLOR_ESTADO_PRODUCTO[
              ('' + pr.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO
            ]
          }
        };

        return { ...producto };
      });
  });

  hasMultimediaProducto = computed(() => this.productos().length > 0);

  constructor() { }

  ngOnInit(): void {
    this.responsiveOptions = [
      { breakpoint: '1400px', numVisible: 4, numScroll: 1 },
      { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
      { breakpoint: '767px', numVisible: 2, numScroll: 1 },
      { breakpoint: '575px', numVisible: 2, numScroll: 1 },
    ];
  }


  irADetalleProducto() { }


}


