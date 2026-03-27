import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CabeceraComponent } from './cabecera/cabecera.component';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';
import { MenuAppComponent } from './menus-nav/menu-app.component';
import { PieComponent } from './pie/pie.component';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css'],
  standalone: true,
  imports: [RouterModule, MatSidenavModule, MenuAppComponent, CabeceraComponent, PieComponent, LoadingOverlayComponent]
})
export class PrincipalComponent {

  private router = inject(Router);
  public authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);


  readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 600px)')
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

}
