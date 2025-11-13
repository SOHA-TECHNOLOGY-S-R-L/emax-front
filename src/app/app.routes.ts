import { Component } from '@angular/core';
import { LoginComponent } from './modules/auth/login.component';
import { TiendaComponent } from './modules/tienda/tienda.component';

import { Routes } from '@angular/router';
import { CrearCuentaTiendaComponent } from './modules/auth/crear-cuenta-tienda.component';
import { PrincipalComponent } from './modules/compartido/principal.component';
import { ProductosPorCategoriaComponent } from './modules/producto/pages/productos-por-categoria.component';
import { ItemProductoPersonaOnlineComponent } from './modules/pedidos/pages/item-producto-persona-online/item-producto-persona-online.component';
import { PedidoPersonaOnlineFinalizadoComponent } from './modules/pedidos/components/pedido-persona-online-finalizado/pedido-persona-online-finalizado.component';
import { RecuperarClaveComponent } from './modules/auth/recuperar-clave.component';

export const routes: Routes = [

  /*    { path: '', redirectTo: 'a', pathMatch: 'full' },
   */
  {
    path: '', component: PrincipalComponent,
    children: [
      {
        path: '',
        loadChildren: () => import("./modules/home/home.routes").then((r) => r.routes),
      },
      {
        path: 'personas',
        loadChildren: () => import("./modules/personas/personas.routes").then((r) => r.routes),
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
            path: 'productos-categoria/:nombre', component: ProductosPorCategoriaComponent,
          },
          {
            path: 'productos-categoria/:nombre/item-producto-persona-online/:productoCodigo', component: ItemProductoPersonaOnlineComponent,
          },
          /*  {
             path: 'item-producto-persona-online/:productoId', component: ItemProductoPersonaOnlineComponent,
           }, */
          {
            path: 'pedido-persona-online-finalizado/:personaId', component: PedidoPersonaOnlineFinalizadoComponent,
          },
        ]

      },
      {
        path: 'crear-cuenta',
        component: CrearCuentaTiendaComponent
      },
      {
        path: 'recuperar-clave',
        component: RecuperarClaveComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
    ]
  },
  { path: '***', component: PrincipalComponent },
];


