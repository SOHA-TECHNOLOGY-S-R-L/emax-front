import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Pedido } from '../../../../models/pedido';
import { PedidoService } from '../../../../services/pedido.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-detalle-pedido-compra',
  templateUrl: './detalle-pedido-compra.component.html',
  styleUrl: './detalle-pedido-compra.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]

})
export class DetallePedidoCompraComponent implements OnInit {

  pedido!: Pedido;
  titulo: string = 'Pedido de compra';
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  //razonSocialActivate:boolean=false;

  constructor(private pedidoService: PedidoService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      let pedidoId = +params.get('pedidoId')!;
      this.pedidoService.getPedido(pedidoId).subscribe(pedido => {
        const newItems = pedido.items.map(item => {
          const mp = item.producto.multimediasProducto;
          if (!mp) {
            item.imagenShow = 'no-imagen.png'
          } else {
            const primerElemento = mp.find(mp => mp.multimedia.mimeType.startsWith('image'))
            item.imagenShow = primerElemento ? this.API_URL_VER_IMAGEN.concat(primerElemento.multimedia.nombre) : 'no-imagen.png';
          }
          return item;
        });
        this.pedido = { ...pedido, items: newItems };

      });
    });
  }

}
