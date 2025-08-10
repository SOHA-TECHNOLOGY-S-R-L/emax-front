import { Injectable } from '@angular/core';
import { ModalDialogAlertComponent } from '../modules/compartido/modal-dialog/modal-dialog-alert.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor( private modal: MatDialog,) {
  }

  decision(message: string, title: string='¿Estas seguro de realizar la operación?') {
    return this.modal.open(ModalDialogAlertComponent, {
      panelClass: 'dialog-info',
      width: '450px',
      data: {
        title: title,
        icon: 'help_outline',
        message: message,
        typeAlert: 'info',
        showYesButton:true
      }
    });
  }

  error(message: string, title: string='¡Algo salió mal!'): void {
    this.modal.open(ModalDialogAlertComponent, {
      panelClass: 'dialog-error',
      width: '450px',
      data: {
        title: title,
        icon: 'report_problem',
        message: message,
        typeAlert: 'error',
        showYesButton:false
      }
    });
  }

  success(message: string, title: string="Tu trabajo ha sido guardado"): void {
    this.modal.open(ModalDialogAlertComponent, {
      panelClass: 'dialog-success',
      width: '450px',
      data: {
        title: title,
        icon: 'check_circle',
        message: message,
        typeAlert: 'success',
        showYesButton:false
      }
    });
  }

  warning(message: string, title: string="Aviso"): void {
    this.modal.open(ModalDialogAlertComponent, {
      panelClass: 'dialog-warning',
      width: '450px',
      data: {
        title: title,
        icon: 'error_outline',
        message: message,
        typeAlert: 'warning',
        showYesButton:false
      }
    });
  }

  info(message: string, title: string='Información'): void {
    this.modal.open(ModalDialogAlertComponent, {
      panelClass: 'dialog-info',
      width: '450px',
      data: {
        title: title,
        icon: 'help_outline',
        message: message,
        typeAlert: 'info',
        showYesButton:false
      }
    });
  }
}
