import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MenuCabeceraComponent } from '../menus-nav/menu-cabecera.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GenericosService } from '../../../services/genericos.service';

@Component({
  selector: 'cabecera',
  templateUrl: './cabecera.component.html',
  styleUrl: './cabecera.component.css',
  standalone: true,
  imports: [MenuCabeceraComponent, RouterModule]
})
export class CabeceraComponent implements OnInit {
  private genericosService = inject(GenericosService)

  @Output()
  clickMenuEvent = new EventEmitter<any>();

  private activateRoute = inject(ActivatedRoute)
  public authService = inject(AuthService)
  public whatsapp!: string;
  modoTienda!: boolean;

  constructor() { }

  sideNavToggle(): void {
    this.clickMenuEvent.emit();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    this.genericosService.getGenericos().subscribe(resp => {
      this.whatsapp = resp.filter( g => g.codigo === "WHATSAPP")[0].valor1;
    })
  }

}
