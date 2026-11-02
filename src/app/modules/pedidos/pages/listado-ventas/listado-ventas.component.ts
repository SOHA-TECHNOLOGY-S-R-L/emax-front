import { Component, computed, inject, signal } from '@angular/core';
import { PersonaService } from '../../../../services/persona.service';
import { SearchBoxTableComponent } from './../../../compartido/search-box-table/search-box-table.component';

import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { concatMap, EMPTY } from 'rxjs';
import { EstadoMetadata, EstadoPedidoEnum, getEtiquetaEstadoPedidoEnum } from '../../../../enums/estado-pedido.enum';
import { TipoPedidoEnum } from '../../../../enums/tipo-pedido.enum';
import { PageableParams } from '../../../../interfaces/pageable-params';
import { Pedido } from '../../../../models/pedido';
import { AuthService } from '../../../../services/auth.service';
import { PedidoService } from '../../../../services/pedido.service';
import { SnackbarService } from '../../../../services/snackbar.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { DetallePedidoComponent } from '../../components/detalle-pedido/detalle-pedido.component';

@Component({
  selector: 'listado-ventas',
  templateUrl: './listado-ventas.component.html',
  styleUrls: ['./listado-ventas.component.css'],
  standalone: true,
  imports: [SearchBoxTableComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, DetallePedidoComponent]
})

export class ListadoVentasComponent {

  private readonly pedidoService = inject(PedidoService);
  public authService = inject(AuthService);

  private readonly usuarioService = inject(UsuarioService);
  private readonly personaService = inject(PersonaService);
  private readonly snack = inject(SnackbarService);

  displayedColumnsLarge: string[] = ['id', 'apellNomRznSocial', 'createAt', 'entregadoEn', 'precioTotal', 'saldoPedido', 'username', 'estado'];
  displayedColumnsLargeExpand = [...this.displayedColumnsLarge, 'expand'];

  displayedColumnsShort: string[] = ['entregadoEn', 'precioTotal', 'saldoPedido'];
  displayedColumnsShortExpand = [...this.displayedColumnsShort, 'expand'];

  // isExpansionDetailRow = (i: number, row: any) => row.hasOwnProperty('detailRow') || true;
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
      if (this.authService.hasRole('ROLE_LIST_VENTAS')) {
        const resul = this.pedidoService.getAllPedidosPageable(params, TipoPedidoEnum.VENTA);
        return resul;
      }

      if (this.authService.hasRole('ROLE_LIST_MY_ORDERS')) {
        const usuario = this.authService.usuario();
        if (!usuario) {
          return EMPTY;
        }

        return this.usuarioService.getUsuarioByUsername(usuario.username)
          .pipe(
            concatMap(usuario => this.personaService.getPersonaByUsuarioId(usuario.id)),
            concatMap(persona => this.pedidoService.getPedidosPersonaPageable(
              params, persona.id))
          );
      }
      console.warn('Sin permisos');
      return EMPTY;
    }
  });

  loading = this.pedidosResource.isLoading;

  readonly pedidos = computed(() => {

    const p = this.pedidosResource.value();
    if (!p) {
      return [];
    }
    /*     return p.content.map(p => ({
          ...p,
          createAt: p.createAt
            ? moment(p.createAt).format('DD/MM/YYYY')
            : '-',
          entregadoEn: p.entregadoEn
            ? moment(p.entregadoEn).format('DD/MM/YYYY HH:mm')
            : '-',
          adquiridoEn: p.adquiridoEn
            ? moment(p.adquiridoEn).format('DD/MM/YYYY')
            : '-',
          isAnuladoDisabled: p.estadoPedido == EstadoPedidoEnum.ANULADO ||
            (p.precioTotal - p.saldoPedido) != 0 ||
            p.pagoTotal > 0 &&
            (p.movimientos.length > 0 || p.comprobantesSunat.length > 0)
        })); */

    return p.content.map(p => ({
      ...p,
      createAt: p.createAt || null,
      entregadoEn: p.entregadoEn || null,
      adquiridoEn: p.adquiridoEn || null,
      isAnuladoDisabled: p.estadoPedido == EstadoPedidoEnum.ANULADO ||
        (p.precioTotal - p.saldoPedido) != 0 ||
        p.pagoTotal > 0 &&
        (p.movimientos.length > 0 || p.comprobantesSunat.length > 0)
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

  /*   sortChanged(sort: Sort) {
      this.params.update(params => ({
        ...params,
        active: sort.active.toUpperCase(),
        direction: sort.direction.toUpperCase(),
        pageNumber: 0
      }));
    } */

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

  getEstadoPedido(estado: any): EstadoMetadata {
    return getEtiquetaEstadoPedidoEnum(estado)
  }

  toggle(pedido: Pedido) {
    this.pedido.update(actual =>
      actual === pedido ? null : pedido
    );
  }
}
