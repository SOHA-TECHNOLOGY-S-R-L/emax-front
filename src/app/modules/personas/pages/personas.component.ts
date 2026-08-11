import { Component, computed, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { Persona } from '../../../models/persona';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { PersonaService } from '../../../services/persona.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { SearchBoxTableComponent } from '../../compartido/search-box-table/search-box-table.component';
import { PageableParams } from '../../../interfaces/pageable-params';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['./personas.component.css'],
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, RouterModule, SearchBoxTableComponent],

})
export class PersonasComponent {
  private personaService = inject(PersonaService);
  public authService = inject(AuthService);
  //private alertService = inject(AlertService);
  displayedColumns: string[] = ['id','nomApellRz', 'numeroDocumento', 'celular', 'acciones'];

  readonly params = signal<PageableParams>({
    pageNumber: 0,
    pageSize: 10,
    active: 'id',
    direction: 'desc',
    query: ''
  });

  readonly personasResource = rxResource({
    params: () => this.params(),
    stream: ({ params }) =>
      this.personaService.getAllClientesPageable(params)
  });

  readonly personas = computed(() =>
    this.personasResource.value()?.content ?? []
  );

  readonly page = computed(() =>
    this.personasResource.value()?.page
  );

  //readonly loading = this.personasResource.isLoading;
  constructor() { }

  pageChanged(event: PageEvent) {
    this.params.update(params => ({
      ...params,
      pageNumber: event.pageIndex,
      pageSize: event.pageSize
    }));
  }

  sortChanged(sort: Sort) {
    const direction = sort.direction ? sort.direction : 'desc';
    const active = sort.direction ? sort.active: 'id';

    this.params.update(params => {
      if (params.active === active && params.direction === direction) {
        return params;
      }
      return {
        ...params,
        active,
        direction,
        pageNumber: 0 // Reiniciamos a la primera página al ordenar
      };
    });
  }

  searchEvent(query: string) {
    this.params.update(params => ({
      ...params,
      query,
      pageNumber: 0
    }));
  }

  delete(persona: Persona): void {

/*     const dialogRef = this.alertService.decision(`¿Seguro que desea eliminar al persona ${persona.nomApellRz}?`, "Borrar persona")
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.personaService.delete(persona.id).subscribe(
          () => {
            this.loadItems();
            this.alertService.success(`Persona ${persona.nomApellRz} eliminado con éxito.`, 'Persona Eliminado!')
          }
        )
      }
    }); */

  }

  /*   abrirModal(persona: Persona) {
      this.personaSeleccionado = persona;
      this.modalService.abrirModal();
    } */

}
