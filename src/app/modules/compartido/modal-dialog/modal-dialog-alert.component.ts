import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'modal-dialog-alert',
  templateUrl: './modal-dialog-alert.component.html',
  styleUrl: './modal-dialog-alert.component.css',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule]
})

export class ModalDialogAlertComponent {
  title: string;
  icon: string;
  message: string;
  typeAlert: string;
  showYesButton:boolean;

  constructor(
    private modal: MatDialogRef<ModalDialogAlertComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DataRecived
  ) {
    this.title = this.data?.title;
    this.icon = this.data?.icon;
    this.message = this.data?.message;
    this.typeAlert = this.data?.typeAlert;
    this.showYesButton = this.data?.showYesButton;
  }
  closeModal(): void{
    this.modal.close();
  }
}

interface DataRecived  {
  title: string,
  icon: string,
  message: string,
  typeAlert: string,
  showYesButton:boolean
}
