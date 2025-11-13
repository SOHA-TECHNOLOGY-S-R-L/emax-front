import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router, RouterModule } from '@angular/router';
import { ELEMENTOS_POR_PAGINA, PRIMERA_PAGINA, SIGUIENTE_PAGINA, ULTIMA_PAGINA } from '../../../constants/constantes';
import { PageableResponse } from '../../../models/pageable-response';
import { Persona } from '../../../models/persona';
import { Usuario } from '../../../models/usuario';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { UsuarioService } from '../../../services/usuario.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { SearchBoxTableComponent } from './../../compartido/search-box-table/search-box-table.component';
import { PersonaService } from '../../../services/persona.service';


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
  standalone: true,
  imports: [SearchBoxTableComponent, AngularMaterialModule , CommonModule,  RouterModule, FormsModule, ReactiveFormsModule]

})
export class UsuariosComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['nomApellRz', 'numeroDocumento','celular','email','usuario', 'acciones'];
  dataSource: Persona[] = [];
  usuarioSeleccionado!: Usuario;
  pageable: PageableResponse = new PageableResponse();
  querySearch!: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isLoading = true;


  constructor(
    private usuarioService: UsuarioService,
    private personaService: PersonaService,
    private modalService: ModalService,
    public authService: AuthService,
    private router: Router) {

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

    this.personaService.getAllEmpleadosPageable(params).subscribe(response => {
      this.dataSource = response.content as Persona[];
      this.pageable = response;

    });
  }

  setUsuario(empleado: Persona): void {
    this.usuarioService.setUsuario(empleado.usuario);
    this.router.navigate(['/usuarios/asignar-rol-usuario']);
  }


  searchEvent(query: string): void {
    this.querySearch = query;
    this.loadItems();
  }


  abrirModal(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.modalService.abrirModal();
  }

}

