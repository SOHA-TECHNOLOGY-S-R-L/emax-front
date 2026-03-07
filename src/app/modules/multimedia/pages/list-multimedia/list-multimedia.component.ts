import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { switchMap } from 'rxjs';
import { Multimedia } from '../../../../models/multimedia';
import { PageableResponse } from '../../../../models/pageable-response';
import { AlertService } from '../../../../services/alert.service';
import { MultimediaHttpService } from '../../../../services/multimedia-http.service';
import { MultimediaService } from '../../../../services/multimedia.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { SearchBoxTableComponent } from '../../../compartido/search-box-table/search-box-table.component';
import { AuthService } from './../../../../services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-list-multimedia',
  standalone: true,
  templateUrl: './list-multimedia.component.html',
  styleUrl: './list-multimedia.component.css',
  imports: [CommonModule, AngularMaterialModule, SearchBoxTableComponent]
})

export class ListMultimediaComponent {
  private multimediaService = inject(MultimediaService);
  private multimediaHttpService = inject(MultimediaHttpService);
  public authService = inject(AuthService);
  private alertService = inject(AlertService);

  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  ALL_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mpeg'];

  pageIndex = signal(0);
  pageSize = signal(6);

  multimediaFilters = signal<MultimediaFilters>({
    query: '',
    tamanio: 0,
    ancho: 0,
    alto: 0,
    extensiones: ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mpeg']
  });

  lstMultimediaChecked = signal<Multimedia[]>([]);

  refreshTrigger = signal(0);

  params = computed(() => ({
    pageNumber: this.pageIndex(),
    pageSize: this.pageSize(),
    refresh: this.refreshTrigger(), // 🔥 dispara reload
    ...this.multimediaFilters()
  }));

  pageable = toSignal(
    toObservable(this.params).pipe(
      switchMap(params =>
        this.multimediaHttpService.listarArchivosMultimedia(params)
      )
    ),
    { initialValue: new PageableResponse() }
  );

  lstMultimedia = computed(() => this.pageable().content ?? []);

  isAllSelected = computed(() => {
    const current = this.multimediaFilters().extensiones;
    return this.ALL_EXTENSIONS.every(ext => current.includes(ext));
  });

  selectedExtensiones = computed(() => {
    const current = this.multimediaFilters().extensiones;

    if (this.isAllSelected()) {
      return ['ALL', ...current.map(e => `extension.${e}`)];
    }

    return current.map(e => `extension.${e}`);
  });

  handlePageEvent(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }

  searchEvent(query: string) {
    this.multimediaFilters.update(f => ({
      ...f,
      query: query ?? ''
    }));
  }

  selectedTamanio = computed(() =>
    this.multimediaFilters().tamanio === 0
      ? ''
      : `tamanio.${this.multimediaFilters().tamanio}`
  );

  selectedAncho = computed(() =>
    this.multimediaFilters().ancho === 0
      ? ''
      : `ancho.${this.multimediaFilters().ancho}`
  );

  selectedAlto = computed(() =>
    this.multimediaFilters().alto === 0
      ? ''
      : `alto.${this.multimediaFilters().alto}`
  );

  onTamanioChange(value: string) {
    const tamanio = value ? Number(value.split('.')[1]) : 0;
    this.multimediaFilters.update(f => ({ ...f, tamanio }));
  }

  onAnchoChange(value: string) {
    const ancho = value ? Number(value.split('.')[1]) : 0;
    this.multimediaFilters.update(f => ({ ...f, ancho }));
  }

  onAltoChange(value: string) {
    const alto = value ? Number(value.split('.')[1]) : 0;
    this.multimediaFilters.update(f => ({ ...f, alto }));
  }

  onCheckChange(checked: boolean, multimedia: Multimedia) {
    this.lstMultimediaChecked.update(list =>
      checked
        ? [...list, multimedia]
        : list.filter(item => item.id !== multimedia.id)
    );
  }


  readonly dialogRef = inject(MatDialogRef<ListMultimediaComponent>, { optional: true });
  readonly data = inject(MAT_DIALOG_DATA, { optional: true });

  multimediaPrincipal: boolean = this.data?.multimediaPrincipal ?? false;

  pageSizeOptions = [6, 12, 18];

  constructor() { }

  onFilesMultimediaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      this.alertService.error('No se han seleccionado archivos', 'Multimedia');
      return;
    }

    this.multimediaService.filesMultimediaSelected(Array.from(input.files));

    // 🔥 Forzamos recarga reactiva
    this.refreshTrigger.update(v => v + 1);

    input.value = '';
  }

  onMultimediaOptionsChange(options: string[]) {

    const currentExtensions = this.multimediaFilters().extensiones;
    const currentlyAllSelected = this.ALL_EXTENSIONS.every(ext =>
      currentExtensions.includes(ext)
    );

    const clickedAll = options.includes('ALL');

    // 🔥 Caso 1: El usuario hizo click en ALL
    if (clickedAll && !currentlyAllSelected) {
      // Seleccionar todas
      this.multimediaFilters.update(f => ({
        ...f,
        extensiones: [...this.ALL_EXTENSIONS]
      }));
      return;
    }

    // 🔥 Caso 2: El usuario desmarcó ALL
    if (!clickedAll && currentlyAllSelected) {
      // Quitar todas
      this.multimediaFilters.update(f => ({
        ...f,
        extensiones: []
      }));
      return;
    }

    // 🔥 Caso 3: Selección normal
    const extensiones = options
      .filter(o => o.startsWith('extension'))
      .map(o => o.split('.')[1]);

    this.multimediaFilters.update(f => ({
      ...f,
      extensiones
    }));
  }

  eliminarMultimedias() {
    const multimedias = this.lstMultimediaChecked();

    if (!multimedias.length) return;

    this.multimediaHttpService.eliminarMultimedias(multimedias)

      .subscribe({
        next: (result) => {
          this.alertService.success(result.mensaje, result.titulo);
          this.lstMultimediaChecked.set([]);
          // 🔥 recargar lista
          this.refreshTrigger.update(v => v + 1);
        },
        error: () => {
          this.lstMultimediaChecked.set([]);
          this.refreshTrigger.update(v => v + 1);
        }
      });
  }

  asignarMultimediasProducto() {
    const seleccionados = this.lstMultimediaChecked();

    if (!seleccionados.length) {
      this.alertService.info("Seleccionar por lo menos un archivo multimedia", "Multimedia");
      return;
    }

    this.dialogRef?.close(seleccionados);
  }

  isChecked(multimedia: Multimedia): boolean {
    return this.lstMultimediaChecked()
      .some(item => item.id === multimedia.id);
  }

}


interface MultimediaFilters {
  query: string,
  tamanio: number,
  ancho: number,
  alto: number,
  extensiones: string[],
}
