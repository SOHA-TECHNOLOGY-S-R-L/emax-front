import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { SearchBoxTableComponent } from '../../compartido/search-box-table/search-box-table.component';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { find } from 'lodash-es';
import { ELEMENTOS_POR_PAGINA, PRIMERA_PAGINA, SIGUIENTE_PAGINA, ULTIMA_PAGINA } from '../../../constants/constantes';
import { PageableResponse } from '../../../models/pageable-response';
import { Producto } from '../../../models/producto';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { ProductoService } from '../../../services/producto.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';

import { COLOR_ACTIVO_PRODUCTO, ESTADO_ACTIVO_PRODUCTO } from '../../../constants/color-estado-producto';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
  standalone: true,
  imports: [SearchBoxTableComponent, CommonModule,  RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule ]


})
export class ProductosComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['codigo', 'nombre', 'categoria', 'cantidadStock', 'costoUnitario','activo','visibleEnTienda', 'acciones'];
  dataSource: Producto[] = [];
  productos: Producto[] = [];
  pageable: PageableResponse = new PageableResponse();
  querySearch!: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isLoading = true;
  estadoActivoProducto = ESTADO_ACTIVO_PRODUCTO


  constructor(
    private productoService: ProductoService,
    private modalService: ModalService,
    public authService: AuthService,
    private modal: MatDialog,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute) {

  }


  ngOnInit() {}

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

    this.productoService.getAllProductosPageable(params).subscribe(response => {
      this.productos = (response.content as Producto[]).map(prod => {
              prod.imagen = environment.API_URL_VER_IMAGEN + prod.imagen;
              prod.colorActivo = COLOR_ACTIVO_PRODUCTO[('' + prod.activo) as keyof typeof COLOR_ACTIVO_PRODUCTO];
              prod.colorVisibleEnTienda = COLOR_ACTIVO_PRODUCTO[('' + prod.visibleEnTienda) as keyof typeof COLOR_ACTIVO_PRODUCTO];
              //cat.cantidadProductos = cat.productos.length;
              return prod;
            }

      )

      this.dataSource = this.productos;
      this.pageable = response;

    });
  }


  searchEvent(query: string): void {
    this.querySearch = query;
    this.loadItems();
  }

  delete(producto: Producto): void {

    const dialogRef = this.alertService.decision(`¿Seguro que desea eliminar ${producto.nombre}?`, "Borrar producto")
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.productoService.deleteProducto(producto.id).subscribe(
          () => {
            this.loadItems();
            this.alertService.success(`${producto.nombre} eliminado con éxito.`, 'Producto Eliminado!')

          }
        )
      }
    });

  }

}
