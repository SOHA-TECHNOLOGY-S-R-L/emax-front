import { Component, inject } from '@angular/core';
import { CarritoItemProductoComponent } from '../carrito-item-producto/carrito-item-producto.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-modal-carrito-item-producto',
  standalone: true,
  templateUrl: './modal-carrito-item-producto.component.html',
  styleUrl: './modal-carrito-item-producto.component.css',
  imports: [CarritoItemProductoComponent, AngularMaterialModule]
})
export class ModalCarritoItemProductoComponent {
  readonly dialogRef = inject(MatDialogRef<ModalCarritoItemProductoComponent>);
  //isOpen = true; // cierra el modal

  //readonly data = inject<number>(MAT_DIALOG_DATA);
  //readonly animal = model(this.data.animal);

  onCloseModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    //this.isOpen = false; // cierra el modal
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
