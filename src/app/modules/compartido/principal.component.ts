import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MenuAppComponent } from './menus-nav/menu-app.component';
import { CabeceraComponent } from './cabecera/cabecera.component';
import { MenuTiendaComponent } from './menus-nav/menu-tienda.component';
import { PieComponent } from './pie/pie.component';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css'],
  standalone: true,
  imports: [RouterModule,MatSidenavModule, MenuAppComponent, CabeceraComponent, PieComponent, LoadingOverlayComponent]
})
export class PrincipalComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  public authService = inject(AuthService);
  mobileQuery: MediaQueryList;
  //fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);
  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    //navegara al boton INICIO o HOME
  }


  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
