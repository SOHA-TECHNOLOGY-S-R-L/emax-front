import { EstadoMetadata, EstadoPedidoEnum, EstadoPedidoEtiquetas, getEtiquetaEstadoPedidoEnum } from './../../../../enums/estado-pedido.enum';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import moment from 'moment';
import { EMPTY } from 'rxjs';
import { COLOR_ESTADO_PEDIDO } from '../../../../constants/pedido.constants';
import { PageableParams } from '../../../../interfaces/pageable-params';
import { Pedido } from '../../../../models/pedido';
import { AuthService } from '../../../../services/auth.service';
import { PedidoService } from '../../../../services/pedido.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { SearchBoxTableComponent } from '../../../compartido/search-box-table/search-box-table.component';
import { DetallePedidoComponent } from '../../components/detalle-pedido/detalle-pedido.component';
import { TipoPedidoEnum } from '../../../../enums/tipo-pedido.enum';
import { SnackbarService } from '../../../../services/snackbar.service';

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
  private readonly snack = inject(SnackbarService);


  displayedColumns: string[] = ['id', 'apellNomRznSocial', 'createAt', 'adquiridoEn', 'costoTotal', 'saldoPedido', 'estado'];
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
        const resul = this.pedidoService.getAllPedidosPageable(params, TipoPedidoEnum.COMPRA);
        return resul;
      }
      console.warn('Sin permisos');
      return EMPTY;
    }
  })

  loading = this.pedidosResource.isLoading;
  estadoPedidoEnum = EstadoPedidoEnum
  //estadoPedidoEtiquetas = EstadoPedidoEtiquetas

  readonly pedidos = computed(() => {
    const p = this.pedidosResource.value();
    if (!p) {
      return [];
    }
    return p.content.map(p => ({
      ...p,
      createAt: p.createAt || null,
      entregadoEn: p.entregadoEn || null,
      adquiridoEn: p.adquiridoEn || null,
      isAnuladoDisabled: p.estadoPedido == EstadoPedidoEnum.ANULADO ||
        (p.costoTotal - p.saldoPedido) != 0 ||
        p.pagoTotal > 0 && p.movimientos.length > 0
      //p.estadoPedido.color = COLOR_ESTADO_PEDIDO[('' + p.estadoPedido) as keyof typeof COLOR_ESTADO_PEDIDO];
    }));

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

  anularPedido(pedidoId: number): void {
    this.pedidoService.getAnularPedido(pedidoId).subscribe({
      next: (res) => {
        if (res.data == null) {
          this.snack.warning('No se recibió el nuevo estado del pedido.');
          return;
        }

        this.pedidosResource.update(current => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            content: current.content.map(pedido =>
              pedido.id === pedidoId ? { ...pedido, estadoPedido: res.data! } : pedido
            )
          };
        });

        this.snack.success(res.message);
      },
      error: (err) => {
        console.error('Error al anular el pedido:', err);
        this.snack.error(
          err.error?.message ?? 'No se pudo anular el pedido.'
        );
      }
    });
  }

  isExpanded(pedido: Pedido) {
    return this.pedido() === pedido;
  }

  //getEtiquetaEstadoPedidoEnum(estado)

  getEstadoPedido(estado: any): EstadoMetadata {
    return getEtiquetaEstadoPedidoEnum(estado)
  }

  toggle(pedido: Pedido) {
    this.pedido.update(actual =>
      actual === pedido ? null : pedido
    );
  }

}
