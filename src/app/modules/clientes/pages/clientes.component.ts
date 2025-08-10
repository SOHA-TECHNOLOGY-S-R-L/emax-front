import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ELEMENTOS_POR_PAGINA, PRIMERA_PAGINA, SIGUIENTE_PAGINA, ULTIMA_PAGINA } from '../../../constants/constantes';
import { Cliente } from '../../../models/cliente';
import { PageableResponse } from '../../../models/pageable-response';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';
import { ModalService } from '../../../services/modal.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { SearchBoxTableComponent } from '../../compartido/search-box-table/search-box-table.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
  standalone: true,
  imports: [CommonModule,AngularMaterialModule , RouterModule, SearchBoxTableComponent],

})
export class ClientesComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['nomApellRz', 'createAt', 'numeroDocumento', 'celular', 'acciones'];
  //dataSource!: MatTableDataSource<Cliente>;
  dataSource: Cliente[] = [];
  //clientes: Cliente[]=[];
  clienteSeleccionado!: Cliente;
  pageable: PageableResponse = new PageableResponse();
  querySearch!: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isLoading = true;


  constructor(
    private clienteService: ClienteService,
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

    this.clienteService.getAllClientesPageable(params).subscribe(response => {
      this.dataSource = response.content as Cliente[];
      this.pageable = response;
    });

  }


  searchEvent(query: string): void {
    this.querySearch = query;
    this.loadItems();
  }

  delete(cliente: Cliente): void {

    const dialogRef = this.alertService.decision(`¿Seguro que desea eliminar al cliente ${cliente.nomApellRz}?`, "Borrar cliente")
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.clienteService.delete(cliente.id).subscribe(
          () => {
            this.loadItems();
            ///this.dataSource = this.clientes.filter(cli => cli !== cliente)
            this.alertService.success(`Cliente ${cliente.nomApellRz} eliminado con éxito.`, 'Cliente Eliminado!')
            /* swal.fire(
             'Cliente Eliminado!',
             `Cliente ${cliente.nombres} eliminado con éxito.`,
             'success'
           ) */
          }
        )
      }
    });

  }

  abrirModal(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.modalService.abrirModal();
  }

}
