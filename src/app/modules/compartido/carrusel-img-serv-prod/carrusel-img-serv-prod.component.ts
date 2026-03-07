import { Component, computed, input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../constants/color-estado-producto';
import { MultimediaProducto } from '../../../models/multimedia-producto';
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
  //multimediaProductoService = inject(MultimediaProductoService);
  inMultimediasProducto = input.required<MultimediaProducto[]>();//es6to genera una señal no mutble
  responsiveOptions: any[] | undefined;
  inCircular = input.required<boolean>();
  inShowNavigators = input.required<boolean>();
  inShowIndicators = input.required<boolean>();
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  multimediasProducto = computed(() => {
    const lista = this.inMultimediasProducto();
    if (!lista || lista.length === 0) {
      return [];
    }

    return lista
      .filter(mp => mp.multimedia?.mimeType?.startsWith('image/'))
      .map(mp => {
        const producto = {
          ...mp.producto,
          precioMasBajoProductoShow: mp.producto.margenesProducto.length
            ? Math.min(...mp.producto.margenesProducto.map(m => m.precioNeto))
            : 0,
          estadoProducto: {
            ...mp.producto.estadoProducto,
            color: COLOR_ESTADO_PRODUCTO[
              ('' + mp.producto.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO
            ]
          }
        };

        return { ...mp, producto };
      });
  });
  hasMultimediaProducto = computed(() => this.multimediasProducto().length > 0);

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


