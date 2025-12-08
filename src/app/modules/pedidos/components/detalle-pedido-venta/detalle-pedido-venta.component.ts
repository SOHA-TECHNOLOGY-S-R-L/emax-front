import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Pedido } from '../../../../models/pedido';
import { PedidoService } from '../../../../services/pedido.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-detalle-pedido-venta',
  templateUrl: './detalle-pedido-venta.component.html',
  styleUrl: './detalle-pedido-venta.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, AngularMaterialModule, FormsModule, ReactiveFormsModule]

})
export class DetallePedidoVentaComponent implements OnInit {

  pedido!: Pedido;
  titulo: string = 'Pedido de venta';
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

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
