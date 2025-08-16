import { CarruselProductosComponent } from '../components/carrusel-productos/carrusel-productos.component';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { LoadJavascriptService } from '../../../services/load-javascript.service';
import { CarruselServiciosComponent } from '../components/carrusel-servicios/carrusel-servicios.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarruselEmpresaComponent } from "../components/carrusel-empresa/carrusel-empresa.component";
import { Categoria } from '../../../models/categoria';
import { ProductoService } from '../../../services/producto.service';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { PieComponent } from "../../compartido/pie/pie.component";
import { CabeceraComponent } from "../../compartido/cabecera/cabecera.component";
import { TrabajadoresComponent } from "../components/trabajadores/trabajadores.component";
import { ExperienciaComponent } from '../components/experiencia/experiencia.component';
import { EmpresaComponent } from '../components/empresa/empresa.component';
import { ServiciosClienteComponent } from '../components/servicios-cliente/servicios-cliente.component';
import { ProductoClienteComponent } from '../components/producto-cliente/producto-cliente.component';
import { CategoriasProductoClienteComponent } from "../components/categorias-producto-cliente/categorias-producto-cliente.component";
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  imports: [ServiciosClienteComponent, CommonModule, FormsModule, CarruselEmpresaComponent, RouterModule, TrabajadoresComponent, ExperienciaComponent, EmpresaComponent, ProductoClienteComponent, CategoriasProductoClienteComponent]
})
export class HomeComponent implements OnInit {

  private seoService = inject(SeoService);

  ngOnInit(): void {
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
