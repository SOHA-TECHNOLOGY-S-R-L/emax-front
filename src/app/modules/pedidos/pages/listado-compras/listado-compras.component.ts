import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import moment from 'moment';
import { EMPTY } from 'rxjs';
import { PEDIDO_COMPRA } from '../../../../constants/constantes';
import { COLOR_ESTADO_PEDIDO } from '../../../../constants/pedido.constants';
import { PageableParams } from '../../../../interfaces/pageable-params';
import { Pedido } from '../../../../models/pedido';
import { AuthService } from '../../../../services/auth.service';
import { PedidoService } from '../../../../services/pedido.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { SearchBoxTableComponent } from '../../../compartido/search-box-table/search-box-table.component';
import { DetallePedidoComponent } from '../../components/detalle-pedido/detalle-pedido.component';

@Component({
  selector: 'listado-compras',
  templateUrl: './listado-compras.component.html',
  styleUrl: './listado-compras.component.css',
  standalone: true,
  imports: [SearchBoxTableComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, DetallePedidoComponent]

})
export class ListadoComprasComponent {

  private readonly pedidoService = inject(PedidoService);
  public authService = inject(AuthService);

  displayedColumns: string[] = ['id', 'nomApellRz', 'createAt', 'adquiridoEn', 'costoTotal', 'saldoPedido', 'estado', 'acciones'];
  displayedColumnsExpand = [...this.displayedColumns, 'expand'];

  isExpansionDetailRow = (index: number, row: any) => true;

  pedido = signal<Pedido | null>(null);
  readonly params = signal<PageableParams>({
    active: 'id',
    direction: 'desc',
    pageNumber: 0,
    pageSize: 10,
    query: ''
  });

  readonly pedidosResource = rxResource({
    params: () => this.params(),
    stream: ({ params }) => {
      if (this.authService.hasRole('ROLE_LIST_COMPRAS')) {
        const resul = this.pedidoService.getAllPedidosPageable(params, PEDIDO_COMPRA);
        return resul;
      }
      console.warn('Sin permisos');
      return EMPTY;
    }
  })

  loading = this.pedidosResource.isLoading;

  readonly pedidos = computed(() => {
    const response = this.pedidosResource.value();
    if (!response) {
      return [];
    }
    return response.content.map(p => {
      p.createAt = moment(p.createAt).format('DD/MM/YYYY');
      p.entregadoEn = p.entregadoEn ? moment(p.entregadoEn).format('DD/MM/YYYY') : '-';
      p.adquiridoEn = p.adquiridoEn ? moment(p.adquiridoEn).format('DD/MM/YYYY') : '-';
      p.estadoPedido.color =
        COLOR_ESTADO_PEDIDO[('' + p.estadoPedido.id) as keyof typeof COLOR_ESTADO_PEDIDO];
      return p;
    });

  });

  readonly page = computed(() =>
    this.pedidosResource.value()?.page
  );


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
      // Evitamos peticiones duplicadas si el estado del orden no cambió realmente
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

  isExpanded(pedido: Pedido) {
    return this.pedido() === pedido;
  }

  toggle(pedido: Pedido) {
    this.pedido.update(actual =>
      actual === pedido ? null : pedido
    );
  }

}
