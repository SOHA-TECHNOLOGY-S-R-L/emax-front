import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import {
  catchError, EMPTY, exhaustMap,
  Subscription,
  take, takeUntil, tap,
  timer
} from 'rxjs';

import { StatusSfs } from '../../../interfaces/status-sfs';
import { AlertService } from '../../../services/alert.service';
import { CajaService } from '../../../services/caja.service';
import { LauncherSfsService } from '../../../services/launcher-sfs.service';

export type SnackBarType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

/* type FacturadorState =
  | 'launcher'
  | 'starting-launcher'
  | 'ready'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'terminating'; */

@Component({
  selector: 'launcher-sfs',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './launcher-sfs.component.html',
  styleUrl: './launcher-sfs.component.css'
})
export class LauncherSfsComponent implements OnInit, OnDestroy {

  private esperarLauncherSubscription?: Subscription;

  private readonly launcherSfsService = inject(LauncherSfsService);
  protected readonly launcherState = this.launcherSfsService.state;

  private readonly alertService = inject(AlertService);
  //readonly inCajaId = input.required<number>();
  readonly inDisabledBtn = input.required<boolean>();
  readonly inPathFacturador = input<string | undefined>();
/*   readonly cajaResource = rxResource({
    stream: () =>
      this.cajaService.getCajaById(
        this.inCajaId()
      )
  }); */

  /**
   * Estado actual del Facturador.
   */
  //readonly state = signal<FacturadorState>('launcher');

  /**
   * Último estado recibido desde el Launcher.
   */
  readonly status = signal<StatusSfs | null>(null);

  /**
   * Indica si existe una operación en curso.
   */
  readonly loading = signal(false);

  /**
   * Mensaje informado por el Launcher.
   */
  readonly message = computed(() => this.status()?.message ?? '');

  /**
   * Texto dinámico del único botón.
   */
  readonly buttonText = computed(() => {

    switch (this.launcherState()) {
      case 'launcher':
        return 'Lanzar Facturador';
      case 'starting-launcher':
        return 'Iniciando Lanzamiento...';
      case 'ready':
        return 'Abrir Facturador';
      case 'starting':
        return 'Abriendo Facturador...';
      case 'running':
        return 'Cerrar Facturador';
      case 'stopping':
        return 'Cerrando Facturador...';
      case 'stopped':
        return 'Terminar Facturador';
      case 'terminating':
        return 'Terminando Facturador...';
      default:
        return 'Lanzar Facturador';
    }
  });

  /**
   * Icono dinámico del botón.
   */
  readonly buttonIcon = computed(() => {

    switch (this.launcherState()) {
      case 'running':
        return 'fa-solid fa-stop mr-1';
      case 'starting-launcher':
      case 'starting':
      case 'stopping':
      case 'terminating':
        return 'fa-solid fa-arrows-rotate mr-1';

      case 'stopped':
        return 'fa-solid fa-power-off mr-1';

      default:
        return 'fa-solid fa-play mr-1';
    }
  });

    /**
   * Icono dinámico del botón.
   */
  readonly buttonColor = computed(() => {

    switch (this.launcherState()) {
      case 'running':
        return 'btn btn-success';
      case 'starting-launcher':
      case 'starting':
      case 'stopping':
      case 'terminating':
        return 'btn btn-secondary';

      case 'stopped':
        return 'btn btn-danger';

      default:
        return 'btn btn-secondary';
    }
  });

  /**
   * El botón queda deshabilitado mientras
   * existe una operación en curso.
   */
  //readonly disabledButton = computed(() => this.loading() && this.inDisabledBtn());

  readonly disabledButton = computed(() => this.loading() || this.inDisabledBtn());

  constructor() {
    console.log('LauncherSfsComponent CONSTRUCTOR');
  }


  ngOnInit(): void {
    console.log('LauncherSfsComponent ngOnInit');
    this.verificarEstadoInicial();
  }


  /**
   * Verifica el estado del Launcher cuandO se carga el componente.
   * Puede encontrar tres situaciones:
   * 1. Launcher no disponible → launcher
   * 2. Launcher disponible + SFS detenido → ready
   * 3. Launcher disponible + SFS ejecutándose → running
   */
  private verificarEstadoInicial(): void {

    this.launcherSfsService.checkStatus().subscribe({
      next: (response) => {
        this.status.set(response);
        if (response.running && response.ready) {
          this.launcherSfsService.setState('running');
          return;
        }
        this.launcherSfsService.setState('ready');
      },
      error: () => {
        this.status.set(null);
        this.launcherSfsService.setState('launcher');
        console.info('Launcher local no disponible')
      }
    });
  }


  /**
   * Acción principal del único botón.
   */
  ejecutarAccion(): void {

    switch (this.launcherState()) {
      case 'launcher':
        this.ejecutarLauncher();
        break;
      case 'ready':
        this.iniciarFacturador();
        break;
      case 'running':
        this.detenerFacturador();
        break;
      case 'stopped':
        this.terminarLauncher();
        break;
      default:
        break;
    }
  }


  /**
   * Ejecuta el protocolo registrado en Windows.
   * Windows se encargará de ejecutar:
   * sfs-launcher://start
   *      ↓
   * iniciar-launcher.bat
   *      ↓
   * LauncherFacturadorSunat
   */
  private ejecutarLauncher(): void {
    this.launcherSfsService.setState('starting-launcher');
    this.loading.set(true);
    window.location.href = 'sfs-launcher://start';
    this.esperarLauncher();
  }


