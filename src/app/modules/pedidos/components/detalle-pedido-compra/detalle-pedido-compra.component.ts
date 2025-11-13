import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Pedido } from '../../../../models/pedido';
import { PedidoService } from '../../../../services/pedido.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-detalle-pedido-compra',
  templateUrl: './detalle-pedido-compra.component.html',
  styleUrl: './detalle-pedido-compra.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule ]

})
export class DetallePedidoCompraComponent implements OnInit {

  pedido!: Pedido;
  titulo: string = 'Pedido de compra';
  //razonSocialActivate:boolean=false;

  constructor(private pedidoService: PedidoService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      let pedidoId = +params.get('pedidoId')!;
      this.pedidoService.getPedido(pedidoId).subscribe(pedido => {
        this.pedido = pedido
        /*         if(this.pedido!.persona!.razonSocial.length>0 ){
                  this.razonSocialActivate=true;
                } */
        console.log("Detalle pedido....", this.pedido)

      });
    });
  }

}
