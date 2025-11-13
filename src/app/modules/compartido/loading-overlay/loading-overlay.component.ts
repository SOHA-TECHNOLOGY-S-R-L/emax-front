import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingService } from '../../../services/loading.service';
import { AngularMaterialModule } from '../angular-material.module';

@Component({
  selector: 'loading-overlay',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule],
  template: `
    <div *ngIf="loadingService.loading$ | async" class="overlay-spinner">
      <mat-spinner diameter="60"></mat-spinner>
    </div>
  `,
  styles: [`
    .overlay-spinner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
  `]
})
export class LoadingOverlayComponent  {

  constructor(public loadingService: LoadingService) {}

}
