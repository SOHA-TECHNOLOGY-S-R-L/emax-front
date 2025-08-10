import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { SeoService } from '../../../../services/seo.service';
import { CategoriasProductoClienteComponent } from '../../components/categorias-producto-cliente/categorias-producto-cliente.component';
import { ProductoClienteComponent } from '../../components/producto-cliente/producto-cliente.component';
import { ServiciosClienteComponent } from '../../components/servicios-cliente/servicios-cliente.component';

@Component({
  selector: 'app-producto-servicio-cliente',
  standalone: true,
  templateUrl: './producto-servicio-cliente.component.html',
  styleUrl: './producto-servicio-cliente.component.css',
  imports: [ProductoClienteComponent, CategoriasProductoClienteComponent, ServiciosClienteComponent, RouterModule]
})
export class ProductoServicioClienteComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.title.setTitle("Productos para hacer publicidad, merchandising y branding")
    this.seoService.meta.updateTag({ name: "description", content: "Tazas,Termos, botellas,Vasos,Libretas,Lapiceros, Máquinas, insumos, para hacer publicidad, merchandising y baranding" })
    this.seoService.meta.updateTag({ name: "og:description", content: "Tazas,Termos, botellas,Vasos,Libretas,Lapiceros, Máquinas, insumos, para hacer publicidad, merchandising y baranding" })
    this.seoService.meta.updateTag({ name: "keywords", content: "tazas, botellas, tomatodos, termos, vasos, lapiceros, libretas, publicidad,  mercahndising, branding" })
    this.seoService.meta.updateTag({ name: "og:url", content: `${environment.apiFront}/home/productos-servicios` })
    this.seoService.meta.updateTag({ name: "og:title", content: `Productos para hacer publicidad, merchandising y branding` })
    this.seoService.setIndexFollow(true);

    /*   <title>Grafiya — Productos publicitarios, merchandising y branding</title>
      <base href="/">

      <meta name="title" content="Grafiya — Productos publicitarios, merchandising y branding" />
      <meta name="description" content="Ofrecemos una amplia variedad de productos para publicidad, merchandising y branding" />
      <meta name="keywords" content="merchandising, publicidad, branding">
      <!-- Open Graph / Facebook -->
      <meta name="og:type" content="website" />
      <meta name="og:url" content="https://grafiya.com.pe/" />
      <meta name="og:title" content="Grafiya — Productos publicitarios, merchandising y branding" />
      <meta name="og:description"
        content="Ofrecemos una amplia variedad de productos para publicidad, merchandising y branding" />
      <meta name="og:image" content="https://grafiya.com.pe/images/meta-tags.png" /> */


  }

}
