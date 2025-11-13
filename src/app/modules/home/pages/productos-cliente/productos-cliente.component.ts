import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { SeoService } from '../../../../services/seo.service';
import { CarruselProductosComponent } from '../../components/carrusel-productos/carrusel-productos.component';
import { CategoriasProductoPersonaComponent } from '../../components/categorias-producto-persona/categorias-producto-persona.component';
import { ServiciosPersonaComponent } from '../../components/servicios-persona/servicios-persona.component';

@Component({
  selector: 'productos-cliente',
  standalone: true,
  templateUrl: './productos-cliente.component.html',
  styleUrl: './productos-cliente.component.css',
  imports: [CategoriasProductoPersonaComponent, ServiciosPersonaComponent, CarruselProductosComponent, RouterModule]
})
export class ProductosClienteComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.title.setTitle("Productos para hacer publicidad, merchandising y branding")
    this.seoService.meta.updateTag({ name: "description", content: "Tazas,Termos, botellas,Vasos,Libretas,Lapiceros, Máquinas, insumos, para hacer publicidad, merchandising y baranding" })
    this.seoService.meta.updateTag({ property: "og:description", content: "Tazas,Termos, botellas,Vasos,Libretas,Lapiceros, Máquinas, insumos, para hacer publicidad, merchandising y baranding" })
    this.seoService.meta.updateTag({ name: "keywords", content: "tazas, botellas, tomatodos, termos, vasos, lapiceros, libretas, publicidad,  mercahndising, branding" })
    this.seoService.meta.updateTag({ property: "og:url", content: `${environment.apiFront}/home/productos` })
    this.seoService.meta.updateTag({ property: "og:title", content: `Productos para hacer publicidad, merchandising y branding` })
    this.seoService.setIndexFollow(true);

  }

}
