import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CabeceraComponent } from '../../../compartido/cabecera/cabecera.component';
import { PieComponent } from '../../../compartido/pie/pie.component';
import { Pedido } from '../../../../models/pedido';
import { ChatUtils } from '../../../../utils/chat-utils';
import { PedidoService } from '../../../../services/pedido.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'contactanos-cliente',
  standalone: true,
  templateUrl: './contactanos-cliente.component.html',
  styleUrl: './contactanos-cliente.component.css',
  imports: [RouterModule, CommonModule]
})
export class ContactanosClienteComponent {

  private pedidoService = inject(PedidoService);
  pedido = new Pedido();
  chatUtils = ChatUtils;


  constructor() {
    this.pedido = { ...this.pedidoService.pedido };
    console.log(this.pedido);
  }

  enviarPedidoChat() {
    this.chatUtils.sendPedido(this.pedido);
  }
}
