import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { SeoService } from '../../../../services/seo.service';
import { EmpresaComponent } from '../../components/empresa/empresa.component';
import { ExperienciaComponent } from "../../components/experiencia/experiencia.component";
import { HistoriaComponent } from '../../components/historia/historia.component';
import { QuienesSomosComponent } from "../../components/quienes-somos/quienes-somos.component";
import { DisenadorGaficoComponent } from '../../components/plazas-trabajo/disenador-grafico';

@Component({
  selector: 'trabaja-con-nosotros',
  standalone: true,
  templateUrl: './trabaja-con-nosotros.component.html',
  styleUrl: './trabaja-con-nosotros.component.css',
  imports: [ DisenadorGaficoComponent, RouterModule]
})
export class TrabajaConNosotrosComponent {
/*
  private seoService = inject(SeoService);

   ngOnInit(): void {
    this.seoService.title.setTitle("Grafiya — Productos para merchandising, publicidad y branding")
    this.seoService.meta.updateTag({ name: "keywords", content: "merchandising, publicidad, branding, marca" })
    this.seoService.meta.updateTag({ name: "description", content: "Productos de merchandising para campañas publicitarias, posicionamiento de marca, regalos empresariales" })
    this.seoService.meta.updateTag({ property: "og:description", content: "Productos de merchandising para campañas publicitarias, posicionamiento de marca, regalos empresariales" })
    this.seoService.meta.updateTag({ property: "og:url", content: `${environment.apiFront}/home` })
    this.seoService.meta.updateTag({ property: "og:title", content: `Grafiya — Productos para merchandising, publicidad y branding` })
    this.seoService.meta.updateTag({ property: "og:type", content: "website" });
    this.seoService.setIndexFollow(true);


  } */

}
