import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '../../guards/is-authenticated.guard';
import { RoleGuard } from '../../guards/role.guard';
import { DetallePedidoCompraComponent } from './components/detalle-pedido-compra/detalle-pedido-compra.component';
import { DetallePedidoVentaComponent } from './components/detalle-pedido-venta/detalle-pedido-venta.component';
import { PedidoPersonaTiendaFinalizadoComponent } from './components/pedido-persona-tienda-finalizado/pedido-persona-tienda-finalizado.component';
import { ItemProductoPersonaTiendaComponent } from './pages/item-producto-pesona-tienda/item-producto-persona-tienda.component';
import { ItemProductoProveedorTiendaComponent } from './pages/item-producto-proveedor-tienda/item-producto-proveedor-tienda.component';
import { ListadoComprasComponent } from './pages/listado-compras/listado-compras.component';
import { ListadoVentasComponent } from './pages/listado-ventas/listado-ventas.component';
import { RptePedidoComponent } from './reportes/rpte-pedido/rpte-pedido.component';

export const routes: Routes = [
  // { path: '', redirectTo: ':personaId', pathMatch: 'full' },

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
  /*   { path: 'form/:personaId',
      component: FormPedidoComponent,
      canActivate:[isAuthenticatedGuard, RoleGuard],
      data: { role: 'ROLE_CREATE_PEDIDO' }
    }, */
  {
    path: 'item-producto-persona-tienda/:personaId',
    component: ItemProductoPersonaTiendaComponent,
    canActivate: [isAuthenticatedGuard],
    /*data: { role: 'ROLE_CREATE_VENTA' }*/
  },
  {
    path: 'item-producto-proveedor-tienda/:personaId',
    component: ItemProductoProveedorTiendaComponent,
    canActivate: [isAuthenticatedGuard],
    /*data: { role: 'ROLE_CREATE_VENTA' }*/
  },
  /*
    {
      path: 'item-producto-persona-online/:productoId',
      component: ItemProductoPersonaOnlineComponent,
           canActivate: [isAuthenticatedGuard, RoleGuard],
          data: { role: 'ROLE_CREATE_PEDIDO' }
    },
    */

  {
    path: 'pedido-persona-tienda-finalizado/:personaId',
    component: PedidoPersonaTiendaFinalizadoComponent,
    /* canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_CREATE_PEDIDO' }*/
  },
/*
  {
    path: 'contactanos',
    component: ContactanosComponent,
         canActivate: [isAuthenticatedGuard, RoleGuard],
        data: { role: 'ROLE_CREATE_PEDIDO' }
  },*/


  {
    path: 'detalle-venta/:pedidoId',
    component: DetallePedidoVentaComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_VIEW_DETAILS_VENTA' }
  },
  {
    path: 'detalle-compra/:pedidoId',
    component: DetallePedidoCompraComponent,
    canActivate: [isAuthenticatedGuard, RoleGuard],
    data: { role: 'ROLE_VIEW_DETAILS_COMPRA' }
  },

];

/* @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosRoutingModule { } */
