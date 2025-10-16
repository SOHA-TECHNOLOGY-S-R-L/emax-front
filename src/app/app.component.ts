import { Component, OnInit } from '@angular/core';
import { ZonaHorariaDefectoService } from './services/zona-horaria-defecto.service';
import { RouterOutlet } from '@angular/router';
import { GoogleTagManagerService } from './services/google-tag-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'emax-front';
  constructor(private zonaHorariaDefectoService: ZonaHorariaDefectoService,
    private gtmService: GoogleTagManagerService
  ) {

  }

  ngOnInit() {
    this.gtmService.init();
  }
}
