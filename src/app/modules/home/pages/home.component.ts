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
      this.whatsapp = "tel:".concat(resp.filter(g => g.codigo === "WHATSAPP")[0].valor1);
    });

    this.seoService.title.setTitle("Grafiya — Productos para merchandising, publicidad y branding")
    this.seoService.meta.updateTag({ name: "keywords", content: "merchandising, publicidad, branding, marca" })
    this.seoService.meta.updateTag({ name: "description", content: "Productos de merchandising para campañas publicitarias, posicionamiento de marca, regalos empresariales" })
    this.seoService.meta.updateTag({ property: "og:description", content: "Productos de merchandising para campañas publicitarias, posicionamiento de marca, regalos empresariales" })
    this.seoService.meta.updateTag({ property: "og:url", content: `${environment.apiFront}/home` })
    this.seoService.meta.updateTag({ property: "og:title", content: `Grafiya — Productos para merchandising, publicidad y branding` })
    this.seoService.meta.updateTag({ property: "og:type", content: "website" });
    this.seoService.setIndexFollow(true);


  }



}
