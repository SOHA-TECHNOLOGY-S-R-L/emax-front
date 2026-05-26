import { Component, computed, effect, input, OnInit, output, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { MultimediaAsignada } from '../../../models/multimedia-asignada';
import { PrimeNgModule } from '../prime-ng.module';


@Component({
  selector: 'ver-multimedia-asignada',
  templateUrl: './ver-multimedia-asignada.component.html',
  styleUrl: './ver-multimedia-asignada.component.css',
  standalone: true,
  imports: [PrimeNgModule]
})

export class VerMultimediaAsignadaComponent implements OnInit {
  inMultimediasAsignadas = input.required<MultimediaAsignada[]>();//es6to genera una señal no mutble
  multimediasAsignada = signal<MultimediaAsignada[]>([]);
  syncFromInput = effect(() => {
    const lista = this.inMultimediasAsignadas();
    if (!lista || lista.length === 0) {
      this.multimediasAsignada.set([]);
      return;
    }
    this.multimediasAsignada.set(lista.map(mp => ({ ...mp })));
  });

  //hasMultimediaAsignada = computed(() => this.multimediasAsignada().length > 0);

  /* a ?? b. Devuelve "a" si a NO es null ni undefined. Si "a" es null o undefined, devuelve "b" */
  multimediaPrincipal = computed(() => {
    const lista = this.multimediasAsignada();
    return lista.find(m => m.esPrincipal) ?? lista[0] ?? null;
  });

  outMultimediasAsignadas = output<MultimediaAsignada[]>();

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

  setMultimediaPrincipal(MultimediaAsignada: MultimediaAsignada) {
    const actual = this.multimediaPrincipal();
    if (actual?.multimedia.id === MultimediaAsignada.multimedia.id) return;

    this.multimediasAsignada.update(lista => {
      for (const item of lista) {
        item.esPrincipal = (item === MultimediaAsignada);
      }
      return [...lista];
    }
    );
    this.outMultimediasAsignadas.emit(this.multimediasAsignada());
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


