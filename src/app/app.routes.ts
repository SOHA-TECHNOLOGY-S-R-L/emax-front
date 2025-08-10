import { Component } from '@angular/core';
import { LoginComponent } from './modules/auth/login.component';
import { TiendaComponent } from './modules/tienda/tienda.component';

import { Routes } from '@angular/router';
import { CrearCuentaTiendaComponent } from './modules/auth/crear-cuenta-tienda.component';
import { PrincipalComponent } from './modules/compartido/principal.component';
import { ProductosPorCategoriaComponent } from './modules/producto/pages/productos-por-categoria.component';
import { ItemProductoClienteOnlineComponent } from './modules/pedidos/pages/item-producto-cliente-online/item-producto-cliente-online.component';
import { PedidoClienteOnlineFinalizadoComponent } from './modules/pedidos/components/pedido-cliente-online-finalizado/pedido-cliente-online-finalizado.component';

export const routes: Routes = [

  /*    { path: '', redirectTo: 'a', pathMatch: 'full' },
   */
  { path: 'login', component: LoginComponent },
  { path: 'crear-cuenta', component: CrearCuentaTiendaComponent },
  {
    path: '', component: PrincipalComponent,
    children: [
      {
        path: '',
        loadChildren: () => import("./modules/home/home.routes").then((r) => r.routes),
      },
      {
        path: 'clientes',
        loadChildren: () => import("./modules/clientes/clientes.routes").then((r) => r.routes),
      },
      {
        path: 'pedidos',
        loadChildren: () => import("./modules/pedidos/pedidos.routes").then((r) => r.routes),
      },
      {
        path: 'cajas',
        loadChildren: () => import("./modules/caja/caja.routes").then((r) => r.routes),
      },
      {
        path: 'movimientos',
        loadChildren: () => import("./modules/movimientos/movimientos.routes").then((r) => r.routes),
      },
      {
        path: 'productos',
        loadChildren: () => import("./modules/producto/producto.routes").then((r) => r.routes),
      },
      {
        path: 'usuarios',
        loadChildren: () => import("./modules/usuarios/usuarios.routes").then((r) => r.routes),
      },
      {
        path: 'tienda', component: TiendaComponent,
        children: [
          {
            path: 'productos-categoria/:categoriaId', component: ProductosPorCategoriaComponent,
          },
          {
            path: 'item-producto-cliente-online/:productoId', component: ItemProductoClienteOnlineComponent,
          },
          {
            path: 'item-producto-cliente-online/:productoId', component: ItemProductoClienteOnlineComponent,
          },
          {
            path: 'pedido-cliente-online-finalizado/:clienteId', component: PedidoClienteOnlineFinalizadoComponent,
          },
        ]

      },
    ]
  },
  { path: '***', component: PrincipalComponent },
];


