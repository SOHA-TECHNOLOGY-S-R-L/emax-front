import { Component, inject, OnInit } from '@angular/core';
import { CabeceraComponent } from '../../../compartido/cabecera/cabecera.component';
import { PieComponent } from '../../../compartido/pie/pie.component';
import { TrabajadoresComponent } from "../../components/trabajadores/trabajadores.component";
import { EmpresaComponent } from '../../components/empresa/empresa.component';
import { ExperienciaComponent } from "../../components/experiencia/experiencia.component";
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../../services/seo.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css',
  imports: [TrabajadoresComponent, EmpresaComponent, ExperienciaComponent, RouterModule]
})
export class NosotrosComponent implements OnInit {

  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.title.setTitle("Somos importadores directos y comerciantes")
    this.seoService.meta.updateTag({ name: "description", content: "Importadores y comerciantes de productos para publicidad, merchandising y branding" })
    this.seoService.meta.updateTag({ property: "og:description", content: "Importadores y comerciantes de productos para publicidad, merchandising y branding" })
    this.seoService.meta.updateTag({ name: "keywords", content: "Importadores, comerciantes, publicidad,  mercahndising, branding" })
    this.seoService.meta.updateTag({ property: "og:url", content: `${environment.apiFront}/home/nosotros` })
    this.seoService.meta.updateTag({ property: "og:title", content: `Somos importadores directos y comerciantes` })
    this.seoService.setIndexFollow(true);




  }

}
