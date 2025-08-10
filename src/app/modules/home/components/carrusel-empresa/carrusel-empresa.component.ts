import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbCarouselConfig, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'carrusel-empresa',
  standalone: true,
  templateUrl: './carrusel-empresa.component.html',
  styleUrl: './carrusel-empresa.component.css',
  imports: [CommonModule, NgOptimizedImage, NgbCarouselModule, RouterModule],
  providers: [NgbCarouselConfig]

})
export class CarruselEmpresaComponent {

  	constructor(config: NgbCarouselConfig) {
		// customize default values of carousels used by this component tree
    config.showNavigationArrows = false;
/*  		config.interval = 10000;
		config.wrap = false;
		config.keyboard = false;
		config.pauseOnHover = false;  */
	}

}
