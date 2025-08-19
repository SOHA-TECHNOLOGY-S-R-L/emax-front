import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SeoService } from '../../../services/seo.service';
import { CarruselEmpresaComponent } from "../components/carrusel-empresa/carrusel-empresa.component";
import { CategoriasProductoClienteComponent } from "../components/categorias-producto-cliente/categorias-producto-cliente.component";
import { EmpresaComponent } from '../components/empresa/empresa.component';
import { ExperienciaComponent } from '../components/experiencia/experiencia.component';
import { ProductoClienteComponent } from '../components/producto-cliente/producto-cliente.component';
import { QuienesSomosComponent } from "../components/quienes-somos/quienes-somos.component";
import { ServiciosClienteComponent } from '../components/servicios-cliente/servicios-cliente.component';
import { GenericosService } from '../../../services/genericos.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  imports: [ServiciosClienteComponent, CommonModule, FormsModule, CarruselEmpresaComponent, RouterModule, ExperienciaComponent, EmpresaComponent, ProductoClienteComponent, CategoriasProductoClienteComponent, QuienesSomosComponent]
})
export class HomeComponent implements OnInit {

  private seoService = inject(SeoService);
  private genericosService = inject(GenericosService);
  public whatsapp!: string;

  ngOnInit(): void {

    this.genericosService.getGenericos().subscribe(resp => {
      this.whatsapp = "tel:".concat( resp.filter(g => g.codigo === "WHATSAPP")[0].valor1);
    });

    this.seoService.title.setTitle("Grafiya — Productos publicitarios, merchandising y branding")
    this.seoService.meta.updateTag({ name: "keywords", content: "merchandising, publicidad, branding" })
    this.seoService.meta.updateTag({ name: "description", content: "Ofrecemos una amplia variedad de productos para publicidad, merchandising y branding" })
    this.seoService.meta.updateTag({ property: "og:description", content: "Ofrecemos una amplia variedad de productos para publicidad, merchandising y branding" })
    this.seoService.meta.updateTag({ property: "og:url", content: `${environment.apiFront}/home` })
    this.seoService.meta.updateTag({ property: "og:title", content: `Grafiya — Productos publicitarios, merchandising y branding` })
    this.seoService.meta.updateTag({ property: "og:type", content: "website" });

    /*       <meta property="og:image" content="https://grafiya.com.pe/images/meta-tags.png" /> */

    this.seoService.setIndexFollow(true);


  }



}
