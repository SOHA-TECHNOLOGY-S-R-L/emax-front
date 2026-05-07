import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';


export type SnackBarType = 'success' | 'info' | 'warning' | 'error';

@Component({
  selector: 'app-custom-snackbar',
  imports: [CommonModule, MatIconModule],
  templateUrl: './custom-snackbar.component.html',
  styleUrl: './custom-snackbar.component.css',
  standalone: true,
})
export class CustomSnackbarComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: {
    message: string;
    type: SnackBarType;
  }) {}

  get icon(): string {
    switch (this.data.type) {
      case 'success': return 'check_circle';
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'error';
    }
  }


}