  /**
   * Espera que el Launcher termine de iniciar.
   *
   * Se consulta /status cada segundo durante
   * un máximo de 15 segundos.
   */


  private esperarLauncher(): void {

    this.esperarLauncherSubscription?.unsubscribe();

    let launcherEncontrado = false;
    let intento = 0;

    this.esperarLauncherSubscription = timer(2000, 1000)
      .pipe(
        takeUntil(timer(30_000)),
        exhaustMap(() => {
          intento++;
          console.log(`/api/sfs/status - intento #${intento}`,
            new Date().toISOString()
          );
          return this.launcherSfsService.checkStatus().pipe(
            tap(response => {
              console.log('Launcher respondió correctamente:', response, new Date().toISOString());}),
            catchError(error => {
              console.log(`Launcher todavía no disponible - intento #${intento}`,error?.status,new Date().toISOString());
              return EMPTY;
            })
          );
        }),
        take(1)
      )
      .subscribe({
        next: response => {

          launcherEncontrado = true;

          this.status.set(response);
          this.loading.set(false);
          this.launcherSfsService.setState(response.running && response.ready? 'running': 'ready');
          console.log('Launcher detectado. Estado:',this.launcherState());
        },

        complete: () => {
          if (launcherEncontrado) {
            return;
          }

          if (this.launcherState() !== 'starting-launcher') {
            return;
          }

          console.error('Timeout esperando al Launcher');
          this.loading.set(false);
          this.launcherSfsService.setState('launcher');

          this.alertService.error('No se pudo iniciar el Launcher del Facturador.','Facturador');
        }
      });
  }


  /**
   * Inicia el Facturador SFS.
   * La ruta del JAR se obtiene de la caja.
   */
  private iniciarFacturador(): void {
    const pathFacturador = this.inPathFacturador()?.trim();

    if (!pathFacturador) {
      this.alertService.error(
        'La ruta del Facturador SUNAT no es válida o está vacía. Configuré su caja',
        'Facturador'
      );
      return;
    }

    this.launcherSfsService.setState('starting');
    this.loading.set(true);

    this.launcherSfsService.startSfs(pathFacturador).subscribe({
      next: response => {
        console.log('RESPUESTA START:', response);

        this.status.set(response);

        if (response.running && response.ready) {
          this.loading.set(false);
          this.launcherSfsService.setState('running');
          return;
        }

        this.loading.set(false);
        this.launcherSfsService.setState('ready');

        this.alertService.error(
          response.message || 'El Facturador no pudo iniciar correctamente.',
          'Facturador'
        );
      },

      error: error => {
        console.error('ERROR START SFS:', error);

        this.loading.set(false);
        this.launcherSfsService.setState('ready');

        this.alertService.error(error.message,'Facturador');
      }
    });
  }


  /**
   * Detiene el Facturador SFS.
   * IMPORTANTE: El Launcher permanece ejecutándose.
   */
  private detenerFacturador(): void {

    this.launcherSfsService.setState('stopping');
    this.loading.set(true);

    this.launcherSfsService.stopSfs().subscribe({
      next: (response) => {
        this.status.set(response);
        this.loading.set(false);
        if (!response.running) {
          this.launcherSfsService.setState('stopped');
          return;
        }
        this.launcherSfsService.setState('running');
      },
      error: (error) => {
        console.error('Error al detener Facturador', error);
        this.loading.set(false);
        this.launcherSfsService.setState('running');
        this.alertService.error('No se pudo detener el Facturador SUNAT.', 'Facturador'
        );
      }
    });
  }


  /**
   * Termina el Launcher.
   * El SFS ya debe encontrarse detenido.
   * POST /api/sfs/shutdown
   */
  private terminarLauncher(): void {

    this.launcherSfsService.setState('terminating');
    this.loading.set(true);

    this.launcherSfsService.shutdown().subscribe({
      next: (response) => {
        this.status.set(response);

        setTimeout(() => {
          this.verificarLauncherFinalizado();
        }, 1000);
      },
      error: (error) => {
        console.error('Error al terminar Launcher', error);
        /*
         * Es posible que el Launcher haya
         * recibido la petición y se haya
         * cerrado antes de que Angular
         * recibiera correctamente la respuesta.
         * Por eso verificamos nuevamente.
         */
        setTimeout(() => {
          this.verificarLauncherFinalizado();
        }, 1000);
      }
    });
  }


  /**
   * Comprueba si el Launcher realmente terminó.
   */
  private verificarLauncherFinalizado(): void {
    this.launcherSfsService.checkStatus().subscribe({
      next: () => {
        /*
         * El Launcher sigue vivo.
         */
        this.loading.set(false);
        this.launcherSfsService.setState('stopped');
        this.alertService.error('El Launcher del Facturador todavía se encuentra ejecutándose.', 'Facturador');
      },
      error: () => {

        /*
         * El Launcher ya no responde.
         */
        this.loading.set(false);
        this.status.set(null);
        this.launcherSfsService.setState('launcher');
      }
    });
  }

  ngOnDestroy(): void {
    console.log('LauncherSfsComponent DESTROY');

    this.esperarLauncherSubscription?.unsubscribe();
  }
}
