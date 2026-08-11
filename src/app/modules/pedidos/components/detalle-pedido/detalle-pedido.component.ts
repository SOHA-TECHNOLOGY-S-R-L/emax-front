import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { PEDIDO_COMPRA, PEDIDO_VENTA } from '../../../../constants/constantes';
import { ItemPedido } from '../../../../models/item-pedido';
import { Pedido } from '../../../../models/pedido';
import { Persona } from '../../../../models/persona';
import { PersonaService } from '../../../../services/persona.service';
import { ProductoService } from '../../../../services/producto.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrl: './detalle-pedido.component.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class DetallePedidoComponent {

  //private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  //private route = inject(ActivatedRoute);
  inPedido = input.required<Pedido>();
  persona = computed<Persona>(() => {
    const persona = this.inPedido().persona!;
    return persona;
  })

  /*     pedido = computed(() => {
      const pedido = this.pedidoResource.value();
      if (!pedido) return null;
      return { ...pedido, items: [] };
    });
   */

  titulo: string = 'Pedido de venta';
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  /*   readonly pedidoId = toSignal(
      this.route.paramMap.pipe(map((p) => p.get('pedidoId'))),
      { initialValue: null },
    ); */

  /*   pedidoResource = rxResource({
      params: () => {
        const pedidoId = this.pedidoId();
        if (!pedidoId) return null;
        return { pedidoId };
      },
      stream: ({ params }) => this.pedidoService.getPedido(+params!.pedidoId),
    }); */

  coloresResource = rxResource({
    stream: () => this.productoService.getColoresProducto(),
  });

  materialesResource = rxResource({
    stream: () => this.productoService.getMaterialesProducto(),
  });

  /*   personaResources = rxResource({
      params: () => {
        const personaId = this.inPedido().persona?.id;
        if (!personaId) return null;
        return { personaId };

      },
      stream: ({ params }) => this.personaService.getPersona(+params!.personaId),
    }) */

  items = computed<ItemPedido[]>(() => {
    const items = this.inPedido().items as ItemPedido[];
    if (!items) { return [] };

    return items.map((item) => {
      const mp = item.producto.multimediasAsignada;

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

  PEDIDO_VENTA = PEDIDO_VENTA;
  PEDIDO_COMPRA = PEDIDO_COMPRA;


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
