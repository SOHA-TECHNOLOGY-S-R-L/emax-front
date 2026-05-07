import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent, SnackBarType } from '../modules/compartido/custom-snackbar/custom-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) {}

  private show(message: string, type: SnackBarType) {
    this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: { message, type },
      duration: 4000,
      panelClass: ['custom-snackbar-panel'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  success(message: string) {
    this.show(message, 'success');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  error(message: string) {
    this.show(message, 'error');
  }
}
