import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { MultimediaProducto } from '../../../../models/multimedia-producto';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';
import { MultimediaProductoService } from '../../../../services/multimedia-producto.service';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';

@Component({
  selector: 'servicios-persona',
  standalone: true,
  templateUrl: './servicios-persona.component.html',
  styleUrl: './servicios-persona.component.css',
  imports: [RouterModule, PrimeNgModule, StringToTitleWithAccents]
})
export class ServiciosPersonaComponent {
  private multimediaProductoService = inject(MultimediaProductoService)
  servicios: MultimediaProducto[] = [];
  responsiveOptions: any[] | undefined;
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;


  ngOnInit() {
    this.multimediaProductoService.multimediasServiciosEsPrincipal().subscribe({
      next: (resp) => {
        this.servicios = resp;
        console.log("servicios", this.servicios)
      }
    });

    this.responsiveOptions = [
      { breakpoint: '1400px', numVisible: 4, numScroll: 1 },
      { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
      { breakpoint: '767px', numVisible: 2, numScroll: 1 },
      { breakpoint: '575px', numVisible: 2, numScroll: 1 },
    ];

  }
}
