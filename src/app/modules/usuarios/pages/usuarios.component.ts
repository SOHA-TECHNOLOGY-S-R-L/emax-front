import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Router, RouterModule } from '@angular/router';
import { PageableParams } from '../../../interfaces/pageable-params';
import { Persona } from '../../../models/persona';
import { Usuario } from '../../../models/usuario';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { PersonaService } from '../../../services/persona.service';
import { UsuarioService } from '../../../services/usuario.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { SearchBoxTableComponent } from './../../compartido/search-box-table/search-box-table.component';
import { TipoPersonaEnum, TipoPersonaEtiquetas } from '../../../enums/tipo-persona.enum';


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
  standalone: true,
  imports: [SearchBoxTableComponent, AngularMaterialModule, CommonModule, RouterModule, FormsModule, ReactiveFormsModule]

})
export class UsuariosComponent {
  private personaService = inject(PersonaService);
  public authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  displayedColumns: string[] = ['id', 'apellNomRznSocial', 'tipoPersona', 'celular', 'acciones'];
  //dataSource: Persona[] = [];
  usuarioSeleccionado!: Usuario;
  //pageable!: PageableResponse<Usuario>;
  //pageable: PageableResponse = new PageableResponse();
  //querySearch!: string;
  //@ViewChild(MatPaginator) paginator!: MatPaginator;
  //@ViewChild(MatSort) sort!: MatSort;
  //isLoading = true;

  readonly params = signal<PageableParams>({
    pageNumber: 0,
    pageSize: 10,
    active: 'id',
    direction: 'desc',
    query: ''
  });


  readonly trabajadoresResource = rxResource({
    params: () => this.params(),
    stream: ({ params }) =>
      this.personaService.getAllEmpleadosPageable(params)
  });

  readonly trabajadores = computed<Persona[]>(() =>
    this.trabajadoresResource.value()?.content ?? []
  );

  readonly page = computed(() =>
    this.trabajadoresResource.value()?.page
  );

  //tipoDocumentosResource = rxResource({ stream: () => this.personaService.getTipoDocumento() });
  //tipoDocumentos = computed(() => this.tipoDocumentosResource.value() ?? []);
  //tipoPersonasResource = rxResource({ stream: () => this.personaService.getTipoPersona() });
  //tipoPersonas = computed(() => this.tipoPersonasResource.value() ?? []);

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
    const active = sort.direction ? sort.active : 'id';

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

  setUsuario(trabajador: Persona): void {
    const id = trabajador.usuarioId
    if (!id) { return; }
    this.usuarioService.getUsuarioById(id).subscribe(resp => {
      this.usuarioService.setUsuario(resp);
      this.router.navigate(['/usuarios/asignar-rol-usuario']);
    })
  }

  /*   getTipoPersona(tipoPersonaId: number) {
      return this.tipoPersonas().find(tp => tp.id === tipoPersonaId)?.persona // Asignamos un tipo de persona por defecto (cliente)
    } */

  getEtiquetaTipoPersonaEnum(tipo: any): string {
    const contrarTipo = tipo as TipoPersonaEnum;
    return TipoPersonaEtiquetas[contrarTipo] || 'Desconocido';
  }


  abrirModal(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.modalService.abrirModal();
  }

}

