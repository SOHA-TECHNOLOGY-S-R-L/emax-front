import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PedidoService } from '../../../../services/pedido.service';
import { ProductoService } from '../../../../services/producto.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { ItemPedido } from '../../../../models/item-pedido';
import { PersonaService } from '../../../../services/persona.service';

@Component({
  selector: 'app-detalle-pedido-venta',
  templateUrl: './detalle-pedido-venta.component.html',
  styleUrl: './detalle-pedido-venta.component.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class DetallePedidoVentaComponent {

  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private personaService = inject(PersonaService);
  private route = inject(ActivatedRoute);

  titulo: string = 'Pedido de venta';
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  readonly pedidoId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('pedidoId'))),
    { initialValue: null },
  );

  pedidoResource = rxResource({
    params: () => {
      const pedidoId = this.pedidoId();
      if (!pedidoId) return null;
      return { pedidoId };
    },
    stream: ({ params }) => this.pedidoService.getPedido(+params!.pedidoId),
  });

  coloresResource = rxResource({
    stream: () => this.productoService.getColoresProducto(),
  });

  materialesResource = rxResource({
    stream: () => this.productoService.getMaterialesProducto(),
  });

  pedido = computed(() => {
    const pedido = this.pedidoResource.value();
    if (!pedido) return null;
    return { ...pedido, items: [] };
  });

  personaResources = rxResource({
    params: () => {
      const personaId = this.pedido()?.personaId
      if (!personaId) return null;
      return { personaId };

    },
    stream: ({ params }) => this.personaService.getPersona(+params!.personaId),
  })

  items = computed<ItemPedido[]>(() => {
    const items = this.pedidoResource.value()?.items as ItemPedido[];
    if (!items) { return [] };

    return items.map((item) => {
      const mp = item.producto.multimediasProducto;

      if (!mp) {
        return { ...item, imagenShow: 'no-imagen.png' };
      }

      const primerElemento = mp.find((mp) =>
        mp.multimedia.mimeType.startsWith('image'),
      );

      const imagenShow = primerElemento
        ? this.API_URL_VER_IMAGEN + primerElemento.multimedia.nombre
        : 'no-imagen.png';

      return { ...item, imagenShow };
    });
  });

  constructor() { }

  findColorById(colorId: number) {
    const colores = this.coloresResource.value();
    if (!colores) return null;
    const color = colores.find((c) => c.id === colorId);
    return color ? color.nombre : 'Sin color';
  }

  findMaterialById(materialId: number) {
    const materiales = this.materialesResource.value();
    if (!materiales) return null;
    const material = materiales.find((m) => m.id === materialId);
    return material ? material.nombre : 'Sin material';
  }
}
