import { Component, computed, effect, input, OnInit, output, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../constants/color-estado-producto';
import { MultimediaProducto } from '../../../models/multimedia-producto';
import { PrimeNgModule } from '../prime-ng.module';


@Component({
  selector: 'ver-multimedia-producto',
  templateUrl: './ver-multimedia-producto.component.html',
  styleUrl: './ver-multimedia-producto.component.css',
  standalone: true,
  imports: [PrimeNgModule]
})

export class VerMultimediaProductoComponent implements OnInit {
  inMultimediasProducto = input.required<MultimediaProducto[]>();//es6to genera una señal no mutble
  multimediasProducto = signal<MultimediaProducto[]>([]);
  syncFromInput = effect(() => {
    const lista = this.inMultimediasProducto();
    if (!lista || lista.length === 0) {
      this.multimediasProducto.set([]);
      return;
    }
    this.multimediasProducto.set(lista.map(mp => ({ ...mp })));
  });

  //hasMultimediaProducto = computed(() => this.multimediasProducto().length > 0);

  /* a ?? b. Devuelve "a" si a NO es null ni undefined. Si "a" es null o undefined, devuelve "b" */
  multimediaPrincipal = computed(() => {
    const lista = this.multimediasProducto();
    return lista.find(m => m.esPrincipal) ?? lista[0] ?? null;
  });

  outMultimediasProducto = output<MultimediaProducto[]>();

  responsiveOptions: any[] | undefined;
  inCircular = input.required<boolean>();
  inShowNavigators = input.required<boolean>();
  inShowIndicators = input.required<boolean>();
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  constructor() { }


  ngOnInit(): void {
    this.responsiveOptions = [
      { breakpoint: '1400px', numVisible: 4, numScroll: 1 },
      { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
      { breakpoint: '767px', numVisible: 2, numScroll: 1 },
      { breakpoint: '575px', numVisible: 2, numScroll: 1 },
    ];
  }

  setMultimediaPrincipal(multimediaProducto: MultimediaProducto) {
    const actual = this.multimediaPrincipal();
    if (actual?.multimedia.id === multimediaProducto.multimedia.id) return;

    this.multimediasProducto.update(lista => {
      for (const item of lista) {
        item.esPrincipal = (item === multimediaProducto);
      }
      return [...lista];
    }
    );
    this.outMultimediasProducto.emit(this.multimediasProducto());
  }

  onMouseMove(event: MouseEvent, img: HTMLImageElement) {
    const rect = img.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    img.style.transformOrigin = `${x}% ${y}%`;
  }

  resetZoom(img: HTMLImageElement) {
    img.style.transformOrigin = 'center center';
  }

}


