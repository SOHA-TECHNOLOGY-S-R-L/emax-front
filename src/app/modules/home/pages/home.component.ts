import { AuthService } from './../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { GenericosService } from '../../../services/genericos.service';
import { SeoService } from '../../../services/seo.service';
import { CarruselEmpresaComponent } from "../components/carrusel-empresa/carrusel-empresa.component";
import { CategoriasProductoPersonaComponent } from "../components/categorias-producto-persona/categorias-producto-persona.component";
import { EmpresaComponent } from '../components/empresa/empresa.component';
import { ExperienciaComponent } from '../components/experiencia/experiencia.component';
import { QuienesSomosComponent } from "../components/quienes-somos/quienes-somos.component";
//import { ServiciosPersonaComponent } from '../components/servicios-persona/servicios-persona.component';
import { ProductoPersonaComponent } from "../components/producto-persona/producto-persona.component";
import { ServiciosPersonaComponent } from '../components/servicios-persona/servicios-persona.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { UsuarioService } from '../../../services/usuario.service';
import { PersonaService } from '../../../services/persona.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, CarruselEmpresaComponent, RouterModule, ExperienciaComponent, EmpresaComponent, CategoriasProductoPersonaComponent, QuienesSomosComponent, ProductoPersonaComponent, ServiciosPersonaComponent]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private personaService = inject(PersonaService);
  private alertService = inject(AlertService);

  private router = inject(Router);


  private seoService = inject(SeoService);
  private genericosService = inject(GenericosService);
  public whatsapp!: string;

  readonly usuarioResource = rxResource({
    params: () => this.authService.usuario(),
    stream: ({ params }) => {
      if (!params?.username) return of(null);
      return this.usuarioService.getUsuarioByUsername(params.username);
    }
  });

  readonly personaResource = rxResource({
    params: () => this.usuarioResource.value(),
    stream: ({ params }) => {
      if (!params?.id) return of(null);
      return this.personaService.getPersonaByUsuarioId(params.id);
    }
  });

  readonly isCliente = computed(() => {
    const persona = this.personaResource.value();
    if (!persona) return true;

    return !persona.tipoPersona.persona.startsWith('Empleado');
  });

  readonly isAutenticado = computed(() =>
    this.authService.isAuthenticated()
  );

  irTiendaPorTipoPersonaYRol() {
    if (!this.isAutenticado() || this.isCliente()) {
      this.router.navigate(['/tienda/productos-categoria', 'tienda']);
      return;
    }

    if (this.authService.hasRole('ROLE_REGISTER_VENTA')) {
      this.router.navigate(['pedidos/item-producto-persona-tienda']);
    } else {
      this.alertService.info("Usuario sin permisos para venta al cliente","Ir a tienda")
    }

  }

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
