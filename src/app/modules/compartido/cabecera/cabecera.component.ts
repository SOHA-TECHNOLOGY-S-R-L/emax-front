import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GenericosService } from '../../../services/genericos.service';
import { BannerTextComponent } from '../banner-text/banner-text.component';
import { MenuCabeceraComponent } from '../menus-nav/menu-cabecera.component';
import { AngularMaterialModule } from '../angular-material.module';
import { CuponService } from '../../../services/cupon.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'cabecera',
  templateUrl: './cabecera.component.html',
  styleUrl: './cabecera.component.css',
  standalone: true,
  imports: [MenuCabeceraComponent, RouterModule, BannerTextComponent, AngularMaterialModule]
})
export class CabeceraComponent {
  private genericosService = inject(GenericosService)
  private cuponService = inject(CuponService)
  private productoService = inject(ProductoService)
  public authService = inject(AuthService)

  readonly cuponesParaClienteResource = rxResource({
    stream: () => this.cuponService.getAllCuponesActivos(),
  })

  readonly hayCuponesParaCliente = computed(() => {
    const cupones = this.cuponesParaClienteResource.value();
    if (!cupones) { return false; }
    return cupones.some(cp => cp.visibleParaCliente === true);
  });

   readonly descripcionCuponActivo = computed(() => {
    const cupones = this.cuponesParaClienteResource.value();
    if (!cupones?.length) { return [] }

    return [
      ...new Set(
        cupones
          .map(cupon => cupon.descripcion)
          .filter(descripcion => !!descripcion)
      )
    ];
  })

  readonly productosConOfertaResource = rxResource({
    stream: () => this.productoService.getProductosConOferta(),
  })

  readonly descripcionProductosConOferta = computed(() => {
    const productos = this.productosConOfertaResource.value();

    if (!productos?.length) {
      return [];
    }

    return [
      ...new Set(
        productos
          .flatMap(producto => producto.margenesProducto ?? [])
          .map(margen => margen.descripcionOferta)
          .filter(descripcion => !!descripcion)
      )
    ];
  });

  readonly mensajesBannerArray = computed(() => [
    ...this.descripcionProductosConOferta(),
    ...this.descripcionCuponActivo()
  ]);

  readonly mensajesBannerString = computed(() => {
    return [
      ...this.descripcionProductosConOferta(),
      ...this.descripcionCuponActivo()
    ].join('  🪙🪙  ');
  });



  @Output()
  clickMenuEvent = new EventEmitter<any>();

  modoTienda!: boolean;

  constructor() { }

  sideNavToggle(): void {
    this.clickMenuEvent.emit();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }


}
