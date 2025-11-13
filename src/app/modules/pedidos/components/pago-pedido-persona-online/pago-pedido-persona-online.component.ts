import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pedido } from '../../../../models/pedido';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChatUtils } from '../../../../utils/chat-utils';


@Component({
  selector: 'pago-pedido-persona-online',
  standalone: true,
  templateUrl: './pago-pedido-persona-online.component.html',
  styleUrl: './pago-pedido-persona-online.component.css',
  imports: [CommonModule, CurrencyPipe]
})
export class PagoPedidoPersonaOnlineComponent {
  dialogRef = inject(MatDialogRef<PagoPedidoPersonaOnlineComponent>);
  data = inject<Pedido>(MAT_DIALOG_DATA);
  chatUtils = ChatUtils;
  isPagoPedidoSendChat = false;
  ngOnInit(): void {
    this.dialogRef.keydownEvents().subscribe(event => event.key === "Escape" ? this.dialogRef.close(this.isPagoPedidoSendChat) : false);
  }

  onConfirm(decision: boolean): void {
    this.dialogRef.close(decision);
  }

  enviarPedidoChat() {
    this.chatUtils.pagoPedidoToEmpleadoCaja(this.data);
    this.isPagoPedidoSendChat = true
    this.dialogRef.close(this.isPagoPedidoSendChat);

  }

}
