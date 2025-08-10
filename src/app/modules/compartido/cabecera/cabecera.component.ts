import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MenuCabeceraComponent } from '../menus-nav/menu-cabecera.component';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'cabecera',
  templateUrl: './cabecera.component.html',
  styleUrl: './cabecera.component.css',
  standalone: true,
  imports: [MenuCabeceraComponent, RouterModule]
})
export class CabeceraComponent implements OnInit {

  @Output()
  clickMenuEvent = new EventEmitter<any>();

  private activateRoute = inject(ActivatedRoute)
  public authService = inject(AuthService)

  modoTienda!: boolean;

  constructor() { }

  sideNavToggle(): void {
    this.clickMenuEvent.emit();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    /*     this.activateRoute.queryParams.subscribe(qp => {
          console.log(qp['modoTienda']);
          console.log(!qp['modoTienda']);
          console.log(!!qp['modoTienda']);
          this.modoTienda = !!qp['modoTienda']
        }); */
  }

}
