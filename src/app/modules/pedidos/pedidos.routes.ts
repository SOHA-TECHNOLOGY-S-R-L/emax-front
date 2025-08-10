import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../../guards/is-authenticated.guard';
import { RoleGuard } from '../../guards/role.guard';
import { ContactanosComponent } from '../compartido/contactanos/contactanos.component';
import { DetallePedidoCompraComponent } from './components/detalle-pedido-compra/detalle-pedido-compra.component';
import { DetallePedidoVentaComponent } from './components/detalle-pedido-venta/detalle-pedido-venta.component';
import { ItemProductoClienteOnlineComponent } from './pages/item-producto-cliente-online/item-producto-cliente-online.component';
import { ItemProductoClienteTiendaComponent } from './pages/item-producto-cliente-tienda/item-producto-cliente-tienda.component';
import { ListadoVentasComponent } from './pages/listado-ventas/listado-ventas.component';
import { RptePedidoComponent } from './reportes/rpte-pedido/rpte-pedido.component';
import { ListadoComprasComponent } from './pages/listado-compras/listado-compras.component';
import { PedidoClienteTiendaFinalizadoComponent } from './components/pedido-cliente-tienda-finalizado/pedido-cliente-tienda-finalizado.component';

export const routes: Routes = [
  // { path: '', redirectTo: ':clienteId', pathMatch: 'full' },

  {
    path: 'listado-ventas',
    component: ListadoVentasComponent,
    canActivate: [isAuthenticatedGuard],
    data: { role: 'ROLE_LIST_VENTAS' }
  },
  {
    path: 'listado-compras',
    component: ListadoComprasComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_LIST_COMPRAS' }
  },
  {
    path: 'rpte-pedidos/:tipoPedidoId',
    component: RptePedidoComponent
  },
  /*   { path: 'form/:clienteId',
      component: FormPedidoComponent,
      canActivate:[isAuthenticatedGuard, RoleGuard],
      data: { role: 'ROLE_CREATE_PEDIDO' }
    }, */
  {
    path: 'item-producto-cliente-tienda/:clienteId',
    component: ItemProductoClienteTiendaComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_CREATE_VENTA' }
  },
  /*
    {
      path: 'item-producto-cliente-online/:productoId',
      component: ItemProductoClienteOnlineComponent,
           canActivate: [isAuthenticatedGuard, RoleGuard],
          data: { role: 'ROLE_CREATE_PEDIDO' }
    },
    */

    {
      path: 'pedido-cliente-tienda-finalizado/:clienteId',
      component: PedidoClienteTiendaFinalizadoComponent,
          /* canActivate: [isAuthenticatedGuard, RoleGuard],
          data: { role: 'ROLE_CREATE_PEDIDO' }*/
    },

  {
    path: 'contactanos',
    component: ContactanosComponent,
    /*     canActivate: [isAuthenticatedGuard, RoleGuard],
        data: { role: 'ROLE_CREATE_PEDIDO' } */
  },


  {
    path: 'detalle-venta/:pedidoId',
    component: DetallePedidoVentaComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_VIEW_DETAILS_PEDIDO' }
  },
  {
    path: 'detalle-compra/:pedidoId',
    component: DetallePedidoCompraComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_VIEW_DETAILS_PEDIDO' }
  },

];

/* @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosRoutingModule { } */
