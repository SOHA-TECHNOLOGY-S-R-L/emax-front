import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-detalle-item-pedido',
  templateUrl: './detalle-item-pedido.component.html',
  styleUrl: './detalle-item-pedido.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule ]
})
export class DetalleItemPedidoComponent {

  detalle!: string;

  constructor(
    public dialogRef: MatDialogRef<DetalleItemPedidoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string){
      this.detalle=data;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

}
