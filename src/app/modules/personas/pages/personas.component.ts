import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ELEMENTOS_POR_PAGINA, PRIMERA_PAGINA, SIGUIENTE_PAGINA, ULTIMA_PAGINA } from '../../../constants/constantes';
import { Persona } from '../../../models/persona';
import { PageableResponse } from '../../../models/pageable-response';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { PersonaService } from '../../../services/persona.service';
import { ModalService } from '../../../services/modal.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { SearchBoxTableComponent } from '../../compartido/search-box-table/search-box-table.component';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['./personas.component.css'],
  standalone: true,
  imports: [CommonModule,AngularMaterialModule , RouterModule, SearchBoxTableComponent],

})
export class PersonasComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['nomApellRz', 'createAt', 'numeroDocumento', 'celular', 'tipoPersona',  'acciones'];
  //dataSource!: MatTableDataSource<Persona>;
  dataSource: Persona[] = [];
  //personas: Persona[]=[];
  personaSeleccionado!: Persona;
  pageable: PageableResponse = new PageableResponse();
  querySearch!: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isLoading = true;


  constructor(
    private personaService: PersonaService,
    private modalService: ModalService,
    public authService: AuthService,
    private modal: MatDialog,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute) {

  }


  ngOnInit() { }

  ngAfterViewInit(): void {
     this.sort.sortChange.subscribe(() => {
      (this.paginator.pageIndex = 0);
      this.loadItems();
    });
    this.paginator._intl.itemsPerPageLabel = ELEMENTOS_POR_PAGINA;
    this.paginator._intl.firstPageLabel = PRIMERA_PAGINA;
    this.paginator._intl.nextPageLabel = SIGUIENTE_PAGINA;
    this.paginator._intl.lastPageLabel = ULTIMA_PAGINA;
    this.loadItems();
  }


  loadItems() {
    // try {
    this.isLoading = true;
    const params: any = {
      active: this.sort.active.toUpperCase(),
      direction: this.sort.direction.toUpperCase(),
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      query: !!this.querySearch ? this.querySearch : ''
    };

    this.personaService.getAllClientesPageable(params).subscribe(response => {
      this.dataSource = response.content as Persona[];
      this.pageable = response;
    });

  }


  searchEvent(query: string): void {
    this.querySearch = query;
    this.loadItems();
  }

  delete(persona: Persona): void {

    const dialogRef = this.alertService.decision(`¿Seguro que desea eliminar al persona ${persona.nomApellRz}?`, "Borrar persona")
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.personaService.delete(persona.id).subscribe(
          () => {
            this.loadItems();
            ///this.dataSource = this.personas.filter(cli => cli !== persona)
            this.alertService.success(`Persona ${persona.nomApellRz} eliminado con éxito.`, 'Persona Eliminado!')
            /* swal.fire(
             'Persona Eliminado!',
             `Persona ${persona.nombres} eliminado con éxito.`,
             'success'
           ) */
          }
        )
      }
    });

  }

  abrirModal(persona: Persona) {
    this.personaSeleccionado = persona;
    this.modalService.abrirModal();
  }

}
